import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

//middleware for cors
app.use(cors({
    origin: process.env.FRONT_END_URL || "http://localhost:5173/",
    methods: ["GET","PUT","POST","DELETE"],
    allowedHeaders: ["Content-Type","Authorization"],
}))


// middleware for json
app.use(express.json());

app.listen(3000,()=>{
    console.log("server running");
})