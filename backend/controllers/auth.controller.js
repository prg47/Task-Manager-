import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";

export const signUp = async (req,res,next)=>{
    const {name,email,password,profileImageUrl,adminJoinCode} = req.body;

    if(!name || !email || !password || name==="" || email===""){
        return next(errorHandler(400,"All fields required"));
    }

    // checking if user already exists
    const userExists = await User.findOne({email});

    if(userExists){
        return next(errorHandler(400,"user already exists"));
    }

    let role = "user";

    if(adminJoinCode && adminJoinCode === process.env.ADMIN_JOIN_CODE){
        role = "admin";
    }

    const hashedPassword = bcryptjs.hashSync(password,10);

    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        profileImageUrl,
        role,
    })

    try{
        await newUser.save();
        res.json("signup successfull");
    }catch(error){
        next(error.message);
    }


}