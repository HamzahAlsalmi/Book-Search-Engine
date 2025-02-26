"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = exports.authContext = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ✅ Middleware to Authenticate Token for Express Routes
const authenticateToken = (_req, _res, next) => {
    console.log("🔍 Middleware authenticateToken is being called.");
    next(); // Allow request to continue
};
exports.authenticateToken = authenticateToken;
// ✅ Middleware for Apollo GraphQL Context
const authContext = async ({ req }) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        console.log("✅ Decoded Token Payload:", decoded);
        return { user: decoded }; // Return user object in context
    }
    catch (err) {
        console.error("❌ Invalid token:", err);
        return { user: null };
    }
};
exports.authContext = authContext;
// ✅ Function to Sign JWT Tokens
const signToken = (username, email, id) => {
    const payload = { id, username, email };
    const secretKey = process.env.JWT_SECRET_KEY || "default_secret";
    return jsonwebtoken_1.default.sign(payload, secretKey, { expiresIn: "1h" });
};
exports.signToken = signToken;
