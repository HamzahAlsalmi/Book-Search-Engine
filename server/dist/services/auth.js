import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
// Middleware for Authentication
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        if (next)
            return next();
        return req;
    }
    const token = authHeader.split(" ")[1];
    const secretKey = process.env.JWT_SECRET_KEY || "default_secret";
    try {
        const decoded = jwt.verify(token, secretKey); // ✅ Ensure correct type
        req.user = decoded; // ✅ Directly assign decoded JWT
    }
    catch (err) {
        console.error("Invalid token:", err);
        if (next)
            return res?.status(403).json({ message: "Invalid or expired token" });
    }
    if (next)
        return next();
    return req;
};
export const signToken = (username, email, id) => {
    const payload = { id, username, email }; // ✅ Explicitly define payload type
    const secretKey = process.env.JWT_SECRET_KEY || "default_secret";
    return jwt.sign(payload, secretKey, { expiresIn: "1h" });
};
export const authenticateToken = (req, res, next) => {
    authMiddleware(req, res, next);
};
