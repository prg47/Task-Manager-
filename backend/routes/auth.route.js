import express from "express";
import { signUp,signIn,userProfile,updateUserProfile,uploadImage } from "../controllers/auth.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.post("/sign-up",signUp);
router.post("/sign-in",signIn);
router.get("/user-profile",verifyToken,userProfile);
router.put("/update-profile",verifyToken,updateUserProfile);
router.post("/upload-image",upload.single("image"),uploadImage);

export default router;