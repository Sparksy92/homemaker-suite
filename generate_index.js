const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, 'app/public/content');
const outputFile = path.join(__dirname, 'app/public/library_index.json');

const index = {};

if (!fs.existsSync(contentDir)) {
    console.error(`Directory not found: ${contentDir}`);
    process.exit(1);
}

const folders = fs.readdirSync(contentDir).filter(f => {
    return fs.statSync(path.join(contentDir, f)).isDirectory();
});

folders.forEach(folder => {
    const folderPath = path.join(contentDir, folder);
    const files = fs.readdirSync(folderPath).filter(f => {
        return !f.startsWith('.') && (f.endsWith('.md') || f.endsWith('.html') || f.endsWith('.pdf'));
    });

    if (files.length > 0) {
        index[folder] = files;
    }
});

fs.writeFileSync(outputFile, JSON.stringify(index, null, 2));
console.log(`Generated library_index.json with ${Object.keys(index).length} folders.`);
