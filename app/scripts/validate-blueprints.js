import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLUEPRINTS_PATH = path.join(__dirname, '../public/data/blueprints.json');
const REPORT_PATH = path.join(__dirname, '../../docs/audits/blueprints-integrity-report.md');

function run() {
    console.log('Starting blueprints database integrity check...');
    
    if (!fs.existsSync(BLUEPRINTS_PATH)) {
        console.error(`Error: blueprints.json not found at ${BLUEPRINTS_PATH}`);
        process.exit(1);
    }
    
    let data;
    try {
        const raw = fs.readFileSync(BLUEPRINTS_PATH, 'utf8');
        data = JSON.parse(raw);
    } catch (err) {
        console.error('Error: Failed to parse blueprints.json as valid JSON.', err.message);
        process.exit(1);
    }
    
    const blueprints = data.blueprints;
    if (!Array.isArray(blueprints)) {
        console.error('Error: Root elements must contain a "blueprints" array.');
        process.exit(1);
    }
    
    const errors = [];
    const warnings = [];
    const ids = new Set();
    
    // Expect exactly 25 blueprints
    if (blueprints.length !== 25) {
        errors.push(`Expected exactly 25 blueprints, but found ${blueprints.length}.`);
    }
    
    const requiredFields = [
        'id', 'title', 'system', 'difficulty', 'safetyLevel', 
        'estimatedTime', 'materials', 'tools', 'steps', 'notes'
    ];
    
    blueprints.forEach((bp, index) => {
        const indexLabel = `Blueprint at index ${index} (${bp.title || bp.id || 'Unnamed'})`;
        
        // 1. Required Fields Check
        requiredFields.forEach(field => {
            if (bp[field] === undefined || bp[field] === null) {
                errors.push(`${indexLabel} is missing required field "${field}".`);
            }
        });
        
        if (bp.id) {
            // 2. Unique ID Check
            if (ids.has(bp.id)) {
                errors.push(`Duplicate blueprint ID found: "${bp.id}".`);
            }
            ids.add(bp.id);
        }
        
        // 3. Materials and Tools Checks
        if (bp.materials && !Array.isArray(bp.materials)) {
            errors.push(`${indexLabel} "materials" must be an array.`);
        }
        if (bp.tools && !Array.isArray(bp.tools)) {
            errors.push(`${indexLabel} "tools" must be an array.`);
        }
        
        // 4. Steps Check
        if (bp.steps) {
            if (!Array.isArray(bp.steps)) {
                errors.push(`${indexLabel} "steps" must be an array.`);
            } else {
                if (bp.steps.length < 3) {
                    errors.push(`${indexLabel} must have at least 3 steps, found ${bp.steps.length}.`);
                }
                
                bp.steps.forEach((step, sIdx) => {
                    const stepLabel = `${indexLabel} step ${sIdx + 1}`;
                    if (step.id === undefined || step.id === null) {
                        errors.push(`${stepLabel} is missing "id".`);
                    }
                    if (step.text === undefined || step.text === null || step.text === '') {
                        errors.push(`${stepLabel} is missing "text".`);
                    }
                    if (step.completed !== false) {
                        errors.push(`${stepLabel} "completed" must be exactly false in template.`);
                    }
                });
            }
        }
        
        // 5. Safety notes check
        if (bp.safetyLevel === 'High') {
            if (!bp.safetyNotes || !Array.isArray(bp.safetyNotes) || bp.safetyNotes.length === 0) {
                warnings.push(`${indexLabel} has safetyLevel "High" but has no safetyNotes.`);
            }
        }
    });
    
    // Write markdown report
    const reportDir = path.dirname(REPORT_PATH);
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportMarkdown = `# Project Blueprints Integrity Report

Date: ${new Date().toISOString()}
Database File: [blueprints.json](file:///${BLUEPRINTS_PATH.replace(/\\/g, '/')})

## Audit Metrics
* **Total Blueprints Found**: ${blueprints.length} (Expected: 25)
* **Total Failures**: ${errors.length}
* **Total Warnings**: ${warnings.length}

## Integrity Status
${errors.length === 0 ? '### ✅ PASS\nAll database validation checks passed successfully.' : '### ❌ FAIL\nIntegrity checks failed with errors.'}

${errors.length > 0 ? `### Errors (${errors.length})\n${errors.map(e => `* ${e}`).join('\n')}` : ''}
${warnings.length > 0 ? `### Warnings (${warnings.length})\n${warnings.map(w => `* ${w}`).join('\n')}` : ''}

## Blueprint Catalog Summary
| System Category | Blueprint ID | Title | Difficulty | Safety |
| --- | --- | --- | --- | --- |
${blueprints.map(bp => `| ${bp.system || 'N/A'} | ${bp.id || 'N/A'} | ${bp.title || 'N/A'} | ${bp.difficulty || 'N/A'} | ${bp.safetyLevel || 'N/A'} |`).join('\n')}
`;

    fs.writeFileSync(REPORT_PATH, reportMarkdown, 'utf8');
    console.log(`Integrity report written to: ${REPORT_PATH}`);
    
    if (errors.length > 0) {
        console.error(`Validation failed with ${errors.length} errors.`);
        process.exit(1);
    } else {
        console.log('Validation passed successfully.');
    }
}

run();
