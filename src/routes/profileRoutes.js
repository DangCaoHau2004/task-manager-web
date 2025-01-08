import express from "express";
import { profileController } from "../controllers/profileController.js";
const profileRoute = express.Router();

profileRoute.get("/", profileController);
export { profileRoute };
