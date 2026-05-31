import { Request, Response } from 'express';
import { callOpenAI } from '../utils/openai';
import User from '../models/user';

function parseJSON(text: string): any {
  const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const firstBrace = clean.indexOf('{');
  const firstBracket = clean.indexOf('[');
  let start = -1;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    start = firstBrace;
  } else if (firstBracket !== -1) {
    start = firstBracket;
  }
  const end = Math.max(clean.lastIndexOf('}'), clean.lastIndexOf(']'));
  return JSON.parse(clean.substring(start, end + 1));
}

const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;
const DELAY = (ms: number) => new Promise(r => setTimeout(r, ms));

// GET /api/dashboard/farmer-insights
export const getFarmerInsights = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = new Date();
    const lastUpdated = (user as any).dashLastUpdated;
    const isStale = !lastUpdated || (now.getTime() - new Date(lastUpdated).getTime() > SIX_MONTHS_MS);

    // Return cached DB data if fresh
    const cached = {
      weather: (user as any).dashWeather || null,
      market: (user as any).dashMarket || null,
      crops: (user as any).dashCrops || null,
    };

    if (!isStale && cached.weather && cached.market && cached.crops) {
      return res.json({ ...cached, source: 'database', cachedAt: lastUpdated });
    }

    const location = [user.district, user.state].filter(Boolean).join(', ') || 'India';
    const mainCropType = user.mainCropType || '';
    const soilType = user.soilType || '';

    let weather = cached.weather;
    let market = cached.market;
    let crops = cached.crops;

    // Only fetch what's missing or stale
    if (!weather || isStale) {
      try {
        const raw = await callOpenAI(
          `Current weather for ${location}, India. Respond ONLY with this JSON, no extra text:\n{"temperature":28,"description":"partly cloudy","humidity":65,"windSpeed":12,"feelsLike":30}`
        );
        weather = parseJSON(raw);
        console.log('✅ Weather fetched via OpenRouter');
      } catch (e: any) {
        console.log('⚠️ Weather fetch failed:', e.message);
      }
      await DELAY(2000);
    }

    if (mainCropType && (!market || isStale)) {
      try {
        const raw = await callOpenAI(
          `Mandi price for ${mainCropType} in ${location}, India. Respond ONLY with this JSON, no extra text (numbers only, no symbols):\n{"crop":"${mainCropType}","prices":{"min":"1200","max":"1800","avg":"1500"},"trend":"Increasing","district":"${user.district || user.state || 'India'}"}`
        );
        market = parseJSON(raw);
        console.log('✅ Market fetched via OpenRouter');
      } catch (e: any) {
        console.log('⚠️ Market fetch failed:', e.message);
      }
      await DELAY(2000);
    }

    if (soilType && (!crops || isStale)) {
      try {
        const raw = await callOpenAI(
          `Top 3 crops for ${soilType} soil in ${location}, India. Respond ONLY with this JSON array, no extra text:\n[{"name":"Wheat","market":"High"},{"name":"Cotton","market":"Medium"},{"name":"Soybean","market":"High"}]`
        );
        crops = parseJSON(raw);
        console.log('✅ Crops fetched via OpenRouter');
      } catch (e: any) {
        console.log('⚠️ Crops fetch failed:', e.message);
      }
    }

    // Save whatever we have to DB (even partial)
    const updateData: any = { dashLastUpdated: now };
    if (weather) updateData.dashWeather = weather;
    if (market) updateData.dashMarket = market;
    if (crops) updateData.dashCrops = crops;
    await User.findByIdAndUpdate(userId, updateData);

    res.json({ weather, market, crops, source: 'gemini', cachedAt: now });
  } catch (error: any) {
    console.error('Dashboard insights error:', error.message);
    res.status(500).json({ error: 'Failed to fetch farmer insights', details: error.message });
  }
};
