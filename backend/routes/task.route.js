import express from "express";
import { adminOnly, verifyToken } from "../utils/verifyUser.js";
import { createTask,getTasks,getTaskById,updateTask,deleteTask } from "../controllers/task.controller.js";

const router = express.Router();

router.post("/create",verifyToken,adminOnly,createTask);
router.get("/",verifyToken,getTasks);
router.get("/:id",getTaskById);
router.put("/:id",updateTask);
router.delete("/:id",verifyToken,adminOnly,deleteTask);

export default router;