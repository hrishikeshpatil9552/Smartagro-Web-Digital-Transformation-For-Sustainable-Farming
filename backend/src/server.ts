
import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from the correct location
// Explicitly load backend/.env regardless of current working directory
// (prevents missing env vars when dev server starts from repo root)
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});


import { connectDB } from "./config/db";
import homeRoutes from "./routes/homeRoutes";
import authRoutes from "./routes/authRoutes";
import geminiRoutes from "./routes/geminiRoutes";
import weatherRoutes from "./routes/weatherRoutes";
import userRoutes from "./routes/userRoutes";
import schemeRoutes from "./routes/schemeRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import consultantRoutes from './routes/consultantRoutes';
import chatbotRoutes from './routes/chatbotRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import contactRoutes from './routes/contactRoutes';
import bodyParser from 'body-parser';

const app = express();

// Middleware
// app.use(cors({
  // origin: 'http://localhost:5173',
//   credentials: true
// }));
// This allows requests from any origin
app.use(cors()); 
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));

// Connect to Database
connectDB();

// ==========================================
// 👇 ROUTE CONFIGURATION
// ==========================================

// 1. Auth Routes (Fixed: Added /api prefix)
// This enables: POST http://localhost:5000/api/auth/login
app.use("/api/auth", authRoutes); 

// 2. Feature Routes
app.use("/api/notifications", notificationRoutes);
app.use('/api/user', userRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/consultants', consultantRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/contact', contactRoutes);
// 3. Home Route
app.use("/", homeRoutes);

// Debug route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 5000;
const geminiKeyPresent = process.env.GEMINI_API_KEY ? 'yes' : 'no';
console.log(`[env-check] GEMINI_API_KEY present: ${geminiKeyPresent}`);
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));





