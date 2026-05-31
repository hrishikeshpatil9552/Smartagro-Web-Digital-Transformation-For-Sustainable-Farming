export interface CropWeatherRequest {
  location: string;
  crop: string;
  weatherData: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    condition: string;
  };
}

export interface CropWeatherSuitability {
  suitable: boolean;
  reason: string;
  recommendations: string;
}

export const getCropWeatherSuitability = async (data: CropWeatherRequest): Promise<CropWeatherSuitability> => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('Please login to access crop weather analysis');
  }

  try {
    const response = await fetch('http://localhost:5000/api/gemini/crop-weather-suitability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result.suitability;
  } catch (error) {
    console.error('Crop Weather Suitability Error:', error);
    throw error;
  }
};