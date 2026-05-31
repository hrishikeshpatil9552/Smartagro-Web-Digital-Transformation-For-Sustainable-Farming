import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as any;
    
    // Find the user by ID from the token and exclude the password field
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    // FIX: Check if 'error' is an instance of the Error object before accessing .message
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    console.error('Auth middleware error:', errorMessage);
    return res.status(403).json({ message: "Invalid or expired token", details: errorMessage });
  }
};