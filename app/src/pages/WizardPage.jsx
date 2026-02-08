import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WizardRunner from '../components/WizardRunner';

// Import Wizard Data
import emergencyPlan from '../data/wizards/EmergencyPlanWizard.json';
import waterSafety from '../data/wizards/WaterSafetyWizard.json';
import winterBlackout from '../data/wizards/WinterBlackoutWizard.json';
import gardenPlanner from '../data/wizards/GardenPlannerWizard.json';
import energyPlanner from '../data/wizards/EnergyPlannerWizard.json';

const wizards = {
    'emergency-plan': emergencyPlan,
    'water-safety': waterSafety,
    'winter-blackout': winterBlackout,
    'garden-planner': gardenPlanner,
    'energy-planner': energyPlanner
};

const WizardPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const wizardData = wizards[id];

    if (!wizardData) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-red-600">Wizard Not Found</h2>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 text-blue-600 hover:underline"
                >
                    Return Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-100 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <WizardRunner
                    wizard={wizardData}
                    onExit={() => navigate('/')}
                />
            </div>
        </div>
    );
};

export default WizardPage;
