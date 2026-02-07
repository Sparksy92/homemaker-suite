import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_DIR = path.join(__dirname, '../public/content/99 Reference Library');

// Ensure directory exists
if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Curated list of survival classics (Public Domain)
const LIBRARY = [
    {
        title: "99.1 Knots, Splices and Rope Work.md",
        url: "https://www.gutenberg.org/cache/epub/13510/pg13510.txt"
    },
    {
        title: "99.2 First Aid in Illness and Injury.md",
        url: "https://www.gutenberg.org/cache/epub/14298/pg14298.txt"
    },
    {
        title: "99.3 The Amateur Machinist.md",
        url: "https://www.gutenberg.org/cache/epub/61689/pg61689.txt"
    },
    {
        title: "99.4 Camp Life in the Woods.md",
        url: "https://www.gutenberg.org/cache/epub/17093/pg17093.txt"
    },
    {
        title: "99.5 Steam, Its Generation and Use.md",
        url: "https://www.gutenberg.org/cache/epub/22657/pg22657.txt"
    }
];

const downloadBook = (book) => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(TARGET_DIR, book.title);
        console.log(`Downloading: ${book.title}...`);

        https.get(book.url, (res) => {
            if (res.statusCode !== 200) {
                console.error(`Failed to download ${book.title}: Status ${res.statusCode}`);
                res.resume();
                return;
            }

            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                // Add a Markdown header so it renders nicely
                const header = `# ${book.title.replace('99.x ', '').replace('.md', '')}\n\n*Source: Project Gutenberg*\n\n---\n\n`;
                fs.writeFileSync(filePath, header + data);
                console.log(`Saved: ${filePath}`);
                resolve();
            });
        }).on('error', (err) => {
            console.error(`Error downloading ${book.title}:`, err.message);
            reject(err);
        });
    });
};

const ingest = async () => {
    for (const book of LIBRARY) {
        await downloadBook(book);
    }
    console.log("Ingestion Complete.");
};

ingest();
