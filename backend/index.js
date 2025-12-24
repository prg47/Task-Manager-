import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.route.js"
import cookieParser from "cookie-parser";

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("Database connected");
}).catch((err)=>{
    console.log(err);
})

const app = express();

//middleware for cors
app.use(cors({
    origin: process.env.FRONT_END_URL || "http://localhost:5173/",
    methods: ["GET","PUT","POST","DELETE"],
    allowedHeaders: ["Content-Type","Authorization"],
}))


// middleware for json
app.use(express.json());

app.use(cookieParser());

app.listen(3000,()=>{
    console.log("server running");
})

app.use("/api/auth",authRoutes);

app.use((err,req,res,next)=>{
    const statusCode = err.statusCode || 500

    const message = err.message||"Internal Server Error";

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    })
})