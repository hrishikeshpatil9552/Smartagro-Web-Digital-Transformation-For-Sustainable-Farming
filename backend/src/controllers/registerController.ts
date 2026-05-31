import { Request, Response } from "express";

export const registerUser = (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  // temporary placeholder logic
  console.log("New user:", { name, email, password });
  res.status(201).json({ success: true, message: "User registered successfully!" });
};
