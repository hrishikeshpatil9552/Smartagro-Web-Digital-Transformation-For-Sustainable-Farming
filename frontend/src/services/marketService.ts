export interface MarketInformationRequest {
  crop: string;
  state: string;
  district: string;
}

export interface MarketInformationResponse {
  marketInfo: string;
  source: string;
}

export const getMarketInformation = async (data: MarketInformationRequest): Promise<MarketInformationResponse> => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('Please login to access market information');
  }

  console.log('Sending market information request:', data);
  console.log('Token:', token ? 'Present' : 'Missing');
  console.log('API URL:', 'http://localhost:5000/api/gemini/market-information');

  try {
    const response = await fetch('http://localhost:5000/api/gemini/market-information', {
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
      console.error('Market API error response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Market API response:', result);
    return result;
  } catch (error) {
    console.error('Market Information Error:', error);
    throw error;
  }
};