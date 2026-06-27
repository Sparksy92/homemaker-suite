import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Thermometer, MapPin, WifiOff } from 'lucide-react';

const WeatherWidget = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isEnabled, setIsEnabled] = useState(false);
    const [unit, setUnit] = useState('celsius');
    const [coords, setCoords] = useState(null);

    const requestWeather = (cachedCoords = coords) => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            return;
        }

        if (!navigator.onLine) {
            setError('Offline');
            return;
        }

        if (cachedCoords) {
            fetchWeather(cachedCoords.latitude, cachedCoords.longitude, unit);
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newCoords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                setCoords(newCoords);
                fetchWeather(newCoords.latitude, newCoords.longitude, unit);
            },
            (err) => {
                console.error("Weather location error:", err);
                setError('Location denied');
                setLoading(false);
            }
        );
    };

    // Check if user has previously enabled weather
    useEffect(() => {
        const savedPreference = localStorage.getItem('weather_enabled');
        if (savedPreference === 'true') {
            setIsEnabled(true);
            requestWeather();
        }
    }, []);

    // Re-fetch when unit changes (only if already enabled)
    useEffect(() => {
        if (isEnabled && weather) {
            requestWeather();
        }
    }, [unit]);

    const handleEnableWeather = () => {
        localStorage.setItem('weather_enabled', 'true');
        setIsEnabled(true);
        requestWeather();
    };

    const fetchWeather = async (lat, lon, tempUnit) => {
        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=${tempUnit}`
            );
            const data = await response.json();
            setWeather(data.current);
            setError(null);
            setLoading(false);
        } catch (err) {
            console.error("Weather fetch error:", err);
            setError('Offline');
            setLoading(false);
        }
    };

    // WMO Weather Code Mapping
    const getWeatherIcon = (code) => {
        if (code === 0 || code === 1) return { icon: Sun, label: 'Clear', color: 'text-amber-500' };
        if (code === 2 || code === 3) return { icon: Cloud, label: 'Partly Cloudy', color: 'text-slate-500' };
        if ([45, 48].includes(code)) return { icon: Wind, label: 'Foggy', color: 'text-slate-400' };
        if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { icon: CloudRain, label: 'Rain', color: 'text-blue-500' };
        if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: CloudSnow, label: 'Snow', color: 'text-cyan-500' };
        if ([95, 96, 99].includes(code)) return { icon: CloudLightning, label: 'Storm', color: 'text-purple-500' };
        return { icon: Thermometer, label: 'Unknown', color: 'text-gray-500' };
    };

    // Opt-In Placeholder State
    if (!isEnabled) {
        return (
            <button
                onClick={handleEnableWeather}
                className="bg-white p-3 rounded-2xl shadow-sm border border-sand-200 flex flex-col items-center justify-center w-[100px] h-[84px] hover:bg-sand-50 transition-colors group"
            >
                <Cloud size={24} className="text-sage-400 mb-1 group-hover:text-sage-600 transition-colors" />
                <span className="text-[10px] text-center text-charcoal-light leading-tight font-medium">
                    Tap to enable weather
                </span>
            </button>
        );
    }

    if (loading) return (
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-sand-200 flex flex-col items-center justify-center w-[100px] h-[84px] animate-pulse">
            <div className="w-6 h-6 bg-sand-200 rounded-full mb-2"></div>
            <div className="w-10 h-4 bg-sand-100 rounded"></div>
        </div>
    );

    if (error) return (
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-sand-200 flex flex-col items-center justify-center w-[100px] h-[84px]">
            <WifiOff size={20} className="text-terracotta-400 mb-1" />
            <span className="text-[10px] text-center text-charcoal-light leading-tight">{error}</span>
        </div>
    );

    if (!weather) return null;

    const { icon: Icon, label, color } = getWeatherIcon(weather.weather_code);

    return (
        <div
            onClick={() => setUnit(unit === 'fahrenheit' ? 'celsius' : 'fahrenheit')}
            className="bg-white p-3 rounded-2xl shadow-sm border border-sand-200 flex flex-col items-center w-[100px] relative cursor-pointer hover:bg-sand-50 active:scale-95 transition-all select-none"
            title="Tap to toggle units"
        >
            <div
                className="absolute top-1 right-1 text-[8px] font-bold bg-sand-100 text-sage-600 px-1 rounded pointer-events-none"
            >
                {unit === 'fahrenheit' ? '°F' : '°C'}
            </div>
            <Icon className={`${color} mb-1 pointer-events-none`} size={24} />
            <span className="text-xl font-bold text-charcoal pointer-events-none">{Math.round(weather.temperature_2m)}°</span>
            <span className="text-xs text-sage-500 whitespace-nowrap pointer-events-none">{label}</span>
        </div>
    );
};

export default WeatherWidget;
