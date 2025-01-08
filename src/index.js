import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import { homePageRoute } from "./routes/homePageRoutes.js";
import { profileRoute } from "./routes/profileRoutes.js";
import { loginRoute, logoutRoute, signUpRoute } from "./routes/authRoutes.js";
import { settingRoute } from "./routes/settingRoutes.js";
import { Task } from "./routes/taskRoutes.js";
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
//   // Xử lý riêng cho all_task
//   if (other_page === "all_task") {
//     if (!req.session.user) {
//       return res.render(`${other_page}.ejs`, {
//         user: null,
//         error: "Bạn cần đăng nhập để xem nhiệm vụ.",
//       });
//     }

//     db.query(
//       "SELECT * FROM tasks WHERE id_user = $1",
//       [req.session.user.id_user],
//       (err, result) => {
//         if (err) {
//           console.log("Error: ", err);
//           return res.render(`${other_page}.ejs`, {
//             user: req.session.user,
//             error: "Có lỗi xảy ra trong quá trình lấy danh sách nhiệm vụ.",
//           });
//         }
//         console.log(result.rows);

//         // Thành công, render với dữ liệu
//         return res.render(`${other_page}.ejs`, {
//           user: req.session.user,
//           error: null,
//           tasks: result.rows,
//         });
//       }
//     );
//     console.log("2");

//     return;
//   }

//   res.render(`${other_page}.ejs`, {
//     user: req.session.user,
//     error: errorMessage,
//   });
// });

app.listen(port, (req, res) => {
  console.log(`Server running on http://localhost:${port}`);
});
