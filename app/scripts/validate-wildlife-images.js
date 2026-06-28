import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '../src/data/wildlifeData.json');
const imagesBaseDir = path.join(__dirname, '../public/images');
const reportPath = path.join(__dirname, '../../docs/audits/wildlife-image-integrity-report.md');

// Ensure docs/audits directory exists
const reportDir = path.dirname(reportPath);
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

const CATEGORY_FOLDERS = {
  flora: 'botany',
  insects: 'wildlife',
  fauna: 'wildlife',
  aquatic: 'aquatic',
  tracking: 'tracking'
};

const KNOWN_SPECIES_KEYWORDS = [
  'deer', 'squirrel', 'beaver', 'mallard', 'ant', 'termite', 'turkey', 'bear', 'bison', 
  'bighorn', 'badger', 'bobcat', 'carp', 'catfish', 'coyote', 'crayfish', 'cricket', 'elk', 
  'fox', 'grizzly', 'hog', 'bee', 'moose', 'mosquito', 'opossum', 'pike', 'porcupine', 
  'pronghorn', 'rabbit', 'raccoon', 'skunk', 'bass', 'sturgeon', 'tick', 'wolf', 'wolverine', 
  'perch', 'walleye', 'salmon', 'trout', 'bluegill', 'chicory', 'garlic', 'burdock', 
  'elderberry', 'amadou', 'yarrow', 'mustard', 'clover', 'acorn', 'coltsfoot', 'sunflower', 
  'violet', 'amaranth', 'strawberry', 'mulberry', 'crabapple', 'walnut', 'maple', 'pea', 'horseweed'
];

function isSuspicious(filename, item) {
  const fnLower = filename.toLowerCase();
  const fnWords = fnLower.replace(/\.[^/.]+$/, "").split(/[^a-z0-9]+/);
  
  const itemText = `${item.id || ''} ${item.name || ''} ${item.scientific_name || ''}`.toLowerCase();
  const itemWords = itemText.split(/[^a-z0-9]+/);

  // If any word in the filename (longer than 2 letters) is present in the item, it's not suspicious
  const hasOverlap = fnWords.some(w => w.length > 2 && (itemWords.includes(w) || itemText.includes(w)));
  if (hasOverlap) return false;

  // Check if filename contains a known species keyword that doesn't appear in the item's info
  for (const keyword of KNOWN_SPECIES_KEYWORDS) {
    if (fnLower.includes(keyword) && !itemText.includes(keyword)) {
      return true;
    }
  }
  return false;
}

function run() {
  console.log('Starting wildlife image validation audit...');
  
  if (!fs.existsSync(dataPath)) {
    console.error(`Error: Data file not found at ${dataPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData);

  let totalEntries = 0;
  let totalImageRefs = 0;
  
  const missingFiles = [];
  const suspiciousMappings = [];
  const noImages = [];
  const imageToEntries = {}; // filename -> array of entries using it

  const collections = ['flora', 'insects', 'fauna', 'aquatic', 'tracking'];

  for (const coll of collections) {
    const list = data[coll];
    if (!list) {
      console.warn(`Warning: Collection "${coll}" not found in JSON.`);
      continue;
    }

    const folderName = CATEGORY_FOLDERS[coll];
    const folderPath = path.join(imagesBaseDir, folderName);

    list.forEach(item => {
      totalEntries++;
      const images = item.images || [];

      if (images.length === 0) {
        noImages.push({ collection: coll, item });
        return;
      }

      images.forEach(img => {
        totalImageRefs++;
        
        // Track duplicates
        const fullKey = `${folderName}/${img}`;
        if (!imageToEntries[fullKey]) {
          imageToEntries[fullKey] = [];
        }
        imageToEntries[fullKey].push({ collection: coll, item });

        // Check if file exists
        const filePath = path.join(folderPath, img);
        if (!fs.existsSync(filePath)) {
          missingFiles.push({ collection: coll, item, filename: img, expectedPath: filePath });
        }

        // Check for suspicious mappings
        if (isSuspicious(img, item)) {
          suspiciousMappings.push({ collection: coll, item, filename: img });
        }
      });
    });
  }

  // Calculate duplicates
  const duplicateImageRefs = [];
  for (const [key, entries] of Object.entries(imageToEntries)) {
    if (entries.length > 1) {
      duplicateImageRefs.push({ imagePath: key, entries });
    }
  }

  // Generate Markdown report
  let report = `# Wildlife & Foraging Image Integrity Report

## Executive Summary
This report was automatically generated during build validation to audit the integrity of images on the Wildlife and Foraging guides.

* **Total Species/Guides Scanned:** ${totalEntries}
* **Total Image References Scanned:** ${totalImageRefs}
* **Missing Image Files:** ${missingFiles.length}
* **Suspicious Image-to-Species Mappings:** ${suspiciousMappings.length}
* **Duplicate/Shared Images:** ${duplicateImageRefs.length}
* **Species with No Image:** ${noImages.length}

---

## 🚨 Critical Failures: Missing Image Files (${missingFiles.length})
${missingFiles.length === 0 ? '_No missing image files. Great!_' : missingFiles.map(f => {
  return `* **[${f.collection.toUpperCase()}]** ${f.item.name} (\`${f.item.id}\`): Missing file \`${f.filename}\`
  * Expected Path: \`app/public/images/${CATEGORY_FOLDERS[f.collection]}/${f.filename}\``;
}).join('\n')}

---

## ⚠️ Warnings: Suspicious Image Mappings (${suspiciousMappings.length})
Filenames containing names of other species (e.g. \`deer.jpg\` assigned to \`bluegill\`):
${suspiciousMappings.length === 0 ? '_No suspicious mappings found._' : suspiciousMappings.map(f => {
  return `* **[${f.collection.toUpperCase()}]** ${f.item.name} (\`${f.item.id}\`): Uses suspicious image \`${f.filename}\``;
}).join('\n')}

---

## ⚠️ Warnings: Duplicate/Shared Image Reuse (${duplicateImageRefs.length})
Filenames referenced by multiple species:
${duplicateImageRefs.length === 0 ? '_No duplicate image reuse._' : duplicateImageRefs.map(d => {
  const list = d.entries.map(e => `\`${e.item.id}\` (${e.item.name})`).join(', ');
  return `* \`${d.imagePath}\` is reused by: ${list}`;
}).join('\n')}

---

## ℹ️ Information: Species/Guides with No Images (${noImages.length})
Fallback rendering is automatically active for these items:
${noImages.length === 0 ? '_All species have at least one image reference._' : noImages.map(n => {
  return `* **[${n.collection.toUpperCase()}]** ${n.item.name} (\`${n.item.id}\`)`;
}).join('\n')}

---

## Recommendations
1. Ensure all missing image files are either copied to their correct directories or removed from the JSON database to allow fallbacks.
2. Correct the suspicious image mappings where a species references an unrelated photograph.
3. Clean up duplicate image reuse if the species are completely distinct.
`;

  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`Markdown report written to: ${reportPath}`);

  if (missingFiles.length > 0) {
    console.error(`🚨 Audit failed: ${missingFiles.length} missing image files detected!`);
    process.exit(1);
  }

  console.log('Audit completed successfully (0 missing files).');
  process.exit(0);
}

run();
