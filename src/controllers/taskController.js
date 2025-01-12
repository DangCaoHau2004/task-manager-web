import db from "../config/database.js";
import { formatDate } from "../models/formatDate.js";
function addTask(req, res) {
  const {
    project_name,
    description,
    priority,
    startdate,
    enddate,
    type,
    id_user,
  } = req.body;
  if (
    project_name === "" ||
    description === "" ||
    priority === "" ||
    id_user === "" ||
    type === ""
  ) {
    res.redirect("/?errorAddTask=2");
    return;
  }
  db.query(
    `INSERT INTO tasks (name, description, priority, start_date, due_date, type, id_user) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id_tasks;
    `,
    [
      project_name,
      description,
      priority,
      startdate == "" ? null : startdate,
      enddate == "" ? null : enddate,
      type,
      id_user,
    ],
    (err, results) => {
      if (err) {
        res.redirect("/?errorAddTask=1");
        return;
      } else {
        db.query(
          "INSERT INTO user_tasks(id_tasks, id_user, role) VALUES ($1, $2, $3)",
          [results.rows[0].id_tasks, id_user, 1],
          (err, result) => {
            if (err) {
              res.redirect("/?errorAddTask=1");
              return;
            } else {
              res.redirect(`/detail_task?id_tasks=${results.rows[0].id_tasks}`);
              return;
            }
          }
        );
      }
    }
  );
}

async function allTask(req, res) {
  let tasks = null;
  let errorMessage = null;
  let sort = "id_tasks";

  if (req.query.sort) {
    if (
      ["id_tasks", "name", "priority", "start_date", "due_date"].indexOf(
        req.query.sort
      ) != -1
    ) {
      sort = req.query.sort;
    }
  }
  const errorMessages = {
    1: "Có lỗi xảy ra vui lòng thử lại sau",
    2: "Xóa thành công!",
  };
  if (req.session.user) {
    try {
      let resdb = await db.query(
        `SELECT * FROM tasks WHERE id_user = $1 ORDER BY ${sort} ASC`,
        [req.session.user.id_user]
      );
      tasks = resdb.rows;
    } catch (error) {
      return res.redirect("/?errorAddTask=1"); // Không có id_tasks
    }
  }
  if (req.query.errorMessage) {
    errorMessage = errorMessages[req.query.errorMessage];
  }
  if (tasks != null) {
    tasks.forEach((task) => {
      task.start_date = formatDate(task.start_date);
      task.due_date = formatDate(task.due_date);
    });
  }

  res.render("./tasks/all_task.ejs", {
    user: req.session.user,
    tasks: tasks,
    errorMessage: errorMessage,
  });
}
// detail task
async function detailTask(req, res) {
  let errorMessage = null;
  let success = req.query.success ? "Thành công" : null;
  let sort = "id_table";

  // Xử lý các tham số sort
  if (req.query.sort) {
    if (
      ["id_table", "name", "priority", "start_date", "due_date"].indexOf(
        req.query.sort
      ) !== -1
    ) {
      sort = req.query.sort;
    }
  }

  let errorMessages = {
    1: "Bạn chưa điền đủ thông tin",
    2: "Task không tồn tại",
    3: "Có lỗi xảy ra, vui lòng thử lại sau",
    4: "Bạn chưa đăng nhập",
    5: "Bạn không có quyền này!",
  };

  if (req.query.id_tasks) {
    try {
      const results = await db.query(
        `SELECT t.*, ta.id_table, ta.name as name_table, ta.description as description_table, ta.status as status_table, ta.priority as priority_table, ta.start_date AS start_date_table, ta.due_date as due_date_table 
        FROM tasks as t 
        LEFT JOIN tables as ta ON ta.id_tasks = t.id_tasks 
        WHERE t.id_tasks = $1 
        ORDER BY ta.${sort}`,
        [req.query.id_tasks]
      );

      let tables = [];
      let tasks = {};

      if (results.rows && results.rows.length > 0) {
        let taskFound = false;
        if (
          parseInt(results.rows[0].type) == 1 &&
          parseInt(results.rows[0].type) != parseInt(req.session.user.id_user)
        ) {
          return res.render("./tasks/detail_task.ejs", {
            user: req.session.user,
            errorMessage: errorMessage,
            tasks: tasks,
            tables: tables,
            success: success,
          });
        }
        // Chia tách các thuộc tính của task và bảng (table)
        Object.entries(results.rows[0]).forEach(([key, value]) => {
          if (!key.includes("table")) {
            tasks[key] = value;
            taskFound = true;
          }
        });

        tasks.start_date_formart = formatDate(tasks.start_date);
        tasks.due_date_formart = formatDate(tasks.due_date);

        if (results.rows[0].id_table) {
          results.rows.forEach((result) => {
            let table = {};
            Object.entries(result).forEach(([key, value]) => {
              if (key.includes("table")) {
                table[key] = value;
              }
            });

            table.start_date_formart = formatDate(table.start_date_table);
            table.due_date_formart = formatDate(table.due_date_table);
            tables.push(table);
          });

          if (!taskFound) {
            errorMessage = "Không tìm thấy task liên kết với bảng này.";
          }

          if (req.query.errorMessage) {
            errorMessage = errorMessages[req.query.errorMessage];
          }
        }
      } else {
        errorMessage = errorMessages[2];
      }
      if (req.query.errorMessage) {
        errorMessage = errorMessages[req.query.errorMessage];
      }

      // Render lại view với dữ liệu
      res.render("./tasks/detail_task.ejs", {
        user: req.session.user,
        errorMessage: errorMessage,
        tasks: tasks,
        tables: tables,
        success: success,
      });
    } catch (err) {
      console.error(err);
      res.redirect("/?errorAddTask=3");
    }
  } else {
    errorMessage = errorMessages[2];
    res.render("./tasks/detail_task.ejs", {
      user: req.session.user,
      errorMessage: errorMessage,
    });
  }
}

async function editTask(req, res) {
  if (!req.session.user) {
    return res.redirect("/login-signUp"); // User not logged in
  }

  if (!req.query.id_tasks) {
    return res.redirect("/?errorAddTask=1"); // Missing task ID
  }

  let errorMessage = null;
  let success = null;

  // Handling error and success messages
  if (req.query.errorMessage) {
    const errorMessages = {
      1: "Bạn chưa điền đủ thông tin!", // Missing information
      2: "Không tìm thấy task!", // Task not found
      5: "Bạn không có quyền chỉnh sửa task này!", // No permission to edit task
    };
    errorMessage = errorMessages[req.query.errorMessage];
  }

  if (req.query.success) {
    const successMessages = {
      1: "Thành công", // Successful operation
    };
    success = successMessages[req.query.success];
  }

  try {
    // Check if the user has permission to edit the task
    const result = await db.query(
      "SELECT * FROM user_tasks WHERE id_user = $1 AND id_tasks = $2",
      [req.session.user.id_user, req.query.id_tasks]
    );

    if (result.rows.length === 0) {
      return res.redirect(
        `/detail_task?id_tasks=${req.query.id_tasks}&errorMessage=5`
      );
    }

    const role = parseInt(result.rows[0].role);

    // If user has role > 2, deny access
    if (role > 2) {
      return res.redirect(
        `/detail_task?id_tasks=${req.query.id_tasks}&errorMessage=5`
      );
    }

    // If user has permission (role <= 2), fetch task details
    const taskResult = await db.query(
      "SELECT * FROM tasks WHERE id_tasks = $1",
      [req.query.id_tasks]
    );

    if (taskResult.rows.length === 0) {
      return res.redirect("/?errorAddTask=2"); // Task not found
    }

    // Render the edit task page
    res.render("./tasks/edit_task.ejs", {
      user: req.session.user,
      tasks: taskResult.rows[0],
      errorMessage: errorMessage,
      success: success,
    });
  } catch (err) {
    res.redirect("/?errorAddTask=1"); // General error
  }
}

async function editTaskPost(req, res) {
  if (req.session.user) {
    let errorMessage = null;

    const {
      id_tasks,
      project_name,
      description,
      priority,
      startdate,
      enddate,
      type,
      id_user,
    } = req.body;

    // Kiểm tra nếu không có id_tasks
    if (!id_tasks) {
      return res.redirect("/?errorAddTask=1");
    }

    // Kiểm tra nếu thiếu thông tin cần thiết
    if (!project_name || !description || !priority || !type) {
      errorMessage = 1;
      return res.redirect(
        `/editTask?id_tasks=${id_tasks}&errorMessage=${errorMessage}`
      );
    }

    try {
      // Kiểm tra quyền người dùng
      const result = await db.query(
        "SELECT * FROM user_tasks WHERE id_user = $1 AND id_tasks = $2",
        [id_user, id_tasks]
      );

      // Nếu không tìm thấy bản ghi
      if (result.rows.length === 0) {
        return res.redirect(`/detail_task?id_tasks=${id_tasks}&errorMessage=5`);
      }

      let role = parseInt(result.rows[0].role);

      // Nếu quyền người dùng > 2, chuyển hướng
      if (role > 2) {
        return res.redirect(`/detail_task?id_tasks=${id_tasks}&errorMessage=5`);
      }

      if (role <= 2) {
        // Cập nhật thông tin task
        await db.query(
          "UPDATE tasks SET name = $1, description = $2, priority = $3, start_date = $4, due_date = $5, type = $6 WHERE id_tasks = $7",
          [
            project_name,
            description,
            priority,
            startdate === "" ? null : startdate,
            enddate === "" ? null : enddate,
            type,
            id_tasks,
          ]
        );
        return res.redirect(`/detail_task?id_tasks=${id_tasks}&success=1`);
      }
    } catch (err) {
      console.error("Database error:", err);
      return res.redirect("/?errorAddTask=1");
    }
  } else {
    return res.redirect("/login-signUp");
  }
}

async function deleteTask(req, res) {
  if (req.session.user) {
    if (req.body.id_tasks) {
      try {
        // Kiểm tra quyền của người dùng
        const result = await db.query(
          "SELECT * FROM user_tasks WHERE id_user = $1 AND id_tasks = $2",
          [req.session.user.id_user, req.body.id_tasks]
        );

        // Nếu không tìm thấy bản ghi
        if (result.rows.length === 0) {
          return res.redirect(
            `/detail_task?id_tasks=${req.body.id_tasks}&errorMessage=5`
          );
        }

        let role = parseInt(result.rows[0].role);

        // Nếu quyền người dùng > 2, chuyển hướng
        if (role > 2) {
          return res.redirect(
            `/detail_task?id_tasks=${req.body.id_tasks}&errorMessage=5`
          );
        }

        if (role === 1) {
          // Xóa task
          await db.query("DELETE FROM tasks WHERE id_tasks = $1", [
            req.body.id_tasks,
          ]);

          return res.redirect("/");
        }
      } catch (err) {
        console.error("Database error:", err);
        return res.redirect("/?errorAddTask=1");
      }
    } else {
      return res.redirect("/?errorAddTask=1");
    }
  } else {
    return res.redirect("/login-signUp");
  }
}

export { addTask, allTask, detailTask, editTask, editTaskPost, deleteTask };
