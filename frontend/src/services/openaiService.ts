export interface DiseaseAnalysisRequest {
  cropName: string;
  imageBase64: string;
}

export interface DiseaseAnalysisResult {
  diseaseName: string;
  diseaseType: string;
  confidenceScore: string;
  symptoms: string[];
  cause: string;
  severityLevel: string;
  organicTreatment: string[];
  chemicalTreatment: string[];
  preventiveMeasures: string[];
  recoveryTime: string;
  farmerExplanation: string;
}

export const analyzeDiseaseWithOpenAI = async (data: DiseaseAnalysisRequest): Promise<DiseaseAnalysisResult> => {
  const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!API_KEY) {
    throw new Error('OpenAI API key not found');
  }

  const prompt = `You are an agriculture disease expert. Analyze this crop leaf image and the crop name provided.

Crop Name: ${data.cropName}

Provide the following fields in the final output:

1. Disease Name (or top 3 possible diseases with confidence %)
2. Disease Type (fungal, bacterial, viral, nutrient deficiency, pest damage)
3. Confidence Score
4. Visible Symptoms (bullet points)
5. Cause of Disease
6. Severity Level (mild, moderate, severe)
7. Treatment:
   - Organic solutions 
   - Chemical solutions with dose (in ml or gm per liter)
8. Preventive Measures
9. Expected Recovery Time
10. Farmer-friendly explanation in simple language

If the leaf is healthy, say: "Leaf is healthy" and recommend basic care.

Format your response as JSON with these exact keys:
{
  "diseaseName": "",
  "diseaseType": "",
  "confidenceScore": "",
  "symptoms": [],
  "cause": "",
  "severityLevel": "",
  "organicTreatment": [],
  "chemicalTreatment": [],
  "preventiveMeasures": [],
  "recoveryTime": "",
  "farmerExplanation": ""
}`;

  try {
    // Updated model name and API structure
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Updated to the latest vision model
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: data.imageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error Response:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    
    if (result.choices && result.choices[0] && result.choices[0].message) {
      const content = result.choices[0].message.content;
      
      try {
        // Try to parse as JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: parse manually
          return parseOpenAIResponse(content);
        }
      } catch (parseError) {
        // If JSON parsing fails, parse manually
        return parseOpenAIResponse(content);
      }
    } else {
      throw new Error('Invalid response from OpenAI API');
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to analyze disease. Please try again.');
  }
};

// Fallback parser for non-JSON responses
function parseOpenAIResponse(content: string): DiseaseAnalysisResult {
  return {
    diseaseName: extractField(content, 'Disease Name') || 'Unknown Disease',
    diseaseType: extractField(content, 'Disease Type') || 'Unknown',
    confidenceScore: extractField(content, 'Confidence Score') || 'Unknown',
    symptoms: extractList(content, 'Visible Symptoms') || ['Analysis in progress'],
    cause: extractField(content, 'Cause of Disease') || 'Unknown cause',
    severityLevel: extractField(content, 'Severity Level') || 'Unknown',
    organicTreatment: extractList(content, 'Organic solutions') || ['Consult expert'],
    chemicalTreatment: extractList(content, 'Chemical solutions') || ['Consult expert'],
    preventiveMeasures: extractList(content, 'Preventive Measures') || ['Regular monitoring'],
    recoveryTime: extractField(content, 'Expected Recovery Time') || 'Unknown',
    farmerExplanation: extractField(content, 'Farmer-friendly explanation') || content.substring(0, 200)
  };
}

function extractField(content: string, fieldName: string): string {
  const regex = new RegExp(`${fieldName}[:\\-]?\\s*([^\\n]+)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

function extractList(content: string, fieldName: string): string[] {
  const regex = new RegExp(`${fieldName}[:\\-]?\\s*([\\s\\S]*?)(?=\\n\\d+\\.|\\n[A-Z]|$)`, 'i');
  const match = content.match(regex);
  if (match) {
    return match[1]
      .split(/[\n\-\•]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }
  return [];
}







// export interface DiseaseAnalysisRequest {
//   cropName: string;
//   imageBase64: string;
// }

// export interface DiseaseAnalysisResult {
//   diseaseName: string;
//   diseaseType: string;
//   confidenceScore: string;
//   symptoms: string[];
//   cause: string;
//   severityLevel: string;
//   organicTreatment: string[];
//   chemicalTreatment: string[];
//   preventiveMeasures: string[];
//   recoveryTime: string;
//   farmerExplanation: string;
// }

// export const analyzeDiseaseWithOpenAI = async (data: DiseaseAnalysisRequest): Promise<DiseaseAnalysisResult> => {
//   const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  
//   if (!API_KEY) {
//     throw new Error('OpenAI API key not found');
//   }

//   const prompt = `You are an agriculture disease expert. Analyze this crop leaf image and the crop name provided.

// Crop Name: ${data.cropName}

// Provide the following fields in the final output:

// 1. Disease Name (or top 3 possible diseases with confidence %)
// 2. Disease Type (fungal, bacterial, viral, nutrient deficiency, pest damage)
// 3. Confidence Score
// 4. Visible Symptoms (bullet points)
// 5. Cause of Disease
// 6. Severity Level (mild, moderate, severe)
// 7. Treatment:
//    - Organic solutions 
//    - Chemical solutions with dose (in ml or gm per liter)
// 8. Preventive Measures
// 9. Expected Recovery Time
// 10. Farmer-friendly explanation in simple language

// If the leaf is healthy, say: "Leaf is healthy" and recommend basic care.

// Format your response as JSON with these exact keys:
// {
//   "diseaseName": "",
//   "diseaseType": "",
//   "confidenceScore": "",
//   "symptoms": [],
//   "cause": "",
//   "severityLevel": "",
//   "organicTreatment": [],
//   "chemicalTreatment": [],
//   "preventiveMeasures": [],
//   "recoveryTime": "",
//   "farmerExplanation": ""
// }`;

//   try {
//     const response = await fetch('https://api.openai.com/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${API_KEY}`,
//       },
//       body: JSON.stringify({
//         model: 'gpt-4-vision-preview',
//         messages: [
//           {
//             role: 'user',
//             content: [
//               {
//                 type: 'text',
//                 text: prompt
//               },
//               {
//                 type: 'image_url',
//                 image_url: {
//                   url: data.imageBase64
//                 }
//               }
//             ]
//           }
//         ],
//         max_tokens: 1500
//       })
//     });

//     if (!response.ok) {
//       throw new Error(`OpenAI API error: ${response.status}`);
//     }

//     const result = await response.json();
    
//     if (result.choices && result.choices[0] && result.choices[0].message) {
//       const content = result.choices[0].message.content;
      
//       try {
//         // Try to parse as JSON
//         const jsonMatch = content.match(/\{[\s\S]*\}/);
//         if (jsonMatch) {
//           return JSON.parse(jsonMatch[0]);
//         } else {
//           // Fallback: parse manually
//           return parseOpenAIResponse(content);
//         }
//       } catch (parseError) {
//         // If JSON parsing fails, parse manually
//         return parseOpenAIResponse(content);
//       }
//     } else {
//       throw new Error('Invalid response from OpenAI API');
//     }
//   } catch (error) {
//     console.error('OpenAI API Error:', error);
//     throw new Error('Failed to analyze disease. Please try again.');
//   }
// };

// // Fallback parser for non-JSON responses
// function parseOpenAIResponse(content: string): DiseaseAnalysisResult {
//   return {
//     diseaseName: extractField(content, 'Disease Name') || 'Unknown Disease',
//     diseaseType: extractField(content, 'Disease Type') || 'Unknown',
//     confidenceScore: extractField(content, 'Confidence Score') || 'Unknown',
//     symptoms: extractList(content, 'Visible Symptoms') || ['Analysis in progress'],
//     cause: extractField(content, 'Cause of Disease') || 'Unknown cause',
//     severityLevel: extractField(content, 'Severity Level') || 'Unknown',
//     organicTreatment: extractList(content, 'Organic solutions') || ['Consult expert'],
//     chemicalTreatment: extractList(content, 'Chemical solutions') || ['Consult expert'],
//     preventiveMeasures: extractList(content, 'Preventive Measures') || ['Regular monitoring'],
//     recoveryTime: extractField(content, 'Expected Recovery Time') || 'Unknown',
//     farmerExplanation: extractField(content, 'Farmer-friendly explanation') || content.substring(0, 200)
//   };
// }

// function extractField(content: string, fieldName: string): string {
//   const regex = new RegExp(`${fieldName}[:\\-]?\\s*([^\\n]+)`, 'i');
//   const match = content.match(regex);
//   return match ? match[1].trim() : '';
// }

// function extractList(content: string, fieldName: string): string[] {
//   const regex = new RegExp(`${fieldName}[:\\-]?\\s*([\\s\\S]*?)(?=\\n\\d+\\.|\\n[A-Z]|$)`, 'i');
//   const match = content.match(regex);
//   if (match) {
//     return match[1]
//       .split(/[\n\-\•]/)
//       .map(item => item.trim())
//       .filter(item => item.length > 0);
//   }
//   return [];
// }