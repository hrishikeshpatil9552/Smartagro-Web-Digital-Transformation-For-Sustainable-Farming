

// src/controllers/geminiController.ts
import { Request, Response } from 'express';
import { callGemini, callGeminiWithImage } from "../utils/gemini"; 
import Scheme from "../models/Scheme";
import Farmer from "../models/Farmer";
import Match from "../models/Match";
import { evaluateEligibility } from "../utils/evaluator";

// --- HELPER: ROBUST JSON CLEANER ---
// prevents "SyntaxError" by stripping markdown and finding the json object/array
const cleanAndParseJSON = (responseText: string): any => {
  // 1. Remove markdown code blocks
  let cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

  // 2. Find pure JSON array or object boundaries
  const firstSquare = cleanText.indexOf('[');
  const firstCurly = cleanText.indexOf('{');
  
  let startIndex = -1;
  let endIndex = -1;

  // Determine if it looks like an Array or Object
  if (firstSquare !== -1 && (firstCurly === -1 || firstSquare < firstCurly)) {
    startIndex = firstSquare;
    endIndex = cleanText.lastIndexOf(']');
  } else if (firstCurly !== -1) {
    startIndex = firstCurly;
    endIndex = cleanText.lastIndexOf('}');
  }

  if (startIndex !== -1 && endIndex !== -1) {
    cleanText = cleanText.substring(startIndex, endIndex + 1);
  } else {
    // If no brackets found, try parsing the whole trimmed string (fallback)
    // warn but proceed
  }

  return JSON.parse(cleanText);
};

// ==========================================
// 1. AGRI GYAAN CONTROLLER
// ==========================================
export const getAgriGyaan = async (req: Request, res: Response) => {
  try {
    const { crop, state, district, soil } = req.body;

    if (!crop || !state || !district || !soil) {
      return res.status(400).json({ error: 'Crop, state, district, and soil type are required' });
    }

    const prompt = `Provide farming guide for ${crop} in ${district}, ${state} with ${soil} soil.
Respond with ONLY this JSON format:
{
  "crop": "${crop}",
  "state": "${state}",
  "is_suitable": "Yes",
  "suitability_reason": "Brief reason...",
  "growing_guide": {
    "climate": "Temperature needs",
    "soil": "Soil pH",
    "sowing": "Planting info",
    "irrigation": "Water needs",
    "fertilizer": "Nutrient schedule",
    "harvesting": "Harvest time"
  },
  "best_practices": ["Tip 1", "Tip 2", "Tip 3"]
}`;

    const geminiResponse = await callGemini(prompt, 2048);
    // Use Helper
    const parsedData = cleanAndParseJSON(geminiResponse);
    
    res.json({ agriGyaan: parsedData, source: "Gemini AI" });
  } catch (error) {
    const err = error as Error;
    console.error('AgriGyaan Error:', err.message);
    res.status(500).json({ error: 'Failed to get AgriGyaan information', details: err.message });
  }
};

// ==========================================
// 2. MARKET INFORMATION CONTROLLER
// ==========================================
export const getMarketInformation = async (req: Request, res: Response) => {
  try {
    const { crop, state, district } = req.body;

    if (!crop || !state || !district) {
      return res.status(400).json({ error: 'Crop, state, and district are required' });
    }

    const prompt = `You are an expert Indian agricultural commodity market analyst with deep knowledge of APMC mandi prices across India.

Crop: ${crop}
State: ${state}
District: ${district}

Provide ACCURATE and REALISTIC current mandi market prices for ${crop} in ${district}, ${state}, India.

IMPORTANT PRICE REFERENCE (use these realistic Indian mandi price ranges):
- Sugarcane: ₹3000-3500 per tonne (Maharashtra FRP is ₹3150/tonne, UP SAP is ₹370/quintal = ₹3700/tonne)
- Wheat: ₹2100-2600 per quintal (MSP 2024-25 is ₹2275/quintal)
- Rice/Paddy: ₹2100-2500 per quintal (MSP is ₹2183/quintal)
- Cotton: ₹6000-8000 per quintal (MSP is ₹7121/quintal for medium staple)
- Soybean: ₹4000-5000 per quintal (MSP is ₹4892/quintal)
- Onion: ₹800-3000 per quintal (highly seasonal)
- Tomato: ₹500-4000 per quintal (highly seasonal)
- Maize: ₹1800-2200 per quintal (MSP is ₹2090/quintal)
- Groundnut: ₹5000-6500 per quintal (MSP is ₹6377/quintal)
- Mustard: ₹5000-5800 per quintal (MSP is ₹5650/quintal)
- Turmeric: ₹10000-18000 per quintal
- Chili: ₹8000-20000 per quintal
- Banana: ₹1000-2500 per quintal
- Potato: ₹600-1500 per quintal

For Sugarcane specifically: Give price in ₹ per TONNE (not quintal). Typical range is ₹2900-3500/tonne.
For all other crops: Give price in ₹ per QUINTAL.

Output ONLY valid JSON with this exact structure:
{
  "crop": "${crop}",
  "state": "${state}",
  "district": "${district}",
  "unit": "per quintal",
  "prices": { "min": "₹2900/tonne", "max": "₹3500/tonne", "avg": "₹3150/tonne" },
  "trend": "Stable",
  "trend_reason": "Specific reason based on current season and demand for ${crop} in ${state}",
  "mandis": [
    { "name": "Nearest real Mandi name in ${district}", "distance": "15 km", "expected_price": "₹3150/tonne" },
    { "name": "Second real Mandi name near ${district}", "distance": "28 km", "expected_price": "₹3100/tonne" },
    { "name": "Third real Mandi name near ${district}", "distance": "45 km", "expected_price": "₹3200/tonne" }
  ],
  "factors": [
    "Specific factor 1 affecting ${crop} price in ${state} currently",
    "Specific factor 2 such as season, arrivals, export demand",
    "MSP or government procurement policy for ${crop}"
  ],
  "advice": [
    "Specific selling advice for ${crop} farmer in ${district} right now",
    "Storage or timing advice based on current price trend"
  ]
}`;

    const geminiResponse = await callGemini(prompt, 4096);
    console.log('Raw Gemini response for market info:', geminiResponse);
    
    // Use Helper
    const parsedData = cleanAndParseJSON(geminiResponse);
    console.log('Parsed market data:', parsedData);
    
    res.json({ marketInfo: parsedData, source: "Gemini AI" });
  } catch (error) {
    console.error('Market info error:', error);
    res.status(500).json({ error: 'Failed to get market information', details: (error as Error).message });
  }
};

// ==========================================
// 3. CROP RECOMMENDATIONS CONTROLLER
// ==========================================
export const getCropRecommendations = async (req: Request, res: Response) => {
  try {
    const { region, soilType, soilPH, waterAvailability, temperatureRange, season, farmSize } = req.body;

    const prompt = `Recommend 5 crops for: ${region}, ${soilType} soil, ${season} season.
IMPORTANT: Respond with ONLY a valid JSON array.
[
  { "name": "Crop Name", "description": "Reason...", "yield": "Yield info", "market": "High/Med/Low" }
]`;

    const geminiResponse = await callGemini(prompt, 4096);
    
    try {
      // Use Helper
      const crops = cleanAndParseJSON(geminiResponse);
      if (!Array.isArray(crops)) throw new Error('Response is not an array');
      res.json({ crops, source: "Gemini AI", count: crops.length });
    } catch (parseError) {
      res.status(500).json({ error: 'Failed to parse crop data', raw: geminiResponse });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to get crop recommendations', details: (error as Error).message });
  }
};

// ==========================================
// 4. DISEASE ANALYSIS CONTROLLER
// ==========================================
export const analyzeDiseaseWithGemini = async (req: Request, res: Response) => {
  try {
    const { cropName, imageBase64 } = req.body;
    if (!cropName || !imageBase64) return res.status(400).json({ error: 'Crop name and Image required' });
    
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    
    const prompt = `Analyze this ${cropName} plant image for diseases. Return JSON:
{
  "diseaseName": "...",
  "diseaseType": "...",
  "confidenceScore": "...",
  "symptoms": ["..."],
  "cause": "...",
  "severityLevel": "...",
  "organicTreatment": ["..."],
  "chemicalTreatment": ["..."],
  "preventiveMeasures": ["..."],
  "recoveryTime": "...",
  "farmerExplanation": "..."
}`;

    const geminiResponse = await callGeminiWithImage(prompt, base64Data, 2048);
    try {
      // Use Helper
      const analysis = cleanAndParseJSON(geminiResponse);
      res.json({ analysis });
    } catch (parseError) {
      res.status(500).json({ error: 'Failed to parse disease analysis', raw: geminiResponse });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze disease', details: (error as Error).message });
  }
};

// ==========================================
// 5. GEMINI WEATHER CONTROLLER
// ==========================================
export const getGeminiWeather = async (req: Request, res: Response) => {
  try {
    const { location, crop } = req.body;

    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    // Extract district and state from location string
    const parts = location.split(',').map((s: string) => s.trim());
    const district = parts[0] || location;
    const state = parts[1] || parts[0] || location;
    const cropName = crop || 'general crops';

    const prompt = `You are a crop weather expert. Generate a 7-day weather intelligence report for ${cropName} farming in ${location}, India.

Respond with ONLY valid JSON (no markdown, no extra text):
{
  "location": "${location}",
  "crop": "${cropName}",
  "timeline": [
    { "date": "Mon", "tempRange": "22-31°C", "rainPercent": 20, "humidity": 65, "status": "🟢 Favorable" },
    { "date": "Tue", "tempRange": "23-33°C", "rainPercent": 10, "humidity": 60, "status": "🟢 Favorable" },
    { "date": "Wed", "tempRange": "24-35°C", "rainPercent": 5, "humidity": 55, "status": "🟡 Caution" },
    { "date": "Thu", "tempRange": "21-29°C", "rainPercent": 70, "humidity": 80, "status": "🔴 Risky" },
    { "date": "Fri", "tempRange": "20-28°C", "rainPercent": 60, "humidity": 78, "status": "🟡 Caution" },
    { "date": "Sat", "tempRange": "22-30°C", "rainPercent": 30, "humidity": 70, "status": "🟢 Favorable" },
    { "date": "Sun", "tempRange": "23-31°C", "rainPercent": 15, "humidity": 62, "status": "🟢 Favorable" }
  ],
  "criticalWindows": [
    "Best sowing window: Mon-Tue - low rain and ideal temperatures",
    "Avoid spraying: Thu-Fri - rain above 60% will wash pesticides",
    "Fertilizer window: Sat - soil moist but no heavy rain expected"
  ],
  "rainfall": {
    "expectedMm": 45,
    "cropNeedMm": 35,
    "verdict": "Surplus",
    "action": "Ensure proper field drainage to prevent waterlogging"
  },
  "thresholdAnalysis": {
    "temperature": { "weekRange": "20-35°C", "idealRange": "20-30°C", "status": "⚠️ Risk" },
    "humidity": { "weekRange": "55-80%", "idealRange": "50-70%", "status": "✅ Safe" },
    "stressDay": "Wed - temperature may cross upper stress threshold"
  },
  "riskAlerts": [
    "🔴 Waterlogging Risk: Thu - 70% rain probability may saturate soil",
    "🟡 Heat Stress: Wed - temperature approaching upper limit for ${cropName}"
  ],
  "pestDisease": [
    { "name": "Fungal Blight", "probability": "High", "reason": "Humidity above 75% on Thu-Fri creates ideal fungal conditions" },
    { "name": "Aphids", "probability": "Moderate", "reason": "Warm temperatures favor aphid activity" },
    { "name": "Powdery Mildew", "probability": "Low", "reason": "Rainfall will suppress mildew spread" }
  ],
  "soilMoisture": "📈 Improving - rainfall on Thu-Fri will recharge soil moisture levels",
  "weekSummary": "*Prioritize drainage before Thu rains and apply fungicide on Tue-Wed to protect ${cropName} from disease risk.*"
}

Fill ALL values with REALISTIC data specific to ${cropName} in ${location}, India. Keep all JSON keys exactly as shown.`;

    const geminiResponse = await callGemini(prompt, 4096);
    console.log('Raw Gemini weather response length:', geminiResponse?.length);
    console.log('Raw Gemini weather response (first 500 chars):', geminiResponse?.substring(0, 500));
    
    let parsedData;
    try {
      parsedData = cleanAndParseJSON(geminiResponse);
      console.log('✅ Weather parsed successfully, keys:', Object.keys(parsedData));
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('Full raw response:', geminiResponse);
      parsedData = { error: 'Failed to parse weather intelligence', raw: geminiResponse?.substring(0, 200) };
    }
    
    res.json({ weather: parsedData, source: "Gemini AI" });
  } catch (error) {
    console.error('Gemini weather error:', error);
    res.status(500).json({ error: 'Failed to get weather information', details: (error as Error).message });
  }
};

// ==========================================
// 6. CROP WEATHER SUITABILITY CONTROLLER
// ==========================================
export const getCropWeatherSuitability = async (req: Request, res: Response) => {
  try {
    const { location, crop, weatherData } = req.body;

    if (!location || !crop || !weatherData) {
      return res.status(400).json({ error: 'Location, crop, and weather data are required' });
    }

    const prompt = `Based on tomorrow's weather forecast, analyze if ${crop} crop is suitable to grow.

Location: ${location}
Crop: ${crop}
Tomorrow's Weather:
- Temperature: ${weatherData.temperature}°C
- Humidity: ${weatherData.humidity}%
- Precipitation: ${weatherData.precipitation}%
- Wind Speed: ${weatherData.windSpeed} km/h
- Condition: ${weatherData.condition}

Respond with ONLY this JSON format:
{
  "suitable": true/false,
  "reason": "Brief explanation why it's suitable or not suitable",
  "recommendations": "Specific farming recommendations for tomorrow"
}`;

    const geminiResponse = await callGemini(prompt, 2048);
    const parsedData = cleanAndParseJSON(geminiResponse);
    
    res.json({ suitability: parsedData, source: "Gemini AI" });
  } catch (error) {
    console.error('Crop weather suitability error:', error);
    res.status(500).json({ error: 'Failed to analyze crop weather suitability', details: (error as Error).message });
  }
};

// ==========================================
// 6. GEMINI MATCH CONTROLLER
// ==========================================

function buildPrompt(farmer: any, source_file?: string) {
  return `
You are a government scheme expert. 
Task: Output strictly a valid JSON array of 2 best matching schemes for this farmer.
NO conversational text. NO Markdown.

Format per scheme:
{
  "scheme_code": "unique_id",
  "title": "Scheme Title",
  "description": "Short description",
  "eligibility_json": { 
      "rules": [ { "field": "state", "op": "==", "value": "MP" } ], 
      "logic": "AND" 
  },
  "documents_required": ["Aadhaar"],
  "benefit_details": { "amount": 6000 },
  "states": ["MP"],
  "source_url": "http...",
  "confidence": 90
}

Farmer: ${JSON.stringify(farmer)}
Source: ${source_file || 'none'}
`;
}

export const geminiMatch = async (req: Request, res: Response) => {
  try {
    const farmerBody = req.body.farmer;
    const source_file = req.body.source_file;
    if (!farmerBody) return res.status(400).json({ error: 'missing farmer body' });

    // 1. Save Farmer
    const farmer = new Farmer(farmerBody);
    await farmer.save();

    // 2. Call Gemini
    const prompt = buildPrompt(farmerBody, source_file);
    const geminiResponse = await callGemini(prompt, 4096); 

    // 3. Robust JSON Parsing
    let arr: any[] = [];
    try {
      arr = cleanAndParseJSON(geminiResponse);
      if (!Array.isArray(arr)) arr = [arr]; 
    } catch (err) {
      console.error('JSON Parse Failed:', err);
      return res.status(500).json({ error: 'Failed to process AI response', raw: geminiResponse });
    }

    const matchedResults = [];

    // 4. Process Schemes
    for (const s of arr) {
      if (!s.scheme_code || !s.title) continue;

      // === CLEANUP: Filter bad rules before saving ===
      let safeRules: any[] = [];
      if (s.eligibility_json && Array.isArray(s.eligibility_json.rules)) {
        // Only keep rules that are Objects AND have a field/op
        safeRules = s.eligibility_json.rules.filter((r: any) => 
          typeof r === 'object' && r !== null && r.field && r.op
        );
      }

      // Map to DB Schema
      const mapped = {
        scheme_code: String(s.scheme_code).slice(0, 150),
        title: s.title,
        description: s.description || '',
        eligibility_json: {
            rules: safeRules, 
            logic: s.eligibility_json?.logic || "AND",
            last_date: s.eligibility_json?.last_date || null
        },
        documents_required: s.documents_required || [],
        benefit_details: s.benefit_details || {},
        states: Array.isArray(s.states) ? s.states : [],
        source_url: s.source_url || null,
        verified: false,
        generated_by: 'gemini'
      };

      // Upsert Scheme
      let schemeDoc;
      const existing = await Scheme.findOne({ scheme_code: mapped.scheme_code });
      
      if (existing && existing.verified) {
        schemeDoc = existing; // Use existing official data
      } else {
        schemeDoc = await Scheme.findOneAndUpdate(
          { scheme_code: mapped.scheme_code },
          { $set: mapped },
          { upsert: true, new: true }
        );
      }

      // 5. Evaluate Eligibility (With Clean Data)
      const result = evaluateEligibility(farmerBody, schemeDoc.eligibility_json);

      // 6. Save Match
      const matchDoc = new Match({
        farmer: farmer._id,
        scheme: schemeDoc._id,
        match_score: result.score,
        eligibility_explanation: result.reasons.length ? result.reasons.join('; ') : 'Eligible'
      });
      await matchDoc.save();

      matchedResults.push({
        matchId: matchDoc._id,
        schemeId: schemeDoc._id,
        title: schemeDoc.title,
        description: schemeDoc.description,
        score: result.score,
        reasons: result.reasons,
        documents: schemeDoc.documents_required,
        generated: !existing?.verified,
        confidence: s.confidence
      });
    }

    return res.json({ matched: matchedResults, farmerId: farmer._id });

  } catch (err) {
    const error = err as Error;
    console.error('geminiMatch Error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
};