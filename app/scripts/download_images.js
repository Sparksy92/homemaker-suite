import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const images = [
    // Flora
    { name: "dandelion.jpg", page: "https://commons.wikimedia.org/wiki/File:Dandelion_flower.jpg" },
    { name: "nettle.jpg", page: "https://commons.wikimedia.org/wiki/File:Stinging_Nettle_-_geograph.org.uk_-_955279.jpg" },
    { name: "cattail.jpg", page: "https://commons.wikimedia.org/wiki/File:Typha_latifolia_-_Broadleaf_Cattail.jpg" },
    { name: "willow.jpg", page: "https://commons.wikimedia.org/wiki/File:White_Willow_Salix_alba.jpg" },
    { name: "plantain.jpg", page: "https://commons.wikimedia.org/wiki/File:Broadleaf_Plantain_Spike.jpg" },
    { name: "yarrow.jpg", page: "https://commons.wikimedia.org/wiki/File:Achillea_millefolium_kz02.jpg" },
    { name: "mullein.jpg", page: "https://commons.wikimedia.org/wiki/File:Verbascum_thapsus_0.5_R.jpg" },
    { name: "pine.jpg", page: "https://commons.wikimedia.org/wiki/File:Pinus_strobus_foliage_cones.jpg" },
    { name: "jewelweed.jpg", page: "https://commons.wikimedia.org/wiki/File:Jewelweed_(Impatiens_capensis)_flower.jpg" },
    { name: "hemlock.jpg", page: "https://commons.wikimedia.org/wiki/File:Conium_maculatum_5.jpg" },
    { name: "poison_ivy.jpg", page: "https://commons.wikimedia.org/wiki/File:Toxicodendron_radicans_leaves.jpg" },

    // Fauna
    { name: "deer.jpg", page: "https://commons.wikimedia.org/wiki/File:White-tailed_deer.jpg" },
    { name: "rabbit.jpg", page: "https://commons.wikimedia.org/wiki/File:Eastern_Cottontail.JPG" },
    { name: "bear.jpg", page: "https://commons.wikimedia.org/wiki/File:Black_Bear_001.jpg" },
    { name: "coyote.jpg", page: "https://commons.wikimedia.org/wiki/File:2009-Coyote-Yosemite.jpg" },

    // Insects
    { name: "honey_bee.jpg", page: "https://commons.wikimedia.org/wiki/File:Apis_mellifera_Western_honey_bee.jpg" },
    { name: "monarch.jpg", page: "https://commons.wikimedia.org/wiki/File:Monarch_Butterfly_Danaus_plexippus_Male_2664px.jpg" },
    { name: "tick.jpg", page: "https://commons.wikimedia.org/wiki/File:Adult_deer_tick.jpg" },
    { name: "mosquito.jpg", page: "https://commons.wikimedia.org/wiki/File:Aedes_aegypti_feeding.jpg" },
    { name: "mantis.jpg", page: "https://commons.wikimedia.org/wiki/File:Mantis_religiosa.jpg" },

    // Tracks
    { name: "track_deer.jpg", page: "https://commons.wikimedia.org/wiki/File:Deer_tracks.jpg" },
    { name: "track_rabbit.jpg", page: "https://commons.wikimedia.org/wiki/File:Rabbit_tracks_in_snow.jpg" },
    { name: "track_canine.jpg", page: "https://commons.wikimedia.org/wiki/File:Coyote_tracks.jpg" },
    { name: "track_feline.jpg", page: "https://commons.wikimedia.org/wiki/File:Bobcat_tracks.jpg" },
    { name: "track_raccoon.jpg", page: "https://commons.wikimedia.org/wiki/File:Raccoon_tracks.jpg" }
];

// Go up one level from scripts to app root, then to public/images/wildlife
const downloadDir = path.join(__dirname, '../public/images/wildlife');

if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
}

async function fetchPage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path.join(downloadDir, filename));
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded: ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filename, () => { }); // Delete failed file
            reject(err);
        });
    });
}

async function processImages() {
    console.log(`Downloading images to: ${downloadDir}`);
    for (const img of images) {
        try {
            console.log(`Fetching page for ${img.name}...`);
            const html = await fetchPage(img.page);

            // Regex to find the original upload URL
            // Wikimedia often uses "original file" link or og:image
            // We look for the "Previous" or "Original file" link which is usually cleaner
            // Or the og:image property
            const match = html.match(/"(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[^"]+\.(jpg|jpeg|JPG|JPEG|png|PNG))"/);

            if (match && match[1]) {
                const imageUrl = match[1];
                console.log(`Found image URL: ${imageUrl}`);
                await downloadImage(imageUrl, img.name);
            } else {
                console.error(`Could not find image URL for ${img.name}`);
            }
        } catch (error) {
            console.error(`Error processing ${img.name}:`, error.message);
        }
    }
}

processImages();
