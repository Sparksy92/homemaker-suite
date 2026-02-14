import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, ArrowLeft, Mail, Info, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Feedback = () => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'Suggestion',
        message: ''
    });

    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Construct mailto link
        const subject = encodeURIComponent(`[Homemaker Feedback] ${formData.type} from ${formData.name || 'Anonymous'}`);
        const body = encodeURIComponent(`Feedback Type: ${formData.type}\nName: ${formData.name || 'Anonymous'}\n\nMessage:\n${formData.message}`);

        window.location.href = `mailto:homemakersuite.help@gmail.com?subject=${subject}&body=${body}`;

        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="min-h-screen bg-sand-50 py-8 px-6 pb-24">
            <div className="max-w-2xl mx-auto">
                {/* Back Button */}
                <Link to="/" className="inline-flex items-center gap-2 text-sage-600 font-bold mb-8 hover:text-sage-800 transition-colors">
                    <ArrowLeft size={18} /> Back to Dashboard
                </Link>

                {/* Header */}
                <div className="bg-sage-800 text-white p-8 rounded-3xl shadow-xl mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <MessageSquare size={120} />
                    </div>
                    <h1 className="text-4xl font-serif font-bold mb-2">Suggestion Box</h1>
                    <p className="text-sage-200 opacity-90 leading-relaxed max-w-lg">
                        Help us build the ultimate survival companion. Whether it's a new guide idea, a correction, or just a tip you'd like to share—we're listening.
                    </p>
                </div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-3xl shadow-sm border border-sand-200"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-sage-600 uppercase tracking-widest mb-2 px-1">Your Name (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Forager John"
                                    className="w-full bg-sand-50 p-4 rounded-xl border border-sand-200 focus:outline-none focus:border-sage-500 font-serif"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-sage-600 uppercase tracking-widest mb-2 px-1">Reason for contact</label>
                                <select
                                    className="w-full bg-sand-50 p-4 rounded-xl border border-sand-200 focus:outline-none focus:border-sage-500 font-serif appearance-none"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option>Suggestion</option>
                                    <option>Correction</option>
                                    <option>New Guide Request</option>
                                    <option>General Tip</option>
                                    <option>Bug Report</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-sage-600 uppercase tracking-widest mb-2 px-1">Your Message</label>
                            <textarea
                                rows="5"
                                placeholder="Tell us more about your idea or feedback..."
                                className="w-full bg-sand-50 p-4 rounded-xl border border-sand-200 focus:outline-none focus:border-sage-500 font-serif leading-relaxed"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${submitted
                                ? 'bg-green-600 text-white'
                                : 'bg-terracotta-500 text-white shadow-lg hover:bg-terracotta-600 active:scale-95'
                                }`}
                        >
                            {submitted ? (
                                <>Success! Opening Mail App...</>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Send Suggestion
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Info Cards */}
                <div className="grid md:grid-cols-2 gap-4 mt-8">
                    <div className="bg-sand-100 p-4 rounded-2xl flex gap-4 items-start border border-sand-200">
                        <div className="bg-white p-2 rounded-lg text-sage-600 shadow-sm shrink-0">
                            <Star size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sage-900 text-sm">Community Built</h4>
                            <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                                Many of our best guides come from user experiences in the field.
                            </p>
                        </div>
                    </div>
                    <div className="bg-sand-100 p-4 rounded-2xl flex gap-4 items-start border border-sand-200">
                        <div className="bg-white p-2 rounded-lg text-sage-600 shadow-sm shrink-0">
                            <Mail size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sage-900 text-sm">Direct Contact</h4>
                            <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                                This form opens your default email app to send a structured request.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Feedback;
