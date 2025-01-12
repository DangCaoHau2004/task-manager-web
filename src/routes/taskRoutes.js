import express from "express";
import {
  addTask,
  allTask,
  detailTask,
  editTask,
  editTaskPost,
  deleteTask,
} from "../controllers/taskController.js";
const Task = express.Router();
const detailTasks = express.Router();
const editTasks = express.Router();
const deleteTasks = express.Router();
Task.post("/", addTask);
Task.get("/", allTask);
detailTasks.get("/", detailTask);
editTasks.get("/", editTask);
editTasks.post("/", editTaskPost);
deleteTasks.post("/", deleteTask);
export { Task, detailTasks, editTasks, deleteTasks };
