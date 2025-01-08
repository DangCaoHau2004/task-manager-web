import express from "express";
import homePageController from "../controllers/homePageController.js";
const homePageRoute = express.Router();

homePageRoute.get("/", homePageController);

export { homePageRoute };
