const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'app/public/images/botany');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const targets = [
    { name: 'wild_strawberry_1.jpg', search: 'strawberry,plant' },
    { name: 'mulberry_1.jpg', search: 'mulberry,fruit' },
    { name: 'crabapple.jpg', search: 'crabapple,fruit' },
    { name: 'black_walnut.jpg', search: 'walnut,tree' },
    { name: 'maple_syrup.jpg', search: 'maple,syrup' },
    { name: 'wild_mustard.jpg', search: 'mustard,plant' },
    { name: 'wild_peas.jpg', search: 'pea,flower' },
    { name: 'horseweed.jpg', search: 'weed,plant' },
    { name: 'wild_violet.jpg', search: 'violet,flower' },
    { name: 'amaranth.jpg', search: 'amaranth,flower' },
    { name: 'clover.jpg', search: 'clover,leaf' },
    { name: 'acorn.jpg', search: 'acorn,oak' },
    { name: 'coltsfoot.jpg', search: 'yellow,flower' },
    { name: 'wild_sunflower.jpg', search: 'sunflower,flower' }
];

targets.forEach((t, idx) => {
    const dest = path.join(targetDir, t.name);
    const url = `https://loremflickr.com/640/480/${t.search}`;
    console.log(`Downloading ${t.name} (searching: ${t.search})...`);
    try {
        if (idx > 0) {
            execSync('powershell Start-Sleep -s 1');
        }
        execSync(`curl.exe -L -o "${dest}" "${url}"`);
        console.log(`Successfully saved ${t.name}`);
    } catch (e) {
        console.error(`Failed to download ${t.name}:`, e.message);
    }
});
