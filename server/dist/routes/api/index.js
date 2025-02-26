"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const user_routes_js_1 = __importDefault(require("./user-routes.js"));
router.use('/users', user_routes_js_1.default);
exports.default = router;
