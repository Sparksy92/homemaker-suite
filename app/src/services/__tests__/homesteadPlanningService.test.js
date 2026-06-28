import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadPlan, savePlan, resetPlan, updatePlan } from '../homesteadPlanningService';
import { triggerSyncPush } from '../homesteadSyncService';

// Mock the sync push trigger to avoid side effects
vi.mock('../homesteadSyncService', () => ({
    triggerSyncPush: vi.fn()
}));

describe('homesteadPlanningService', () => {
    const TEST_KEY = 'homemaker_garden_plan';

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should load default schema if key does not exist', () => {
        const plan = loadPlan(TEST_KEY);
        expect(plan).toBeDefined();
        expect(plan.schemaVersion).toBe(1);
        expect(plan.beds).toEqual([]);
    });

    it('should save plan and trigger sync push', () => {
        const value = { beds: [{ id: 1, name: 'Raised Bed 1' }], schemaVersion: 1 };
        savePlan(TEST_KEY, value);

        // Verify stored in localStorage
        const stored = JSON.parse(localStorage.getItem(TEST_KEY));
        expect(stored.beds).toEqual(value.beds);
        expect(stored.updatedAt).toBeDefined();
        
        // Verify triggerSyncPush was invoked
        expect(triggerSyncPush).toHaveBeenCalledWith(TEST_KEY);
    });

    it('should update plan using updater function', () => {
        const original = { beds: [], schemaVersion: 1 };
        savePlan(TEST_KEY, original);

        updatePlan(TEST_KEY, (current) => {
            return {
                ...current,
                beds: [...current.beds, { id: 2, name: 'Bed 2' }]
            };
        });

        const updated = loadPlan(TEST_KEY);
        expect(updated.beds).toHaveLength(1);
        expect(updated.beds[0].name).toBe('Bed 2');
    });

    it('should write a tombstone to localStorage when resetPlan is called', () => {
        resetPlan(TEST_KEY);

        const raw = localStorage.getItem(TEST_KEY);
        expect(raw).toBeDefined();

        const stored = JSON.parse(raw);
        expect(stored.deletedAt).toBeDefined();
        expect(stored.updatedAt).toBeDefined();
        expect(stored.schemaVersion).toBe(1);

        // Should trigger sync push
        expect(triggerSyncPush).toHaveBeenCalledWith(TEST_KEY);
    });

    it('should load default schema when loading a tombstoned key', () => {
        // Write tombstone directly
        const tombstone = {
            deletedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            schemaVersion: 1
        };
        localStorage.setItem(TEST_KEY, JSON.stringify(tombstone));

        // Loading should bypass tombstone and return default schema
        const plan = loadPlan(TEST_KEY);
        expect(plan.beds).toEqual([]);
        expect(plan.deletedAt).toBeUndefined(); // Def schema does not have deletedAt
    });
});
