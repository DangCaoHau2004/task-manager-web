import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import { Server } from "socket.io";
import http from "http";
import { homePageRoute } from "./routes/homePageRoutes.js";
import { profileRoute } from "./routes/profileRoutes.js";
import { loginRoute, logoutRoute, signUpRoute } from "./routes/authRoutes.js";
import { settingRoute } from "./routes/settingRoutes.js";
import {
  Task,
  detailTasks,
  editTasks,
  deleteTasks,
  addPerson,
  personTask,
} from "./routes/taskRoutes.js";
import { tableRoute, deleteTableRoute } from "./routes/tableRoutes.js";
import { addCardRoute, updateCardRoute } from "./routes/cardRoutes.js";
import { friendRoute, addFriendRoute } from "./routes/friendRoutes.js";
import { editRoleRoute, deleteRoleRoute } from "./routes/roleRoutes.js";
import { chatRoutes, chatMessages } from "./routes/chatRoutes.js";
import { saveMessagesToDB } from "./utils/messages.js";
import { addComment } from "./routes/commentRoutes.js";
import { notification } from "./routes/notificationRotues.js";
import { addNotification } from "./utils/notification.js";
dotenv.config();

const app = express();
const port = 3000;
const server = http.createServer(app);
// tạo một websocket
const io = new Server(server);

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
app.use("/personTask", personTask);
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
app.use("/addPerson", addPerson);
app.use("/addPersonPost", addPerson);

app.use("/editRole", editRoleRoute);
app.use("/deleteRole", deleteRoleRoute);
app.use("/chat", chatRoutes);
app.use("/chat_messages", chatMessages);
app.use("/addComment", addComment);

app.use("/notification", notification);
// Xử lý chat

io.on("connection", (socket) => {
  socket.on("join", (roomId) => {
    socket.join(roomId);
  });

  socket.on("send_message", (data) => {
    //lưu dữ liệu vào db
    saveMessagesToDB(data.message, data.sender_id, data.receiver_id);
    addNotification(data.message, data.receiver_id, "Bạn có tin nhắn mới");
    //đẩy dữ liệu lên web
    socket.emit("receiver_message", {
      sender_id: data.sender_id,
      receiver_id: data.receiver_id,
      message: data.message,
    });
    socket.to(data.roomId).emit("receiver_message", {
      sender_id: data.sender_id,
      receiver_id: data.receiver_id,
      message: data.message,
    });
  });
});

server.listen(port, (req, res) => {
  console.log(`Server running on http://localhost:${port}`);
});
