import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, AlertTriangle, Droplets, CheckCircle, XCircle, Info, Calendar, Save, X, ArrowRight, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// TODO: Migrate data persistence from localStorage to IndexedDB for larger datasets and P2P sync readiness.
const WATER_STORAGE_KEY = 'homemaker_water_inventory';

const DEFAULT_CONTAINERS = [
    {
        id: '1',
        name: 'Main Well Cistern',
        capacity: 1500,
        currentLevel: 1200,
        unit: 'gallons',
        filterType: 'Bio-Sand + Activated Charcoal',
        filterChangeDate: '2026-09-01',
        lastTestDate: '2026-05-15',
        lastTestResult: 'Safe',
        notes: 'Primary drinking water supply. Gravity feeds to the kitchen.'
    },
    {
        id: '2',
        name: 'Greenhouse Rain Barrel',
        capacity: 55,
        currentLevel: 12,
        unit: 'gallons',
        filterType: 'Screen Mesh only',
        filterChangeDate: '2026-04-10', // Overdue
        lastTestDate: '2026-02-10', // Stale (> 90 days)
        lastTestResult: 'Safe',
        notes: 'Used for watering crops. Fed from greenhouse roof runoff.'
    }
];

const WaterTracker = () => {
    const navigate = useNavigate();
    const [containers, setContainers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContainer, setEditingContainer] = useState(null);

    // Form fields
    const [name, setName] = useState('');
    const [capacity, setCapacity] = useState('');
    const [currentLevel, setCurrentLevel] = useState('');
    const [unit, setUnit] = useState('gallons');
    const [filterType, setFilterType] = useState('');
    const [filterChangeDate, setFilterChangeDate] = useState('');
    const [lastTestDate, setLastTestDate] = useState('');
    const [lastTestResult, setLastTestResult] = useState('Safe');
    const [notes, setNotes] = useState('');

    // Load containers
    useEffect(() => {
        const saved = localStorage.getItem(WATER_STORAGE_KEY);
        if (saved) {
            try {
                setContainers(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse water storage", e);
                setContainers(DEFAULT_CONTAINERS);
            }
        } else {
            setContainers(DEFAULT_CONTAINERS);
            localStorage.setItem(WATER_STORAGE_KEY, JSON.stringify(DEFAULT_CONTAINERS));
        }
    }, []);

    // Save containers
    const saveToLocalStorage = (updated) => {
        setContainers(updated);
        localStorage.setItem(WATER_STORAGE_KEY, JSON.stringify(updated));
    };

    const handleOpenAdd = () => {
        setEditingContainer(null);
        setName('');
        setCapacity('');
        setCurrentLevel('');
        setUnit('gallons');
        setFilterType('');
        setFilterChangeDate('');
        setLastTestDate('');
        setLastTestResult('Safe');
        setNotes('');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (c) => {
        setEditingContainer(c);
        setName(c.name);
        setCapacity(c.capacity);
        setCurrentLevel(c.currentLevel);
        setUnit(c.unit);
        setFilterType(c.filterType || '');
        setFilterChangeDate(c.filterChangeDate || '');
        setLastTestDate(c.lastTestDate || '');
        setLastTestResult(c.lastTestResult || 'Safe');
        setNotes(c.notes || '');
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this container?")) {
            const updated = containers.filter(c => c.id !== id);
            saveToLocalStorage(updated);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!name || !capacity || !currentLevel) {
            alert("Name, Capacity, and Current Level are required.");
            return;
        }

        const numericCapacity = parseFloat(capacity);
        const numericCurrentLevel = parseFloat(currentLevel);

        if (numericCurrentLevel > numericCapacity) {
            alert("Current level cannot exceed container capacity.");
            return;
        }

        const containerData = {
            id: editingContainer ? editingContainer.id : Date.now().toString(),
            name,
            capacity: numericCapacity,
            currentLevel: numericCurrentLevel,
            unit,
            filterType,
            filterChangeDate,
            lastTestDate,
            lastTestResult,
            notes
        };

        let updated;
        if (editingContainer) {
            updated = containers.map(c => c.id === editingContainer.id ? containerData : c);
        } else {
            updated = [...containers, containerData];
        }

        saveToLocalStorage(updated);
        setIsModalOpen(false);
    };

    // Warning evaluation helpers
    const isLowLevel = (c) => {
        return (c.currentLevel / c.capacity) <= 0.25;
    };

    const isFilterOverdue = (c) => {
        if (!c.filterChangeDate) return false;
        const changeDate = new Date(c.filterChangeDate);
        const today = new Date();
        // Set hours to 0 to compare dates accurately
        changeDate.setHours(0,0,0,0);
        today.setHours(0,0,0,0);
        return changeDate < today;
    };

    const isTestStale = (c) => {
        if (!c.lastTestDate) return false;
        const testDate = new Date(c.lastTestDate);
        const today = new Date();
        const diffTime = Math.abs(today - testDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 90 || c.lastTestResult === 'Unsafe';
    };

    const getWarningCount = (c) => {
        let count = 0;
        if (isLowLevel(c)) count++;
        if (isFilterOverdue(c)) count++;
        if (isTestStale(c)) count++;
        return count;
    };

    // Calculate aggregated totals
    const totalGallons = containers.reduce((acc, c) => {
        const val = c.unit === 'gallons' ? c.currentLevel : c.currentLevel * 0.264172;
        return acc + val;
    }, 0);

    const totalCapacityGallons = containers.reduce((acc, c) => {
        const val = c.unit === 'gallons' ? c.capacity : c.capacity * 0.264172;
        return acc + val;
    }, 0);

    const aggregatePercent = totalCapacityGallons > 0 ? Math.round((totalGallons / totalCapacityGallons) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
        >
            {/* Header Dashboard Summary */}
            <div className="bg-gradient-to-br from-sage-800 to-sage-900 rounded-[2.5rem] p-6 text-white shadow-xl shadow-sage-900/10 border border-sage-700/50">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sage-200">Off-Grid Systems</span>
                        <h2 className="text-3xl font-serif font-black tracking-tight mt-0.5">Water Security</h2>
                    </div>
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                        <Droplets size={24} className="text-blue-300" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-sage-300">Total Reserve</span>
                        <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-3xl font-serif font-black">{Math.round(totalGallons).toLocaleString()}</span>
                            <span className="text-xs font-bold text-sage-200 uppercase">gal</span>
                        </div>
                        <span className="text-[9px] text-sage-300 block mt-1">across {containers.length} containers</span>
                    </div>

                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-sage-300">Storage Fill</span>
                        <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-3xl font-serif font-black">{aggregatePercent}%</span>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-blue-300 h-full rounded-full transition-all duration-500" style={{ width: `${aggregatePercent}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* List Header */}
            <div className="flex justify-between items-center px-1">
                <h3 className="text-xs font-black text-sage-600 uppercase tracking-widest">Storage Inventory</h3>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-2 px-4 py-2.5 bg-sage-800 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-sage-900 transition-colors shadow-sm"
                >
                    <Plus size={14} /> Add Container
                </button>
            </div>

            {/* Containers List */}
            <div className="grid gap-4">
                {containers.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-3xl border-2 border-dashed border-sand-200">
                        <Droplets size={48} className="mx-auto text-sand-300 mb-3" />
                        <h4 className="font-serif font-black text-lg text-sage-900">No Containers Registered</h4>
                        <p className="text-sm text-sand-400 max-w-xs mx-auto mt-1">Add cisterns, rain barrels, or tanks to start tracking your homestead supply.</p>
                        <button
                            onClick={handleOpenAdd}
                            className="mt-4 px-6 py-2.5 bg-sage-700 text-white rounded-full font-black text-xs uppercase tracking-widest"
                        >
                            Register First Container
                        </button>
                    </div>
                ) : (
                    containers.map(c => {
                        const low = isLowLevel(c);
                        const filterOverdue = isFilterOverdue(c);
                        const staleTest = isTestStale(c);
                        const warningCount = getWarningCount(c);
                        const fillPercent = Math.round((c.currentLevel / c.capacity) * 100);

                        return (
                            <div
                                key={c.id}
                                className={`bg-white rounded-[2rem] p-6 border transition-all ${
                                    warningCount > 0 ? 'border-terracotta-200 shadow-terracotta-100/10' : 'border-sand-200 shadow-sm'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-serif font-black text-xl text-sage-900 leading-tight">{c.name}</h4>
                                        <span className="text-[10px] text-sand-400 font-bold uppercase tracking-wider mt-0.5 block">
                                            Filter: {c.filterType || 'None'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => handleOpenEdit(c)}
                                            className="p-2 bg-sand-50 hover:bg-sand-100 rounded-xl text-sage-600 transition-colors"
                                            title="Edit Container"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(c.id)}
                                            className="p-2 bg-sand-50 hover:bg-red-50 hover:text-red-600 rounded-xl text-sand-400 transition-colors"
                                            title="Delete Container"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Progress Bar & Quantities */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-baseline">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-serif font-black text-sage-900">{c.currentLevel}</span>
                                            <span className="text-xs text-sand-400 font-bold uppercase">/ {c.capacity} {c.unit}</span>
                                        </div>
                                        <span className="text-xs font-black text-sage-700">{fillPercent}% Fill</span>
                                    </div>
                                    <div className="w-full bg-sand-100 h-3 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                low ? 'bg-terracotta-500' : 'bg-blue-500'
                                            }`}
                                            style={{ width: `${fillPercent}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Warning Alerts */}
                                {warningCount > 0 && (
                                    <div className="mt-4 p-4 bg-terracotta-50/50 rounded-2xl border border-terracotta-100/50 space-y-2.5">
                                        <div className="flex items-center gap-2 text-terracotta-600 font-black text-xs uppercase tracking-wider">
                                            <AlertTriangle size={14} /> Attention Required ({warningCount})
                                        </div>
                                        <div className="space-y-1 text-sm text-sage-700">
                                            {low && (
                                                <div className="flex flex-col gap-1.5 py-1">
                                                    <span className="flex items-center gap-1.5 font-bold text-terracotta-700">
                                                        • Critical Low Water Level (25% or less)
                                                    </span>
                                                    <span className="text-xs text-sage-600 pl-3 leading-relaxed">
                                                        Need to secure more water or filter raw reserves. Review:
                                                    </span>
                                                    <div className="flex flex-wrap gap-2 pl-3 mt-0.5">
                                                        <button
                                                            onClick={() => navigate('/library?folder=15 Infrastructure&file=15.1 Water Procurement.md')}
                                                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-sage-700 hover:text-terracotta-600 bg-white border border-sand-200 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            15.1 Water Procurement <ArrowRight size={10} />
                                                        </button>
                                                        <button
                                                            onClick={() => navigate('/library?folder=15 Infrastructure&file=15.7 Bio-Sand Filtration.md')}
                                                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-sage-700 hover:text-terracotta-600 bg-white border border-sand-200 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            15.7 Bio-Sand Filtration <ArrowRight size={10} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {filterOverdue && (
                                                <div className="py-0.5">
                                                    <span className="font-bold">• Filter Change Overdue</span> (Scheduled for {c.filterChangeDate})
                                                </div>
                                            )}
                                            {staleTest && (
                                                <div className="py-0.5">
                                                    <span className="font-bold">• Water Safety Check Needed</span>
                                                    {c.lastTestResult === 'Unsafe' ? (
                                                        <span className="text-terracotta-600 font-bold"> (Last test marked UNSAFE!)</span>
                                                    ) : (
                                                        <span> (No test in last 90 days - last test {c.lastTestDate || 'Never'})</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Dates & Status Info footer */}
                                <div className="mt-4 pt-4 border-t border-sand-100 grid grid-cols-2 gap-4 text-[10px] font-bold text-sand-400 uppercase tracking-wider">
                                    <div>
                                        <span>Last Tested:</span>
                                        <div className="flex items-center gap-1 mt-0.5 text-sage-800">
                                            <Calendar size={10} />
                                            <span>{c.lastTestDate || 'No Date'}</span>
                                            <span className={`ml-1 px-1.5 py-0.5 rounded text-[8px] font-black ${
                                                c.lastTestResult === 'Safe' ? 'bg-sage-100 text-sage-700' :
                                                c.lastTestResult === 'Unsafe' ? 'bg-terracotta-100 text-terracotta-700' : 'bg-sand-100 text-sand-600'
                                            }`}>{c.lastTestResult}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span>Next Filter Change:</span>
                                        <div className="flex items-center gap-1 mt-0.5 text-sage-800">
                                            <Calendar size={10} />
                                            <span>{c.filterChangeDate || 'Not Scheduled'}</span>
                                        </div>
                                    </div>
                                </div>
                                {c.notes && (
                                    <p className="mt-3 text-xs text-sand-400 font-serif italic border-t border-sand-50/50 pt-2">{c.notes}</p>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Container Modal Form Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-sage-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] p-6 max-w-md w-full border border-sand-200 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-serif font-black text-2xl text-sage-900">
                                {editingContainer ? "Edit Container" : "Register Container"}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-sand-100 rounded-full text-sand-400"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Container Name */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-sage-600 mb-1">Container Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Backyard IBC Tote"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 border border-sand-200 rounded-2xl outline-none focus:border-sage-500 font-serif text-sage-800"
                                />
                            </div>

                            {/* Capacity / Current Level */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-sage-600 mb-1">Max Capacity *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="any"
                                        placeholder="e.g. 275"
                                        value={capacity}
                                        onChange={(e) => setCapacity(e.target.value)}
                                        className="w-full px-4 py-3 border border-sand-200 rounded-2xl outline-none focus:border-sage-500 text-sage-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-sage-600 mb-1">Current Level *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="any"
                                        placeholder="e.g. 150"
                                        value={currentLevel}
                                        onChange={(e) => setCurrentLevel(e.target.value)}
                                        className="w-full px-4 py-3 border border-sand-200 rounded-2xl outline-none focus:border-sage-500 text-sage-800"
                                    />
                                </div>
                            </div>

                            {/* Units & Filter Type */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-sage-600 mb-1">Volume Unit</label>
                                    <select
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                        className="w-full px-4 py-3 border border-sand-200 rounded-2xl outline-none focus:border-sage-500 text-sage-800"
                                    >
                                        <option value="gallons">Gallons</option>
                                        <option value="litres">Litres</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-sage-600 mb-1">Filter Type</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Bio-Sand, Carbon"
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="w-full px-4 py-3 border border-sand-200 rounded-2xl outline-none focus:border-sage-500 text-sage-800"
                                    />
                                </div>
                            </div>

                            {/* Filter Date & Test Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-sage-600 mb-1">Filter Change Date</label>
                                    <input
                                        type="date"
                                        value={filterChangeDate}
                                        onChange={(e) => setFilterChangeDate(e.target.value)}
                                        className="w-full px-4 py-3 border border-sand-200 rounded-2xl outline-none focus:border-sage-500 text-sage-800 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-sage-600 mb-1">Last Tested Date</label>
                                    <input
                                        type="date"
                                        value={lastTestDate}
                                        onChange={(e) => setLastTestDate(e.target.value)}
                                        className="w-full px-4 py-3 border border-sand-200 rounded-2xl outline-none focus:border-sage-500 text-sage-800 text-xs"
                                    />
                                </div>
                            </div>

                            {/* Test Result */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-sage-600 mb-1">Last Test Status</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Safe', 'Unsafe', 'Pending'].map((status) => (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={() => setLastTestResult(status)}
                                            className={`py-2 rounded-xl text-xs font-black tracking-wider uppercase border transition-all ${
                                                lastTestResult === status
                                                    ? status === 'Safe' ? 'bg-sage-100 text-sage-700 border-sage-400'
                                                    : status === 'Unsafe' ? 'bg-terracotta-100 text-terracotta-700 border-terracotta-400'
                                                    : 'bg-sand-100 text-sand-700 border-sand-400'
                                                    : 'bg-white text-sand-400 border-sand-200 hover:bg-sand-50'
                                            }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-sage-600 mb-1">Notes / Description</label>
                                <textarea
                                    rows="3"
                                    placeholder="Add specifics about cleanings, sourcing, or maintenance issues..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-4 py-3 border border-sand-200 rounded-2xl outline-none focus:border-sage-500 font-serif text-sage-800"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-sand-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 bg-sand-50 text-sage-600 rounded-2xl font-bold hover:bg-sand-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-sage-800 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-sage-900 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save size={16} /> Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default WaterTracker;
