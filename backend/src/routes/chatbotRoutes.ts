import express from 'express';
import { chatWithBot } from '../controllers/chatbotController';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post('/chat', authenticateToken, upload.single('image'), chatWithBot);

export default router;