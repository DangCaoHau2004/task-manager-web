import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import { homePageRoute } from "./routes/homePageRoutes.js";
import { profileRoute } from "./routes/profileRoutes.js";
import { loginRoute, logoutRoute, signUpRoute } from "./routes/authRoutes.js";
import { settingRoute } from "./routes/settingRoutes.js";
import {
  Task,
  detailTasks,
  editTasks,
  deleteTasks,
} from "./routes/taskRoutes.js";
import { tableRoute, deleteTableRoute } from "./routes/tableRoutes.js";
import { addCardRoute, updateCardRoute } from "./routes/cardRoutes.js";
import { friendRoute, addFriendRoute } from "./routes/friendRoutes.js";
friendRoute;
dotenv.config();

const app = express();
const port = 3000;

//middleware
app.use(express.urlencoded({ extended: true })); // phân tích dữ liệu từ form
app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {},
  })
);

//route
app.use("/", homePageRoute);
app.use("/index", homePageRoute);
app.use("/profile", profileRoute);
app.use("/setting", settingRoute);
app.use("/login-signUp", loginRoute);
app.use("/login", loginRoute);
app.use("/register", signUpRoute);
app.use("/logout", logoutRoute);
app.use("/change-password", settingRoute);
app.use("/addTask", Task);
app.use("/allTask", Task);
app.use("/detail_task", detailTasks);
app.use("/editTask", editTasks);
app.use("/deleteTask", deleteTasks);
app.use("/edit-profile", profileRoute);
app.use("/detail_table", tableRoute);
app.use("/addTable", tableRoute);
app.use("/deleteTable", deleteTableRoute);
app.use("/addCard", addCardRoute);
app.use("/completeCard", updateCardRoute);
app.use("/friend", friendRoute);
app.use("/addFriend", addFriendRoute);

app.listen(port, (req, res) => {
  console.log(`Server running on http://localhost:${port}`);
});
