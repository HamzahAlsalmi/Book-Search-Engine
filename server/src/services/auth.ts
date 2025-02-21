import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface JwtPayload {
  _id: string;
  username: string;
  email: string;
}

// Extend Express Request to include `user`
declare module "express" {
  interface Request {
    user?: JwtPayload;
  }
}

// Middleware for Express and GraphQL
export const authMiddleware = (
  req: Request,
  res?: Response,
  next?: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    if (next) return next(); // If used in Express, continue
    return req; // If used in Apollo, return modified request
  }

  const token = authHeader.split(" ")[1];
  const secretKey = process.env.JWT_SECRET_KEY || "";

  try {
    const decoded = jwt.verify(token, secretKey) as JwtPayload;
    req.user = {
      _id: decoded._id,
      username: decoded.username,
      email: decoded.email,
    }; // Ensure `email` exists
  } catch (err) {
    console.error("Invalid token:", err);
  }

  if (next) return next(); // Continue for Express
  return req; // Return for Apollo
};

// Function to sign a new token
export const signToken = (username: string, email: string, _id: string) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || "";

  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
};

// Middleware function for Express routes
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  authMiddleware(req, res, next); // Calls the existing authMiddleware
};
