const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'app/public/images/wildlife');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Map of desired filename -> Wiki File Page URL
const targets = [
    { name: 'chicory.jpg', page: 'https://commons.wikimedia.org/wiki/File:Cichorium_intybus_var_sativum.jpg' },
    { name: 'wild_garlic.jpg', page: 'https://commons.wikimedia.org/wiki/File:Allium_vineale_1.jpg' },
    { name: 'burdock.jpg', page: 'https://commons.wikimedia.org/wiki/File:Arctium_lappa02.jpg' },
    { name: 'elderberry.jpg', page: 'https://commons.wikimedia.org/wiki/File:Sambucus_nigra_0004.JPG' },
    { name: 'lambs_quarters.jpg', page: 'https://commons.wikimedia.org/wiki/File:Chenopodium_album_Sims.jpg' }, // Switched to a known good file
    { name: 'amadou.jpg', page: 'https://commons.wikimedia.org/wiki/File:Fomes_fomentarius_2010_G1.jpg' },
    { name: 'squirrel.jpg', page: 'https://commons.wikimedia.org/wiki/File:Eastern_Grey_Squirrel.jpg' },
    { name: 'turkey.jpg', page: 'https://commons.wikimedia.org/wiki/File:Wild_turkey_eastern_us.jpg' },
    { name: 'beaver.jpg', page: 'https://commons.wikimedia.org/wiki/File:American_Beaver.jpg' },
    { name: 'mallard.jpg', page: 'https://commons.wikimedia.org/wiki/File:Mallard_Duck_Image.jpg' },
    { name: 'black_ant.jpg', page: 'https://commons.wikimedia.org/wiki/File:Camponotus_pennsylvanicus_P1340211a.jpg' },
    { name: 'termite.jpg', page: 'https://commons.wikimedia.org/wiki/File:Isoptera.jpg' },
    { name: 'track_turkey.jpg', page: 'https://commons.wikimedia.org/wiki/File:Wild_Turkey_footprint_in_mud.jpg' },
    { name: 'track_bear.jpg', page: 'https://commons.wikimedia.org/wiki/File:Black_bear_tracks.jpg' }
];

const headers = {
    'User-Agent': 'HomemakerSuiteBot/1.0 (https://github.com/Sparksy92/homemaker-suite; contact@example.com)'
};

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers }, (res) => {
            if (res.statusCode !== 200) {
                res.resume();
                return reject(new Error(`Image Request Failed: ${res.statusCode}`));
            }
            const file = fs.createWriteStream(filepath);
            res.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve());
            });
        }).on('error', reject);
    });
}

function processTarget(target) {
    return new Promise((resolve, reject) => {
        console.log(`Processing ${target.name}...`);

        https.get(target.page, { headers }, (res) => {
            if (res.statusCode !== 200) {
                res.resume();
                console.error(`Failed to fetch page ${target.page}: ${res.statusCode}`);
                return resolve(); // Skip
            }

            let data = '';
            res.on('data', chuck => data += chuck);
            res.on('end', async () => {
                // Regex to find the original upload URL. 
                // Look for: class="internal" title="Original file" href="..."
                // OR: "Original file" ... href="..."
                // Simple approach: Look for the 'upload.wikimedia.org' link that ends in original extension

                // Common pattern in Wiki HTML: <div class="fullImageLink" id="file"><a href="https://upload.wikimedia.org/..."
                const match = data.match(/class="fullImageLink" id="file"><a href="(https:\/\/upload\.wikimedia\.org\/[^"]+)"/);

                if (match && match[1]) {
                    const imageUrl = match[1];
                    console.log(`Found image URL: ${imageUrl}`);
                    try {
                        await downloadImage(imageUrl, path.join(targetDir, target.name));
                        console.log(`Successfully saved ${target.name}`);
                    } catch (err) {
                        console.error(`Error downloading image for ${target.name}: ${err.message}`);
                    }
                } else {
                    console.error(`Could not extract image URL for ${target.name}`);
                }
                resolve();
            });
        }).on('error', (err) => {
            console.error(`Error fetching page ${target.name}: ${err.message}`);
            resolve();
        });
    });
}

async function run() {
    for (const target of targets) {
        await processTarget(target);
    }
}

run();
