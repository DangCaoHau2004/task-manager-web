import express from "express";
import { addCommentController } from "../controllers/commentController.js";
const addComment = express.Router();
addComment.post("/", addCommentController);
export { addComment };
