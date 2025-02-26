"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const path_1 = __importDefault(require("path"));
const __dirname = path_1.default.resolve(); // ✅ CommonJS fix
const index_js_1 = __importDefault(require("./api/index.js"));
router.use("/api", index_js_1.default);
// Serve up React front-end in production
router.use((_req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../../client/build/index.html"));
});
exports.default = router;
