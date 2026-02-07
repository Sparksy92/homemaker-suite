import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Droplets, Leaf } from 'lucide-react';

const Dashboard = () => {
    const today = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = today.toLocaleDateString('en-US', dateOptions);

    const hour = today.getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 space-y-8"
        >

            {/* Welcome Section */}
            <section>
                <span className="text-terracotta-600 font-bold text-xs uppercase tracking-widest">{dateString}</span>
                <h2 className="text-3xl mt-1 text-sage-900 leading-tight">
                    {greeting},<br /><span className="italic text-terracotta-500">Homemaker.</span>
                </h2>
            </section>

            {/* Snapshot Cards */}
            <section className="grid grid-cols-2 gap-4">
                <div className="bg-sage-100 p-4 rounded-2xl border border-sage-200 flex flex-col gap-2">
                    <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center text-terracotta-500 shadow-sm">
                        <Sun size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-sage-600 font-medium uppercase">Season</p>
                        <p className="font-serif text-lg font-bold text-sage-900">Winter</p>
                    </div>
                </div>

                <div className="bg-sand-100 p-4 rounded-2xl border border-sand-300 flex flex-col gap-2">
                    <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center text-blue-500 shadow-sm">
                        <Droplets size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-charcoal-light font-medium uppercase">Water Storage</p>
                        <p className="font-serif text-lg font-bold text-charcoal">14 Gal</p>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section>
                <h3 className="text-lg mb-4 flex items-center gap-2">
                    <Leaf size={18} className="text-sage-500" />
                    Daily Focus
                </h3>
                <div className="bg-white rounded-3xl p-1 shadow-sm border border-sand-200">
                    <div className="p-5 border-b border-sand-100">
                        <p className="text-sm text-charcoal-light mb-1">Dinner Plan</p>
                        <p className="font-serif text-xl text-sage-800">Roasted Root Vegetables & Chicken</p>
                    </div>
                    <div className="p-5">
                        <p className="text-sm text-charcoal-light mb-1">Garden Task</p>
                        <p className="font-serif text-xl text-sage-800">Inventory Seed Stock</p>
                    </div>
                </div>
            </section>

        </motion.div>
    );
};

export default Dashboard;
