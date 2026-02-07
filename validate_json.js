const fs = require('fs');
try {
    const data = fs.readFileSync('app/public/library_index.json', 'utf8');
    JSON.parse(data);
    console.log("JSON is valid");
} catch (e) {
    console.error("JSON Error:", e.message);
}
