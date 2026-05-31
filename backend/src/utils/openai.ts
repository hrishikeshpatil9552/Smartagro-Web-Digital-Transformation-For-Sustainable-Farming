import axios from 'axios';

// Use the correct environment variable name
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Add this debug logging
console.log('OpenRouter API Key exists:', !!OPENROUTER_API_KEY);
console.log('OpenRouter API Key length:', OPENROUTER_API_KEY?.length);

if (!OPENROUTER_API_KEY) {
  console.warn('OPENROUTER_API_KEY not set. Chatbot will not work until API key is configured.');
}

export async function callOpenAI(message: string, imageBase64?: string): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env file.');
  }

  try {
    console.log('Making API call to OpenRouter with message:', message);
    console.log('Image provided:', !!imageBase64);
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',   
      {
        model: imageBase64 ? 'openai/gpt-4o-mini' : 'deepseek/deepseek-v3.2-exp',
        messages: [
          {
            role: 'system',
            content: `You are an agricultural expert assistant. Provide helpful, accurate advice about farming, crops, soil, weather, and agricultural practices.
            
            Format your responses using markdown for better readability:
            - Use headings (##) for main topics
            - Use bullet points (*) for lists
            - Use bold (**text**) for important terms
            - Use code (\`text\`) for specific varieties or technical terms
            
            Keep responses concise and practical for farmers. When analyzing images, focus on plant health, diseases, pests, soil conditions, and growth stages.`
          },
          {
            role: 'user',
            content: imageBase64 ? [
              { type: 'text', text: message },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
            ] : message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://your-domain.com', // Replace with your actual domain
          'X-Title': 'Agri Sarathi' // Your app name
        },
        timeout: 30000
      }
    );

    console.log('OpenRouter API response status:', response.status);
    return response.data.choices[0].message.content;
  } catch (error: any) {
    // Enhanced error logging
    console.error('OpenAI API error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      throw new Error('Invalid API key. Please check your OpenRouter API key.');
    } else if (error.response?.status === 429) {
      throw new Error('API rate limit exceeded. Please try again later.');
    } else if (error.response?.status >= 500) {
      throw new Error('OpenRouter server error. Please try again later.');
    } else {
      throw new Error(`OpenRouter API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}











// import axios from 'axios';

// const OPENAI_API_KEY = process.env.OPEN_Router_API_KEY || process.env.OPENAI_API_KEY;

// // Add this debug logging
// console.log('OpenRouter API Key exists:', !!OPENAI_API_KEY);
// console.log('OpenRouter API Key length:', OPENAI_API_KEY?.length);

// if (!OPENAI_API_KEY) {
//   console.warn('OPENAI_API_KEY not set. Chatbot will not work until API key is configured.');
// }

// export async function callOpenAI(message: string, imageBase64?: string): Promise<string> {
//   if (!OPENAI_API_KEY) {
//     throw new Error('OpenRouter API key not configured. Please set OPENAI_API_KEY in .env file.');
//   }

//   try {
//     console.log('Making API call to OpenRouter with message:', message);
//     console.log('Image provided:', !!imageBase64);
    
//     const response = await axios.post(
//       'https://openrouter.ai/api/v1/chat/completions',   
//       {
//         model: imageBase64 ? 'openai/gpt-4o-mini' : 'deepseek/deepseek-v3.2-exp',
//         messages: [
//           {
//             role: 'system',
//             content: 'You are an agricultural expert assistant. Provide helpful, accurate advice about farming, crops, soil, weather, and agricultural practices. Keep responses concise and practical. When analyzing images, focus on plant health, diseases, pests, soil conditions, and growth stages.'
//           },
//           {
//             role: 'user',
//             content: imageBase64 ? [
//               { type: 'text', text: message },
//               { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
//             ] : message
//           }
//         ],
//         max_tokens: 1000,
//         temperature: 0.7
//       },
//       {
//         headers: {
//           'Authorization': `Bearer ${OPENAI_API_KEY}`,
//           'Content-Type': 'application/json'
//         },
//         timeout: 30000
//       }
//     );

//     console.log('OpenRouter API response status:', response.status);
//     return response.data.choices[0].message.content;
//   } catch (error: any) {
//     // Enhanced error logging
//     console.error('OpenAI API error details:', {
//       message: error.message,
//       status: error.response?.status,
//       statusText: error.response?.statusText,
//       data: error.response?.data
//     });
    
//     if (error.response?.status === 401) {
//       throw new Error('Invalid API key. Please check your OpenRouter API key.');
//     } else if (error.response?.status === 429) {
//       throw new Error('API rate limit exceeded. Please try again later.');
//     } else if (error.response?.status >= 500) {
//       throw new Error('OpenRouter server error. Please try again later.');
//     } else {
//       throw new Error(`OpenRouter API error: ${error.response?.data?.error?.message || error.message}`);
//     }
//   }
// }






// previous file hrishikesh patil phase -1
// import axios from 'axios';

// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// if (!OPENAI_API_KEY) {
//   console.warn('OPENAI_API_KEY not set. Set OPENAI_API_KEY in .env');
// }

// export async function callOpenAI(message: string): Promise<string> {
//   if (!OPENAI_API_KEY) {
//     throw new Error('OpenAI API key not configured');
//   }

//   try {
//     const response = await axios.post(
//       'https://api.openai.com/v1/chat/completions',
//       {
//         model: 'gpt-3.5-turbo',
//         messages: [
//           {
//             role: 'system',
//             content: 'You are an agricultural expert assistant. Provide helpful, accurate advice about farming, crops, soil, weather, and agricultural practices. Keep responses concise and practical.'
//           },
//           {
//             role: 'user',
//             content: message
//           }
//         ],
//         max_tokens: 500,
//         temperature: 0.7
//       },
//       {
//         headers: {
//           'Authorization': `Bearer ${OPENAI_API_KEY}`,
//           'Content-Type': 'application/json'
//         },
//         timeout: 30000
//       }
//     );

//     return response.data.choices[0].message.content;
//   } catch (error: any) {
//     console.error('OpenAI API error:', error.response?.data || error.message);
//     throw new Error('Failed to get response from AI assistant');
//   }
// }