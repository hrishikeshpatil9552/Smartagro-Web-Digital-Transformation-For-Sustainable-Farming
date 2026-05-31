export interface AgriGyaanRequest {
  crop: string;
  state: string;
  district: string;
  soil: string;
}

export interface AgriGyaanResponse {
  agriGyaan: any;
  source: string;
}

export const getAgriGyaan = async (data: AgriGyaanRequest): Promise<AgriGyaanResponse> => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('Please login to access AgriGyaan');
  }

  console.log('Sending AgriGyaan request:', data);
  console.log('Using token:', token ? 'Token present' : 'No token');

  try {
    const response = await fetch('http://localhost:5000/api/gemini/agri-gyaan', {
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
      console.error('API error response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('AgriGyaan response received:', result);
    return result;
  } catch (error) {
    console.error('AgriGyaan Error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get AgriGyaan information. Please check if the backend server is running on port 5000.');
  }
};