import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Upload, Bug, Shield, Leaf, Droplets, AlertTriangle, Clock, Beaker, Camera, RefreshCw, CheckCircle } from 'lucide-react';
import { analyzeDiseaseWithGemini, type DiseaseAnalysisResult } from '../services/geminiDiseaseService';
import { profileAPI } from '../services/api';

interface DiseaseDetectionProps {
  onBack: () => void;
}

export function DiseaseDetection({ onBack }: DiseaseDetectionProps) {
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [result, setResult] = useState<DiseaseAnalysisResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const crops = ['Rice', 'Wheat', 'Sugarcane', 'Tomato', 'Potato', 'Cotton', 'Corn', 'Onion', 'Chili', 'Soybean'];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetect = async () => {
    if (!selectedCrop || !selectedImage) {
      alert('Please select a crop and upload an image');
      return;
    }

    setIsDetecting(true);
    
    try {
      const analysisResult = await analyzeDiseaseWithGemini({
        cropName: selectedCrop,
        imageBase64: selectedImage
      });
      
      setResult(analysisResult);
      // Save last disease detection to profile
      profileAPI.updateProfile({
        lastDiseaseDetection: `${selectedCrop} → ${analysisResult.diseaseName} (${analysisResult.severityLevel})`
      }).catch(() => {});
    } catch (error) {
      alert('Failed to analyze disease. Please try again.');
      console.error('Disease analysis error:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const resetDetection = () => {
    setSelectedCrop('');
    setSelectedImage(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe': return 'bg-red-100 text-red-700 border-red-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'mild': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'moderate': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'mild': return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Crop Disease Detection</h1>
          <p className="text-lg text-gray-600">Upload a photo of your crop to detect diseases and get treatment recommendations</p>
        </div>

        {!result ? (
          <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column - Input Form */}
                <div className="space-y-6">
                  {/* Crop Selection */}
                  <div className="space-y-2">
                    <Label className="text-lg font-medium flex items-center">
                      <Leaf className="w-4 h-4 mr-2 text-green-600" />
                      Select Crop Type *
                    </Label>
                    <select 
                      value={selectedCrop}
                      onChange={(e) => setSelectedCrop(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-green-300 rounded-xl text-base bg-white focus:outline-none focus:border-green-600 shadow-sm h-14"
                    >
                      <option value="">Choose your crop</option>
                      {crops.map(crop => (
                        <option key={crop} value={crop}>{crop}</option>
                      ))}
                    </select>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <Label className="text-lg font-medium text-gray-700 mb-2 block">Upload Plant Image</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {!selectedImage ? (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <Upload className="w-8 h-8 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-gray-500 mb-4">
                              Drag and drop an image here, or click to select
                            </p>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={handleFileInput}
                              className="hidden"
                              id="image-upload"
                            />
                            <Button 
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              Choose Image
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <img
                            src={selectedImage}
                            alt="Uploaded crop"
                            className="max-w-full h-48 object-cover rounded-lg mx-auto"
                          />
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setSelectedImage(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="w-full"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Change Image
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Analyze Button */}
                  <Button 
                    onClick={handleDetect}
                    disabled={isDetecting || !selectedCrop || !selectedImage}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {isDetecting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Analyzing Image...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Bug className="w-5 h-5 mr-2" />
                        Detect Disease
                      </div>
                    )}
                  </Button>
                </div>

                {/* Right Column - Instructions */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">How to Use</h3>
                  <ol className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3">1</span>
                      <span>Select the type of crop from the dropdown menu</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3">2</span>
                      <span>Upload a clear image of the affected plant part</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3">3</span>
                      <span>Click "Detect Disease" to analyze the image</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3">4</span>
                      <span>Review the analysis and treatment recommendations</span>
                    </li>
                  </ol>
                  
                  <div className="mt-6 p-4 bg-yellow-100 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Tip:</strong> For best results, ensure good lighting and focus on the affected area of the plant.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Results Section */
          <div className="space-y-6">
            {/* Disease Header */}
            <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Disease Analysis Results</h2>
                    <p className="text-green-100">Based on AI analysis of your {selectedCrop} plant</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{result.confidenceScore}</div>
                    <div className="text-green-100">Confidence</div>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <Bug className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{result.diseaseName}</h3>
                    <p className="text-gray-600">{result.diseaseType}</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg border ${getSeverityColor(result.severityLevel)}`}>
                    <div className="flex items-center mb-2">
                      {getSeverityIcon(result.severityLevel)}
                      <h4 className="font-semibold ml-2">Severity</h4>
                    </div>
                    <p className="font-bold">{result.severityLevel}</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-2">
                      <Clock className="w-5 h-5 text-blue-600 mr-2" />
                      <h4 className="font-semibold">Recovery Time</h4>
                    </div>
                    <p className="font-bold text-blue-700">{result.recoveryTime}</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center mb-2">
                      <Beaker className="w-5 h-5 text-purple-600 mr-2" />
                      <h4 className="font-semibold">Disease Type</h4>
                    </div>
                    <p className="font-bold text-purple-700">{result.diseaseType}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Symptoms and Cause */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
                <div className="bg-red-50 p-4 border-b border-red-100">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Bug className="w-5 h-5 mr-2 text-red-600" />
                    Visible Symptoms
                  </h4>
                </div>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {result.symptoms.map((symptom, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span className="text-gray-700">{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
                <div className="bg-orange-50 p-4 border-b border-orange-100">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                    Cause of Disease
                  </h4>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-700">{result.cause}</p>
                </CardContent>
              </Card>
            </div>

            {/* Treatment Options */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
                <div className="bg-green-50 p-4 border-b border-green-100">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Leaf className="w-5 h-5 mr-2 text-green-600" />
                    Organic Treatment
                  </h4>
                </div>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {result.organicTreatment.map((treatment, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span className="text-gray-700">{treatment}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
                <div className="bg-blue-50 p-4 border-b border-blue-100">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Droplets className="w-5 h-5 mr-2 text-blue-600" />
                    Chemical Treatment
                  </h4>
                </div>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {result.chemicalTreatment.map((treatment, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span className="text-gray-700">{treatment}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Prevention and Simple Explanation */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
                <div className="bg-purple-50 p-4 border-b border-purple-100">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-purple-600" />
                    Preventive Measures
                  </h4>
                </div>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {result.preventiveMeasures.map((measure, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span className="text-gray-700">{measure}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
                <div className="bg-blue-50 p-4 border-b border-blue-100">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="text-xl mr-2">👨‍🌾</span>
                    Simple Explanation
                  </h4>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-700 leading-relaxed">{result.farmerExplanation}</p>
                </CardContent>
              </Card>
            </div>

            {/* Action Button */}
            <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-6 text-center">
                <Button 
                  onClick={resetDetection}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Analyze Another Image
                </Button>
                <p className="text-sm text-gray-600 mt-4">
                  💡 <strong>Tip:</strong> Always consult with local agricultural experts for severe cases
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}








// import React, { useState, useRef, useEffect } from 'react';
// import { Card, CardContent } from '../components/ui/card';
// import { Button } from '../components/ui/button';
// import { Label } from '../components/ui/label';
// import { Upload, Bug, Shield, Leaf, Droplets, AlertTriangle, Clock, Beaker } from 'lucide-react';
// import { analyzeDiseaseWithGemini, type DiseaseAnalysisResult } from '../services/geminiDiseaseService';

// interface DiseaseDetectionProps {
//   onBack: () => void;
// }



// export function DiseaseDetection({ onBack }: DiseaseDetectionProps) {
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
//   const [selectedImage, setSelectedImage] = useState<string | null>(null);
//   const [isDetecting, setIsDetecting] = useState(false);
//   const [result, setResult] = useState<DiseaseAnalysisResult | null>(null);
//   const [dragActive, setDragActive] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const crops = ['Rice', 'Wheat', 'Sugarcane', 'Tomato', 'Potato', 'Cotton', 'Corn', 'Onion', 'Chili', 'Soybean'];

//   const handleDrag = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === 'dragenter' || e.type === 'dragover') {
//       setDragActive(true);
//     } else if (e.type === 'dragleave') {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
    
//     const files = e.dataTransfer.files;
//     if (files && files[0]) {
//       handleFile(files[0]);
//     }
//   };

//   const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (files && files[0]) {
//       handleFile(files[0]);
//     }
//   };

//   const handleFile = (file: File) => {
//     if (file.type.startsWith('image/')) {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setSelectedImage(e.target?.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleDetect = async () => {
//     if (!selectedCrop || !selectedImage) {
//       alert('Please select a crop and upload an image');
//       return;
//     }

//     setIsDetecting(true);
    
//     try {
//       const analysisResult = await analyzeDiseaseWithGemini({
//         cropName: selectedCrop,
//         imageBase64: selectedImage
//       });
      
//       setResult(analysisResult);
//     } catch (error) {
//       alert('Failed to analyze disease. Please try again.');
//       console.error('Disease analysis error:', error);
//     } finally {
//       setIsDetecting(false);
//     }
//   };

//   const resetDetection = () => {
//     setSelectedCrop('');
//     setSelectedImage(null);
//     setResult(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Title */}
//       <div className="text-center mb-8">
//         <h1 className="text-4xl font-bold text-green-800 mb-4">
//           Crop Disease Detection
//         </h1>
//         <p className="text-xl text-gray-600">Upload a photo of your crop to detect diseases and get treatment recommendations</p>
//       </div>

//       {/* Main Form */}
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
//                 <option value="">Choose your crop</option>
//                 {crops.map(crop => (
//                   <option key={crop} value={crop}>{crop}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Image Upload */}
//             <div className="space-y-2">
//               <Label className="text-lg font-medium">Upload Plant Image</Label>
//               <div
//                 className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
//                   dragActive 
//                     ? 'border-green-500 bg-green-50' 
//                     : 'border-green-200 hover:border-green-400'
//                 }`}
//                 onDragEnter={handleDrag}
//                 onDragLeave={handleDrag}
//                 onDragOver={handleDrag}
//                 onDrop={handleDrop}
//               >
//                 {!selectedImage ? (
//                   <div className="space-y-4">
//                     <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
//                       <Upload className="w-8 h-8 text-green-600" />
//                     </div>
//                     <div>
//                       <p className="text-gray-600 mb-4">
//                         Drag and drop an image here, or click to select
//                       </p>
//                       <input
//                         ref={fileInputRef}
//                         type="file"
//                         accept="image/*"
//                         capture="environment"
//                         onChange={handleFileInput}
//                         className="hidden"
//                         id="image-upload"
//                       />
//                       <Button 
//                         type="button"
//                         onClick={() => fileInputRef.current?.click()}
//                         className="bg-green-600 hover:bg-green-700 cursor-pointer"
//                       >
//                         Choose Image
//                       </Button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     <img
//                       src={selectedImage}
//                       alt="Uploaded crop"
//                       className="max-w-full h-48 object-cover rounded-lg mx-auto"
//                     />
//                     <Button 
//                       variant="outline" 
//                       onClick={() => {
//                         setSelectedImage(null);
//                         if (fileInputRef.current) fileInputRef.current.value = '';
//                       }}
//                     >
//                       Change Image
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Detect Button */}
//             <div className="text-center pt-4">
//               <Button 
//                 onClick={handleDetect}
//                 disabled={isDetecting || !selectedCrop || !selectedImage}
//                 className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//               >
//                 {isDetecting ? (
//                   <div className="flex items-center">
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                     Detecting Disease...
//                   </div>
//                 ) : (
//                   'Detect Disease'
//                 )}
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Results */}
//       {result && (
//         <div className="max-w-6xl mx-auto space-y-6">
//           {/* Header */}
//           <Card className="border-0 shadow-xl bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl text-white">
//             <CardContent className="p-8 text-center">
//               <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
//                 <Bug className="w-8 h-8" />
//               </div>
//               <h2 className="text-3xl font-bold mb-2">AI Disease Analysis Complete</h2>
//               <h3 className="text-2xl font-semibold">{result.diseaseName}</h3>
//               <div className="flex items-center justify-center mt-2">
//                 <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
//                   {result.diseaseType} • Confidence: {result.confidenceScore}
//                 </span>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Severity & Overview */}
//           <div className="grid md:grid-cols-3 gap-6">
//             <Card className={`border-0 shadow-lg ${
//               result.severityLevel.toLowerCase() === 'severe' ? 'bg-red-50 border-red-200' :
//               result.severityLevel.toLowerCase() === 'moderate' ? 'bg-yellow-50 border-yellow-200' :
//               'bg-green-50 border-green-200'
//             } rounded-xl`}>
//               <CardContent className="p-6 text-center">
//                 <AlertTriangle className={`w-8 h-8 mx-auto mb-3 ${
//                   result.severityLevel.toLowerCase() === 'severe' ? 'text-red-600' :
//                   result.severityLevel.toLowerCase() === 'moderate' ? 'text-yellow-600' :
//                   'text-green-600'
//                 }`} />
//                 <h4 className="font-bold text-gray-800">Severity Level</h4>
//                 <p className={`text-lg font-semibold ${
//                   result.severityLevel.toLowerCase() === 'severe' ? 'text-red-600' :
//                   result.severityLevel.toLowerCase() === 'moderate' ? 'text-yellow-600' :
//                   'text-green-600'
//                 }`}>{result.severityLevel}</p>
//               </CardContent>
//             </Card>

//             <Card className="border-0 shadow-lg bg-blue-50 border-blue-200 rounded-xl">
//               <CardContent className="p-6 text-center">
//                 <Clock className="w-8 h-8 mx-auto mb-3 text-blue-600" />
//                 <h4 className="font-bold text-gray-800">Recovery Time</h4>
//                 <p className="text-lg font-semibold text-blue-600">{result.recoveryTime}</p>
//               </CardContent>
//             </Card>

//             <Card className="border-0 shadow-lg bg-purple-50 border-purple-200 rounded-xl">
//               <CardContent className="p-6 text-center">
//                 <Beaker className="w-8 h-8 mx-auto mb-3 text-purple-600" />
//                 <h4 className="font-bold text-gray-800">Disease Type</h4>
//                 <p className="text-lg font-semibold text-purple-600">{result.diseaseType}</p>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Symptoms & Cause */}
//           <div className="grid md:grid-cols-2 gap-6">
//             <Card className="border-0 shadow-lg bg-white rounded-xl">
//               <CardContent className="p-6">
//                 <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                   <Bug className="w-5 h-5 mr-2 text-red-600" />
//                   Visible Symptoms
//                 </h4>
//                 <ul className="space-y-2">
//                   {result.symptoms.map((symptom, index) => (
//                     <li key={index} className="flex items-start text-sm text-gray-700">
//                       <span className="w-2 h-2 bg-red-600 rounded-full mr-2 mt-2 flex-shrink-0"></span>
//                       {symptom}
//                     </li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card>

//             <Card className="border-0 shadow-lg bg-white rounded-xl">
//               <CardContent className="p-6">
//                 <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                   <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
//                   Cause of Disease
//                 </h4>
//                 <p className="text-gray-700">{result.cause}</p>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Treatment Options */}
//           <div className="grid md:grid-cols-2 gap-6">
//             <Card className="border-0 shadow-lg bg-white rounded-xl">
//               <CardContent className="p-6">
//                 <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                   <Leaf className="w-5 h-5 mr-2 text-green-600" />
//                   Organic Treatment
//                 </h4>
//                 <ul className="space-y-2">
//                   {result.organicTreatment.map((treatment, index) => (
//                     <li key={index} className="flex items-start text-sm text-gray-700">
//                       <span className="w-2 h-2 bg-green-600 rounded-full mr-2 mt-2 flex-shrink-0"></span>
//                       {treatment}
//                     </li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card>

//             <Card className="border-0 shadow-lg bg-white rounded-xl">
//               <CardContent className="p-6">
//                 <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                   <Droplets className="w-5 h-5 mr-2 text-blue-600" />
//                   Chemical Treatment
//                 </h4>
//                 <ul className="space-y-2">
//                   {result.chemicalTreatment.map((treatment, index) => (
//                     <li key={index} className="flex items-start text-sm text-gray-700">
//                       <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 mt-2 flex-shrink-0"></span>
//                       {treatment}
//                     </li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Prevention & Farmer Explanation */}
//           <div className="grid md:grid-cols-2 gap-6">
//             <Card className="border-0 shadow-lg bg-white rounded-xl">
//               <CardContent className="p-6">
//                 <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                   <Shield className="w-5 h-5 mr-2 text-purple-600" />
//                   Preventive Measures
//                 </h4>
//                 <ul className="space-y-2">
//                   {result.preventiveMeasures.map((measure, index) => (
//                     <li key={index} className="flex items-start text-sm text-gray-700">
//                       <span className="w-2 h-2 bg-purple-600 rounded-full mr-2 mt-2 flex-shrink-0"></span>
//                       {measure}
//                     </li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card>

//             <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
//               <CardContent className="p-6">
//                 <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                   <span className="text-2xl mr-2">👨‍🌾</span>
//                   Simple Explanation
//                 </h4>
//                 <p className="text-gray-700 leading-relaxed">{result.farmerExplanation}</p>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Action Button */}
//           <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
//             <CardContent className="p-6 text-center">
//               <Button 
//                 onClick={resetDetection}
//                 className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
//               >
//                 <span className="mr-2">🔄</span>
//                 Analyze Another Image
//               </Button>
//               <p className="text-sm text-gray-600 mt-4">
//                 💡 <strong>Tip:</strong> Always consult with local agricultural experts for severe cases
//               </p>
//             </CardContent>
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// }