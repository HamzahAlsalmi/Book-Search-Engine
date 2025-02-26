import type { Request, Response } from "express";
import express from "express";
const router = express.Router();

import path from "path";
const __dirname = path.resolve(); // ✅ CommonJS fix

import apiRoutes from "./api/index.js";

router.use("/api", apiRoutes);

// Serve up React front-end in production
router.use((_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../client/build/index.html"));
});

export default router;
