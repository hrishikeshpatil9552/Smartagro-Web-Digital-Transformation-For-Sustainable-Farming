import express from 'express';
import { geminiMatch, getCropRecommendations, analyzeDiseaseWithGemini, getMarketInformation, getAgriGyaan, getCropWeatherSuitability, getGeminiWeather } from "../controllers/geminiController";
import { authenticateToken } from "../middleware/auth";
const router = express.Router();

router.post('/match', geminiMatch); // POST /api/gemini/match
router.post('/crop-recommendations', authenticateToken, getCropRecommendations);
router.post('/disease-analysis', authenticateToken, analyzeDiseaseWithGemini);
router.post('/market-information', authenticateToken, getMarketInformation);
router.post('/agri-gyaan', authenticateToken, getAgriGyaan);
router.post('/crop-weather-suitability', authenticateToken, getCropWeatherSuitability);
router.post('/gemini-weather', authenticateToken, getGeminiWeather);

export default router;
