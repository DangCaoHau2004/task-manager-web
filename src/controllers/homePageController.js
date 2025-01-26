import db from "../config/database.js";
import { formatDate } from "../utils/formatDate.js";
async function homePageController(req, res) {
  let errorMessage = null;

  if (req.query.errorAddTask) {
    const errorMessages = {
      1: "Có lỗi xảy ra vui lòng thử lại sau",
      2: "Bạn chưa điền đủ thông tin",
    };
    errorMessage = errorMessages[req.query.errorAddTask];
  }

  if (req.query.errorProfile) {
    const errorMessages = {
      1: "Có lỗi xảy ra vui lòng thử lại sau",
      2: "Không tồn tại user",
    };
    errorMessage = errorMessages[req.query.errorProfile];
  }
  let resultTask = await db.query(
    "SELECT * FROM tasks ORDER BY start_date, created_at DESC LIMIT 5"
  );
  let recentProject = [];
  // nếu như không tồn tại tasks nào và chưa đăng nhập!

  if (resultTask.rows.length == 0 || !req.session.user) {
    res.render("index.ejs", {
      user: req.session.user,
      errorMessage: errorMessage,
      recentProject: recentProject,
    });
  }

  for (let index = 0; index < resultTask.rows.length; index++) {
    // đổi lại định dạng ngày
    resultTask.rows[index].start_date = formatDate(
      resultTask.rows[index].start_date
    );
    resultTask.rows[index].due_date = formatDate(
      resultTask.rows[index].due_date
    );
    // đếm số comment trong task
    let count_cm = await db.query(
      "SELECT COUNT(*) as count_cm FROM comments WHERE id_tasks = $1",
      [resultTask.rows[index].id_tasks]
    );

    let count_tb = await db.query(
      "SELECT COUNT(*) as count_tb FROM tables WHERE id_tasks = $1",
      [resultTask.rows[index].id_tasks]
    );
    resultTask.rows[index].count_cm = count_cm.rows[0].count_cm;
    resultTask.rows[index].count_tb = count_tb.rows[0].count_tb;

    recentProject.push(resultTask.rows[index]);
  }

  res.render("index.ejs", {
    user: req.session.user,
    errorMessage: errorMessage,
    recentProject: recentProject,
  });
}

export default homePageController;
