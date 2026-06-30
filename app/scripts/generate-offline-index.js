import fs from 'fs';
import path from 'path';

const SOURCE_DIR = 'C:\\Users\\Blair\\Downloads\\survival\\picked out material for app';
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'offline_survival_index.json');

// Blacklist keywords for weapons, tactical combat, explosives
const BLACKLIST = [
    'explosive', 'ammunition', 'artillery', 'tactics', 'mortar', 'bomb',
    'grenade', 'missile', 'mine', 'demolition', 'combat', 'warfare',
    'insurgency', 'counterinsurgency', 'irregular', 'detonation',
    'chemical', 'biological', 'nuclear', 'pistol', 'shotgun', 'machine_gun',
    'platoon', 'squad', 'battalion', 'armored', 'tank', 'bayonet',
    'assault', 'violence', 'terrorist', 'terrorism', 'enemy', 'gunsmithing',
    'small arms', 'firearm', 'remington', 'def defensive', 'defensive shotgun',
    'sniper', 'counter sniper', 'marksmanship training pistol'
];

// Whitelist patterns for general wilderness/hunting rifle guides
const WHITELIST_EXCEPTIONS = [
    'rifle_marksmanship',
    'rifle marksmanship',
    'international rifle marksmanship',
    'standards in weapons training'
];

// Clean titles helper
function getCleanTitle(fileName) {
    let nameWithoutExt = fileName.replace(/\.(zip|pdf|epub|mp4|txt|rar|doc|djvu)$/i, '');

    // Common military/agency prefixes to clean
    nameWithoutExt = nameWithoutExt
        .replace(/^united_states_army_fm_/i, 'FM ')
        .replace(/^united_states_army-fm_/i, 'FM ')
        .replace(/^united_states_army_tc_/i, 'TC ')
        .replace(/^united_states_army_tm_/i, 'TM ')
        .replace(/^united_states_army_da_/i, 'DA ')
        .replace(/^united_states_army_sh/i, 'SH ')
        .replace(/^united_states_army_st/i, 'ST ')
        .replace(/^united_states_army_stp/i, 'STP ')
        .replace(/^united_states_army_fmi/i, 'FMI ')
        .replace(/^united_states_army_mm/i, 'MM ')
        .replace(/^united_states_army_cc_/i, 'CC ')
        .replace(/^usda_forest_service_\d+_/i, '')
        .replace(/^usda_forest_service_/i, '')
        .replace(/^us_army_corps_of_engineers_/i, 'USACE ')
        .replace(/^us_army_corps_of_engineers-em/i, 'USACE EM ')
        .replace(/^us_army_corps_of_engineers-ep/i, 'USACE EP ')
        .replace(/^us_army_corps_of_engineers-fm/i, 'USACE FM ')
        .replace(/^us_army_corps_of_engineers/i, 'USACE ')
        .replace(/^Absolute Cheapskate Way to Start Making Knives - Scott Jones/i, 'Cheapskate Guide to Knifemaking')
        .replace(/^Don Paul - Everbodys Knife Bible/i, 'Everybodys Knife Bible')
        .replace(/^Experiments on Knife Sharpening - John Verhoeven/i, 'Experiments on Knife Sharpening')
        .replace(/^Step-by-Step Knifemaking- David Boye/i, 'Step-by-Step Knifemaking')
        .replace(/^THE ADVANCE KNIFE MAKERS MANUAL - Harold Hoffman/i, 'Advanced Knifemaking Manual')
        .replace(/^The Complete Bladesmith-Forging Your Way to Perfection-Jim Hrisoulas/i, 'The Complete Bladesmith')
        .replace(/^The Modern Blacksmith - Alexander G. Weygers/i, 'The Modern Blacksmith')
        .replace(/^Where There Is No Doctor - A Village Health Care Handbook - David Werner/i, 'Where There Is No Doctor')
        .replace(/^how to avoid getting lost gta 05-02-013/i, 'How to Avoid Getting Lost')
        .replace(/^how_to_find_your_way gta 05-02-013/i, 'How to Find Your Way');

    // Replace underscores, hyphens, and multi-spaces
    let title = nameWithoutExt.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();

    // Capitalize words nicely
    title = title.split(' ').map(word => {
        if (!word) return '';
        // If it starts with FM/TC/TM/DA/USACE, keep it uppercase
        if (/^(FM|TC|TM|DA|USACE|EP|EM|SH|ST|STP|FMI|MM|CC|AGI|USDA|TPE|ATV|MTDC)$/i.test(word)) {
            return word.toUpperCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');

    return title;
}

// Get subcategory / category display mapping
function getCategoryName(relPath) {
    const parts = relPath.split('/');
    const rootDir = parts[0];

    switch (rootDir) {
        case 'ATL':
            return 'Appropriate Technology Library (ATL)';
        case 'Knifemaking':
            return 'Bladesmithing & Knifemaking';
        case 'The Modern Blacksmith':
            return 'Blacksmithing';
        case 'Where There Is No Doctor':
            return 'Medical & First Aid';
        case 'COOKING':
            return 'Cookbooks & Culinary';
        case 'USDA Forest Service':
            return 'USDA Forest Service (Trails & Saws)';
        case 'US Army Corps of Engineers':
            return 'US Army Corps of Engineers (Construction)';
        case 'United States Army':
            return 'US Army Field Manuals';
        case 'Canadian Army':
            return 'Canadian Army Manuals';
        case 'United States Marine Corps':
            return 'US Marine Corps Manuals';
        case 'United States Navy':
            return 'US Navy Manuals';
        case 'United States Air Force':
            return 'US Air Force Manuals';
        case 'United States Joint Services':
            return 'US Joint Services Manuals';
        case 'NATURE':
            return 'Nature & Wildlife';
        case 'PSYCHOLOGY AND MEDICINE':
            return 'Psychology & Preventive Medicine';
        case 'Airdrop of Supplies and Equipment Rigging':
            return 'Airdrop & Rigging (Ropework)';
        case 'Other Information':
            return 'General Survival & Navigation';
        case 'BOOKS THAT CHANGED THE WORLD':
            return 'Historical & Philosophy';
        default:
            return rootDir || 'General Reference';
    }
}

// Recursive directory scan
function scanDirectory(dir, baseDir = SOURCE_DIR) {
    let results = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            results = results.concat(scanDirectory(fullPath, baseDir));
        } else {
            const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
            const ext = path.extname(file).toLowerCase();

            // Only index supported extensions
            if (!['.zip', '.pdf', '.epub', '.mp4', '.txt'].includes(ext)) {
                continue;
            }

            // Apply Blacklist filter for safety
            const lowCaseFile = file.toLowerCase();
            const matchesBlacklist = BLACKLIST.some(word => lowCaseFile.includes(word));
            if (matchesBlacklist) {
                // Check if it matches any whitelist exceptions
                const isWhitelisted = WHITELIST_EXCEPTIONS.some(word => lowCaseFile.includes(word));
                if (!isWhitelisted) {
                    // Skip blacklisted files
                    continue;
                }
            }

            // Also skip general firearm mentions unless they are whitelisted marksmanship cards
            if ((lowCaseFile.includes('gun') || lowCaseFile.includes('rifle') || lowCaseFile.includes('weapon')) && 
                !WHITELIST_EXCEPTIONS.some(word => lowCaseFile.includes(word))) {
                continue;
            }

            const category = getCategoryName(relPath);

            results.push({
                name: file,
                path: relPath,
                title: getCleanTitle(file),
                size: stat.size,
                type: ext.substring(1),
                category: category
            });
        }
    }
    return results;
}

try {
    console.log(`Scanning local hand-picked survival folder: ${SOURCE_DIR}...`);
    const index = scanDirectory(SOURCE_DIR);
    
    // Group index by Category
    const groupedIndex = {};
    index.forEach(item => {
        if (!groupedIndex[item.category]) {
            groupedIndex[item.category] = [];
        }
        groupedIndex[item.category].push({
            name: item.name,
            path: item.path,
            title: item.title,
            size: item.size,
            type: item.type
        });
    });

    // Write index output
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(groupedIndex, null, 4));
    console.log(`Success! Indexed ${index.length} off-grid files.`);
    console.log(`Output written to: ${OUTPUT_FILE}`);
} catch (error) {
    console.warn(`Warning: Could not index local survival library. Build will continue.`, error.message);
    // Write empty index so the app doesn't break
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({}, null, 4));
}
