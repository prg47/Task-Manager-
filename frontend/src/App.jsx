import React from "react";
import {BrowserRouter,Routes,Route} from "react-router-dom";
import Login from ".pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import ManageTasks from "./pages/admin/ManageTask";
import ManageUsers from "./pages/admin/ManageUsers";
import Dashboard from "./pages/admin/Dashboard";
import CreateTask from "./pages/admin/CreateTask";
import PrivateRoute from "./routes/PrivateRoute";
import MyTasks from "./pages/user/MyTasks";
import TaskDetails from "./pages/user/TaskDetails";
import UserDashboard from "./pages/user/UserDashboard";


const App = ()=>{
  return(
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element = {<Login />} />
          <Route path="/sign-up" element = {<SignUp />} />
          
          {/* Admin routes */}
          <Route element={<PrivateRoute allowedRoles = {["admin"]}/>}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/tasks" element={<ManageTasks />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/create-tasks" element={<CreateTask />} />
          </Route>

          {/* user route */}
          <Route element={<PrivateRoute allowedRoles = {["user"]}/>}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/tasks" element={<MyTasks />} />
            <Route path="/user/task-details/:id" element={<TaskDetails />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App;
