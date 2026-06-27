// Pure seasonal task engine

export const getCurrentSeason = (date = new Date()) => {
    const month = date.getMonth(); // 0-indexed: 0 = Jan, 11 = Dec
    
    // Northern hemisphere seasons
    if (month >= 2 && month <= 4) {
        return 'Spring';
    } else if (month >= 5 && month <= 7) {
        return 'Summer';
    } else if (month >= 8 && month <= 10) {
        return 'Fall';
    } else {
        return 'Winter';
    }
};

export const generateSeasonalTasks = ({ date = new Date(), homesteadProfile = null }) => {
    const season = getCurrentSeason(date);
    const climate = homesteadProfile?.region?.climate || 'temperate';
    const waterSource = homesteadProfile?.water?.primary || 'well';
    const heatingSource = homesteadProfile?.heat?.source || 'wood_stove';

    const tasks = [];

    if (season === 'Spring') {
        tasks.push(
            { id: 's-sp-1', system: 'Garden', title: 'Start indoor seeds', desc: 'Sow warm-season crops (tomatoes, peppers) inside starter trays.', priority: 'high' },
            { id: 's-sp-2', system: 'Garden', title: 'Prepare outdoor beds', desc: 'Rake compost into beds and pull early spring weeds.', priority: 'medium' },
            { id: 's-sp-3', system: 'Water', title: 'Inspect gutters and rain diverters', desc: 'Clear winter sludge and leaves from rain collection lines.', priority: 'high' },
            { id: 's-sp-4', system: 'Infrastructure', title: 'Verify hand tools condition', desc: 'Sharpen hoes, shovels, and pruners. Oil moving parts.', priority: 'medium' }
        );
    } else if (season === 'Summer') {
        tasks.push(
            { id: 's-su-1', system: 'Garden', title: 'Deep watering schedule', desc: 'Water early morning or evening to minimize evaporation.', priority: 'high' },
            { id: 's-su-2', system: 'Garden', title: 'Apply straw mulch', desc: 'Spread mulch around plants to cool roots and conserve water.', priority: 'medium' },
            { id: 's-su-3', system: 'Water', title: 'Check cistern water level', desc: 'Monitor consumption rates against remaining reserves.', priority: 'high' },
            { id: 's-su-4', system: 'Preservation', title: 'Canning preparation', desc: 'Sterilize jars, inspect canning lids, and test pressure gauge.', priority: 'high' }
        );
    } else if (season === 'Fall') {
        tasks.push(
            { id: 's-fa-1', system: 'Garden', title: 'Harvest storage crops', desc: 'Dig potatoes, carrots, and harvest squash before hard frosts.', priority: 'high' },
            { id: 's-fa-2', system: 'Water', title: 'Winterize exterior lines', desc: 'Drain outdoor hoses, open valves, and disconnect rain barrels.', priority: 'high' },
            { id: 's-fa-3', system: 'Infrastructure', title: 'Prepare chimney & woodstove', desc: 'Clean flue, inspect door gasket, and pile firewood near the house.', priority: 'high' },
            { id: 's-fa-4', system: 'Preservation', title: 'Clean root cellar vents', desc: 'Verify screens are clear to allow ventilation while preventing rodent entry.', priority: 'medium' }
        );
    } else { // Winter
        tasks.push(
            { id: 's-wi-1', system: 'Energy', title: 'Clear solar panels of snow', desc: 'Keep solar surfaces clear of snow and debris to maintain battery charge.', priority: 'high' },
            { id: 's-wi-2', system: 'Energy', title: 'Monitor battery temperature', desc: 'Ensure lithium or lead-acid batteries remain above freezing to prevent damage.', priority: 'high' },
            { id: 's-wi-3', system: 'Garden', title: 'Plan crop rotation & order seeds', desc: 'Draw garden layout for spring and order heirloom seeds.', priority: 'medium' },
            { id: 's-wi-4', system: 'Preservation', title: 'Rotate pantry inventory', desc: 'Perform audits of dry food boxes and consume oldest items first.', priority: 'medium' }
        );
    }

    // Custom condition tasks
    if (heatingSource === 'wood_stove' && season === 'Winter') {
        tasks.push({ id: 's-cond-wood', system: 'Infrastructure', title: 'Test smoke/CO alarms', desc: 'Critical for safety during peak woodstove heating season.', priority: 'high' });
    }

    if (waterSource === 'well' && (climate === 'temperate' || climate === 'boreal') && season === 'Fall') {
        tasks.push({ id: 's-cond-well', system: 'Water', title: 'Insulate well head', desc: 'Wrap pipes and install heat tape or lightbulb inside pump house.', priority: 'high' });
    }

    return tasks;
};

export const groupTasksBySystem = (tasks = []) => {
    return tasks.reduce((acc, task) => {
        const sys = task.system || 'Other';
        if (!acc[sys]) {
            acc[sys] = [];
        }
        acc[sys].push(task);
        return acc;
    }, {});
};
