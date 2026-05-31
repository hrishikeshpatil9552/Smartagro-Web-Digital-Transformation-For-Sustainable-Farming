import React, { useState, useEffect } from 'react';
import { MapPin, Phone, TrendingUp, Loader2, Info, DollarSign, TrendingDown, Minus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import StateDropdown from '../components/StateDropdown';
import DistrictDropdown from '../components/DistrictDropdown';
import CropDropdown from '../components/CropDropdown';
import { getMarketInformation } from '../services/marketService';
import { profileAPI } from '../services/api';

// Define the structure for the parsed market data
interface ParsedMarketData {
  crop: string;
  state: string;
  district: string;
  prices: { min: string; max: string; avg: string };
  trend: string;
  trend_reason: string;
  mandis: { name: string; distance: string; expected_price: string }[];
  factors: string[];
  advice: string[];
}

interface MarketInformationProps {
  onBack: () => void;
}

export function MarketInformation({ onBack }: MarketInformationProps) {
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
  const [marketData, setMarketData] = useState<string | null>(null);
  const [parsedMarketData, setParsedMarketData] = useState<ParsedMarketData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnter = async () => {
    if (!selectedCrop || !selectedState || !selectedDistrict) {
      alert('Please select crop, state, and district');
      return;
    }

    setIsLoading(true);
    setError(null);
    setParsedMarketData(null);
    setMarketData(null);
    
    try {
      console.log('Making market information request...');
      console.log('Selected values:', { crop: selectedCrop, state: selectedState, district: selectedDistrict });
      
      // Check if user is logged in
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please login first to access market information');
      }
      
      const response = await getMarketInformation({
        crop: selectedCrop,
        state: selectedState,
        district: selectedDistrict
      });
      
      console.log('Market information response received:', response);
      setMarketData(typeof response.marketInfo === 'string' ? response.marketInfo : JSON.stringify(response.marketInfo, null, 2));

      // Extract and parse the JSON from the response
      console.log('Raw market info response:', response.marketInfo);
      console.log('Type of marketInfo:', typeof response.marketInfo);
      
      // Handle different response formats
      if (typeof response.marketInfo === 'object' && response.marketInfo !== null) {
        // Direct JSON object
        setParsedMarketData(response.marketInfo);
        // Save last market price to profile
        profileAPI.updateProfile({
          lastMarketPricePrediction: `${response.marketInfo.crop} in ${response.marketInfo.district} → Avg ₹${response.marketInfo.prices?.avg} (${response.marketInfo.trend})`
        }).catch(() => {});
      } else if (typeof response.marketInfo === 'string') {
        // String response - try different parsing methods
        try {
          // First try: extract JSON from markdown code blocks
          const jsonMatch = response.marketInfo.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[1].trim());
            setParsedMarketData(jsonData);
            profileAPI.updateProfile({
              lastMarketPricePrediction: `${jsonData.crop} in ${jsonData.district} → Avg ₹${jsonData.prices?.avg} (${jsonData.trend})`
            }).catch(() => {});
          } else {
            // Second try: parse entire string as JSON
            const jsonData = JSON.parse(response.marketInfo);
            setParsedMarketData(jsonData);
          }
        } catch (parseError) {
          console.error('Failed to parse market data:', parseError);
          console.log('Raw response for debugging:', response.marketInfo);
          setError('Failed to parse market information response');
        }
      } else {
        console.error('Unexpected response format:', response.marketInfo);
        setError('Received unexpected response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get market information');
      console.error('Market information error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend.includes('Up')) return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (trend.includes('Down')) return <TrendingDown className="h-5 w-5 text-red-600" />;
    return <Minus className="h-5 w-5 text-yellow-600" />;
  };

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-4">Market Information</h1>
          <p className="text-xl text-gray-600">Real-time mandi prices, buyers, and selling suggestions.</p>
        </div>

        {/* Crop and Location Selection */}
        <Card className="bg-white rounded-2xl shadow-lg border-0">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">Select Crop:</label>
                <CropDropdown 
                  value={selectedCrop}
                  onChange={setSelectedCrop}
                  className="p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">Select State:</label>
                <StateDropdown 
                  value={selectedState}
                  onChange={setSelectedState}
                  className="p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">Select District:</label>
                <DistrictDropdown 
                  selectedState={selectedState}
                  value={selectedDistrict}
                  onChange={setSelectedDistrict}
                  className="p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none bg-white"
                />
              </div>
            </div>
            <div className="text-center">
              <Button 
                onClick={handleEnter}
                disabled={!selectedCrop || !selectedState || !selectedDistrict || isLoading}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center text-xl">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Getting Market Data...
                  </div>
                ) : (
                  'Get Market Information'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-50 border-red-200 rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <div className="text-red-700">
                <h3 className="font-semibold mb-2">Error</h3>
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Market Information - New UI */}
        {parsedMarketData && (
          <>
            {/* Header and Price Summary */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white rounded-2xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center text-xl">
                    {/* <DollarSign className="mr-2 h-6 w-6" /> */}
                    Price Summary for {parsedMarketData.crop} in {parsedMarketData.district}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-500 text-xl">Min Price</p>
                      <p className="text-2xl font-bold text-red-600">{parsedMarketData.prices.min}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 text-xl">Avg Price</p>
                      <p className="text-2xl font-bold text-green-600">{parsedMarketData.prices.avg}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 text-xl">Max Price</p>
                      <p className="text-2xl font-bold text-blue-600">{parsedMarketData.prices.max}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-2xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center text-xl">
                    <TrendingUp className="mr-2 h-6 w-6" />
                    Price Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    {getTrendIcon(parsedMarketData.trend)}
                    <span className="text-xl font-semibold">{parsedMarketData.trend}</span>
                  </div>
                  <p className="text-gray-600 mt-2">{parsedMarketData.trend_reason}</p>
                </CardContent>
              </Card>
            </div>

            {/* Nearby Mandis */}
            <Card className="bg-white rounded-2xl shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center text-xl">
                  <MapPin className="mr-2 h-6 w-6" />
                  Best Nearby Mandis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {parsedMarketData.mandis.map((mandi, index) => (
                    <div key={index} className="flex justify-between items-center p-6 border rounded-lg">
                      <div>
                        <p className="font-medium">{mandi.name}</p>
                        <p className="text-sm text-gray-500">{mandi.distance}</p>
                      </div>
                      <p className="font-bold text-green-700">{mandi.expected_price}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

                     {/* Factors and Suggestions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white rounded-2xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center text-xl">
                    <Info className="mr-2 h-6 w-6" />
                    Factors Affecting Price
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    {[
                      "Arrivals from Major Producing Belts: The supply from key banana growing regions in Maharashtra (Jalgaon, Bhusawal, Sangli) significantly impacts local prices in Kolhapur.",
                      "Seasonal Consumer Demand: Demand for bananas remains consistent throughout the year, with slight increases during festivals or warmer months when fruit consumption generally rises.",
                      "Transportation and Logistics: Fuel prices and efficient transportation from distant farms to Kolhapur mandis play a crucial role in determining the final market price.",
                      "Quality and Variety: Premium varieties like Grand Naine, with good size, ripeness, and minimal damage, consistently fetch higher prices compared to local or lower-grade produce.",
                      "Absence of MSP: There is no Minimum Support Price (MSP) or government procurement policy for bananas, making prices entirely market-driven and susceptible to demand-supply dynamics."
                    ].map((factor, index) => {
                      // Split the string into Title and Description based on the colon
                      const [title, ...descParts] = factor.split(':');
                      const description = descParts.join(':').trim(); // Rejoin in case description has colons
                      const cleanTitle = title.replace(/\*\*/g, ''); // Remove markdown bold symbols if present

                      return (
                        <div key={index} className="flex items-start gap-3">
                          {/* Numbering: Bold Green */}
                          <span className="font-bold text-green-700 text-lg min-w-[24px]">
                            {index + 1}.
                          </span>
                          <div className="flex-1">
                            {/* Main Point: Bold Black */}
                            <span className="font-bold text-gray-900 text-base block leading-tight">
                              {cleanTitle}
                            </span><br></br>
                            {/* Description: Simple Normal Text */}
                            <span className="text-gray-600 text-sm mt-3 block leading-relaxed">
                              {description}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* ... Suggestions Card remains below ... */}
              <Card className="bg-white rounded-2xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-green-800 text-xl">Suggestions for Farmer</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {parsedMarketData.advice.map((advice, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-700 font-bold mr-2">{index + 1}.</span>
                        <span className="text-gray-700">{advice}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}






// import React, { useState, useEffect } from 'react';
// import { MapPin, Phone, TrendingUp, Loader2 } from 'lucide-react';
// import { Button } from '../components/ui/button';
// import { Card, CardContent } from '../components/ui/card';
// import StateDropdown from '../components/StateDropdown';
// import DistrictDropdown from '../components/DistrictDropdown';
// import CropDropdown from '../components/CropDropdown';
// import { getMarketInformation } from '../services/marketService';

// interface MarketInformationProps {
//   onBack: () => void;
// }

// export function MarketInformation({ onBack }: MarketInformationProps) {
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
//   const [selectedDistrict, setSelectedDistrict] = useState('');
//   const [marketData, setMarketData] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleEnter = async () => {
//     if (!selectedCrop || !selectedState || !selectedDistrict) {
//       alert('Please select crop, state, and district');
//       return;
//     }

//     setIsLoading(true);
//     setError(null);
    
//     try {
//       const response = await getMarketInformation({
//         crop: selectedCrop,
//         state: selectedState,
//         district: selectedDistrict
//       });
      
//       setMarketData(response.marketInfo);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to get market information');
//       console.error('Market information error:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   };


//   return (
//     <div className="min-h-screen bg-green-50 px-4 py-8">
//       <div className="max-w-7xl mx-auto space-y-8">
//         {/* Page Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold text-green-800 mb-4">Market Information</h1>
//           <p className="text-xl text-gray-600">Real-time mandi prices, buyers, and selling suggestions.</p>
//         </div>

//         {/* Crop and Location Selection */}
//         <Card className="bg-white rounded-2xl shadow-lg border-0">
//           <CardContent className="p-6">
//             <div className="grid md:grid-cols-3 gap-6 mb-6">
//               <div>
//                 <label className="block text-lg font-medium text-gray-700 mb-3">Select Crop:</label>
//                 <CropDropdown 
//                   value={selectedCrop}
//                   onChange={setSelectedCrop}
//                   className="p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none bg-white"
//                 />
//               </div>
//               <div>
//                 <label className="block text-lg font-medium text-gray-700 mb-3">Select State:</label>
//                 <StateDropdown 
//                   value={selectedState}
//                   onChange={setSelectedState}
//                   className="p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none bg-white"
//                 />
//               </div>
//               <div>
//                 <label className="block text-lg font-medium text-gray-700 mb-3">Select District:</label>
//                 <DistrictDropdown 
//                   selectedState={selectedState}
//                   value={selectedDistrict}
//                   onChange={setSelectedDistrict}
//                   className="p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none bg-white"
//                 />
//               </div>
//             </div>
//             <div className="text-center">
//               <Button 
//                 onClick={handleEnter}
//                 disabled={!selectedCrop || !selectedState || !selectedDistrict || isLoading}
//                 className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isLoading ? (
//                   <div className="flex items-center">
//                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                     Getting Market Data...
//                   </div>
//                 ) : (
//                   'Get Market Information'
//                 )}
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Error Display */}
//         {error && (
//           <Card className="bg-red-50 border-red-200 rounded-2xl shadow-lg">
//             <CardContent className="p-6">
//               <div className="text-red-700">
//                 <h3 className="font-semibold mb-2">Error</h3>
//                 <p>{error}</p>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* AI Market Information */}
//         {marketData && (
//           <Card className="bg-white rounded-2xl shadow-lg border-0">
//             <CardContent className="p-6">
//               <h2 className="text-2xl font-bold text-green-800 mb-6">AI Market Analysis</h2>
//               <div className="prose max-w-none">
//                 <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
//                   {marketData}
//                 </pre>
//               </div>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// }