"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.deleteBook = exports.saveBook = exports.getSingleUser = exports.createUser = void 0;
const User_js_1 = __importDefault(require("../models/User.js")); // Ensure correct import
// ✅ Create a new user
const createUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        // Check if user already exists
        const existingUser = await User_js_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        // Create and save new user
        const newUser = new User_js_1.default({ username, email, password });
        await newUser.save();
        res
            .status(201)
            .json({ message: "User created successfully", user: newUser });
    }
    catch (error) {
        next(error);
    }
};
exports.createUser = createUser;
// ✅ Get a single user
const getSingleUser = async (req, res, next) => {
    try {
        if (!req.user || !req.user._id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const user = await User_js_1.default.findById(req.user._id.toString()); // ✅ Ensure `_id` is a string
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
};
exports.getSingleUser = getSingleUser;
// ✅ Save a book to user's account
const saveBook = async (req, res, next) => {
    try {
        if (!req.user || !req.user._id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const user = await User_js_1.default.findById(req.user._id.toString());
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        user.savedBooks.push(req.body);
        await user.save();
        res.status(200).json({ message: "Book saved successfully", user });
    }
    catch (error) {
        next(error);
    }
};
exports.saveBook = saveBook;
// ✅ Delete a book from user's saved books
const deleteBook = async (req, res, next) => {
    try {
        if (!req.user || !req.user._id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const user = await User_js_1.default.findById(req.user._id.toString());
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        user.savedBooks = user.savedBooks.filter((book) => book.bookId !== req.params.bookId);
        await user.save();
        res.status(200).json({ message: "Book removed successfully", user });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteBook = deleteBook;
// ✅ User login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User_js_1.default.findOne({ email }); // ✅ Explicitly typed
        if (!user) {
            res.status(400).json({ message: "Invalid email or password" });
            return;
        }
        // ✅ Use `isCorrectPassword` instead of `comparePassword`
        const isMatch = await user.isCorrectPassword(password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid email or password" });
            return;
        }
        const token = user.generateAuthToken();
        res.status(200).json({ token, user });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
