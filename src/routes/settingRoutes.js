import express from "express";
import {
  settingController,
  changePassword,
} from "../controllers/settingController.js";
const settingRoute = express.Router();

settingRoute.get("/", settingController);
settingRoute.post("/", changePassword);

export { settingRoute };
