import { describe, it, expect } from 'vitest';
import { createProjectFromTemplate } from '../projectPlanner';

describe('projectPlanner createProjectFromTemplate', () => {
    it('should successfully build a project using a legacy string template ID', () => {
        const proj = createProjectFromTemplate('raised_bed');
        expect(proj).not.toBeNull();
        expect(proj.sourceBlueprintId).toBe('raised_bed');
        expect(proj.title).toBe('Raised Bed Frame');
        expect(proj.status).toBe('planned');
        expect(proj.priority).toBe('medium');
        expect(proj.materials).toHaveLength(4);
        expect(proj.steps).toHaveLength(5);
        expect(proj.createdAt).toBeDefined();
        expect(proj.updatedAt).toBeDefined();
    });

    it('should successfully build a project using a full blueprint object', () => {
        const customBlueprint = {
            id: 'custom_aquaponics',
            title: 'Custom Aquaponics System',
            system: 'Infrastructure',
            difficulty: 'Hard',
            safetyLevel: 'High',
            estimatedTime: '2 days',
            materials: ['IBC tote', 'Water pump', 'Grow media'],
            tools: ['Jigsaw', 'Drill'],
            steps: [
                { id: 1, text: 'Cut the IBC tote top off.', completed: false },
                { id: 2, text: 'Plumb drainage siphon.', completed: false },
                { id: 3, text: 'Wash grow media and fill bed.', completed: false }
            ],
            notes: 'Test notes'
        };

        const proj = createProjectFromTemplate(customBlueprint);
        expect(proj).not.toBeNull();
        expect(proj.sourceBlueprintId).toBe('custom_aquaponics');
        expect(proj.title).toBe('Custom Aquaponics System');
        expect(proj.materials).toContain('IBC tote');
        expect(proj.steps).toHaveLength(3);
        expect(proj.steps[0].completed).toBe(false);
    });

    it('should return null when template/id is missing or invalid', () => {
        expect(createProjectFromTemplate('invalid_id')).toBeNull();
        expect(createProjectFromTemplate(null)).toBeNull();
        expect(createProjectFromTemplate({})).toBeNull();
    });

    it('should ensure cloned step objects are independent from the source template', () => {
        const blueprint = {
            id: 'independent_test',
            title: 'Test',
            steps: [{ id: 1, text: 'Step 1', completed: false }]
        };

        const proj = createProjectFromTemplate(blueprint);
        expect(proj.steps[0]).not.toBe(blueprint.steps[0]); // Object references must differ
        
        proj.steps[0].completed = true;
        expect(blueprint.steps[0].completed).toBe(false); // Template should not be mutated
    });
});
