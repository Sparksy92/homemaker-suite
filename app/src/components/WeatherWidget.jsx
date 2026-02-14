import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Thermometer, MapPin } from 'lucide-react';

const WeatherWidget = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locationName, setLocationName] = useState('Local Weather');

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeather(position.coords.latitude, position.coords.longitude);
            },
            (err) => {
                console.error("Weather location error:", err);
                setError('Location denied');
                setLoading(false);
            }
        );
    }, []);

    const fetchWeather = async (lat, lon) => {
        try {
            // Fetch Weather Data
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`
            );
            const data = await response.json();

            // Attempt to get a rough location name (Optional reverse geocoding could go here, 
            // but for now we'll just stick to "Local" to avoid complex API keys)

            setWeather(data.current);
            setLoading(false);
        } catch (err) {
            console.error("Weather fetch error:", err);
            setError('Weather unavailable');
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

    if (loading) return (
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-sand-200 flex flex-col items-center justify-center w-[100px] h-[84px] animate-pulse">
            <div className="w-6 h-6 bg-sand-200 rounded-full mb-2"></div>
            <div className="w-10 h-4 bg-sand-100 rounded"></div>
        </div>
    );

    if (error) return (
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-sand-200 flex flex-col items-center justify-center w-[100px] h-[84px]">
            <MapPin size={20} className="text-terracotta-400 mb-1" />
            <span className="text-[10px] text-center text-charcoal-light leading-tight">{error}</span>
        </div>
    );

    const { icon: Icon, label, color } = getWeatherIcon(weather.weather_code);

    return (
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-sand-200 flex flex-col items-center w-[100px]">
            <Icon className={`${color} mb-1`} size={24} />
            <span className="text-xl font-bold text-charcoal">{Math.round(weather.temperature_2m)}°</span>
            <span className="text-xs text-sage-500 whitespace-nowrap">{label}</span>
        </div>
    );
};

export default WeatherWidget;
