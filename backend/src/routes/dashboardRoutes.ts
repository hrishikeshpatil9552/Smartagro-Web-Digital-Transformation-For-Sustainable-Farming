import express from 'express';
import { getFarmerInsights } from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/dashboard/farmer-insights?state=...&district=...&mainCropType=...&soilType=...
router.get('/farmer-insights', authenticateToken, getFarmerInsights);

export default router;
