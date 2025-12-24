import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true,
        },
        email:{
            type: String,
            required: true,
            unique: true,
        },
        password:{
            type: String,
            required: true,
        },
        profileImageUrl:{
            type: String,
            default:"https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png",
        },
        role:{
            type: String,
            enum: ["admin","user"],
            default: "user,"
        }

        

    }
,{timestamps:true});

const User = mongoose.model("User",userSchema);

export default User;