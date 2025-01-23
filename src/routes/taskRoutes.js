import express from "express";
import {
  addTask,
  allTask,
  detailTask,
  editTask,
  editTaskPost,
  deleteTask,
  addPersonGet,
  addPersonPost,
  personTaskGet,
} from "../controllers/taskController.js";
const Task = express.Router();
const detailTasks = express.Router();
const editTasks = express.Router();
const deleteTasks = express.Router();
const addPerson = express.Router();
const personTask = express.Router();
Task.post("/", addTask);
Task.get("/", allTask);
detailTasks.get("/", detailTask);
editTasks.get("/", editTask);
editTasks.post("/", editTaskPost);
deleteTasks.post("/", deleteTask);
addPerson.get("/", addPersonGet);
addPerson.post("/", addPersonPost);
personTask.get("/", personTaskGet);
export { Task, detailTasks, editTasks, deleteTasks, addPerson, personTask };
