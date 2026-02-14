import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { ArrowLeft, BookOpen, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

// Import all manual content directly (Vite will handle this)
import foodMd from '../modules/food/content/manual_food_production.md?raw';
import preservationMd from '../modules/preservation/content/manual_preservation.md?raw';
import waterMd from '../modules/water/content/manual_water.md?raw';
import medicalMd from '../modules/medical/content/manual_medical.md?raw';
import energyMd from '../modules/energy/content/manual_energy.md?raw';
import shelterMd from '../modules/shelter/content/manual_shelter.md?raw';
import wildernessMd from '../modules/wilderness/content/manual_wilderness.md?raw';
import gardeningMd from '../modules/gardening/content/manual_gardening.md?raw';

// Scenario Playbooks
import winterOutageMd from '../public/content/21 Scenario Playbooks/21.1 72-Hour Winter Outage.md?raw';
import summerOutageMd from '../public/content/21 Scenario Playbooks/21.2 72-Hour Summer Outage.md?raw';
import gridDownKidsMd from '../public/content/21 Scenario Playbooks/21.3 7-Day Grid-Down Children.md?raw';
import budgetSurvivalMd from '../public/content/21 Scenario Playbooks/21.4 30-Day Budget Survival.md?raw';
import waterContamMd from '../public/content/21 Scenario Playbooks/21.5 Water Contamination.md?raw';
import winterStormMd from '../public/content/21 Scenario Playbooks/21.6 Severe Winter Storm.md?raw';
import supplyPlanMd from '../public/content/21 Scenario Playbooks/21.7 3-Month Supply Plan.md?raw';

const manuals = {
    'food': { title: 'Food Production', content: foodMd, color: 'bg-green-100 text-green-800' },
    'preservation': { title: 'Food Preservation', content: preservationMd, color: 'bg-amber-100 text-amber-800' },
    'water': { title: 'Water Systems', content: waterMd, color: 'bg-blue-100 text-blue-800' },
    'medical': { title: 'Survival Medicine', content: medicalMd, color: 'bg-red-100 text-red-800' },
    'energy': { title: 'Off-Grid Energy', content: energyMd, color: 'bg-yellow-100 text-yellow-800' },
    'shelter': { title: 'Shelter & Home', content: shelterMd, color: 'bg-stone-100 text-stone-800' },
    'wilderness': { title: 'Wilderness Survival', content: wildernessMd, color: 'bg-emerald-100 text-emerald-800' },
    'gardening': { title: 'Gardening & Soil', content: gardeningMd, color: 'bg-lime-100 text-lime-800' },

    // Scenarios
    'scenario-winter': { title: '72-Hour Winter Outage', content: winterOutageMd, color: 'bg-blue-50 text-blue-900 border-blue-200' },
    'scenario-summer': { title: '72-Hour Summer Outage', content: summerOutageMd, color: 'bg-orange-50 text-orange-900 border-orange-200' },
    'scenario-kids': { title: '7-Day Grid-Down (Kids)', content: gridDownKidsMd, color: 'bg-purple-50 text-purple-900 border-purple-200' },
    'scenario-budget': { title: '30-Day Budget Survival', content: budgetSurvivalMd, color: 'bg-green-50 text-green-900 border-green-200' },
    'scenario-water': { title: 'Water Contamination', content: waterContamMd, color: 'bg-cyan-50 text-cyan-900 border-cyan-200' },
    'scenario-storm': { title: 'Severe Winter Storm', content: winterStormMd, color: 'bg-slate-50 text-slate-900 border-slate-200' },
    'scenario-supply': { title: '3-Month Supply Plan', content: supplyPlanMd, color: 'bg-yellow-50 text-yellow-900 border-yellow-200' },
};

const ManualReader = () => {
    const { id } = useParams();
    const manual = manuals[id];

    if (!manual) {
        return (
            <div className="p-8 text-center">
                <AlertTriangle className="mx-auto w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold">Manual Not Found</h2>
                <Link to="/" className="text-blue-600 hover:underline mt-4 block">Return Home</Link>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-20 bg-sand-50 min-h-screen"
        >
            {/* Header / Hero */}
            <div className={`relative bg-sage-900 text-white overflow-hidden shadow-md`}>
                <div className="absolute inset-0 opacity-10 bg-[url('/patterns/topography.svg')]"></div> {/* Texture placeholder/concept */}
                <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-16">
                    <Link to="/" className="inline-flex items-center gap-2 text-sage-200 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-bold tracking-wide text-sm uppercase">Back to Library</span>
                    </Link>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4 bg-white/10 text-sage-50 backdrop-blur-sm border border-white/20`}>
                        Survival Manual v1.0
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight">{manual.title}</h1>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-20">
                <div className="bg-white rounded-t-3xl shadow-xl p-8 md:p-12 min-h-[500px] border border-stone-100">
                    <MarkdownRenderer content={manual.content} />
                </div>
            </div>
        </motion.div>
    );
};

export default ManualReader;
