import express from "express";
import { createUser, getSingleUser, saveBook, deleteBook, login, } from "../../controllers/user-controller.js";
import { authenticateToken } from "../../services/auth.js";
const router = express.Router();
// ✅ No need for explicit type casting anymore
router.post("/", createUser);
router.post("/login", login);
router.get("/me", authenticateToken, getSingleUser);
router.put("/", authenticateToken, saveBook);
router.delete("/:bookId", authenticateToken, deleteBook);
export default router;
