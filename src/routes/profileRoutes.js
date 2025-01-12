import express from "express";
import {
  profileController,
  editProfile,
} from "../controllers/profileController.js";
const profileRoute = express.Router();

profileRoute.get("/", profileController);
profileRoute.post("/", editProfile);
export { profileRoute };
