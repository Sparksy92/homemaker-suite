import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLONE_DIR = 'C:/Users/Blair/.gemini/antigravity/brain/c2406ce0-caf6-44c7-81ab-64e1ee52057b/scratch/survival_data/HOME';
const OUTPUT_FILE = path.join(__dirname, '../public/external_pdfs.json');

// Helper to get natural sort order
const naturalSort = (a, b) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
};

// Helper to make title clean
const cleanTitle = (name) => {
    return name
        .replace(/\.pdf$/i, '')
        .replace(/[-_]+/g, ' ')
        .trim();
};

const buildPdfLibrary = () => {
    if (!fs.existsSync(CLONE_DIR)) {
        console.error(`Cloned directory not found: ${CLONE_DIR}`);
        process.exit(1);
    }

    const index = {};
    const folders = fs.readdirSync(CLONE_DIR).filter(file => {
        return fs.statSync(path.join(CLONE_DIR, file)).isDirectory();
    }).sort(naturalSort);

    folders.forEach(folder => {
        const folderPath = path.join(CLONE_DIR, folder);
        const files = fs.readdirSync(folderPath).filter(file => {
            return file.toLowerCase().endsWith('.pdf') && fs.statSync(path.join(folderPath, file)).isFile();
        }).sort(naturalSort);

        if (files.length > 0) {
            index[folder] = files.map(file => {
                const filePath = path.join(folderPath, file);
                const stat = fs.statSync(filePath);
                return {
                    name: file,
                    title: cleanTitle(file),
                    url: `https://raw.githubusercontent.com/PR0M3TH3AN/Survival-Data/master/HOME/${folder}/${encodeURIComponent(file)}`,
                    size: stat.size
                };
            });
        }
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
    console.log(`Successfully indexed ${Object.keys(index).length} categories and ${Object.values(index).reduce((a, b) => a + b.length, 0)} PDF files!`);
};

buildPdfLibrary();
