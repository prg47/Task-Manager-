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

export const updateTaskChecklist = async(req,res,next)=>{
    try{
        const {todoCheckList} = req.body;
        const task = await Task.findById(req.params.id);
        

        if(!task){
            return next(errorHandler(404,"Task not found"));
        }

        if(!task.assignedTo.includes(req.user.id) && req.user.role !== "admin"){
            return next(errorHandler(403,"Not Authorized"));
        }

        task.todoCheckList = todoCheckList

        const completedCount = task.todoCheckList.filter((item)=>item.completed).length;
        const totalItems = task.todoCheckList.length;

        task.progress  = totalItems>0?Math.round((completedCount/totalItems)*100):0;

        if(task.progress === 100){
            task.status = "Completed";
        }else if(task.progress>0){
            task.status = "In Progress";
        }else{
            task.status = "Pending";
        }

        await task.save();

        const updatedTask = await Task.findById(req.params.id).populate("assignedTo","name email profileImageUrl")

        res.status(200).json({message:"Task checklist uodated",task: updatedTask});
    }catch(error){
        next(error);
    }
}

export const getDashboardData = async(req,res,next)=>{
    try{
        //fetch stats
        const totalTasks = await Task.countDocuments();
        const pendingTasks = await Task.countDocuments({status: "Pending"});
        const CompletedTasks = await Task.countDocuments({status: "Completed"});
        const overdueTasks = await Task.countDocuments({
            status: {$ne: "Completed"},
            dueDate: {$lt: new Date()}
        })

        const taskStatuses = ["Pending","In Progress","Completed"]

        const taskDistributionRaw = await Task.aggregate([
            {
                $group:{
                    _id: "$status",
                    count: {$sum: 1}
                },
            },
        ])

        const taskDistribution = taskStatuses.reduce((acc,status)=>{
            const formattedKey = status.replace(/\s+/g,"");//remove spaces
            acc[formattedKey] = taskDistributionRaw.find((item)=>item._id===status)?.count || 0

            return acc
        },{})

        taskDistribution["All"] = totalTasks;

        const taskPriorities = ["Low","Medium","High"]

        const taskPriorityRaw = await Task.aggregate([
            {
                $group:{
                    _id: "$priority",
                    count: {$sum:1},
                },

        },])

        const taskPriorityLevel = taskPriorities.reduce((acc,priority)=>{
            acc[priority] = taskPriorityRaw.find((item)=>item._id===priority)?. count || 0
            return acc
        },{})

        //Fetch recent 10 tasks
        const recentTasks = await Task.find().sort({createdAt: -1}).limit(10).select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics:{
                totalTasks,
                pendingTasks,
                CompletedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                taskPriorityLevel,
            },
            recentTasks,
        })

    }catch(error){
        next(error);
    }
}