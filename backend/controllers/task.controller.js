import { errorHandler } from "../utils/error.js";
import Task from "../models/task.model.js";

export const createTask = async(req,res,next)=>{
    try{
        const {
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            attachments,
            todoChecklist} = req.body;

        if(!Array.isArray(assignedTo)){
            return next(errorHandler(400,"assignedto must be an array"));
        }

        const task = await Task.create({
            title,description,priority,dueDate,assignedTo,attachments,todoChecklist,createdBy: req.user.id
        })

        res.status(201).json({message:"task created succesfully",task});
    }catch(error){
        next(error);
    }

}