// src/services/api.ts

const API_BASE_URL = '/api';

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  gender?: string;
  dateOfBirth?: string;
  profilePhoto?: string;
  soilImage?: string;
  state?: string;
  district?: string;
  taluka?: string;
  village?: string;
  pincode?: string;
  addressDescription?: string;
  farmSize?: string;
  mainCropType?: string;
  soilType?: string;
  preferredLanguage?: string;
  farmingExperience?: string;
  irrigationType?: string;
  waterSource?: string;
  currentSeasonCrop?: string;
  fertilizerUsage?: string;
  farmMachinery?: string[];
  notificationMethod?: string[];
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id?: string;
  email: string;
  name?: string;
  phone?: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    return response.json();
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    return response.json();
  },
};

export const profileAPI = {
  getProfile: async (): Promise<{ user: any }> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  updateProfile: async (data: Partial<RegisterData>): Promise<{ user: any }> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Update failed');
    }
    return response.json();
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/user/change-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password change failed');
    }
    return response.json();
  },
};

export const setAuthToken = (token: string) => localStorage.setItem('authToken', token);
export const getAuthToken = (): string | null => localStorage.getItem('authToken');
export const removeAuthToken = () => localStorage.removeItem('authToken');

// --- Weather API ---
export interface WeatherLocation {
  name: string; lat: number; lon: number; country: string; state?: string;
}

export interface WeatherData {
  current: {
    temp: number; feels_like: number; humidity: number; pressure: number;
    uvi: number; visibility: number; wind_speed: number; wind_deg: number;
    weather: Array<{ main: string; description: string; icon: string }>;
  };
  daily: Array<{
    dt: number;
    temp: { day: number; min: number; max: number };
    weather: Array<{ main: string; description: string; icon: string }>;
    humidity: number; wind_speed: number; pop: number;
  }>;
  timezone: string;
}

export const weatherAPI = {
  getCoordinates: async (locationQuery: string): Promise<WeatherLocation[]> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/weather/coordinates?q=${encodeURIComponent(locationQuery)}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch location coordinates');
    return response.json();
  },

  getWeatherForecast: async (lat: number, lon: number): Promise<WeatherData> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/weather/forecast?lat=${lat}&lon=${lon}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch weather data');
    return response.json();
  },

  getWeatherByLocation: async (locationQuery: string): Promise<{ location: WeatherLocation; weather: WeatherData }> => {
    const locations = await weatherAPI.getCoordinates(locationQuery);
    if (locations.length === 0) throw new Error('Location not found');
    const location = locations[0];
    const weather = await weatherAPI.getWeatherForecast(location.lat, location.lon);
    return { location, weather };
  },
};
