import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";

export const signUp = async (req,res)=>{
    const {name,email,password,profileImageUrl,adminJoinCode} = req.body;

    if(!name || !email || !password || name==="" || email===""){
        return res.status(400).json({message:"All fields required"});
    }

    // checking if user already exists
    const userExists = await User.findOne({email});

    if(userExists){
        return res.status(400).json({success: false, message: "User already Exists"});
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
        res.status(500).json({message: error.message});
    }


}