const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'app/public/images/botany');

const missingImages = [
    'wild_strawberry_1.jpg',
    'mulberry_1.jpg',
    'crabapple.jpg',
    'black_walnut.jpg',
    'maple_syrup.jpg',
    'wild_mustard.jpg',
    'wild_peas.jpg',
    'horseweed.jpg',
    'wild_violet.jpg',
    'amaranth.jpg',
    'clover.jpg',
    'acorn.jpg',
    'coltsfoot.jpg',
    'wild_sunflower.jpg'
];

const placeholderUrl = 'https://picsum.photos/400/300'; // Redirects to a random nature image or placeholder

const headers = {
    'User-Agent': 'HomemakerSuiteBot/1.0 (https://github.com/Sparksy92/homemaker-suite; contact@example.com)'
};

function downloadPlaceholder(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers }, (res) => {
            // Handle redirects (Picsum redirects to a CDN URL)
            if (res.statusCode === 302 || res.statusCode === 301) {
                return downloadPlaceholder(res.headers.location, filepath).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                res.resume();
                return reject(new Error(`Failed to download placeholder: ${res.statusCode}`));
            }
            const file = fs.createWriteStream(filepath);
            res.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve());
            });
        }).on('error', reject);
    });
}

async function run() {
    const tempFile = path.join(targetDir, 'temp_placeholder.jpg');
    console.log('Downloading base placeholder image...');
    try {
        await downloadPlaceholder(placeholderUrl, tempFile);
        console.log('Base placeholder downloaded. Writing missing files...');
        
        missingImages.forEach(name => {
            fs.copyFileSync(tempFile, path.join(targetDir, name));
            console.log(`Created placeholder for ${name}`);
        });
        
        // Remove temp file
        fs.unlinkSync(tempFile);
        console.log('Cleaned up temporary files. Done!');
    } catch (err) {
        console.error(`Error generating placeholders: ${err.message}`);
        // Fallback: Copy cattail.jpg if network download fails
        const cattailPath = path.join(targetDir, 'cattail.jpg');
        if (fs.existsSync(cattailPath)) {
            console.log('Network download failed. Falling back to cloning cattail.jpg...');
            missingImages.forEach(name => {
                fs.copyFileSync(cattailPath, path.join(targetDir, name));
                console.log(`Cloned cattail.jpg -> ${name}`);
            });
        } else {
            console.error('Fallback image cattail.jpg not found.');
        }
    }
}

run();
