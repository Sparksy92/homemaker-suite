// Pure garden planner engine

export const suggestCropsForProfile = ({ homesteadProfile, cropProfiles = [] }) => {
    if (!homesteadProfile) return [];
    const climate = homesteadProfile.region?.climate || 'temperate';
    const gardenType = homesteadProfile.garden?.type || 'raised_beds';

    // Basic logic mapping crop profiles to user's parameters
    return cropProfiles.filter(crop => {
        // Suggested based on climate and space
        if (gardenType === 'containers' && !crop.containerFriendly) {
            return false;
        }
        if (climate === 'boreal' && crop.needsLongWarmSeason) {
            return false; // boreal zones struggle with long warm-season crops (unless greenhouse)
        }
        return true;
    }).map(crop => crop.id);
};

export const generateCropCalendar = ({ selectedCrops = [], frostDates = {}, cropProfiles = [] }) => {
    const calendar = [];
    const lastSpring = frostDates.lastSpringFrost || 'Last Spring Frost';

    selectedCrops.forEach(cropId => {
        const crop = cropProfiles.find(c => c.id === cropId);
        if (!crop) return;

        // Add planting phases
        if (crop.sowIndoorsWeeksBeforeFrost) {
            calendar.push({
                cropId,
                cropName: crop.name,
                action: 'Start Seeds Indoors',
                timing: `${crop.sowIndoorsWeeksBeforeFrost} weeks before ${lastSpring}`,
                notes: 'Use seed starting mix, maintain warm soil temperature.'
            });
            calendar.push({
                cropId,
                cropName: crop.name,
                action: 'Transplant Outdoors',
                timing: `Around ${lastSpring}`,
                notes: 'Harden off seedlings for 7 days before transplanting.'
            });
        } else {
            calendar.push({
                cropId,
                cropName: crop.name,
                action: 'Direct Sow Seeds',
                timing: crop.directSowRelative || `At or after ${lastSpring}`,
                notes: 'Sow directly in prepared soil beds, water lightly.'
            });
        }

        calendar.push({
            cropId,
            cropName: crop.name,
            action: 'Harvest Window',
            timing: `${crop.daysToMaturity || '60-90'} days after sowing/planting`,
            notes: crop.harvestIndicators || 'Check size and color.'
        });
    });

    return calendar;
};

export const estimateBedCapacity = ({ beds = [], selectedCrops = [], cropProfiles = [] }) => {
    let totalSqFt = 0;
    beds.forEach(bed => {
        const w = parseFloat(bed.width) || 0;
        const l = parseFloat(bed.length) || 0;
        totalSqFt += w * l;
    });

    const cropEstimates = selectedCrops.map(cropId => {
        const crop = cropProfiles.find(c => c.id === cropId);
        if (!crop) return null;
        
        // Standard square foot garden spacings: plants per sq ft
        const plantsPerSqFt = crop.plantsPerSqFt || 1;
        // Allocate space evenly among selected crops
        const allocatedSqFt = selectedCrops.length > 0 ? (totalSqFt / selectedCrops.length) : 0;
        const maxPlants = Math.floor(allocatedSqFt * plantsPerSqFt);

        return {
            cropId,
            name: crop.name,
            allocatedSqFt: parseFloat(allocatedSqFt.toFixed(1)),
            plantsPerSqFt,
            maxPlants,
            depthRequired: crop.depthRequiredInches || 6
        };
    }).filter(Boolean);

    return {
        totalSqFt,
        cropEstimates
    };
};

export const generateGardenTasks = ({ selectedCrops = [], cropProfiles = [] }) => {
    const tasks = [
        { id: 'g-prep', title: 'Prepare garden beds', desc: 'Add 2 inches of aged compost and rake smooth.', due: '2 weeks before Last Spring Frost', completed: false },
        { id: 'g-irr', title: 'Setup irrigation lines', desc: 'Install drip lines or check cistern hose connections.', due: 'Around Last Spring Frost', completed: false }
    ];

    selectedCrops.forEach((cropId, idx) => {
        const crop = cropProfiles.find(c => c.id === cropId);
        if (!crop) return;

        tasks.push({
            id: `g-crop-${cropId}-${idx}`,
            title: `Sow/Transplant ${crop.name}`,
            desc: `Plant ${crop.name} according to calendar spacing guidelines.`,
            due: crop.sowIndoorsWeeksBeforeFrost ? `At Last Spring Frost` : `Direct sow after Last Spring Frost`,
            completed: false
        });
    });

    tasks.push({ id: 'g-mulch', title: 'Mulch crop beds', desc: 'Apply straw or leaf mulch to retain water and suppress weeds.', due: 'Early Summer', completed: false });
    tasks.push({ id: 'g-frost-prep', title: 'Protect late crops', desc: 'Prepare frost blankets for late season harvest extensions.', due: '2 weeks before First Fall Frost', completed: false });

    return tasks;
};
