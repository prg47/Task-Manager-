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

export const getTasks = async(req,res,next)=>{
    try{
        const {status} = req.query;
        let filter = {};

        if(status){
            filter.status = status;
        }

        let tasks;

        if(req.user.role === "admin"){
            tasks = await Task.find(filter).populate(
                "assignedTo","name email profileImageUrl"
            )
        }else{
            tasks = await Task.find({
                ...filter,
                assignedTo: req.user.id,
            }).populate("assignedTo","name email profileImageUrl");
        }

        tasks = await Promise.all(
            tasks.map(async(task)=>{
                const completedCount = task.todoCheckList.filter((item)=>item.completed).length;
                return {...task._doc, completedCount: completedCount}
            })
        )

        //status summary count
        const allTasks = await Task.countDocuments(
            req.user.role === "admin"?{}:{assignedTo: req.user.id}
        )

        const pendingTasks = await Task.countDocuments({
            ...filter,
            status: "Pending",
            ...(req.user.role !== "admin" && {assignedTo: req.user.id})
        })

        const inProgressTasks = await Task.countDocuments({
            ...filter,
            status: "In Progress",
            ...(req.user.role !== "admin" && {assignedTo: req.user.id})
        })

        const CompletedTasks = await Task.countDocuments({
            ...filter,
            status: "Completed",
            ...(req.user.role !== "admin" && {assignedTo: req.user.id})
        })

        res.status(200).json({
            tasks,
            statusSummary: {
                all: allTasks,
                pendingTasks,
                inProgressTasks,
                CompletedTasks,
            }
        })

    }catch(error){
        next(error);
    }
}

export const getTaskById  = async(req,res,next)=>{
    try{
        const task = await Task.findById(req.params.id).populate("assignedTo","name email profileImageUrl");
        if(!task){
            return next(errorHandler(404,"Task not found"));
        }
        res.status(200).json(task);
    }catch(error){
        next(error);
    }
}

export const updateTask = async(req,res,next)=>{
    try{
        const task = await Task.findById(req.params.id);
        if(!task){
            return next(errorHandler(404,"Task not found"));
        }

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.priority = req.body.priority || task.priority;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.attachments = req.body.attachments || task.attachments;

        if(req.body.assignedTo){
            if(!Array.isArray(req.body.assignedTo)){
                return next(errorHandler(400,"Assigned to should be array"));
            }
            task.assignedTo = req.body.assignedTo;
        }
        const updatedTask = await task.save();
        return res.status(200).json({updatedTask,message:"Task updated successfully"});
    }catch(error){
        next(error);
    }
}

export const deleteTask = async(req,res,next)=>{
    try{
        const task = await Task.findById(req.params.id)
        if(!task){
            return next(errorHandler(404,"Task not found"));
        }

        await task.deleteOne();

        res.status(200).json({message:"task deleted succesfully"});
    }catch(error){
        next(error);
    }
}

export const updateTaskStatus = async(req,res,next)=>{
    try{
        const task = await Task.findById(req.params.id);
        if(!task){
            return next(errorHandler(404,"Task not found"));
        }
        const isAssigned = task.assignedTo.some((userId)=>userId.toString()===req.user.id.toString());
        if(!isAssigned && req.user.role !== "admin"){
            return next(errorHandler(403,"Unauthorized"));
        }

        task.status = req.body.status || task.status;

        if(task.status === "Completed"){
            task.todoCheckList.forEach((item)=>(item.completed = true))
        }

        await task.save();
        res.status(200).json({message:"Task status updated"});
    }catch(error){
        next(error);
    }
}