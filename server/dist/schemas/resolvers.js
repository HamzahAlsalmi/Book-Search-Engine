"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const User_1 = __importDefault(require("../models/User")); // ✅ Ensure IUser is imported
const auth_1 = require("../services/auth");
const resolvers = {
    Query: {
        me: async (_parent, _args, context) => {
            console.log("🔍 Full context:", context); // Log the full context to verify if user data is being passed
            if (context.user) {
                console.log("✅ User found in context:", context.user); // Log user data
                return await User_1.default.findById(context.user._id); // Fetch user from DB
            }
            console.log("❌ No user found in context");
            throw new apollo_server_express_1.AuthenticationError("Not logged in");
        },
    },
    Mutation: {
        login: async (_parent, { email, password }) => {
            console.log("🔍 Login Attempt:", email); // ✅ Debugging log
            const user = await User_1.default.findOne({ email });
            if (!user) {
                console.log("❌ User not found in DB");
                throw new apollo_server_express_1.AuthenticationError("Incorrect credentials");
            }
            console.log("✅ User found:", user.username);
            console.log("🔍 Hashed Password in DB:", user.password);
            console.log("🔍 Plain Password Entered:", password);
            // ✅ Ensure `isCorrectPassword` function exists
            if (!user.isCorrectPassword) {
                console.error("❌ isCorrectPassword function missing in User model");
                throw new apollo_server_express_1.AuthenticationError("Internal error");
            }
            // ✅ Debug: Check password comparison
            const isMatch = await user.isCorrectPassword(password);
            console.log("🔍 Password Match Result:", isMatch);
            if (!isMatch) {
                console.log("❌ Incorrect password");
                throw new apollo_server_express_1.AuthenticationError("Incorrect credentials");
            }
            console.log("✅ Password match, generating token...");
            const userId = user._id.toString();
            const token = (0, auth_1.signToken)(user.username, user.email, userId);
            return { token, user };
        },
        addUser: async (_parent, { username, email, password, }) => {
            console.log("🔍 Creating new user:", username, email);
            const user = await User_1.default.create({ username, email, password });
            const userId = user._id.toString();
            const token = (0, auth_1.signToken)(user.username, user.email, userId);
            console.log("✅ User created successfully:", user.username);
            return { token, user };
        },
        saveBook: async (_parent, { book }, context) => {
            if (context.user) {
                console.log(`📚 Saving book for user ${context.user._id}:`, book);
                return await User_1.default.findByIdAndUpdate(context.user._id, { $addToSet: { savedBooks: book } }, { new: true, runValidators: true });
            }
            throw new apollo_server_express_1.AuthenticationError("Not logged in");
        },
        removeBook: async (_parent, { bookId }, context) => {
            if (context.user) {
                console.log(`🗑 Removing book for user ${context.user._id}:`, bookId);
                return await User_1.default.findByIdAndUpdate(context.user._id, { $pull: { savedBooks: { bookId } } }, { new: true });
            }
            throw new apollo_server_express_1.AuthenticationError("Not logged in");
        },
    },
};
exports.default = resolvers;
