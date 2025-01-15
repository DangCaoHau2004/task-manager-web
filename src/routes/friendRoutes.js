import express from "express";
import {
  friendGetController,
  addFriend,
} from "../controllers/friendsController.js";
const friendRoute = express.Router();
const addFriendRoute = express.Router();
friendRoute.get("/", friendGetController);
addFriendRoute.post("/", addFriend);
export { friendRoute, addFriendRoute };
