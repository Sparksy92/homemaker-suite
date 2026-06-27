// Pure energy planner engine

export const calculateDailyWh = (loads = []) => {
    return loads.reduce((acc, load) => {
        const watts = parseFloat(load.watts) || 0;
        const hours = parseFloat(load.hoursPerDay) || 0;
        return acc + (watts * hours);
    }, 0);
};

export const estimateSolarArray = ({ dailyWh = 1000, peakSunHours = 4, lossFactor = 0.25 }) => {
    if (peakSunHours <= 0) return 0;
    // Wattage = (Daily Wh) / (Sun Hours * (1 - System Losses))
    const rawWatts = dailyWh / (peakSunHours * (1 - lossFactor));
    return Math.round(rawWatts);
};

export const estimateBatteryBank = ({ dailyWh = 1000, autonomyDays = 2, voltage = 12, depthOfDischarge = 0.50 }) => {
    if (voltage <= 0 || depthOfDischarge <= 0) return 0;
    // Ah = (Daily Wh * Autonomy Days) / (System Voltage * Max Depth of Discharge)
    const rawAh = (dailyWh * autonomyDays) / (voltage * depthOfDischarge);
    return Math.round(rawAh);
};

export const flagHighDrawLoads = (loads = []) => {
    // Flag loads >= 800W that typically require heavy inverter surges
    return loads.filter(load => (parseFloat(load.watts) || 0) >= 800);
};

export const generateEnergySafetyChecklist = (loads = []) => {
    const checklist = [
        { id: 'e-fuse', title: 'Verify fuse/breaker sizing', desc: 'Ensure all DC circuits are fused directly at the battery terminal with appropriate wire gauges (e.g. 10 AWG for 30A).', completed: false },
        { id: 'e-vent', title: 'Inspect battery enclosure ventilation', desc: 'Lead-acid (flooded) batteries must be vented to the outdoors to prevent hydrogen gas accumulation.', completed: false },
        { id: 'e-ground', title: 'Inspect system grounding', desc: 'Ensure solar rack frames and inverter chassis are connected to an earth ground rod.', completed: false }
    ];

    const highDraw = flagHighDrawLoads(loads);
    if (highDraw.length > 0) {
        checklist.push({
            id: 'e-surge',
            title: 'Verify Inverter Surge Capacity',
            desc: `Your loads include high-draw items (${highDraw.map(h => h.name).join(', ')}). Inverter continuous capacity must exceed their combined surge peaks.`,
            completed: false
        });
    }

    return checklist;
};
