import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Sun, CloudRain, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { mealPlans } from '../data/mealPlans';

const MealPlans = () => {
    const [selectedPlan, setSelectedPlan] = useState(null);

    return (
        <div className="bg-sand-50">
            <AnimatePresence mode="wait">
                {!selectedPlan ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="" // Removed padding
                    >
                        <header className="mb-8">
                            <h1 className="text-3xl font-serif text-sage-900 mb-2">Meal Plans</h1>
                            <p className="text-sage-600">Seasonal menus to simplify your kitchen.</p>
                        </header>

                        <div className="grid gap-4">
                            {mealPlans.map(plan => (
                                <button
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan)}
                                    className="bg-white p-5 rounded-xl shadow-sm border border-sand-200 text-left hover:border-terracotta-200 transition-colors group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${plan.season === 'Spring' ? 'bg-green-100 text-green-700' :
                                            plan.season === 'Summer' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {plan.season}
                                        </span>
                                        <Calendar size={20} className="text-sand-400 group-hover:text-terracotta-500 transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-serif font-bold text-sage-800 mb-1">{plan.title}</h3>
                                    <p className="text-sm text-sage-500 line-clamp-2">{plan.description}</p>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="detail"
                        initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}
                        className="p-6"
                    >
                        <button
                            onClick={() => setSelectedPlan(null)}
                            className="flex items-center gap-2 text-sage-600 font-bold mb-6 hover:text-sage-800"
                        >
                            <ArrowLeft size={20} />
                            Back to Plans
                        </button>

                        <div className="bg-white rounded-2xl shadow-lg border border-sand-200 overflow-hidden">
                            <div className="p-6 bg-sage-50 border-b border-sand-200">
                                <h1 className="text-2xl font-serif font-bold text-sage-900">{selectedPlan.title}</h1>
                                <p className="text-sage-600 mt-2">{selectedPlan.description}</p>
                            </div>

                            <div className="divide-y divide-sand-100">
                                {selectedPlan.days.map((day, index) => (
                                    <div key={index} className="p-4">
                                        <h3 className="font-bold text-terracotta-600 mb-2 uppercase tracking-wide text-xs">{day.day}</h3>
                                        <div className="space-y-2">
                                            <MealRow label="Breakfast" meal={day.breakfast} />
                                            <MealRow label="Lunch" meal={day.lunch} />
                                            <MealRow label="Dinner" meal={day.dinner} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MealRow = ({ label, meal }) => (
    <div className="flex items-baseline gap-2 text-sm">
        <span className="font-medium text-sage-400 w-16 shrink-0">{label}:</span>
        <span className="text-charcoal-700">{meal}</span>
    </div>
);

export default MealPlans;
