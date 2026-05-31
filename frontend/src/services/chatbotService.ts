export interface ChatMessage {
  message: string;
}

export interface ChatResponse {
  response: string;
  source: string;
}

export const sendChatMessage = async (message: string, imageFile?: File): Promise<ChatResponse> => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('Please login to use the chatbot');
  }

  try {
    const formData = new FormData();
    formData.append('message', message);
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await fetch('http://localhost:5000/api/chatbot/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Chatbot Error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to send message to chatbot');
  }
};