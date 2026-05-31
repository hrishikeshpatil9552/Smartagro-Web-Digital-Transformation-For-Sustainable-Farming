import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Calendar, Droplets, Thermometer, Wind, Eye, Navigation, AlertCircle, ChevronDown, Leaf, Sun, CloudRain, Zap, ShieldAlert, Bug, Sprout, BarChart3, TriangleAlert } from 'lucide-react';

interface WeatherForecastingProps {
  onBack?: () => void;
}

interface ProcessedWeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  uvIndex: number;
  feelsLike: number;
  pressure: number;
  forecast: Array<{
    date: string;
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    precipitation: number;
    humidity: number;
    windSpeed: number;
  }>;
}

interface CropWeatherSuitability {
  suitable: boolean;
  reason: string;
  recommendations: string;
}

const weatherAPI = {
  getWeatherByLocation: async (query: string) => {
    await new Promise(r => setTimeout(r, 1200));
    const mockWeather = {
      current: {
        temp: 28 + Math.random() * 8,
        weather: [{ description: 'partly cloudy', icon: '02d' }],
        humidity: 62 + Math.floor(Math.random() * 20),
        wind_speed: 3.2 + Math.random() * 3,
        visibility: 9000 + Math.random() * 1000,
        uvi: 5 + Math.random() * 4,
        feels_like: 30 + Math.random() * 5,
        pressure: 1010 + Math.floor(Math.random() * 10),
      },
      daily: Array.from({ length: 7 }, (_, i) => ({
        temp: { max: 28 + Math.random() * 8, min: 18 + Math.random() * 6 },
        weather: [{ description: ['sunny', 'cloudy', 'light rain', 'partly cloudy', 'thunderstorm'][Math.floor(Math.random() * 5)], icon: ['01d', '02d', '10d', '03d', '11d'][Math.floor(Math.random() * 5)] }],
        pop: Math.random(),
        humidity: 55 + Math.floor(Math.random() * 35),
        wind_speed: 2 + Math.random() * 5,
      }))
    };
    return {
      location: { name: query.split(',')[0].trim(), state: query.split(',')[1]?.trim() || '', country: 'IN' },
      weather: mockWeather
    };
  }
};

const getCropWeatherSuitability = async (params: any): Promise<CropWeatherSuitability> => {
  await new Promise(r => setTimeout(r, 800));
  const suitable = params.weatherData.temperature < 35 && params.weatherData.humidity < 85;
  return {
    suitable,
    reason: suitable
      ? `Temperature (${params.weatherData.temperature.toFixed(1)}°C) and humidity (${params.weatherData.humidity}%) are within optimal range for ${params.crop}.`
      : `Conditions may stress ${params.crop}. Temperature or humidity is outside ideal range.`,
    recommendations: suitable
      ? `Ideal window for ${params.crop} activities tomorrow. Consider fertilization or planting during morning hours.`
      : `Delay sensitive operations for ${params.crop}. Monitor soil moisture closely and ensure adequate irrigation.`,
  };
};

const locationData: Record<string, string[]> = {
  Maharashtra: ['Mumbai', 'Pune', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Sangli', 'Satara'],
  Karnataka: ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar'],
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer'],
  Punjab: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali'],
  Haryana: ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Malda'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar'],
  Kerala: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad'],
  Odisha: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri'],
  Bihar: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga'],
  Assam: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Palampur', 'Baddi'],
  Uttarakhand: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur'],
};

const CROPS = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Soybean', 'Groundnut', 'Tomato', 'Onion', 'Potato', 'Chickpea', 'Mustard'];

const iconMap: Record<string, string> = {
  '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️',
  '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
  '09d': '🌦️', '09n': '🌦️', '10d': '🌧️', '10n': '🌧️',
  '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️',
  '50d': '🌫️', '50n': '🌫️',
};

function getWeatherIcon(code: string) { return iconMap[code] || '🌤️'; }

function processWeatherData(apiData: any, location: any): ProcessedWeatherData {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  return {
    location: `${location.name}, ${location.state || location.country}`,
    temperature: Math.round(apiData.current.temp),
    condition: apiData.current.weather[0].description,
    humidity: apiData.current.humidity,
    windSpeed: Math.round(apiData.current.wind_speed * 3.6),
    visibility: Math.round((apiData.current.visibility || 10000) / 1000),
    uvIndex: Math.round(apiData.current.uvi),
    feelsLike: Math.round(apiData.current.feels_like),
    pressure: apiData.current.pressure,
    forecast: apiData.daily.slice(0, 7).map((day: any, i: number) => {
      const d = new Date(today); d.setDate(today.getDate() + i);
      return {
        date: d.toISOString().split('T')[0],
        day: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[d.getDay()],
        high: Math.round(day.temp.max),
        low: Math.round(day.temp.min),
        condition: day.weather[0].description,
        icon: getWeatherIcon(day.weather[0].icon),
        precipitation: Math.round(day.pop * 100),
        humidity: day.humidity,
        windSpeed: Math.round(day.wind_speed * 3.6),
      };
    }),
  };
}

const cropThresholds: Record<string, { tempMin: number; tempMax: number; humMin: number; humMax: number; rainMin: number; rainMax: number }> = {
  Rice: { tempMin: 20, tempMax: 35, humMin: 60, humMax: 90, rainMin: 100, rainMax: 250 },
  Wheat: { tempMin: 15, tempMax: 28, humMin: 40, humMax: 70, rainMin: 40, rainMax: 120 },
  Maize: { tempMin: 18, tempMax: 33, humMin: 50, humMax: 80, rainMin: 50, rainMax: 180 },
  Cotton: { tempMin: 25, tempMax: 38, humMin: 40, humMax: 65, rainMin: 50, rainMax: 150 },
  Sugarcane: { tempMin: 22, tempMax: 36, humMin: 60, humMax: 85, rainMin: 100, rainMax: 250 },
  Soybean: { tempMin: 20, tempMax: 32, humMin: 55, humMax: 80, rainMin: 60, rainMax: 180 },
  Groundnut: { tempMin: 25, tempMax: 35, humMin: 50, humMax: 75, rainMin: 50, rainMax: 150 },
  Tomato: { tempMin: 18, tempMax: 30, humMin: 50, humMax: 75, rainMin: 40, rainMax: 120 },
  Onion: { tempMin: 15, tempMax: 28, humMin: 40, humMax: 65, rainMin: 30, rainMax: 100 },
  Potato: { tempMin: 12, tempMax: 25, humMin: 50, humMax: 75, rainMin: 40, rainMax: 120 },
  Chickpea: { tempMin: 15, tempMax: 28, humMin: 35, humMax: 60, rainMin: 20, rainMax: 80 },
  Mustard: { tempMin: 12, tempMax: 25, humMin: 35, humMax: 65, rainMin: 20, rainMax: 80 },
};

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getCriticalWindows(wd: ProcessedWeatherData, crop: string) {
  const avgTemp = wd.forecast.reduce((s, d) => s + (d.high + d.low) / 2, 0) / 7;
  const thresh = cropThresholds[crop] || cropThresholds.Wheat;
  return [
    {
      title: 'Sowing Window',
      status: avgTemp >= thresh.tempMin && avgTemp <= thresh.tempMax ? 'Open' : 'Closed',
      color: avgTemp >= thresh.tempMin && avgTemp <= thresh.tempMax ? 'emerald' : 'red' as const,
      detail: `Avg temp ${avgTemp.toFixed(1)}°C vs needed ${thresh.tempMin}–${thresh.tempMax}°C`,
      icon: '🌱',
    },
    {
      title: 'Fertilizer Application',
      status: wd.forecast.slice(0, 3).every(d => d.precipitation < 40) ? 'Favorable' : 'Unfavorable',
      color: wd.forecast.slice(0, 3).every(d => d.precipitation < 40) ? 'emerald' : 'amber' as const,
      detail: `Rain chance next 3 days: ${wd.forecast.slice(0, 3).map(d => d.precipitation + '%').join(', ')}`,
      icon: '🧪',
    },
    {
      title: 'Spraying Window',
      status: wd.windSpeed < 15 && wd.humidity < 80 ? 'Safe' : 'Risky',
      color: wd.windSpeed < 15 && wd.humidity < 80 ? 'emerald' : 'red' as const,
      detail: `Wind ${wd.windSpeed} km/h, Humidity ${wd.humidity}%`,
      icon: '💨',
    },
    {
      title: 'Harvest Window',
      status: wd.forecast.slice(0, 5).some(d => d.precipitation > 60) ? 'Delay' : 'Proceed',
      color: wd.forecast.slice(0, 5).some(d => d.precipitation > 60) ? 'amber' : 'emerald' as const,
      detail: `Rain risk in 5-day: ${wd.forecast.slice(0, 5).some(d => d.precipitation > 60) ? 'High' : 'Low'}`,
      icon: '🌾',
    },
  ];
}

function getRainfallVsNeed(wd: ProcessedWeatherData, crop: string) {
  const thresh = cropThresholds[crop] || cropThresholds.Wheat;
  const weekRain = wd.forecast.reduce((s, d) => s + d.precipitation * 0.5, 0);
  const needMin = thresh.rainMin / 7;
  const needMax = thresh.rainMax / 7;
  const avgDaily = weekRain / 7;
  const deficit = avgDaily < needMin;
  const surplus = avgDaily > needMax;
  return {
    weekRainMm: weekRain.toFixed(1),
    dailyAvg: avgDaily.toFixed(1),
    needMin: needMin.toFixed(1),
    needMax: needMax.toFixed(1),
    status: surplus ? 'Surplus' : deficit ? 'Deficit' : 'Adequate',
    color: surplus ? 'blue' : deficit ? 'orange' : 'green' as const,
    pct: Math.min(120, Math.round((avgDaily / needMax) * 100)),
  };
}

function getPestDiseaseProb(wd: ProcessedWeatherData, seed: number) {
  const avgHum = wd.forecast.reduce((s, d) => s + d.humidity, 0) / 7;
  const avgTemp = wd.forecast.reduce((s, d) => s + (d.high + d.low) / 2, 0) / 7;
  const pests = [
    { name: 'Aphids', favTemp: [18, 28], favHum: [50, 75] },
    { name: 'Whitefly', favTemp: [25, 35], favHum: [40, 65] },
    { name: 'Leaf Blight', favTemp: [20, 28], favHum: [75, 95] },
    { name: 'Rust Fungus', favTemp: [15, 25], favHum: [70, 90] },
    { name: 'Bollworm', favTemp: [25, 35], favHum: [50, 70] },
    { name: 'Powdery Mildew', favTemp: [15, 28], favHum: [50, 75] },
  ];
  return pests.map((p, idx) => {
    const tempFit = avgTemp >= p.favTemp[0] && avgTemp <= p.favTemp[1];
    const humFit = avgHum >= p.favHum[0] && avgHum <= p.favHum[1];
    const randVal = Math.floor(seededRandom(seed + idx * 7) * 15);
    const prob = (tempFit ? 40 : 10) + (humFit ? 45 : 5) + randVal;
    return { name: p.name, probability: Math.min(prob, 95), level: prob > 65 ? 'High' : prob > 40 ? 'Moderate' : 'Low' };
  });
}

function getSoilMoistureTrend(wd: ProcessedWeatherData, seed: number) {
  const base = 45 + Math.floor(seededRandom(seed) * 20);
  return wd.forecast.map((d, i) => ({
    day: d.day,
    value: Math.min(95, Math.max(15, base + (d.precipitation * 0.4) - (d.high > 35 ? 8 : 0) + Math.floor(seededRandom(seed + i * 3) * 10 - 5))),
  }));
}

function getCropThresholdAnalysis(wd: ProcessedWeatherData, crop: string) {
  const thresh = cropThresholds[crop] || cropThresholds.Wheat;
  const avgTemp = wd.forecast.reduce((s, d) => s + (d.high + d.low) / 2, 0) / 7;
  const avgHum = wd.forecast.reduce((s, d) => s + d.humidity, 0) / 7;
  const totalRain = wd.forecast.reduce((s, d) => s + d.precipitation * 0.5, 0);
  return [
    { param: 'Temperature', current: `${avgTemp.toFixed(1)}°C`, ideal: `${thresh.tempMin}–${thresh.tempMax}°C`, status: avgTemp >= thresh.tempMin && avgTemp <= thresh.tempMax ? 'Optimal' : 'Out of range', ok: avgTemp >= thresh.tempMin && avgTemp <= thresh.tempMax },
    { param: 'Humidity', current: `${avgHum.toFixed(0)}%`, ideal: `${thresh.humMin}–${thresh.humMax}%`, status: avgHum >= thresh.humMin && avgHum <= thresh.humMax ? 'Optimal' : 'Out of range', ok: avgHum >= thresh.humMin && avgHum <= thresh.humMax },
    { param: 'Weekly Rainfall', current: `${totalRain.toFixed(0)} mm`, ideal: `${thresh.rainMin}–${thresh.rainMax} mm`, status: totalRain >= thresh.rainMin && totalRain <= thresh.rainMax ? 'Optimal' : 'Out of range', ok: totalRain >= thresh.rainMin && totalRain <= thresh.rainMax },
    { param: 'Wind Speed', current: `${wd.windSpeed} km/h`, ideal: '< 20 km/h', status: wd.windSpeed < 20 ? 'Safe' : 'High', ok: wd.windSpeed < 20 },
    { param: 'UV Index', current: `${wd.uvIndex}`, ideal: '< 8', status: wd.uvIndex < 8 ? 'Safe' : 'High', ok: wd.uvIndex < 8 },
  ];
}

function getRiskAlerts(wd: ProcessedWeatherData, crop: string) {
  const alerts: { severity: 'high' | 'medium' | 'low'; title: string; desc: string }[] = [];
  if (wd.forecast.some(d => d.precipitation > 70)) alerts.push({ severity: 'high', title: 'Heavy Rain Expected', desc: `${crop} may face waterlogging. Ensure drainage channels are clear.` });
  if (wd.uvIndex > 8) alerts.push({ severity: 'medium', title: 'High UV Radiation', desc: `UV index ${wd.uvIndex}. Workers need protective gear; shade-sensitive crops.` });
  if (wd.windSpeed > 20) alerts.push({ severity: 'medium', title: 'Strong Winds', desc: `${wd.windSpeed} km/h winds. Secure nets, stakes, and lightweight structures.` });
  const thresh = cropThresholds[crop] || cropThresholds.Wheat;
  const avgTemp = wd.forecast.reduce((s, d) => s + (d.high + d.low) / 2, 0) / 7;
  if (avgTemp > thresh.tempMax + 3) alerts.push({ severity: 'high', title: 'Heat Stress Risk', desc: `Temperature exceeding ${crop} tolerance. Consider mulching and extra irrigation.` });
  if (alerts.length === 0) alerts.push({ severity: 'low', title: 'No Major Risks', desc: 'Weather conditions look favorable for the week ahead.' });
  return alerts;
}

function getWeekSummary(wd: ProcessedWeatherData, crop: string) {
  const avgTemp = (wd.forecast.reduce((s, d) => s + (d.high + d.low) / 2, 0) / 7).toFixed(1);
  const totalRain = wd.forecast.reduce((s, d) => s + d.precipitation * 0.5, 0).toFixed(0);
  const rainyDays = wd.forecast.filter(d => d.precipitation > 30).length;
  const avgHum = (wd.forecast.reduce((s, d) => s + d.humidity, 0) / 7).toFixed(0);
  return `This week for ${crop}: Average temperature ${avgTemp}°C with ${totalRain}mm total rainfall across ${rainyDays} rainy day(s). Humidity averages ${avgHum}%. ${rainyDays > 3 ? 'Frequent rain expected — prioritize drainage and delay spraying.' : rainyDays === 0 ? 'Dry week ahead — maintain regular irrigation schedule.' : 'Mixed conditions — pick dry windows for field operations.'}`;
}

function RainBar({ pct }: { pct: number }) {
  return (
    <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: pct > 60 ? '#3b82f6' : pct > 30 ? '#93c5fd' : '#bfdbfe' }}
      />
    </div>
  );
}

function CustomSelect({ value, onChange, options, placeholder, disabled = false }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all duration-150
          ${disabled ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400 hover:shadow-sm cursor-pointer'}
          ${open ? 'border-emerald-500 ring-2 ring-emerald-100' : ''}`}
      >
        <span className={value ? 'text-slate-800' : 'text-slate-400'}>{value || placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-slate-100  max-h-52 overflow-y-auto py-1">
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors ${value === opt ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-700'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5 bg-green-700 rounded-xl px-4 py-3">
      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-base font-bold text-white">{title}</h3>
    </div>
  );
}

export function WeatherForecasting({ onBack }: WeatherForecastingProps) {
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [cropType, setCropType] = useState('');
  const [weatherData, setWeatherData] = useState<ProcessedWeatherData | null>(null);
  const [cropSuitability, setCropSuitability] = useState<CropWeatherSuitability | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [fetchKey, setFetchKey] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if ((e.key === 'Escape' || e.key === 'ArrowUp') && onBack) onBack(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onBack]);

  const districts = state ? locationData[state] || [] : [];
  const handleStateChange = (v: string) => { setState(v); setDistrict(''); };
  const locationString = [district, state].filter(Boolean).join(', ') || '';

  const handleGetForecast = async () => {
    if (!state) { setError('Please select a state.'); return; }
    if (!cropType) { setError('Please select a crop for suitability analysis.'); return; }
    const requestId = ++requestIdRef.current;
    setIsLoading(true); setError(null); setCropSuitability(null); setWeatherData(null);
    try {
      const { location, weather } = await weatherAPI.getWeatherByLocation(locationString || state);
      if (requestId !== requestIdRef.current) return;
      const processed = processWeatherData(weather, location);
      setWeatherData(processed);
      setActiveDay(0);
      setFetchKey(k => k + 1);
      const tomorrow = processed.forecast[1];
      const suit = await getCropWeatherSuitability({
        location: locationString,
        crop: cropType,
        weatherData: { temperature: (tomorrow.high + tomorrow.low) / 2, humidity: tomorrow.humidity, precipitation: tomorrow.precipitation, windSpeed: tomorrow.windSpeed, condition: tomorrow.condition },
      });
      if (requestId !== requestIdRef.current) return;
      setCropSuitability(suit);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data.');
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  };

  const maxPrecip = weatherData ? Math.max(...weatherData.forecast.map(d => d.precipitation)) : 0;
  const uvLabel = (uv: number) => uv <= 2 ? ['Low', 'text-green-400'] : uv <= 5 ? ['Moderate', 'text-yellow-400'] : uv <= 7 ? ['High', 'text-orange-400'] : ['Very High', 'text-red-400'];

  const seed = fetchKey * 1000;

  const criticalWindows = useMemo(() =>
    weatherData ? getCriticalWindows(weatherData, cropType) : [],
    [weatherData, cropType]
  );
  const rainfallVsNeed = useMemo(() =>
    weatherData ? getRainfallVsNeed(weatherData, cropType) : null,
    [weatherData, cropType]
  );
  const pestDisease = useMemo(() =>
    weatherData ? getPestDiseaseProb(weatherData, seed) : [],
    [weatherData, seed]
  );
  const soilMoisture = useMemo(() =>
    weatherData ? getSoilMoistureTrend(weatherData, seed) : [],
    [weatherData, seed]
  );
  const thresholdAnalysis = useMemo(() =>
    weatherData ? getCropThresholdAnalysis(weatherData, cropType) : [],
    [weatherData, cropType]
  );
  const riskAlerts = useMemo(() =>
    weatherData ? getRiskAlerts(weatherData, cropType) : [],
    [weatherData, cropType]
  );
  const weekSummary = useMemo(() =>
    weatherData ? getWeekSummary(weatherData, cropType) : '',
    [weatherData, cropType]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-emerald-50 font-sans">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        * { font-family: 'Sora', sans-serif; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        .fade-up { animation: fadeUp 0.45s ease both; }
        .fade-up-1 { animation: fadeUp 0.45s 0.05s ease both; }
        .fade-up-2 { animation: fadeUp 0.45s 0.1s ease both; }
        .fade-up-3 { animation: fadeUp 0.45s 0.15s ease both; }
        .fade-up-4 { animation: fadeUp 0.45s 0.2s ease both; }
        .fade-up-5 { animation: fadeUp 0.45s 0.25s ease both; }
        .fade-up-6 { animation: fadeUp 0.45s 0.3s ease both; }
        .fade-up-7 { animation: fadeUp 0.45s 0.35s ease both; }
        .fade-up-8 { animation: fadeUp 0.45s 0.4s ease both; }
        .fade-up-9 { animation: fadeUp 0.45s 0.45s ease both; }
        .fade-up-10 { animation: fadeUp 0.45s 0.5s ease both; }
        .shimmer { animation: shimmer 1.4s ease-in-out infinite; }
        .spin-slow { animation: spin-slow 8s linear infinite; }
        .glass { background: rgba(255,255,255,0.78); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.85); }
        .day-active { background: linear-gradient(135deg, #10b981, #059669); color: white; box-shadow: 0 4px 20px rgba(16,185,129,0.3); }
        .forecast-row { transition: all 0.2s ease; }
        .forecast-row:hover { transform: translateX(4px); }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* ── Header ── */}
        <div className="fade-up text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-widest mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shimmer inline-block" />
            Live Data
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Farm Weather<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-sky-500">Intelligence</span>
          </h1>
          <p className="text-slate-500 text-base max-w-md mx-auto">Real-time forecasts with crop-specific suitability analysis for smarter farming decisions.</p>
        </div>

        {/* ── Form Card ── */}
        <div className="fade-up-1 glass rounded-3xl p-7 ">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Select Your Location & Crop</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">State *</label>
              <CustomSelect value={state} onChange={handleStateChange} options={Object.keys(locationData)} placeholder="Choose state" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">District</label>
              <CustomSelect value={district} onChange={setDistrict} options={districts} placeholder="Choose district" disabled={!state} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Crop *</label>
              <CustomSelect value={cropType} onChange={setCropType} options={CROPS} placeholder="Choose crop" />
            </div>
          </div>

          {state && (
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100">
              <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{locationString || state}</span>
              {cropType && <><span className="text-slate-300 mx-1">·</span><Leaf className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span>{cropType}</span></>}
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleGetForecast}
            disabled={isLoading || !state || !cropType}
            className="mt-5 w-full sm:w-auto sm:min-w-48 flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-200
              bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Fetching Forecast…
              </>
            ) : (
              <>
                <Sun className="w-4 h-4" />
                Get Live Forecast
              </>
            )}
          </button>
        </div>

        {/* ── Results ── */}
        {weatherData && (
          <div ref={resultsRef} key={fetchKey} className="space-y-10">

            {/* ★ Green Banner — simple green bg, white text, no shadow */}
            <div className="fade-up rounded-3xl p-7 bg-green-700">
              <div className="flex items-start gap-4">
                <div className="text-4xl mt-0.5">🌾</div>
                <div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-white leading-snug">7-Day Crop Weather Intelligence</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="inline-flex items-center gap-1.5 text-white font-semibold text-sm bg-white/20 px-3 py-1.5 rounded-lg">
                      <Leaf className="w-3.5 h-3.5" />
                      {cropType}
                    </span>
                    <span className="text-white/50 text-lg">—</span>
                    <span className="inline-flex items-center gap-1.5 text-white font-semibold text-sm bg-white/20 px-3 py-1.5 rounded-lg">
                      <MapPin className="w-3.5 h-3.5" />
                      {weatherData.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Weather Hero */}
            <div className="fade-up-1 relative overflow-hidden rounded-3xl shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0d4f3c 100%)' }}>
              <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 spin-slow"
                style={{ background: 'radial-gradient(circle, #34d399, transparent)', transform: 'translate(30%, -30%)' }} />
              <div className="relative p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shimmer" />
                      Current Conditions
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{weatherData.location}</h3>
                    <p className="text-slate-400 capitalize text-sm">{weatherData.condition}</p>
                  </div>
                  <div className="text-right">
                    <div className="mono text-7xl font-bold text-white leading-none">{weatherData.temperature}°</div>
                    <div className="text-slate-400 text-sm mt-1">Feels like {weatherData.feelsLike}°C</div>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {[
                    { icon: <Droplets className="w-4 h-4" />, label: 'Humidity', value: `${weatherData.humidity}%`, accent: 'text-sky-400' },
                    { icon: <Wind className="w-4 h-4" />, label: 'Wind', value: `${weatherData.windSpeed} km/h`, accent: 'text-violet-400' },
                    { icon: <Eye className="w-4 h-4" />, label: 'Visibility', value: `${weatherData.visibility} km`, accent: 'text-slate-300' },
                    { icon: <Sun className="w-4 h-4" />, label: 'UV Index', value: `${weatherData.uvIndex} · ${uvLabel(weatherData.uvIndex)[0]}`, accent: uvLabel(weatherData.uvIndex)[1] },
                    { icon: <Thermometer className="w-4 h-4" />, label: 'Pressure', value: `${weatherData.pressure} hPa`, accent: 'text-orange-400' },
                    { icon: <Navigation className="w-4 h-4" />, label: 'Feels Like', value: `${weatherData.feelsLike}°C`, accent: 'text-pink-400' },
                  ].map(({ icon, label, value, accent }) => (
                    <div key={label} className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className={`flex justify-center mb-1 ${accent}`}>{icon}</div>
                      <div className="text-slate-400 text-xs mb-0.5">{label}</div>
                      <div className="text-white text-xs font-semibold leading-tight">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 7-Day Forecast */}
            <div className="fade-up-2 glass rounded-3xl p-7">
              <SectionHeader icon={<Calendar className="w-4 h-4 text-white" />} title="7-Day Forecast" />

              <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
                {weatherData.forecast.map((day, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveDay(i)}
                    className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer
                      ${activeDay === i ? 'day-active' : 'bg-white border border-slate-100 text-slate-600 hover:border-emerald-300 hover:text-emerald-700'}`}
                  >
                    <span className="text-lg leading-none">{day.icon}</span>
                    <span>{day.day}</span>
                    <span className={activeDay === i ? 'text-white/80' : 'text-slate-400'}>{day.high}°</span>
                  </button>
                ))}
              </div>

              {weatherData.forecast[activeDay] && (() => {
                const d = weatherData.forecast[activeDay];
                return (
                  <div className="rounded-2xl bg-gradient-to-r from-slate-50 to-sky-50 border border-slate-100 p-5 grid sm:grid-cols-4 gap-4 fade-up">
                    <div className="sm:col-span-1 flex flex-col justify-center">
                      <div className="text-4xl mb-1">{d.icon}</div>
                      <div className="text-slate-700 font-bold text-sm capitalize">{d.condition}</div>
                      <div className="text-slate-500 text-xs">{d.date}</div>
                    </div>
                    <div className="sm:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'High / Low', value: `${d.high}° / ${d.low}°`, color: 'text-orange-600' },
                        { label: 'Rain Chance', value: `${d.precipitation}%`, color: 'text-blue-600' },
                        { label: 'Humidity', value: `${d.humidity}%`, color: 'text-teal-600' },
                        { label: 'Wind', value: `${d.windSpeed} km/h`, color: 'text-violet-600' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="bg-white rounded-xl p-3 border border-slate-100 text-center shadow-sm">
                          <div className="text-slate-500 text-xs mb-1">{label}</div>
                          <div className={`font-bold text-sm ${color}`}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="mt-5 rounded-2xl overflow-hidden border border-slate-100">
                {weatherData.forecast.map((day, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveDay(i)}
                    className={`forecast-row flex items-center justify-between px-5 py-3.5 cursor-pointer border-b border-slate-50 last:border-b-0
                      ${activeDay === i
                        ? 'bg-emerald-50 border-l-4 border-l-emerald-500'
                        : i % 2 === 0 ? 'bg-white hover:bg-emerald-50/60' : 'bg-slate-50/40 hover:bg-emerald-50/60'
                      }`}
                  >
                    <div className="flex items-center gap-3 w-28">
                      <span className="text-xl">{day.icon}</span>
                      <div>
                        <span className="text-sm font-semibold text-slate-700 block">{day.day}</span>
                        <span className="text-xs text-slate-400">{day.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-1 mx-4">
                      <RainBar pct={day.precipitation} />
                      <span className="text-xs text-slate-500 w-8 mono">{day.precipitation}%</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-xs text-slate-400">{day.humidity}% 💧</span>
                      <span className="text-xs text-slate-400">{day.windSpeed} km/h 💨</span>
                      <div className="text-right min-w-[70px]">
                        <span className="font-bold text-slate-800">{day.high}°</span>
                        <span className="text-slate-400 ml-2">{day.low}°</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Precipitation Chart */}
            <div className="fade-up-3 glass rounded-3xl p-7 ">
              <SectionHeader icon={<CloudRain className="w-4 h-4 text-white" />} title="Precipitation Outlook" />
              <div className="flex items-end gap-3 h-32 px-2">
                {weatherData.forecast.map((day, i) => {
                  const h = maxPrecip > 0 ? (day.precipitation / maxPrecip) * 100 : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer" onClick={() => setActiveDay(i)}>
                      <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mono font-medium">{day.precipitation}%</span>
                      <div className="w-full rounded-t-lg transition-all duration-500 group-hover:opacity-80" style={{
                        height: `${Math.max(h, 6)}%`,
                        background: activeDay === i
                          ? 'linear-gradient(180deg, #10b981, #059669)'
                          : day.precipitation > 60
                            ? 'linear-gradient(180deg, #60a5fa, #3b82f6)'
                            : day.precipitation > 30
                              ? 'linear-gradient(180deg, #93c5fd, #60a5fa)'
                              : 'linear-gradient(180deg, #e2e8f0, #cbd5e1)',
                        minHeight: '8px',
                      }} />
                      <span className="text-xs text-slate-500 font-medium">{day.day.slice(0, 3)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ⚡ Critical Weather Windows */}
            <div className="fade-up-4 glass rounded-3xl p-7 ">
              <SectionHeader icon={<Zap className="w-4 h-4 text-white" />} title="Critical Weather Windows" />
              <div className="grid sm:grid-cols-2 gap-5">
                {criticalWindows.map((w) => {
                  const colorMap: Record<string, { bg: string; border: string; badge: string; text: string }> = {
                    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-700' },
                    red: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', text: 'text-red-700' },
                    amber: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', text: 'text-amber-700' },
                  };
                  const c = colorMap[w.color] || colorMap.emerald;
                  return (
                    <div key={w.title} className={`${c.bg} border ${c.border} rounded-2xl p-5 hover:shadow-md transition-shadow duration-200`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg">{w.icon}</span>
                        <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${c.badge}`}>{w.status}</span>
                      </div>
                      <h4 className={`text-sm font-bold ${c.text} mb-1`}>{w.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{w.detail}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 🌧️ Rainfall vs Crop Need */}
            {rainfallVsNeed && (
              <div className="fade-up-5 glass rounded-3xl p-7 ">
                <SectionHeader icon={<CloudRain className="w-4 h-4 text-white" />} title="Rainfall vs Crop Need" />
                <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-2xl p-6">
                  <div className="grid sm:grid-cols-3 gap-5 mb-5">
                    <div className="text-center">
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Weekly Rainfall</div>
                      <div className="mono text-2xl font-bold text-sky-700">{rainfallVsNeed.weekRainMm} <span className="text-sm font-medium">mm</span></div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Daily Average Need</div>
                      <div className="mono text-2xl font-bold text-slate-700">{rainfallVsNeed.needMin}–{rainfallVsNeed.needMax} <span className="text-sm font-medium">mm</span></div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Status</div>
                      <div className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-full ${
                        rainfallVsNeed.color === 'green' ? 'bg-emerald-100 text-emerald-700' :
                        rainfallVsNeed.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {rainfallVsNeed.color === 'green' ? '💧' : rainfallVsNeed.color === 'orange' ? '🏜️' : '🌊'} {rainfallVsNeed.status}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Supply vs Demand</span>
                      <span className="mono font-medium">{rainfallVsNeed.pct}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-white overflow-hidden shadow-inner">
                      <div className="h-full rounded-full transition-all duration-700" style={{
                        width: `${Math.min(rainfallVsNeed.pct, 100)}%`,
                        background: rainfallVsNeed.color === 'green'
                          ? 'linear-gradient(90deg, #10b981, #34d399)'
                          : rainfallVsNeed.color === 'orange'
                            ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                            : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                      }} />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>0%</span>
                      <span>Demand met →</span>
                      <span>100%+</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 🦠 Pest & Disease */}
            <div className="fade-up-6 glass rounded-3xl p-7 ">
              <SectionHeader icon={<Bug className="w-4 h-4 text-white" />} title="Pest & Disease Weather Probability" />
              <div className="grid sm:grid-cols-3 gap-5">
                {pestDisease.map((p) => {
                  const levelColor = p.level === 'High' ? 'bg-red-50 border-red-200' : p.level === 'Moderate' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200';
                  const badgeColor = p.level === 'High' ? 'bg-red-100 text-red-700' : p.level === 'Moderate' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';
                  const barColor = p.level === 'High' ? 'linear-gradient(90deg, #ef4444, #f87171)' : p.level === 'Moderate' ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #10b981, #34d399)';
                  return (
                    <div key={p.name} className={`${levelColor} border rounded-2xl p-5 hover:shadow-md transition-shadow duration-200`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-slate-700">🦠 {p.name}</span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeColor}`}>{p.level}</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-white/80 overflow-hidden mb-1.5">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p.probability}%`, background: barColor }} />
                      </div>
                      <div className="text-xs text-slate-500 text-right mono font-medium">{p.probability}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 🌱 Soil Moisture Trend */}
            <div className="fade-up-7 glass rounded-3xl p-7 ">
              <SectionHeader icon={<Sprout className="w-4 h-4 text-white" />} title="Soil Moisture Trend" />
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-6">
                <div className="flex items-end gap-3 h-28 px-2">
                  {soilMoisture.map((s, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                      <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mono font-medium">{s.value}%</span>
                      <div className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80" style={{
                        height: `${s.value}%`,
                        background: s.value > 75
                          ? 'linear-gradient(180deg, #0d9488, #14b8a6)'
                          : s.value > 45
                            ? 'linear-gradient(180deg, #2dd4bf, #5eead4)'
                            : s.value > 25
                              ? 'linear-gradient(180deg, #fbbf24, #fcd34d)'
                              : 'linear-gradient(180deg, #f97316, #fb923c)',
                        minHeight: '8px',
                      }} />
                      <span className="text-xs text-slate-500 font-medium">{s.day.slice(0, 3)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gradient-to-r from-orange-400 to-orange-300 inline-block" /> Dry (&lt;25%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gradient-to-r from-yellow-400 to-yellow-300 inline-block" /> Low (25–45%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gradient-to-r from-teal-300 to-teal-200 inline-block" /> Optimal (45–75%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gradient-to-r from-teal-600 to-teal-400 inline-block" /> Wet (&gt;75%)</span>
                </div>
              </div>
            </div>

            {/* 📊 Crop Threshold Analysis */}
            <div className="fade-up-8 glass rounded-3xl p-7 ">
              <SectionHeader icon={<BarChart3 className="w-4 h-4 text-white" />} title={`Crop Threshold Analysis — ${cropType}`} />
              <div className="rounded-2xl overflow-hidden border border-slate-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-200">
                      <th className="text-left px-6 py-4 text-xs font-extrabold text-slate-600 uppercase tracking-wider">Parameter</th>
                      <th className="text-center px-6 py-4 text-xs font-extrabold text-slate-600 uppercase tracking-wider">Current</th>
                      <th className="text-center px-6 py-4 text-xs font-extrabold text-slate-600 uppercase tracking-wider">Ideal for {cropType}</th>
                      <th className="text-center px-6 py-4 text-xs font-extrabold text-slate-600 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {thresholdAnalysis.map((row, i) => (
                      <tr key={row.param} className={`border-b border-slate-100 transition-colors duration-150 hover:bg-emerald-50/50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}>
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">{row.param}</td>
                        <td className="px-6 py-4 text-center mono text-slate-700 font-semibold text-sm">{row.current}</td>
                        <td className="px-6 py-4 text-center text-slate-500 font-medium text-sm">{row.ideal}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full ${
                            row.ok
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: row.ok ? '#10b981' : '#ef4444' }} />
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 🚨 Risk Alerts */}
            <div className="fade-up-9 glass rounded-3xl p-7 ">
              <SectionHeader icon={<ShieldAlert className="w-4 h-4 text-white" />} title="Risk Alerts" />
              <div className="space-y-4">
                {riskAlerts.map((alert, i) => {
                  const severityStyle = alert.severity === 'high'
                    ? 'bg-red-50 border-red-200 border-l-4 border-l-red-500'
                    : alert.severity === 'medium'
                      ? 'bg-amber-50 border-amber-200 border-l-4 border-l-amber-500'
                      : 'bg-emerald-50 border-emerald-200 border-l-4 border-l-emerald-500';
                  const badgeStyle = alert.severity === 'high'
                    ? 'bg-red-100 text-red-700'
                    : alert.severity === 'medium'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700';
                  const icon = alert.severity === 'high' ? '🔴' : alert.severity === 'medium' ? '🟡' : '🟢';
                  return (
                    <div key={i} className={`${severityStyle} border rounded-2xl p-5 hover:shadow-md transition-shadow duration-200`}>
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-base">{icon}</span>
                        <h4 className="text-sm font-bold text-slate-800">{alert.title}</h4>
                        <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${badgeStyle}`}>{alert.severity}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed ml-8">{alert.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Crop Suitability */}
            {cropSuitability && (
              <div className={`fade-up-9 rounded-3xl p-7 border-2 ${cropSuitability.suitable ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200' : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'}`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${cropSuitability.suitable ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {cropSuitability.suitable ? '✅' : '⚠️'}
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${cropSuitability.suitable ? 'text-emerald-800' : 'text-red-800'}`}>
                      {cropType} — Tomorrow's Suitability
                    </h3>
                    <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${cropSuitability.suitable ? 'bg-emerald-200 text-emerald-700' : 'bg-red-200 text-red-700'}`}>
                      {cropSuitability.suitable ? 'Suitable' : 'Not Recommended'}
                    </span>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white/70 rounded-2xl p-5 border border-white">
                    <h4 className="text-sm font-bold text-slate-700 mb-2">🔍 Analysis</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{cropSuitability.reason}</p>
                  </div>
                  <div className="bg-white/70 rounded-2xl p-5 border border-white">
                    <h4 className="text-sm font-bold text-slate-700 mb-2">📋 Recommendation</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{cropSuitability.recommendations}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 🎯 Week Summary */}
            <div className="fade-up-10 glass rounded-3xl p-7 ">
              <SectionHeader icon={<TriangleAlert className="w-4 h-4 text-white" />} title="Week Summary" />
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">🎯</span>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{weekSummary}</p>
                </div>
              </div>
            </div>

            {/* AI Farming Insights */}
            <div className="fade-up-10 glass rounded-3xl p-7 ">
              <SectionHeader icon={<Leaf className="w-4 h-4 text-white" />} title="AI Farming Insights" />

              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  {
                    emoji: '💧',
                    title: 'Irrigation',
                    color: 'bg-sky-50 border-sky-100',
                    accent: 'text-sky-700',
                    body: weatherData.forecast.some(d => d.precipitation > 50)
                      ? `High rain probability (${maxPrecip}%). Reduce irrigation 30–50% this week to conserve resources.`
                      : weatherData.forecast.some(d => d.precipitation > 20)
                        ? `Moderate rain expected (${maxPrecip}%). Monitor soil moisture before irrigating.`
                        : 'Low precipitation forecast. Maintain regular irrigation schedule.',
                  },
                  {
                    emoji: '🌾',
                    title: 'Crop Care',
                    color: 'bg-emerald-50 border-emerald-100',
                    accent: 'text-emerald-700',
                    body: `Humidity at ${weatherData.humidity}%. ${weatherData.humidity > 80 ? 'High — watch for fungal disease and improve air circulation.' : weatherData.humidity < 40 ? 'Low — increase watering frequency and consider mulching.' : 'Optimal for most crops.'}`,
                  },
                  {
                    emoji: '⚠️',
                    title: 'Weather Alerts',
                    color: 'bg-orange-50 border-orange-100',
                    accent: 'text-orange-700',
                    body: weatherData.windSpeed > 25
                      ? `High winds (${weatherData.windSpeed} km/h). Secure equipment and shelter young plants.`
                      : weatherData.uvIndex > 8
                        ? `Very high UV (${weatherData.uvIndex}). Protect workers and shade sensitive crops.`
                        : 'No severe alerts. Conditions are suitable for outdoor farm work.',
                  },
                  {
                    emoji: '📅',
                    title: 'Best Working Days',
                    color: 'bg-violet-50 border-violet-100',
                    accent: 'text-violet-700',
                    body: (() => {
                      const good = weatherData.forecast.filter(d => d.precipitation < 30 && d.windSpeed < 20).map(d => d.day).slice(0, 3);
                      return good.length > 0 ? `Optimal days this week: ${good.join(', ')}. Plan intensive activities around these.` : 'Adverse conditions forecast. Monitor daily before planning field work.';
                    })(),
                  },
                ].map(({ emoji, title, color, accent, body }) => (
                  <div key={title} className={`rounded-2xl p-5 border ${color} hover:shadow-md transition-shadow duration-200`}>
                    <h4 className={`text-sm font-bold mb-2 ${accent}`}>{emoji} {title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default WeatherForecasting;