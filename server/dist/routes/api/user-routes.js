"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_js_1 = require("../../controllers/user-controller.js");
const auth_js_1 = require("../../services/auth.js");
const router = express_1.default.Router();
// ✅ No need for explicit type casting anymore
router.post("/", user_controller_js_1.createUser);
router.post("/login", user_controller_js_1.login);
router.get("/me", auth_js_1.authenticateToken, user_controller_js_1.getSingleUser);
router.put("/", auth_js_1.authenticateToken, user_controller_js_1.saveBook);
router.delete("/:bookId", auth_js_1.authenticateToken, user_controller_js_1.deleteBook);
exports.default = router;
