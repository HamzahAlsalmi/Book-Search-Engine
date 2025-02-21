import type { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload as DefaultJwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// ✅ Extend JWT Payload Correctly
export interface JwtPayload extends DefaultJwtPayload {
  id: string;
  username: string;
  email: string;
}

// ✅ Extend Express Request Type to Include Custom JWT
declare module "express" {
  interface Request {
    user?: JwtPayload;
  }
}

// Middleware for Authentication
export const authMiddleware = (
  req: Request,
  res?: Response,
  next?: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    if (next) return next();
    return req;
  }

  const token = authHeader.split(" ")[1];
  const secretKey = process.env.JWT_SECRET_KEY || "default_secret";

  try {
    const decoded = jwt.verify(token, secretKey) as JwtPayload; // ✅ Ensure correct type
    req.user = decoded; // ✅ Directly assign decoded JWT
  } catch (err) {
    console.error("Invalid token:", err);
    if (next)
      return res?.status(403).json({ message: "Invalid or expired token" });
  }

  if (next) return next();
  return req;
};

export const signToken = (username: string, email: string, id: string) => {
  const payload: JwtPayload = { id, username, email }; // ✅ Explicitly define payload type
  const secretKey = process.env.JWT_SECRET_KEY || "default_secret";

  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
};

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  authMiddleware(req, res, next);
};
