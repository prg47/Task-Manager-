import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
    },

    description:{
        type: String,
    },

    priority:{
        type: String,
        enum: ["Low","Medium","High"],
        default: "Low",
    },

    status: {
        type: String,
        enum : ["Completed","Pending","In Progress"],
        default : "Pending",
    },

    dueDate : {
        type: Date,
        requied: true,
    },

    assignedTo:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],

    createdBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
        }
    ],

    attachments:[
        {
            type: String,
        },
    ],

    todoCheckList: [todoSchema],

    progress:{
        type: Number,
        default: 0,
    },

    
},{timestamps:true});

const Task = mongoose.model("Task",taskSchema);

export default Task;