import express from "express";
import { friendGetController } from "../controllers/friendsController.js";
const friendRoute = express.Router();
friendRoute.get("/", friendGetController);
export { friendRoute };
