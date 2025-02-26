import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload as DefaultJwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// ✅ Extend JWT Payload Correctly
export interface JwtPayload extends DefaultJwtPayload {
  id: string;
  username: string;
  email: string;
}

// ✅ Middleware to Authenticate Token for Express Routes
export const authenticateToken = (
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  console.log("🔍 Middleware authenticateToken is being called.");
  next(); // Allow request to continue
};

// ✅ Middleware for Apollo GraphQL Context
export const authContext = async ({ req }: { req: Request }) => {
  console.log("📌 Inside authContext function!"); // Debugging log
  const authHeader = req.headers.authorization || "";
  console.log("🔍 Received Authorization Header:", authHeader); // Debugging log

  if (!authHeader.startsWith("Bearer ")) {
    console.log("❌ No Bearer token found in headers");
    return { user: null };
  }

  const token = authHeader.split(" ")[1]; // Extract token after "Bearer "
  if (!token) {
    console.log("❌ No token found after 'Bearer'");
    return { user: null };
  }

  const secretKey = process.env.JWT_SECRET_KEY || "default_secret";
  try {
    const decoded = jwt.verify(token, secretKey) as JwtPayload;
    console.log("✅ Decoded Token Payload:", decoded);
    return { user: decoded }; // Return user object in context
  } catch (err) {
    console.error("❌ Invalid token:", err);
    return { user: null };
  }
};

// ✅ Function to Sign JWT Tokens
export const signToken = (username: string, email: string, id: string) => {
  const payload: JwtPayload = { id, username, email };
  const secretKey = process.env.JWT_SECRET_KEY || "default_secret";

  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
};
