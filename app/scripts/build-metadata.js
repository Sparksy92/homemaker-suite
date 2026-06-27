import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../public/content');
const OUTPUT_FILE = path.join(__dirname, '../public/guides_metadata.json');

// Helper to get natural sort order
const naturalSort = (a, b) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
};

// Simple frontmatter parser
function parseFrontmatter(content) {
    const frontmatterRegex = /^---\r?\n([\s\S]+?)\r?\n---/;
    const match = content.match(frontmatterRegex);
    if (!match) return { tags: [] };
    
    const yamlStr = match[1];
    const result = { tags: [] };
    
    yamlStr.split(/\r?\n/).forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join(':').trim();
            if (key === 'tags') {
                if (val.startsWith('[') && val.endsWith(']')) {
                    result.tags = val.slice(1, -1).split(',').map(t => t.trim()).filter(Boolean);
                } else {
                    result.tags = val.split(',').map(t => t.trim()).filter(Boolean);
                }
            } else {
                result[key] = val.replace(/^['"]|['"]$/g, '');
            }
        }
    });
    return result;
}

// Clean display names
const getCleanTitle = (fileName) => {
    return fileName.replace(/^\d+(\.\d+)?\s+/, '').replace('.md', '');
};

const buildMetadata = () => {
    if (!fs.existsSync(CONTENT_DIR)) {
        console.error(`Content directory not found: ${CONTENT_DIR}`);
        process.exit(1);
    }

    const metadataList = [];

    // Get all directories in content folder
    const folders = fs.readdirSync(CONTENT_DIR).filter(file => {
        return fs.statSync(path.join(CONTENT_DIR, file)).isDirectory();
    }).sort(naturalSort);

    folders.forEach(folder => {
        const folderPath = path.join(CONTENT_DIR, folder);

        // Get all files in the directory
        const files = fs.readdirSync(folderPath).filter(file => {
            return !file.startsWith('.') && file.endsWith('.md') && fs.statSync(path.join(folderPath, file)).isFile();
        }).sort(naturalSort);

        files.forEach(file => {
            const filePath = path.join(folderPath, file);
            const content = fs.readFileSync(filePath, 'utf-8');

            const fm = parseFrontmatter(content);
            
            // Clean content to get a accurate word count
            const cleanContent = content.replace(/^---\r?\n[\s\S]+?\r?\n---/, '');
            const wordCount = cleanContent.trim().split(/\s+/).filter(Boolean).length;

            const relativePath = `content/${folder}/${file}`;

            metadataList.push({
                title: fm.title || getCleanTitle(file),
                path: relativePath,
                category: folder,
                tags: fm.tags || [],
                word_count: wordCount,
                ...fm
            });
        });
    });

    // Write to JSON
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(metadataList, null, 2));
    console.log(`\nSuccess! Metadata written to ${OUTPUT_FILE}`);
    console.log(`Total Guides Indexed: ${metadataList.length}`);
};

buildMetadata();
