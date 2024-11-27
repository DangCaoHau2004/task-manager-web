import express from "express";
import dotenv from "dotenv";
const app = express();
const port = 3000;
app.use(express.static("public"));
app.get("/", (req, res) => {
  req.user = { name: "Đặng Cao Hậu", tuoi: 20 };
  res.render("index.ejs", { user: req.user });
});
app.listen(port, (req, res) => {
  console.log(`Server running on http://localhost:${port}`);
});
