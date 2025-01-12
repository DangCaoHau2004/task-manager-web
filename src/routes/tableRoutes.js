import express from "express";
import {
  tableGetController,
  tablePostController,
  deleteTable,
} from "../controllers/tableController.js";
const tableRoute = new express.Router();
const deleteTableRoute = new express.Router();
tableRoute.get("/", tableGetController);
tableRoute.post("/", tablePostController);
deleteTableRoute.post("/", deleteTable);
export { tableRoute, deleteTableRoute };
