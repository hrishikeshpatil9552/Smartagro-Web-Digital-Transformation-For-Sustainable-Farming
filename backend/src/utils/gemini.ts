// src/utils/gemini.ts
import axios from 'axios';

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) console.warn('GEMINI_API_KEY not set. Set GEMINI_API_KEY in .env');


// gemini-2.0-flash
const MODEL_NAME = 'gemini-2.5-flash';
const API_VERSION = 'v1';

// Function for image analysis with Gemini Vision
export async function callGeminiWithImage(prompt: string, base64Image: string, maxTokens = 4096) {
  if (!KEY) {
    throw new Error('LLM not configured. Please set GEMINI_API_KEY in .env');
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL_NAME}:generateContent`;
    const url = `${endpoint}?key=${encodeURIComponent(KEY)}`;

    const body = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.2
      }
    };

    const resp = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000 // Longer timeout for image analysis
    });

    const data = resp.data;

    if (data?.candidates && Array.isArray(data.candidates) && data.candidates.length > 0) {
      const candidate = data.candidates[0];

      if (candidate.content?.parts && Array.isArray(candidate.content.parts) && candidate.content.parts[0]?.text) {
        return candidate.content.parts[0].text;
      }

      if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        console.error('Gemini vision call blocked:', candidate.finishReason);
        throw new Error(`Vision analysis blocked: ${candidate.finishReason}`);
      }
    } else if (data.candidates && data.candidates.length === 0) {
      console.error('Gemini vision returned no candidates');
      throw new Error('Vision analysis returned no results');
    }

    console.warn('Gemini vision response non-standard:', JSON.stringify(data));
    return JSON.stringify(data);

  } catch (err: any) {
    const errorDetail = err?.response?.data?.error?.message || err.message;
    console.error('callGeminiWithImage error:', errorDetail);
    throw new Error(`Vision analysis failed: ${errorDetail}`);
  }
}

export async function callGemini(prompt: string, maxTokens =8192) {
  if (!KEY) {
    throw new Error('LLM not configured. Please set GEMINI_API_KEY in .env');
  }

  // Retry logic for overloaded API
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
    // Current Gemini API endpoint structure (v1/models/modelName:generateContent)
    const endpoint = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL_NAME}:generateContent`;
    // API Key passed as a query parameter ONLY
    const url = `${endpoint}?key=${encodeURIComponent(KEY)}`;

    // Request body structure required by the Gemini REST API
    const body = {
      // 1. Prompt is inside a 'contents' array with 'parts'
      contents: [{
        parts: [{ text: prompt }]
      }],
      
      // 2. Configuration fields must be nested under 'generationConfig'
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.2
      }
    };

    const resp = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60000
    });

    const data = resp.data;

    // --- Robust Response Parsing ---
    if (data?.candidates && Array.isArray(data.candidates) && data.candidates.length > 0) {
        
        const candidate = data.candidates[0];

        // Check for the full expected structure
        if (candidate.content?.parts && Array.isArray(candidate.content.parts) && candidate.content.parts[0]?.text) {
            return candidate.content.parts[0].text;
        }

        // Handle case where content is missing (e.g., due to safety block)
        if (candidate.finishReason && candidate.finishReason !== 'STOP') {
             console.error('Gemini call blocked or finished early:', candidate.finishReason);
             throw new Error(`LLM call blocked or finished early: ${candidate.finishReason}`);
        }
        
    } else if (data.candidates && data.candidates.length === 0) {
        // Explicitly handle the case where the LLM returns no candidates
        console.error('Gemini returned no candidates. Potential safety filter or prompt issue.');
        throw new Error('LLM returned no matching schemes (response was empty).');
    }

    // Fallback: If no expected structure, return the raw data stringified for debugging
    console.warn('Gemini response successful but non-standard top-level structure:', JSON.stringify(data));
    return JSON.stringify(data);

    } catch (err: any) {
      const status = err?.response?.status;
      const errorDetail = err?.response?.data?.error?.message || err.message;
      
      // Retry on 503 (overloaded) or 429 (rate limit)
      if ((status === 503 || status === 429) && attempt < 3) {
        console.log(`Gemini API attempt ${attempt} failed (${status}), retrying in ${attempt * 2}s...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
        continue;
      }
      
      console.error('callGemini external API error:', errorDetail);
      throw new Error(`LLM call failed with status ${status || 'N/A'}: ${errorDetail}`);
    }
  }
}