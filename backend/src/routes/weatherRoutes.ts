import express from "express";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

router.get("/coordinates", authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    console.log('Weather coordinates request for:', q);
    
    if (!process.env.WEATHER_API_KEY) {
      return res.status(500).json({ message: "Weather API key not configured" });
    }
    
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q as string)}&limit=5&appid=${process.env.WEATHER_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API responded with ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Weather coordinates response:', data);
    res.json(data);
  } catch (error) {
    console.error('Weather coordinates error:', error);
    res.status(500).json({ message: "Weather API error", details: error.message });
  }
});

router.get("/forecast", authenticateToken, async (req, res) => {
  try {
    const { lat, lon } = req.query;
    console.log('Weather forecast request for:', lat, lon);
    
    if (!process.env.WEATHER_API_KEY) {
      return res.status(500).json({ message: "Weather API key not configured" });
    }
    
    const fetch = (await import('node-fetch')).default;
    
    // Get current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.WEATHER_API_KEY}`
    );
    
    if (!currentResponse.ok) {
      throw new Error(`Weather API responded with ${currentResponse.status}`);
    }
    
    const currentData = await currentResponse.json();
    
    // Get 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.WEATHER_API_KEY}`
    );
    
    if (!forecastResponse.ok) {
      throw new Error(`Forecast API responded with ${forecastResponse.status}`);
    }
    
    const forecastData = await forecastResponse.json();
    
    // Transform data to match expected format
    const transformedData = {
      current: {
        temp: currentData.main.temp,
        feels_like: currentData.main.feels_like,
        humidity: currentData.main.humidity,
        pressure: currentData.main.pressure,
        wind_speed: currentData.wind.speed,
        visibility: currentData.visibility,
        weather: currentData.weather,
        sunrise: currentData.sys.sunrise,
        sunset: currentData.sys.sunset,
        uvi: 0 // Not available in free tier
      },
      daily: [
        {
          temp: {
            min: currentData.main.temp_min,
            max: currentData.main.temp_max
          },
          humidity: currentData.main.humidity,
          wind_speed: currentData.wind.speed,
          weather: currentData.weather,
          pop: 0
        },
        // Tomorrow's forecast from 5-day data
        {
          temp: {
            min: forecastData.list[8]?.main.temp_min || currentData.main.temp_min,
            max: forecastData.list[8]?.main.temp_max || currentData.main.temp_max
          },
          humidity: forecastData.list[8]?.main.humidity || currentData.main.humidity,
          wind_speed: forecastData.list[8]?.wind.speed || currentData.wind.speed,
          weather: forecastData.list[8]?.weather || currentData.weather,
          pop: forecastData.list[8]?.pop || 0
        }
      ]
    };
    
    console.log('Weather forecast response received');
    res.json(transformedData);
  } catch (error) {
    console.error('Weather forecast error:', error);
    res.status(500).json({ message: "Weather API error", details: error.message });
  }
});

export default router;