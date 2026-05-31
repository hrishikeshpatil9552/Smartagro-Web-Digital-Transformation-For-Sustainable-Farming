// geminiservices.ts

export interface CropRecommendationRequest {
  region: string;
  soilType: string;
  soilPH: string;
  waterAvailability: string;
  temperatureRange: string;
  season: string;
  farmSize: string;
}

export interface CropInfo {
  name: string;
  description: string;
  yield: string;
  market: string;
}

export const getCropRecommendations = async (data: CropRecommendationRequest): Promise<CropInfo[]> => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('Please login to access crop recommendations');
  }

  try {
    console.log('Sending request to:', 'http://localhost:5000/api/gemini/crop-recommendations');
    console.log('Request data:', data);
    console.log('Token:', token ? 'Present' : 'Missing');
    
    const response = await fetch('http://localhost:5000/api/gemini/crop-recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data)
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('API Response:', result);
    return result.crops || [];
  } catch (error) {
    console.error('Crop Recommendations Error:', error);
    throw error;
  }
};




