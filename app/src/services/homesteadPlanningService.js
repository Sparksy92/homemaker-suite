// Local planning data service for Homemaker Suite

const KEYS = {
    HOMESTEAD: 'homemaker_homestead_plan',
    GARDEN: 'homemaker_garden_plan',
    PANTRY: 'homemaker_pantry_plan',
    WATER: 'homemaker_water_plan',
    ENERGY: 'homemaker_energy_plan',
    PROJECTS: 'homemaker_build_projects',
    TASKS: 'homemaker_seasonal_tasks',
    BINDER: 'homemaker_field_binder_settings'
};

const DEFAULT_SCHEMAS = {
    [KEYS.HOMESTEAD]: () => ({
        schemaVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        householdSnapshot: {},
        operatingMode: 'starter', // starter, seasonal, deep_resilience, full_off_grid
        priorities: [],
        notes: ''
    }),
    [KEYS.GARDEN]: () => ({
        schemaVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        frostDates: {
            lastSpringFrost: '',
            firstFallFrost: '',
            frostFreeDays: ''
        },
        beds: [],
        selectedCrops: [],
        cropCalendar: [],
        tasks: []
    }),
    [KEYS.PANTRY]: () => ({
        schemaVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        householdSize: 2,
        targetDays: 90,
        caloriesPerPerson: 2000,
        categoryTargets: {},
        inventoryNotes: '',
        rotationTasks: []
    }),
    [KEYS.WATER]: () => ({
        schemaVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        householdSize: 2,
        dailyGallonsPerPerson: 2,
        targetDays: 90,
        primarySource: '',
        backupSource: '',
        storageContainers: [],
        treatmentMethods: [],
        maintenanceTasks: []
    }),
    [KEYS.ENERGY]: () => ({
        schemaVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dailyLoads: [],
        solarEstimate: {},
        batteryEstimate: {},
        generatorBackup: {},
        safetyChecklist: []
    }),
    [KEYS.PROJECTS]: () => ({
        schemaVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        projects: []
    }),
    [KEYS.TASKS]: () => ({
        schemaVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tasks: []
    }),
    [KEYS.BINDER]: () => ({
        schemaVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        selectedSections: ['profile', 'water', 'pantry', 'garden', 'energy', 'projects', 'safety', 'tasks', 'emergency'],
        includeEmergencySection: true
    })
};

export const loadPlan = (key, fallback) => {
    try {
        const data = localStorage.getItem(key);
        if (!data) {
            const def = DEFAULT_SCHEMAS[key] ? DEFAULT_SCHEMAS[key]() : (fallback || {});
            return def;
        }
        const parsed = JSON.parse(data);
        // Ensure standard fields like schemaVersion exist
        if (parsed && typeof parsed === 'object') {
            return {
                ...(DEFAULT_SCHEMAS[key] ? DEFAULT_SCHEMAS[key]() : {}),
                ...parsed
            };
        }
        return DEFAULT_SCHEMAS[key] ? DEFAULT_SCHEMAS[key]() : (fallback || {});
    } catch (e) {
        console.error(`Error loading plan for key ${key}:`, e);
        return DEFAULT_SCHEMAS[key] ? DEFAULT_SCHEMAS[key]() : (fallback || {});
    }
};

export const savePlan = (key, value) => {
    try {
        if (value && typeof value === 'object') {
            value.updatedAt = new Date().toISOString();
        }
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error(`Error saving plan for key ${key}:`, e);
    }
};

export const updatePlan = (key, updater) => {
    try {
        const current = loadPlan(key);
        const updated = updater(current);
        savePlan(key, updated);
        return updated;
    } catch (e) {
        console.error(`Error updating plan for key ${key}:`, e);
        return null;
    }
};

export const resetPlan = (key) => {
    try {
        if (DEFAULT_SCHEMAS[key]) {
            const def = DEFAULT_SCHEMAS[key]();
            savePlan(key, def);
            return def;
        }
        localStorage.removeItem(key);
        return null;
    } catch (e) {
        console.error(`Error resetting plan for key ${key}:`, e);
        return null;
    }
};

export const loadAllPlans = () => {
    const plans = {};
    Object.keys(KEYS).forEach(k => {
        const keyVal = KEYS[k];
        plans[keyVal] = loadPlan(keyVal);
    });
    return plans;
};

export const initializePlansFromHomesteadProfile = (homesteadProfile) => {
    if (!homesteadProfile || homesteadProfile.skipped) return;

    const { household, region, water, pantry, energy } = homesteadProfile;

    // 1. Homestead plan updates
    updatePlan(KEYS.HOMESTEAD, plan => ({
        ...plan,
        householdSnapshot: household || {},
        operatingMode: energy?.setup === 'solar_off_grid' ? 'full_off_grid' : 'starter'
    }));

    // 2. Garden plan updates
    updatePlan(KEYS.GARDEN, plan => {
        let lastSpring = '';
        let firstFall = '';
        if (region?.frostDates) {
            // Attempt to parse "Last: May 10 / First: Oct 15"
            const parts = region.frostDates.split('/');
            lastSpring = parts[0] ? parts[0].replace('Last:', '').trim() : '';
            firstFall = parts[1] ? parts[1].replace('First:', '').trim() : '';
        }
        return {
            ...plan,
            frostDates: {
                lastSpringFrost: lastSpring || plan.frostDates.lastSpringFrost,
                firstFallFrost: firstFall || plan.frostDates.firstFallFrost,
                frostFreeDays: region?.frostFreeDays || plan.frostDates.frostFreeDays
            }
        };
    });

    // 3. Pantry plan updates
    updatePlan(KEYS.PANTRY, plan => ({
        ...plan,
        householdSize: household?.size ? parseInt(household.size) : plan.householdSize,
        targetDays: pantry?.targetDays ? parseInt(pantry.targetDays) : plan.targetDays
    }));

    // 4. Water plan updates
    updatePlan(KEYS.WATER, plan => ({
        ...plan,
        householdSize: household?.size ? parseInt(household.size) : plan.householdSize,
        targetDays: pantry?.targetDays ? parseInt(pantry.targetDays) : plan.targetDays,
        primarySource: water?.primary || plan.primarySource,
        backupSource: water?.secondary || plan.backupSource
    }));
};
