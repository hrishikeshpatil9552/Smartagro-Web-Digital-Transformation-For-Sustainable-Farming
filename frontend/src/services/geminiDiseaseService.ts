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

export const analyzeDiseaseWithGemini = async (data: DiseaseAnalysisRequest): Promise<DiseaseAnalysisResult> => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('Please login to access disease analysis');
  }

  console.log('Sending disease analysis request:');
  console.log('Crop name:', data.cropName);
  console.log('Image data:', data.imageBase64 ? `Present (${data.imageBase64.length} chars)` : 'Missing');

  try {
    const response = await fetch('http://localhost:5000/api/gemini/disease-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    return result.analysis || parseGeminiResponse('Analysis failed');
  } catch (error) {
    console.error('Disease Analysis Error:', error);
    throw new Error('Failed to analyze disease. Please try again.');
  }
};

// Fallback parser for non-JSON responses
function parseGeminiResponse(content: string): DiseaseAnalysisResult {
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