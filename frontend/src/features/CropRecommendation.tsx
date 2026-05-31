// CropRecommendation.tsx

import React, { useState, useEffect } from 'react';
import { MapPin, Mountain, Droplets, Thermometer, Calendar, Sprout, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { getCropRecommendations, CropRecommendationRequest, CropInfo } from '../services/geminiService';
import { profileAPI } from '../services/api';
import StateDropdown from '../components/StateDropdown';
import Select from 'react-select';

interface CropRecommendationProps {
  onBack: () => void;
}

interface FormData {
  region: string;
  soilType: string;
  soilPH: string;
  waterAvailability: string;
  temperatureRange: string;
  season: string;
  farmSize: string;
}

export function CropRecommendation({ onBack }: CropRecommendationProps) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'ArrowUp') {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onBack]);

  const [formData, setFormData] = useState<FormData>({
    region: '',
    soilType: '',
    soilPH: '',
    waterAvailability: '',
    temperatureRange: '',
    season: '',
    farmSize: ''
  });
  
  const [results, setResults] = useState<CropInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const soilTypes = ['Black', 'Red', 'Clay', 'Sandy', 'Loamy', 'Silt'];
  const waterLevels = ['Low', 'Medium', 'High'];
  const temperatures = ['Cool', 'Moderate', 'Hot'];
  const seasons = ['Kharif', 'Rabi', 'Zaid'];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.region || !formData.soilType || !formData.season) {
      alert('Please fill required fields: Region, Soil Type, and Season are mandatory');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Submitting form data:', formData);
      const recommendations = await getCropRecommendations(formData as CropRecommendationRequest);
      console.log('Received recommendations:', recommendations);
      setResults(recommendations);
      // Save last crop recommendation to profile
      if (recommendations.length > 0) {
        const summary = recommendations.map((c: CropInfo) => c.name).join(', ');
        profileAPI.updateProfile({ lastCropRecommendation: `${formData.soilType} soil, ${formData.season} season → ${summary}` }).catch(() => {});
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to get recommendations: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      region: '',
      soilType: '',
      soilPH: '',
      waterAvailability: '',
      temperatureRange: '',
      season: '',
      farmSize: ''
    });
    setResults([]);
  };

  const getMarketColor = (market: string) => {
    switch (market.toLowerCase()) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCropIcon = (cropName: string) => {
    const name = cropName.toLowerCase();
    if (name.includes('cotton')) return '🌱';
    if (name.includes('wheat')) return '🌾';
    if (name.includes('rice') || name.includes('paddy')) return '🌾';
    if (name.includes('maize') || name.includes('corn')) return '🌽';
    if (name.includes('pigeon') || name.includes('tur') || name.includes('dal')) return '🫘';
    if (name.includes('millet') || name.includes('bajra')) return '🌾';
    if (name.includes('sugarcane')) return '🎋';
    if (name.includes('soybean')) return '🫘';
    if (name.includes('jute')) return '🧵';
    if (name.includes('coffee')) return '☕';
    if (name.includes('tea')) return '🍵';
    if (name.includes('groundnut') || name.includes('peanut')) return '🥜';
    return '🌱'; // Default icon
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-800 mb-4">
          Crop Recommendation System
        </h1>
        <p className="text-xl text-gray-600">Enter your farm details to get personalized crop suggestions</p>
      </div>

{/* Form Card */}
<Card className="border-0 shadow-xl bg-white rounded-2xl">
  <CardContent className="p-8">
    <div className="grid md:grid-cols-2 gap-6 mb-8">

      {/* Region */}
      <div className="space-y-2">
        <Label className="text-lg font-medium flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-green-600" />
          Region *
        </Label>
        <StateDropdown
          value={formData.region}
          onChange={(value) => handleInputChange('region', value)}
          className="w-full px-4 py-3 border-2 border-green-300 rounded-xl 
          text-base bg-white focus:outline-none focus:border-green-600 shadow-sm h-14"
        />
      </div>

      {/* Soil Type */}
      <div className="space-y-2">
        <Label className="text-lg font-medium flex items-center">
          <Mountain className="w-4 h-4 mr-2 text-green-600" />
          Soil Type *
        </Label>
        <select
          value={formData.soilType}
          onChange={(e) => handleInputChange('soilType', e.target.value)}
          className="w-full px-4 py-3 border-2 border-green-300 rounded-xl 
          text-base bg-white focus:outline-none focus:border-green-600 shadow-sm h-14"
        >
          <option value="">Select Soil Type</option>
          {soilTypes.map(soil => (
            <option key={soil} value={soil}>{soil}</option>
          ))}
        </select>
      </div>

      {/* Soil pH */}
      <div className="space-y-2">
        <Label className="text-lg font-medium">Soil pH Value</Label>
        <Input
          type="number"
          step="0.1"
          min="0"
          max="14"
          value={formData.soilPH}
          onChange={(e) => handleInputChange('soilPH', e.target.value)}
          placeholder="e.g., 6.5"
          className="w-full px-4 py-3 border-2 border-green-300 rounded-xl 
          text-base bg-white focus:outline-none focus:border-green-600 shadow-sm h-14"
        />
      </div>

      {/* Water Availability */}
      <div className="space-y-2">
        <Label className="text-lg font-medium flex items-center">
          <Droplets className="w-4 h-4 mr-2 text-green-600" />
          Water Availability
        </Label>
        <select
          value={formData.waterAvailability}
          onChange={(e) => handleInputChange('waterAvailability', e.target.value)}
          className="w-full px-4 py-3 border-2 border-green-300 rounded-xl 
          text-base bg-white focus:outline-none focus:border-green-600 shadow-sm h-14"
        >
          <option value="">Select Water Level</option>
          {waterLevels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      {/* Temperature Range */}
      <div className="space-y-2">
        <Label className="text-lg font-medium flex items-center">
          <Thermometer className="w-4 h-4 mr-2 text-green-600" />
          Temperature Range
        </Label>
        <select
          value={formData.temperatureRange}
          onChange={(e) => handleInputChange('temperatureRange', e.target.value)}
          className="w-full px-4 py-3 border-2 border-green-300 rounded-xl 
          text-base bg-white focus:outline-none focus:border-green-600 shadow-sm h-14"
        >
          <option value="">Select Temperature</option>
          {temperatures.map(temp => (
            <option key={temp} value={temp}>{temp}</option>
          ))}
        </select>
      </div>

      {/* Season */}
      <div className="space-y-2">
        <Label className="text-lg font-medium flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-green-600" />
          Season *
        </Label>
        <select
          value={formData.season}
          onChange={(e) => handleInputChange('season', e.target.value)}
          className="w-full px-4 py-3 border-2 border-green-300 rounded-xl 
          text-base bg-white focus:outline-none focus:border-green-600 shadow-sm h-14"
        >
          <option value="">Select Season</option>
          {seasons.map(season => (
            <option key={season} value={season}>{season}</option>
          ))}
        </select>
      </div>

      {/* Farm Size */}
      <div className="space-y-2 md:col-span-2">
        <Label className="text-lg font-medium">Farm Size (Acres)</Label>
        <Input
          type="number"
          min="0"
          value={formData.farmSize}
          onChange={(e) => handleInputChange('farmSize', e.target.value)}
          placeholder="Enter farm size in acres"
          className="w-full px-4 py-3 border-2 border-green-300 rounded-xl 
          text-base bg-white focus:outline-none focus:border-green-600 shadow-sm h-14"
        />
      </div>
    </div>

    {/* Button */}
    <div className="text-center">
      <Button 
        onClick={handleSubmit}
        disabled={isLoading}
        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          'Get Recommendation'
        )}
      </Button>
    </div>

  </CardContent>
</Card>






      {/* Results Section */}
      {results.length > 0 && (
        <div className="space-y-6">
          {/* Header */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-green-600 to-green-700 rounded-2xl text-white">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <Sprout className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold mb-2">AI-Powered Crop Recommendations</h2>
              <p className="text-green-100">Personalized suggestions based on your farm conditions</p>
            </CardContent>
          </Card>

          {/* Farm Summary */}
          <Card className="border-0 shadow-lg bg-white rounded-xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">🏡</span>
                Your Farm Profile
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Region & Season</div>
                  <div className="text-gray-800 font-semibold">{formData.region}</div>
                  <div className="text-sm text-gray-600">{formData.season} Season</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Soil Conditions</div>
                  <div className="text-gray-800 font-semibold">{formData.soilType} Soil</div>
                  <div className="text-sm text-gray-600">pH: {formData.soilPH || 'Not specified'}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">Resources</div>
                  <div className="text-gray-800 font-semibold">{formData.waterAvailability} Water</div>
                  <div className="text-sm text-gray-600">{formData.farmSize} acres</div>
                </div>
              </div>
            </CardContent>
          </Card>

{/* Crop Recommendations Grid */}
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {results.map((crop, index) => (
    <Card key={index} className="border-0 shadow-lg bg-white rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
        <div className="flex items-center justify-center">
          <span className="text-4xl mb-2">{getCropIcon(crop.name)}</span>
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="text-2xl font-bold text-black mb-3 text-center">{crop.name}</h3>
        <p className="text-gray-700 mb-4">{crop.description}</p>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            <div>
              <div className="text-sm text-gray-500">Expected Yield</div>
              <div className="font-semibold text-black">{crop.yield}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            <div>
              <div className="text-sm text-gray-500">Market Potential</div>
              <div className={`font-semibold px-2 py-1 rounded-md inline-block ${getMarketColor(crop.market)}`}>
                {crop.market}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>

          
     

          {/* Action Buttons */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
            <CardContent className="p-6">
              <div className="flex flex-wrap justify-center items-center gap-8 mt-8">

  {/* New Recommendation Button */}
  <Button
    onClick={handleReset}
    className="
      bg-green-600
      hover:bg-green-700
      text-white
      h-16
      w-[320px]
      rounded-2xl
      shadow-md
      transition-colors duration-300
      text-lg
      font-semibold
      flex items-center justify-center
    "
  >
    <div className="flex items-center justify-center gap-3 w-full">
      <span className="text-2xl flex items-center">🔄</span>
      <span className="text-center">Get New Recommendation</span>
    </div>
  </Button>

  {/* Print Report Button */}
  <Button
    onClick={() => window.print()}
    className="
      bg-blue-600
      hover:bg-blue-700
      text-white
      h-16
      w-[320px]
      rounded-2xl
      shadow-md
      transition-colors duration-300
      text-lg
      font-semibold
      flex items-center justify-center
    "
  >
    <div className="flex items-center justify-center gap-3 w-full">
      <span className="text-2xl flex items-center">🖨️</span>
      <span className="text-center">Print Report</span>
    </div>
  </Button>

</div>



              {/* <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                <Button 
                  onClick={handleReset}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <span className="mr-2">🔄</span>
                  Get New Recommendation
                </Button>
                <Button 
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <span className="mr-2">🖨️</span>
                  Print Report
                </Button>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  💡 <strong>Tip:</strong> Consult with local agricultural experts before making final decisions
                </p>
              </div> */}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}








// import React, { useState, useEffect } from 'react';
// import { MapPin, Mountain, Droplets, Thermometer, Calendar, Sprout, DollarSign } from 'lucide-react';
// import { Button } from '../components/ui/button';
// import { Input } from '../components/ui/input';
// import { Label } from '../components/ui/label';
// import { Card, CardContent } from '../components/ui/card';
// import { getCropRecommendations, CropRecommendationRequest } from '../services/geminiService';
// import StateDropdown from '../components/StateDropdown';

// interface CropRecommendationProps {
//   onBack: () => void;
// }

// interface FormData {
//   region: string;
//   soilType: string;
//   soilPH: string;
//   waterAvailability: string;
//   temperatureRange: string;
//   season: string;
//   farmSize: string;
// }

// interface RecommendationResult {
//   recommendations: string;
// }

// export function CropRecommendation({ onBack }: CropRecommendationProps) {
//   useEffect(() => {
//     const handleKeyPress = (event: KeyboardEvent) => {
//       if (event.key === 'Escape' || event.key === 'ArrowUp') {
//         onBack();
//       }
//     };

//     window.addEventListener('keydown', handleKeyPress);
//     return () => window.removeEventListener('keydown', handleKeyPress);
//   }, [onBack]);

//   const [formData, setFormData] = useState<FormData>({
//     region: '',
//     soilType: '',
//     soilPH: '',
//     waterAvailability: '',
//     temperatureRange: '',
//     season: '',
//     farmSize: ''
//   });
  
//   const [result, setResult] = useState<RecommendationResult | null>(null);
//   const [isLoading, setIsLoading] = useState(false);


//   const soilTypes = ['Black', 'Red', 'Clay', 'Sandy', 'Loamy', 'Silt'];
//   const waterLevels = ['Low', 'Medium', 'High'];
//   const temperatures = ['Cool', 'Moderate', 'Hot'];
//   const seasons = ['Kharif', 'Rabi', 'Zaid'];

//   const handleInputChange = (field: keyof FormData, value: string) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const handleSubmit = async () => {
//     if (!formData.region || !formData.soilType || !formData.season) {
//       alert('Please fill required fields');
//       return;
//     }
    
//     setIsLoading(true);
//     try {
//       const recommendations = await getCropRecommendations(formData as CropRecommendationRequest);
//       setResult({ recommendations });
//     } catch (error) {
//       alert('Failed to get recommendations. Please try again.');
//       console.error(error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleReset = () => {
//     setFormData({
//       region: '',
//       soilType: '',
//       soilPH: '',
//       waterAvailability: '',
//       temperatureRange: '',
//       season: '',
//       farmSize: ''
//     });
//     setResult(null);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Title */}
//       <div className="text-center mb-8">
//         <h1 className="text-4xl font-bold text-green-800 mb-4">
//           Crop Recommendation System
//         </h1>
//         <p className="text-xl text-gray-600">Enter your farm details to get personalized crop suggestions</p>
//       </div>

//       {/* Form Card */}
//       <Card className="border-0 shadow-xl bg-white rounded-2xl">
//         <CardContent className="p-8">
//           <div className="grid md:grid-cols-2 gap-6 mb-8">
//             {/* Region */}
//             <div className="space-y-2">
//               <Label className="text-lg font-medium flex items-center">
//                 <MapPin className="w-4 h-4 mr-2 text-green-600" />
//                 Region *
//               </Label>
//               <StateDropdown 
//                 value={formData.region}
//                 onChange={(value) => handleInputChange('region', value)}
//                 className="p-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none"
//               />
//             </div>

//             {/* Soil Type */}
//             <div className="space-y-2">
//               <Label className="text-lg font-medium flex items-center">
//                 <Mountain className="w-4 h-4 mr-2 text-green-600" />
//                 Soil Type *
//               </Label>
//               <select 
//                 value={formData.soilType}
//                 onChange={(e) => handleInputChange('soilType', e.target.value)}
//                 className="w-full p-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none"
//               >
//                 <option value="">Select Soil Type</option>
//                 {soilTypes.map(soil => (
//                   <option key={soil} value={soil}>{soil}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Soil pH */}
//             <div className="space-y-2">
//               <Label className="text-lg font-medium">Soil pH Value</Label>
//               <Input 
//                 type="number"
//                 step="0.1"
//                 min="0"
//                 max="14"
//                 value={formData.soilPH}
//                 onChange={(e) => handleInputChange('soilPH', e.target.value)}
//                 placeholder="e.g., 6.5"
//                 className="p-3 border-2 border-green-200 rounded-xl focus:border-green-500"
//               />
//             </div>

//             {/* Water Availability */}
//             <div className="space-y-2">
//               <Label className="text-lg font-medium flex items-center">
//                 <Droplets className="w-4 h-4 mr-2 text-green-600" />
//                 Water Availability
//               </Label>
//               <select 
//                 value={formData.waterAvailability}
//                 onChange={(e) => handleInputChange('waterAvailability', e.target.value)}
//                 className="w-full p-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none"
//               >
//                 <option value="">Select Water Level</option>
//                 {waterLevels.map(level => (
//                   <option key={level} value={level}>{level}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Temperature Range */}
//             <div className="space-y-2">
//               <Label className="text-lg font-medium flex items-center">
//                 <Thermometer className="w-4 h-4 mr-2 text-green-600" />
//                 Temperature Range
//               </Label>
//               <select 
//                 value={formData.temperatureRange}
//                 onChange={(e) => handleInputChange('temperatureRange', e.target.value)}
//                 className="w-full p-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none"
//               >
//                 <option value="">Select Temperature</option>
//                 {temperatures.map(temp => (
//                   <option key={temp} value={temp}>{temp}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Season */}
//             <div className="space-y-2">
//               <Label className="text-lg font-medium flex items-center">
//                 <Calendar className="w-4 h-4 mr-2 text-green-600" />
//                 Season *
//               </Label>
//               <select 
//                 value={formData.season}
//                 onChange={(e) => handleInputChange('season', e.target.value)}
//                 className="w-full p-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none"
//               >
//                 <option value="">Select Season</option>
//                 {seasons.map(season => (
//                   <option key={season} value={season}>{season}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Farm Size */}
//             <div className="space-y-2 md:col-span-2">
//               <Label className="text-lg font-medium">Farm Size (Acres)</Label>
//               <Input 
//                 type="number"
//                 min="0"
//                 value={formData.farmSize}
//                 onChange={(e) => handleInputChange('farmSize', e.target.value)}
//                 placeholder="Enter farm size in acres"
//                 className="p-3 border-2 border-green-200 rounded-xl focus:border-green-500"
//               />
//             </div>
//           </div>

//           {/* Button */}
//           <div className="text-center">
//             <Button 
//               onClick={handleSubmit}
//               disabled={isLoading}
//               className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//             >
//               {isLoading ? (
//                 <div className="flex items-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                   Processing...
//                 </div>
//               ) : (
//                 'Get Recommendation'
//               )}
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Results Card */}
//       {result && (
//         <div className="space-y-6">
//           {/* Header */}
//           <Card className="border-0 shadow-xl bg-gradient-to-r from-green-600 to-green-700 rounded-2xl text-white">
//             <CardContent className="p-8 text-center">
//               <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
//                 <Sprout className="w-8 h-8" />
//               </div>
//               <h2 className="text-3xl font-bold mb-2">AI-Powered Crop Recommendations</h2>
//               <p className="text-green-100">Personalized suggestions based on your farm conditions</p>
//             </CardContent>
//           </Card>

//           {/* Farm Summary */}
//           <Card className="border-0 shadow-lg bg-white rounded-xl">
//             <CardContent className="p-6">
//               <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                 <span className="text-2xl mr-2">🏡</span>
//                 Your Farm Profile
//               </h3>
//               <div className="grid md:grid-cols-3 gap-4">
//                 <div className="bg-blue-50 p-4 rounded-lg">
//                   <div className="text-sm text-blue-600 font-medium">Region & Season</div>
//                   <div className="text-gray-800 font-semibold">{formData.region}</div>
//                   <div className="text-sm text-gray-600">{formData.season} Season</div>
//                 </div>
//                 <div className="bg-green-50 p-4 rounded-lg">
//                   <div className="text-sm text-green-600 font-medium">Soil Conditions</div>
//                   <div className="text-gray-800 font-semibold">{formData.soilType} Soil</div>
//                   <div className="text-sm text-gray-600">pH: {formData.soilPH || 'Not specified'}</div>
//                 </div>
//                 <div className="bg-purple-50 p-4 rounded-lg">
//                   <div className="text-sm text-purple-600 font-medium">Resources</div>
//                   <div className="text-gray-800 font-semibold">{formData.waterAvailability} Water</div>
//                   <div className="text-sm text-gray-600">{formData.farmSize} acres</div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* AI Recommendations */}
//           <Card className="border-0 shadow-xl bg-white rounded-2xl">
//             <CardContent className="p-8">
//               <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
//                 <span className="text-2xl mr-3">🤖</span>
//                 AI Analysis & Recommendations
//               </h3>
              
//               <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
//                 <div className="prose prose-lg max-w-none">
//                   <div className="text-gray-800 leading-relaxed space-y-4">
//                     {result.recommendations.split('\n').map((line, index) => {
//                       if (line.trim() === '') return null;
                      
//                       // Format headers (lines with numbers or bullets)
//                       if (line.match(/^\d+\.|^[•\-\*]/)) {
//                         return (
//                           <div key={index} className="font-semibold text-green-700 text-lg mt-6 mb-2 flex items-start">
//                             <span className="text-green-600 mr-2">🌱</span>
//                             {line}
//                           </div>
//                         );
//                       }
                      
//                       // Format crop names (lines in ALL CAPS or starting with capital)
//                       if (line.match(/^[A-Z][A-Z\s]+:/) || line.match(/^\*\*.*\*\*/)) {
//                         return (
//                           <div key={index} className="font-bold text-blue-700 text-xl mt-4 mb-2 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
//                             {line.replace(/\*\*/g, '')}
//                           </div>
//                         );
//                       }
                      
//                       // Regular content
//                       return (
//                         <div key={index} className="text-gray-700 mb-2 pl-4">
//                           {line}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Action Buttons */}
//           <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
//             <CardContent className="p-6">
//               <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
//                 <Button 
//                   onClick={handleReset}
//                   className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
//                 >
//                   <span className="mr-2">🔄</span>
//                   Get New Recommendation
//                 </Button>
//                 <Button 
//                   onClick={() => window.print()}
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
//                 >
//                   <span className="mr-2">🖨️</span>
//                   Print Report
//                 </Button>
//               </div>
//               <div className="text-center mt-4">
//                 <p className="text-sm text-gray-600">
//                   💡 <strong>Tip:</strong> Consult with local agricultural experts before making final decisions
//                 </p>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// }