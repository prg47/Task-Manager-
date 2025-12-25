import express from "express";
import { adminOnly, verifyToken } from "../utils/verifyUser.js";
import { createTask,getTasks,getTaskById } from "../controllers/task.controller.js";

const router = express.Router();

router.post("/create",verifyToken,adminOnly,createTask);
router.get("/",verifyToken,getTasks);
router.get("/:id",getTaskById);

export default router;