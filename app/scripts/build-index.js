import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../public/content');
const OUTPUT_FILE = path.join(__dirname, '../public/library_index.json');

// Helper to get natural sort order (e.g. 1, 2, 10 instead of 1, 10, 2)
const naturalSort = (a, b) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
};

const buildIndex = () => {
    if (!fs.existsSync(CONTENT_DIR)) {
        console.error(`Content directory not found: ${CONTENT_DIR}`);
        process.exit(1);
    }

    const index = {};

    // Get all directories in content folder
    const folders = fs.readdirSync(CONTENT_DIR).filter(file => {
        return fs.statSync(path.join(CONTENT_DIR, file)).isDirectory();
    }).sort(naturalSort);

    console.log(`Found ${folders.length} categories.`);

    folders.forEach(folder => {
        const folderPath = path.join(CONTENT_DIR, folder);

        // Get all files in the directory
        const files = fs.readdirSync(folderPath).filter(file => {
            return !file.startsWith('.') && fs.statSync(path.join(folderPath, file)).isFile();
        }).sort(naturalSort);

        if (files.length > 0) {
            index[folder] = files;
            console.log(`  ${folder}: ${files.length} items`);
        }
    });

    // Write to JSON
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
    console.log(`\nSuccess! Index written to ${OUTPUT_FILE}`);
    console.log(`Total Categories: ${Object.keys(index).length}`);
    console.log(`Total Files: ${Object.values(index).reduce((acc, files) => acc + files.length, 0)}`);
};

buildIndex();
