import express from "express";
import {
  createFollow,
  deleteFollow,
  getFollowStatus,
} from "../controllers/followController.js";

const router = express.Router();

router.post("/", createFollow);
router.delete("/:followingId", deleteFollow);
router.get("/status/:targetUserId", getFollowStatus);

export default router;
