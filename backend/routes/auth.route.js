import express from "express";
import { signUp,signIn,userProfile,updateUserProfile } from "../controllers/auth.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/sign-up",signUp);
router.post("/sign-in",signIn);
router.get("/user-profile",verifyToken,userProfile);
router.put("/update-profile",verifyToken,updateUserProfile);

export default router;