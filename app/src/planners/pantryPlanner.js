// Pure pantry planner engine

export const calculatePantryTargets = ({ householdSize = 2, targetDays = 90, caloriesPerPerson = 2000 }) => {
    const totalKcalRequired = householdSize * targetDays * caloriesPerPerson;

    // Standard long-term survival pantry multipliers (percentage of daily calories)
    const grainsLbs = Math.round((totalKcalRequired * 0.40) / 1600); // 40% of calories, ~1600 kcal per dry lb
    const legumesLbs = Math.round((totalKcalRequired * 0.25) / 1500); // 25% of calories, ~1500 kcal per dry lb
    const fatsLbs = Math.round((totalKcalRequired * 0.15) / 4000); // 15% of calories, ~4000 kcal per lb of oils
    const sugarsLbs = Math.round((totalKcalRequired * 0.10) / 1200); // 10% of calories, ~1200 kcal per lb
    const vegetablesLbs = Math.round((totalKcalRequired * 0.10) / 300); // 10% of calories, ~300 kcal per dry/dehydrated lb

    // Non-food targets
    const waterGallons = householdSize * targetDays * 1; // 1 gallon per person per day minimum for drinking
    const cookingFuelLbs = Math.round(householdSize * targetDays * 0.15); // ~0.15 lbs propane/wood equivalent per person per day

    return {
        totalKcalRequired,
        categories: {
            grains_starch: { label: 'Grains & Starches', targetLbs: grainsLbs, desc: 'Rice, oats, wheat, flour, cornmeal, pasta.' },
            proteins_legumes: { label: 'Proteins & Legumes', targetLbs: legumesLbs, desc: 'Beans, lentils, canned meats, milk powder, nuts.' },
            fats_oils: { label: 'Fats & Oils', targetLbs: fatsLbs, desc: 'Olive oil, coconut oil, butter, lard.' },
            sugars_fruits: { label: 'Sugars & Dried Fruits', targetLbs: sugarsLbs, desc: 'Honey, sugar, maple syrup, raisins, dried apples.' },
            vegetables: { label: 'Vegetables (Dry/Canned)', targetLbs: vegetablesLbs, desc: 'Dehydrated vegetables, canned greens, tomatoes.' },
            water_filtration: { label: 'Emergency Drinking Water', targetGallons: waterGallons, desc: 'Drinking water buffer (excludes sanitation).' },
            fuel_cooking: { label: 'Cooking Fuel Buffer', targetLbs: cookingFuelLbs, desc: 'Propane canisters, charcoal, dry firewood equivalent.' }
        }
    };
};

export const estimateStorageVolume = (totalLbs) => {
    // 1 lb of dry storage averages roughly 0.022 cubic feet of shelf space
    const cuFt = parseFloat((totalLbs * 0.022).toFixed(1));
    // A standard heavy-duty 5-shelf rack holds roughly 15 cubic feet of packed totes
    const racksCount = parseFloat((cuFt / 15).toFixed(1));
    
    return {
        cubicFeet: cuFt,
        estimatedRacks: racksCount || 0.5
    };
};

export const generateRotationTasks = () => {
    return [
        { id: 'p-fifo', title: 'Implement FIFO (First-In, First-Out)', desc: 'Label all storage containers with month/year. Always pull from the oldest date first.', completed: false },
        { id: 'p-audit', title: 'Bi-annual inventory audit', desc: 'Verify all container seals, check for pests/moisture, and verify expiration dates.', completed: false },
        { id: 'p-temp', title: 'Verify storage climate', desc: 'Ensure pantry room remains below 70°F (21°C) and is completely dark to preserve nutrients.', completed: false }
    ];
};
