import express from "express";
import {
  login_signUp,
  login,
  register,
  logout,
} from "../controllers/authController.js";
const loginRoute = express.Router();
const logoutRoute = express.Router();
const signUpRoute = express.Router();
loginRoute.get("/", login_signUp);
loginRoute.post("/", login);
signUpRoute.post("/", register);
logoutRoute.post("/", logout);
export { loginRoute, logoutRoute, signUpRoute };
