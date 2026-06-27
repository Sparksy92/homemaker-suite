const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'app/public/images/botany');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Map of desired filename -> Wiki File Page URL
const targets = [
    { name: 'wild_strawberry_1.jpg', page: 'https://commons.wikimedia.org/wiki/File:Fragaria_vesca_0516.JPG' },
    { name: 'mulberry_1.jpg', page: 'https://commons.wikimedia.org/wiki/File:Morus_alba_fruit.JPG' },
    { name: 'crabapple.jpg', page: 'https://commons.wikimedia.org/wiki/File:Malus_sylvestris_fruit_0.7_R.jpg' },
    { name: 'black_walnut.jpg', page: 'https://commons.wikimedia.org/wiki/File:Juglans_nigra_leaves_fruit.jpg' },
    { name: 'maple_syrup.jpg', page: 'https://commons.wikimedia.org/wiki/File:Maple_syrup_2.jpg' },
    { name: 'wild_mustard.jpg', page: 'https://commons.wikimedia.org/wiki/File:Sinapis_arvensis_2017_05_12_9877.jpg' },
    { name: 'wild_peas.jpg', page: 'https://commons.wikimedia.org/wiki/File:Lathyrus_japonicus_04.JPG' },
    { name: 'horseweed.jpg', page: 'https://commons.wikimedia.org/wiki/File:Conyza_canadensis_2020-07-28_6464.jpg' },
    { name: 'wild_violet.jpg', page: 'https://commons.wikimedia.org/wiki/File:Viola_odorata_02.JPG' },
    { name: 'amaranth.jpg', page: 'https://commons.wikimedia.org/wiki/File:Amaranthus_retroflexus_130919a.jpg' },
    { name: 'clover.jpg', page: 'https://commons.wikimedia.org/wiki/File:Trifolium_pratense_Sturm39.jpg' },
    { name: 'acorn.jpg', page: 'https://commons.wikimedia.org/wiki/File:Acorn_closeup_3.jpg' },
    { name: 'coltsfoot.jpg', page: 'https://commons.wikimedia.org/wiki/File:Tussilago_farfara_flowers.jpg' },
    { name: 'wild_sunflower.jpg', page: 'https://commons.wikimedia.org/wiki/File:Helianthus_annuus_2012_09_15_1876.jpg' }
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
                // Look for class="fullImageLink" id="file"><a href="..."
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
