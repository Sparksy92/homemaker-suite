// Schema validation utilities for Homemaker Suite

export const isPlainObject = (value) => {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
};

export const safeParseJson = (value, fallback) => {
    if (!value) return fallback;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

export const normalizeNumber = (value, fallback = 0, min = -Infinity, max = Infinity) => {
    const num = parseFloat(value);
    if (isNaN(num)) return fallback;
    return Math.max(min, Math.min(max, num));
};

export const validateHomesteadProfile = (profile) => {
    if (!isPlainObject(profile)) return false;
    if (profile.schemaVersion !== 1) return false;
    
    // Check skipped profiles
    if (profile.skipped) {
        return typeof profile.skippedAt === 'string' || profile.skippedAt === undefined;
    }

    // Check complete profiles
    const requiredKeys = ['completedAt', 'household', 'region', 'water', 'pantry', 'energy', 'heat', 'sanitation', 'garden', 'experience'];
    return requiredKeys.every(key => profile[key] !== undefined);
};

export const validatePlanObject = (plan, expectedSchemaVersion = 1) => {
    if (!isPlainObject(plan)) return false;
    if (plan.schemaVersion !== expectedSchemaVersion) return false;
    if (typeof plan.createdAt !== 'string' || typeof plan.updatedAt !== 'string') return false;
    return true;
};
