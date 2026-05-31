import React, { useState, useEffect } from 'react';
import { Sprout, CheckCircle2, Lightbulb, Loader2, ThermometerSun, Droplets, Trees, CalendarDays } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { allStates, citiesForState } from 'indian-states-cities';
import { getAgriGyaan } from '../services/agriGyaanService';

interface AgriGyaanProps {
  onBack: () => void;
}

interface ParsedAgriGyaanData {
  crop: string;
  state: string;
  is_suitable: string;
  suitability_reason: string;
  growing_guide: {
    [key: string]: string;
  };
  best_practices: string[];
}

export function AgriGyaan({ onBack }: AgriGyaanProps) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'ArrowUp') {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onBack]);

  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSoil, setSelectedSoil] = useState('');
  const [agriGyaanData, setAgriGyaanData] = useState<string | null>(null);
  const [parsedAgriGyaanData, setParsedAgriGyaanData] = useState<ParsedAgriGyaanData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  const states = allStates();
  const crops = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Tomato', 'Potato', 'Onion', 'Soybean', 'Maize', 'Groundnut', 'Sunflower', 'Mustard', 'Gram', 'Turmeric', 'Chili', 'Ginger', 'Garlic', 'Banana', 'Mango', 'Apple'];
  const soilTypes = ['Black Soil', 'Red Soil', 'Alluvial Soil', 'Laterite Soil', 'Desert Soil', 'Mountain Soil', 'Clay Soil', 'Sandy Soil', 'Loamy Soil'];

  useEffect(() => {
    if (selectedState) {
      let districts = citiesForState(selectedState) || [];
      
      // Add missing districts for Maharashtra
      if (selectedState === 'Maharashtra') {
        const maharashtraDistricts = ['Kolhapur', 'Pune', 'Mumbai', 'Nashik', 'Aurangabad', 'Solapur', 'Nagpur', 'Sangli', 'Satara', 'Ahmednagar'];
        districts = [...new Set([...districts, ...maharashtraDistricts])].sort();
      }
      
      setAvailableDistricts(districts);
      setSelectedDistrict('');
    }
  }, [selectedState]);

  const handleSearch = async () => {
    if (!selectedCrop || !selectedState || !selectedDistrict || !selectedSoil) {
      alert('Please select crop, state, district, and soil type');
      return;
    }

    setIsLoading(true);
    setError(null);
    setParsedAgriGyaanData(null);
    
    try {
      const response = await getAgriGyaan({
        crop: selectedCrop,
        state: selectedState,
        district: selectedDistrict,
        soil: selectedSoil
      });

      // Backend now returns parsed JSON directly
      if (typeof response.agriGyaan === 'object') {
        setParsedAgriGyaanData(response.agriGyaan);
        setAgriGyaanData(null);
      } else {
        setAgriGyaanData(response.agriGyaan);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get AgriGyaan information';
      setError(msg);
      console.error('AgriGyaan error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconForGuide = (key: string) => {
    const iconClass = "h-6 w-6 text-green-600";
    switch (key.toLowerCase()) {
      case 'climate': return <ThermometerSun className={`${iconClass} text-orange-500`} />;
      case 'soil': return <Trees className={`${iconClass} text-yellow-700`} />;
      case 'irrigation': return <Droplets className={`${iconClass} text-blue-500`} />;
      case 'fertilizer': return <Sprout className={`${iconClass} text-green-500`} />;
      case 'sowing':
      case 'seed_selection': return <CalendarDays className={`${iconClass} text-purple-500`} />;
      case 'harvesting': return <CalendarDays className={`${iconClass} text-red-500`} />;
      default: return <Lightbulb className={`${iconClass} text-gray-500`} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header with Back Button */}
        <div className="text-center bg-white rounded-2xl shadow-md p-6">
          <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
            🌾 AgriGyaan Knowledge Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get simple, reliable farming advice tailored to your land and crop.
          </p>
        </div>

        {/* Search Form */}
        <Card className="border-0 shadow-xl bg-white rounded-2xl">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <Label className="text-lg font-medium flex items-center">
                  <Sprout className="w-4 h-4 mr-2 text-green-600" />
                  Select Crop *
                </Label>
                <select 
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-xl text-base bg-white focus:outline-none focus:border-green-600 shadow-sm h-14"
                >
                  <option value="">Choose a crop</option>
                  {crops.map(crop => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-lg font-medium flex items-center">
                  <Trees className="w-4 h-4 mr-2 text-green-600" />
                  Select State *
                </Label>
                <select 
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-xl text-base bg-white focus:outline-none focus:border-green-600 shadow-sm h-14"
                >
                  <option value="">Choose a state</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-lg font-medium flex items-center">
                  <CalendarDays className="w-4 h-4 mr-2 text-green-600" />
                  Select District *
                </Label>
                <select 
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={!selectedState}
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-xl text-base bg-white focus:outline-none focus:border-green-600 shadow-sm h-14 disabled:bg-gray-100"
                >
                  <option value="">Choose a district</option>
                  {availableDistricts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-lg font-medium flex items-center">
                  <ThermometerSun className="w-4 h-4 mr-2 text-green-600" />
                  Select Soil Type *
                </Label>
                <select 
                  value={selectedSoil}
                  onChange={(e) => setSelectedSoil(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-xl text-base bg-white focus:outline-none focus:border-green-600 shadow-sm h-14"
                >
                  <option value="">Choose soil type</option>
                  {soilTypes.map(soil => (
                    <option key={soil} value={soil}>{soil}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-center">
              <Button 
                onClick={handleSearch}
                disabled={!selectedCrop || !selectedState || !selectedDistrict || !selectedSoil || isLoading}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Getting AgriGyaan...
                  </div>
                ) : (
                  'Get My Farming Guide'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-50 border-red-200 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <div className="text-red-700 text-center">
                <h3 className="font-semibold mb-2">❌ Oops! Something went wrong.</h3>
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Raw AgriGyaan Response */}
        {agriGyaanData && !parsedAgriGyaanData && (
          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
                <Lightbulb className="w-6 h-6 mr-3" />
                AgriGyaan Guide: {selectedCrop} in {selectedState}
              </h2>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                  {agriGyaanData}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Parsed AgriGyaan Results - All in One Box */}
        {parsedAgriGyaanData && (
          <Card className="bg-white rounded-2xl shadow-lg border-0">
            <CardContent className="p-8">
              {/* Suitability Section */}
              <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-xl p-8 mb-8 text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="w-20 h-20 text-green-700" />
                </div>
                <h3 className="text-3xl font-bold mb-4 text-green-800">
                  {parsedAgriGyaanData.crop} in {parsedAgriGyaanData.state}
                </h3>
                <p className="text-5xl font-extrabold mb-6 text-green-800">
                  YES, IT CAN GROW!
                </p>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                  {parsedAgriGyaanData.suitability_reason}
                </p>
              </div>

              {/* Growing Guide Section */}
              {parsedAgriGyaanData.growing_guide && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-green-800 mb-6">Complete Growing Guide</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(parsedAgriGyaanData.growing_guide).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          {getIconForGuide(key)}
                          <h4 className="font-semibold ml-2 capitalize">{key.replace('_', ' ')}</h4>
                        </div>
                        <p className="text-gray-700 text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Best Practices Section */}
              {parsedAgriGyaanData.best_practices && (
                <div>
                  <h3 className="text-2xl font-bold text-green-800 mb-6">Best Practices</h3>
                  <ul className="list-disc list-inside space-y-4 text-gray-700">
                    {parsedAgriGyaanData.best_practices.map((practice, index) => (
                      <li key={index} className="text-lg">{practice}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}









// import React, { useState, useEffect } from 'react';
// import { MapPin, Sprout, ChevronDown, ChevronUp, CheckCircle2, XCircle, Calendar, Thermometer, Droplets, Lightbulb, Loader2 } from 'lucide-react';
// import { Button } from '../components/ui/button';
// import { Label } from '../components/ui/label';
// import { Card, CardContent } from '../components/ui/card';
// import { allStates } from 'indian-states-cities';
// import { getAgriGyaan } from '../services/agriGyaanService';

// interface AgriGyaanProps {
//   onBack: () => void;
// }

// interface KnowledgeData {
//   suitableCrops: string[];
//   unsuitableCrops: { name: string; reason: string }[];
//   alternativeCrops: string[];
//   climateRequirements: {
//     temperature: string;
//     rainfall: string;
//     soil: string;
//   };
//   seasonalCalendar: {
//     kharif: string[];
//     rabi: string[];
//     zaid: string[];
//   };
//   bestPractices: string[];
// }

// export function AgriGyaan({ onBack }: AgriGyaanProps) {
//   useEffect(() => {
//     const handleKeyPress = (event: KeyboardEvent) => {
//       if (event.key === 'Escape' || event.key === 'ArrowUp') {
//         onBack();
//       }
//     };

//     window.addEventListener('keydown', handleKeyPress);
//     return () => window.removeEventListener('keydown', handleKeyPress);
//   }, [onBack]);

//   const [selectedCrop, setSelectedCrop] = useState('');
//   const [selectedState, setSelectedState] = useState('');
//   const [agriGyaanData, setAgriGyaanData] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const states = allStates();
//   const crops = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Tomato', 'Potato', 'Onion', 'Soybean', 'Maize', 'Groundnut', 'Sunflower', 'Mustard', 'Gram', 'Turmeric', 'Chili', 'Ginger', 'Garlic', 'Banana', 'Mango', 'Apple'];

//   const handleSearch = async () => {
//     if (!selectedCrop || !selectedState) {
//       alert('Please select both crop and state');
//       return;
//     }

//     setIsLoading(true);
//     setError(null);
    
//     try {
//       const response = await getAgriGyaan({
//         crop: selectedCrop,
//         state: selectedState
//       });
      
//       setAgriGyaanData(response.agriGyaan);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to get AgriGyaan information');
//       console.error('AgriGyaan error:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   };



//   return (
//     <div className="space-y-6">
//       {/* Title */}
//       <div className="text-center mb-8">
//         <h1 className="text-4xl font-bold text-green-800 mb-4">
//           AgriGyaan Knowledge Hub
//         </h1>
//         <p className="text-xl text-gray-600">Get region-wise agricultural knowledge and farming guidance</p>
//       </div>

//       {/* Search Form */}
//       <div className="max-w-2xl mx-auto">
//         <Card className="border-0 shadow-xl bg-white rounded-2xl">
//           <CardContent className="p-8 space-y-6">
//             {/* Crop Selection */}
//             <div className="space-y-2">
//               <Label className="text-lg font-medium">Select Crop</Label>
//               <select 
//                 value={selectedCrop}
//                 onChange={(e) => setSelectedCrop(e.target.value)}
//                 className="w-full p-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none"
//               >
//                 <option value="">Choose a crop</option>
//                 {crops.map(crop => (
//                   <option key={crop} value={crop}>{crop}</option>
//                 ))}
//               </select>
//             </div>

//             {/* State Selection */}
//             <div className="space-y-2">
//               <Label className="text-lg font-medium">Select State</Label>
//               <select 
//                 value={selectedState}
//                 onChange={(e) => setSelectedState(e.target.value)}
//                 className="w-full p-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none"
//               >
//                 <option value="">Choose a state</option>
//                 {states.map(state => (
//                   <option key={state} value={state}>{state}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Search Button */}
//             <div className="text-center pt-4">
//               <Button 
//                 onClick={handleSearch}
//                 disabled={!selectedCrop || !selectedState || isLoading}
//                 className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//               >
//                 {isLoading ? (
//                   <div className="flex items-center">
//                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                     Getting AgriGyaan...
//                   </div>
//                 ) : (
//                   'Get AgriGyaan'
//                 )}
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Error Display */}
//       {error && (
//         <Card className="bg-red-50 border-red-200 rounded-2xl shadow-lg max-w-4xl mx-auto">
//           <CardContent className="p-6">
//             <div className="text-red-700">
//               <h3 className="font-semibold mb-2">Error</h3>
//               <p>{error}</p>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* AI AgriGyaan Results */}
//       {agriGyaanData && (
//         <Card className="bg-white rounded-2xl shadow-lg border-0 max-w-6xl mx-auto">
//           <CardContent className="p-8">
//             <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
//               <Lightbulb className="w-6 h-6 mr-3" />
//               AgriGyaan Analysis: {selectedCrop} in {selectedState}
//             </h2>
//             <div className="prose max-w-none">
//               <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
//                 {agriGyaanData}
//               </pre>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }