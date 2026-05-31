import React, { useState, useEffect } from 'react';
import { allStates, citiesForState } from 'indian-states-cities';
import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';

interface WeatherSimpleProps {
  onBack: () => void;
}

export function WeatherSimple({ onBack }: WeatherSimpleProps) {
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [taluka, setTaluka] = useState('');
  const [crop, setCrop] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onBack(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const states = allStates();

  const additionalDistricts: Record<string, string[]> = {
    'Maharashtra': ['Kolhapur', 'Sangli', 'Satara', 'Raigad', 'Ratnagiri', 'Sindhudurg', 'Solapur'],
    'Karnataka': ['Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban'],
    'Tamil Nadu': ['Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore']
  };

  const getDistricts = (selectedState: string) => {
    const pkg = citiesForState(selectedState);
    const extra = additionalDistricts[selectedState] || [];
    return [...new Set([...pkg, ...extra])].sort();
  };

  const fetchWeatherData = async () => {
    if (!state || !crop) { alert('Please select state and crop'); return; }
    const location = [taluka, district, state].filter(Boolean).join(', ');
    const token = localStorage.getItem('authToken');
    if (!token) { alert('Please login first'); return; }
    setIsLoading(true);
    try {
      const response = await fetch('/api/gemini/gemini-weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ location, crop })
      });
      if (!response.ok) throw new Error('Failed to get weather data');
      const result = await response.json();
      setWeatherData(result.weather);
    } catch (error) {
      alert('Failed to fetch weather data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBg = (status: string) => {
    if (status.includes('🟢')) return 'bg-green-50 border-green-300 text-green-800';
    if (status.includes('🟡')) return 'bg-yellow-50 border-yellow-300 text-yellow-800';
    if (status.includes('🔴')) return 'bg-red-50 border-red-300 text-red-800';
    return 'bg-gray-50 border-gray-200 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">🌾 Crop Weather Intelligence</h1>
          <p className="text-gray-600">AI-powered 7-day weather analysis tailored for your crop</p>
        </div>

        {/* Input Form */}
        <Card className="border-0 shadow-xl bg-white rounded-2xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
            <h2 className="text-xl font-semibold">Enter Location & Crop Details</h2>
          </div>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label className="text-base font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" /> State *
                </Label>
                <select
                  value={state}
                  onChange={e => { setState(e.target.value); setDistrict(''); setTaluka(''); }}
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-xl text-base bg-white focus:outline-none focus:border-green-600 h-12"
                >
                  <option value="">Select State</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" /> District
                </Label>
                <select
                  value={district}
                  onChange={e => { setDistrict(e.target.value); setTaluka(''); }}
                  disabled={!state}
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-xl text-base bg-white focus:outline-none focus:border-green-600 h-12 disabled:bg-gray-100"
                >
                  <option value="">Select District</option>
                  {state && getDistricts(state).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Taluka (Optional)</Label>
                <Input
                  value={taluka}
                  onChange={e => setTaluka(e.target.value)}
                  placeholder="Enter Taluka name"
                  className="h-12 border-2 border-green-300 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Select Crop *</Label>
                <select
                  value={crop}
                  onChange={e => setCrop(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-xl text-base bg-white focus:outline-none focus:border-green-600 h-12"
                >
                  <option value="">Select Crop</option>
                  {['Rice','Wheat','Maize','Cotton','Sugarcane','Soybean','Groundnut','Tomato','Onion','Potato',
                    'Chickpea','Mustard','Sunflower','Barley','Jowar','Bajra','Ragi','Turmeric','Chili','Ginger',
                    'Garlic','Coriander','Cumin','Banana','Mango','Grapes','Pomegranate','Coconut','Coffee','Tea'
                  ].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={fetchWeatherData}
                disabled={!state || !crop || isLoading}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-12 py-6 text-lg font-medium rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Analyzing Weather Intelligence...</>
                ) : (
                  '🌾 Get Crop Weather Intelligence'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {weatherData && !weatherData.error && (
          <div className="space-y-8">

            {/* Header */}
            <div className="bg-white border-2 border-green-500 rounded-2xl p-8 text-center shadow-xl">
              <h2 className="text-3xl font-bold mb-2 text-gray-900">🌾 7-Day Crop Weather Intelligence</h2>
              <p className="text-gray-800 text-lg font-semibold bg-green-100 inline-block px-4 py-1 rounded-full mt-1 border border-green-300">
                {weatherData.crop} — {weatherData.location}
              </p>
            </div>

            {/* Section 1: 7-Day Timeline */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <div className="bg-blue-600 px-6 py-4 text-white">
                <h3 className="text-xl font-bold">📅 7-Day Crop Weather Timeline</h3>
              </div>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{backgroundColor: '#eff6ff', borderBottom: '3px solid #bfdbfe'}}>
                        <th className="px-6 py-5 text-left font-bold text-blue-800 text-sm uppercase tracking-wide" style={{width:'15%'}}>Date</th>
                        <th className="px-6 py-5 text-left font-bold text-blue-800 text-sm uppercase tracking-wide" style={{width:'22%'}}>Temp Range</th>
                        <th className="px-6 py-5 text-left font-bold text-blue-800 text-sm uppercase tracking-wide" style={{width:'13%'}}>Rain %</th>
                        <th className="px-6 py-5 text-left font-bold text-blue-800 text-sm uppercase tracking-wide" style={{width:'15%'}}>Humidity</th>
                        <th className="px-6 py-5 text-left font-bold text-blue-800 text-sm uppercase tracking-wide" style={{width:'35%'}}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weatherData.timeline?.map((day: any, i: number) => (
                        <tr
                          key={i}
                          style={{
                            backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc',
                            borderBottom: '1px solid #e2e8f0',
                            transition: 'background-color 0.15s'
                          }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#ffffff' : '#f8fafc')}
                        >
                          <td className="px-6 py-5 font-bold text-gray-900 text-base">{day.date}</td>
                          <td className="px-6 py-5 text-gray-700 font-medium text-base">{day.tempRange}</td>
                          <td className="px-6 py-5">
                            <span
                              className="font-bold text-base"
                              style={{
                                color: day.rainPercent >= 60 ? '#dc2626' :
                                       day.rainPercent >= 30 ? '#d97706' : '#2563eb'
                              }}
                            >{day.rainPercent}%</span>
                          </td>
                          <td className="px-6 py-5 text-gray-700 text-base">{day.humidity}%</td>
                          <td className="px-6 py-5">
                            <span
                              className="inline-block px-4 py-2 rounded-full text-sm font-bold border whitespace-nowrap"
                              style={{
                                backgroundColor:
                                  day.status?.includes('🟢') ? '#f0fdf4' :
                                  day.status?.includes('🟡') ? '#fefce8' : '#fef2f2',
                                borderColor:
                                  day.status?.includes('🟢') ? '#86efac' :
                                  day.status?.includes('🟡') ? '#fde047' : '#fca5a5',
                                color:
                                  day.status?.includes('🟢') ? '#166534' :
                                  day.status?.includes('🟡') ? '#854d0e' : '#991b1b'
                              }}
                            >
                              {day.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Critical Weather Windows */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <div className="bg-orange-600 px-6 py-4 text-white">
                <h3 className="text-xl font-bold text-white">⚡ Critical Weather Windows</h3>
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  {weatherData.criticalWindows?.map((w: string, i: number) => (
                    <div key={i} className="flex items-start gap-4 bg-orange-50 border-l-4 border-orange-400 rounded-xl p-5 shadow-sm">
                      <span className="text-orange-500 font-black text-xl shrink-0 mt-0.5">→</span>
                      <span className="text-gray-800 text-sm leading-relaxed font-medium">{w}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Rainfall vs Crop Need */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <div className="bg-blue-600 px-6 py-4 text-white">
                <h3 className="text-xl font-bold text-white">🌧️ Rainfall vs Crop Need</h3>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-5 text-center shadow-sm">
                    <div className="text-4xl font-black text-blue-600 mb-1">{weatherData.rainfall?.expectedMm ?? '—'}mm</div>
                    <div className="text-sm font-semibold text-blue-700">Expected Rainfall</div>
                    <div className="text-xs text-gray-500 mt-1">This week</div>
                  </div>
                  <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-5 text-center shadow-sm">
                    <div className="text-4xl font-black text-green-600 mb-1">{weatherData.rainfall?.cropNeedMm ?? '—'}mm</div>
                    <div className="text-sm font-semibold text-green-700">{weatherData.crop} Weekly Need</div>
                    <div className="text-xs text-gray-500 mt-1">Standard requirement</div>
                  </div>
                  <div className={`rounded-2xl p-5 text-center border-2 shadow-sm ${
                    weatherData.rainfall?.verdict === 'Surplus' ? 'bg-yellow-50 border-yellow-400' :
                    weatherData.rainfall?.verdict === 'Deficit' ? 'bg-red-50 border-red-400' :
                    'bg-green-50 border-green-400'
                  }`}>
                    <div className={`text-3xl font-black mb-1 ${
                      weatherData.rainfall?.verdict === 'Surplus' ? 'text-yellow-600' :
                      weatherData.rainfall?.verdict === 'Deficit' ? 'text-red-600' : 'text-green-600'
                    }`}>{weatherData.rainfall?.verdict ?? '—'}</div>
                    <div className="text-sm font-semibold text-gray-600">Verdict</div>
                  </div>
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-5">
                  <p className="text-gray-800 text-sm font-medium">💡 <strong>Recommended Action:</strong> {weatherData.rainfall?.action}</p>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Crop Threshold Analysis */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <div className="px-6 py-4" style={{backgroundColor: '#7e22ce'}}>
                <h3 className="text-xl font-bold" style={{color: '#ffffff'}}>📊 Crop Threshold Analysis</h3>
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 border-2 border-gray-200 rounded-xl p-5 gap-3">
                    <div>
                      <span className="font-bold text-gray-800">🌡️ Temperature: </span>
                      <span className="text-gray-700">{weatherData.thresholdAnalysis?.temperature?.weekRange || 'N/A'} this week</span>
                      <span className="text-gray-500 text-sm ml-2">vs ideal {weatherData.thresholdAnalysis?.temperature?.idealRange || 'N/A'}</span>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold shrink-0 ${
                      weatherData.thresholdAnalysis?.temperature?.status?.includes('✅') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                    }`}>{weatherData.thresholdAnalysis?.temperature?.status || '⚠️ Check'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 border-2 border-gray-200 rounded-xl p-5 gap-3">
                    <div>
                      <span className="font-bold text-gray-800">💧 Humidity: </span>
                      <span className="text-gray-700">{weatherData.thresholdAnalysis?.humidity?.weekRange || 'N/A'} this week</span>
                      <span className="text-gray-500 text-sm ml-2">vs ideal {weatherData.thresholdAnalysis?.humidity?.idealRange || 'N/A'}</span>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold shrink-0 ${
                      weatherData.thresholdAnalysis?.humidity?.status?.includes('✅') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                    }`}>{weatherData.thresholdAnalysis?.humidity?.status || '⚠️ Check'}</span>
                  </div>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-xl p-5">
                    <span className="text-yellow-800 text-sm font-medium">⚠️ <strong>Stress Day Alert:</strong> {weatherData.thresholdAnalysis?.stressDay || 'No critical stress days identified this week'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Risk Alerts */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <div className="px-6 py-4" style={{backgroundColor: '#b91c1c'}}>
                <h3 className="text-xl font-bold" style={{color: '#ffffff'}}>🚨 Risk Alerts</h3>
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  {weatherData.riskAlerts?.length > 0 ? weatherData.riskAlerts.map((alert: string, i: number) => (
                    <div key={i} className={`rounded-xl p-5 border-l-4 shadow-sm ${
                      alert.includes('🔴') ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
                    }`}>
                      <p className="text-sm font-semibold text-gray-800">{alert}</p>
                    </div>
                  )) : (
                    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-5">
                      <p className="text-sm font-semibold text-green-800">✅ No critical risk alerts for this week</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Section 6: Pest & Disease */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <div className="px-6 py-4" style={{backgroundColor: '#be123c'}}>
                <h3 className="text-xl font-bold" style={{color: '#ffffff'}}>🦠 Pest &amp; Disease Weather Probability</h3>
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  {weatherData.pestDisease?.length > 0 ? weatherData.pestDisease.map((item: any, i: number) => (
                    <div key={i} className="flex items-start gap-5 bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <span className={`px-4 py-2 rounded-full text-xs font-black shrink-0 border-2 ${
                        item.probability === 'High' ? 'bg-red-100 text-red-700 border-red-300' :
                        item.probability === 'Moderate' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                        'bg-green-100 text-green-700 border-green-300'
                      }`}>{item.probability}</span>
                      <div>
                        <p className="font-bold text-gray-900 text-base">{item.name}</p>
                        <p className="text-gray-600 text-sm mt-1 leading-relaxed">{item.reason}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-5">
                      <p className="text-sm font-semibold text-green-800">✅ No significant pest or disease risk this week</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Section 7 & 8: Soil Moisture + Week Summary */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <div className="px-6 py-4" style={{backgroundColor: '#0f766e'}}>
                  <h3 className="text-xl font-bold" style={{color: '#ffffff'}}>🌱 Soil Moisture Trend</h3>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-800 text-base leading-relaxed font-medium">
                    {weatherData.soilMoisture || '📊 Soil moisture data not available for this location'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                <div className="px-6 py-4" style={{backgroundColor: '#166534'}}>
                  <h3 className="text-xl font-bold" style={{color: '#ffffff'}}>🎯 Week Summary</h3>
                </div>
                <CardContent className="p-6 flex items-center">
                  <p className="text-gray-800 text-base font-semibold leading-relaxed italic border-l-4 border-green-500 pl-4">
                    {weatherData.weekSummary || 'Monitor weather conditions closely and adjust farming activities accordingly.'}
                  </p>
                </CardContent>
              </Card>
            </div>

          </div>
        )}

        {weatherData?.error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
            Failed to parse weather intelligence. Please try again.
          </div>
        )}

      </div>
    </div>
  );
}
