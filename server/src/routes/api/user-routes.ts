import express from "express";
const router = express.Router();
import {
  createUser,
  getSingleUser,
  saveBook,
  deleteBook,
  login,
} from "../../controllers/user-controller.js";

// import middleware
import { authenticateToken } from "../../services/auth.js";

// put authMiddleware anywhere we need to send a token for verification of user
router.route("/").post(createUser).put(authenticateToken, saveBook);

router.route("/login").post(login);

router.route("/me").get(
  authenticateToken,
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  },
  getSingleUser
);

router.route("/books/:bookId").delete(
  authenticateToken,
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  },
  deleteBook
);

export default router;
