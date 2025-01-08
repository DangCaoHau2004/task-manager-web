import express from "express";
import { addTask } from "../controllers/taskController.js";
const Task = express.Router();
Task.post("/", addTask);
export { Task };
