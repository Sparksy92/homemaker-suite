const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'app/public/images/wildlife');

const missingImages = [
    'chicory',
    'wild_garlic',
    'burdock',
    'elderberry',
    'lambs_quarters',
    'amadou',
    'squirrel',
    'turkey',
    'beaver',
    'mallard',
    'black_ant',
    'termite',
    'track_turkey',
    'track_bear'
];

// Ensure directory exists
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

missingImages.forEach(name => {
    // Determine background color based on type
    let color = '#e2e8f0'; // slate-200 (default)
    let textColor = '#475569'; // slate-600

    if (['chicory', 'wild_garlic', 'burdock', 'elderberry', 'lambs_quarters'].includes(name)) {
        color = '#dcfce7'; // green-100
        textColor = '#166534'; // green-800
    } else if (['squirrel', 'turkey', 'beaver', 'mallard'].includes(name)) {
        color = '#ffedd5'; // orange-100
        textColor = '#9a3412'; // orange-800
    } else if (['track_turkey', 'track_bear'].includes(name)) {
        color = '#f1f5f9'; // slate-100
        textColor = '#334155'; // slate-700
    }

    // Capitalize for display
    const displayName = name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${color}"/>
  <text x="50%" y="50%" font-family="serif" font-size="24" fill="${textColor}" text-anchor="middle" dy=".3em">${displayName}</text>
  <text x="50%" y="90%" font-family="sans-serif" font-size="12" fill="${textColor}" text-anchor="middle" opacity="0.6">Image Placeholder</text>
</svg>`;

    // Save as .jpg (even though it's SVG code, files are requested as .jpg in JSON? No, I should save as .jpg? 
    // Wait, browsers won't render SVG content in a .jpg file. 
    // I MUST save as .svg and UPDATE the JSON to point to .svg OR use a library to generate actual PNG/JPGs.
    // Node doesn't natively speak JPG. 
    // BETTER IDEA: Update wildlifeData.json to look for .svg if .jpg fails? 
    // OR just update the JSON entries for these specific new items to use .svg extension.

    // Changing strategy: Save as .svg and update JSON.
    const fileName = `${name}.svg`;
    fs.writeFileSync(path.join(targetDir, fileName), svgContent);
    console.log(`Generated ${fileName}`);
});
