import { Request, Response } from "express";

export const getHomePage = (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to AgriSarthi Home Page" });
};
