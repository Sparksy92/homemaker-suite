const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'app/public/images/wildlife');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const targets = [
    { name: 'chicory.jpg', search: 'chicory,flower' },
    { name: 'wild_garlic.jpg', search: 'allium,onion' },
    { name: 'burdock.jpg', search: 'burdock,plant' },
    { name: 'elderberry.jpg', search: 'elderberry,berry' },
    { name: 'lambs_quarters.jpg', search: 'chenopodium,album' },
    { name: 'amadou.jpg', search: 'amadou,fungus' },
    { name: 'squirrel.jpg', search: 'grey,squirrel' },
    { name: 'turkey.jpg', search: 'wild,turkey' },
    { name: 'beaver.jpg', search: 'beaver,animal' },
    { name: 'mallard.jpg', search: 'mallard,duck' },
    { name: 'black_ant.jpg', search: 'black,ant' },
    { name: 'termite.jpg', search: 'termite,bug' },
    { name: 'track_turkey.jpg', search: 'bird,track' },
    { name: 'track_bear.jpg', search: 'bear,footprint' }
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
