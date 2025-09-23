import express from "express";
import {
  createLike,
  deleteLike,
  getLikeStatus,
} from "../controllers/likeController.js";

const router = express.Router();

router.post("/", createLike);
router.delete("/", deleteLike);
router.get("/", getLikeStatus);

export default router;
