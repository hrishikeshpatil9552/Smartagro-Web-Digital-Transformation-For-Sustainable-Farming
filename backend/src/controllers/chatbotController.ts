import { Request, Response } from 'express';
import { callOpenAI } from '../utils/openai';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const chatWithBot = async (req: MulterRequest, res: Response) => {
  try {
    const { message } = req.body;
    const imageFile = req.file;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Chatbot request:', message);
    console.log('Image file:', imageFile ? `${imageFile.originalname} (${imageFile.size} bytes)` : 'None');

    let imageBase64: string | undefined;
    if (imageFile) {
      imageBase64 = imageFile.buffer.toString('base64');
    }

    const response = await callOpenAI(message, imageBase64);
    
    console.log('Chatbot response received');
    const modelUsed = imageBase64 ? 'OpenRouter GPT-4o-mini Vision' : 'OpenRouter DeepSeek-v3.2';
    res.json({ response, source: modelUsed });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      error: 'Failed to get chatbot response', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};