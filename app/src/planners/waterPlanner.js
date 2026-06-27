// Pure water planner engine

export const calculateDailyWaterNeed = ({ people = 2, gallonsPerPerson = 2 }) => {
    return people * gallonsPerPerson;
};

export const calculateStorageTarget = ({ people = 2, targetDays = 90, gallonsPerPerson = 2 }) => {
    return people * targetDays * gallonsPerPerson;
};

export const estimateRainCatchment = ({ roofAreaSqFt = 1000, rainfallInches = 1, efficiency = 0.85 }) => {
    // Rain catchment formula: Area (sq ft) * Rainfall (inches) * 0.6233 (Gallons per sq ft per inch) * Runoff Efficiency
    const rawGallons = roofAreaSqFt * rainfallInches * 0.6233;
    return Math.round(rawGallons * efficiency);
};

export const suggestStorageContainers = ({ targetGallons }) => {
    // Standard off-grid containers
    const ibcTotes = Math.ceil(targetGallons / 275);
    const blueDrums = Math.ceil(targetGallons / 55);
    
    return [
        { type: 'IBC Tote', capacity: '275 Gal', count: ibcTotes, desc: 'Best for permanent gravity-fed outdoor non-potable storage.' },
        { type: 'Food-Grade Drum', capacity: '55 Gal', count: blueDrums, desc: 'Excellent for potable backup buffer storage, easily sanitized.' },
        { type: 'Jerry Cans', capacity: '5 Gal', count: Math.ceil(targetGallons / 5), desc: 'Portable transport vessels, convenient for indoor water access.' }
    ];
};

export const generateWaterMaintenanceTasks = ({ sources = [], treatmentMethods = [], climate = 'temperate' }) => {
    const tasks = [
        { id: 'w-flush', title: 'Clean first-flush diverter', desc: 'Empty sediment chamber and wash screen filter.', interval: 'Monthly / After heavy rains', completed: false },
        { id: 'w-pot', title: 'Verify water potability', desc: 'Use a local certified water laboratory or perform off-grid test kit evaluations.', interval: 'Every 6 months', completed: false }
    ];

    if (sources.includes('rain_catchment')) {
        tasks.push({ id: 'w-gutters', title: 'Clear debris from gutters', desc: 'Rake out leaves, branches, and organic sludge from roof run-off channels.', interval: 'Seasonal (Spring/Autumn)', completed: false });
    }

    if (treatmentMethods.includes('filtration')) {
        tasks.push({ id: 'w-ceramic', title: 'Scrub ceramic filter candles', desc: 'Use a clean abrasive pad (no soap) to restore flow rates when candles clog.', interval: 'As flow slows down', completed: false });
    }

    if (climate === 'temperate' || climate === 'boreal') {
        tasks.push({ id: 'w-winter', title: 'Winterize catchment systems', desc: 'Disconnect rain barrels, drain external pipes, and insulate above-ground pump houses.', interval: 'Autumn (Before first hard freeze)', completed: false });
    }

    return tasks;
};
