import db from "../config/database.js";
import { formatDate } from "../utils/formatDate.js";
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
  let tasks = [];
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
      // Đẩy thêm dữ liệu của task mà mình đã tham gia

      // lấy các task được liên kết với id_user
      let resdb = await db.query(
        `
        SELECT 
          t.*
          FROM tasks AS t
          INNER JOIN user_tasks AS ut ON ut.id_tasks = t.id_tasks
          WHERE ut.id_user = $1
          Order by t.${sort}
          `,
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
  if (tasks.length > 0) {
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
  let role = 4;
  // mặc định quyền là người xem
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
    6: "Không thể xem danh sách người tham gia do task đang ở chế độ personal",
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

        // lấy dữ liệu comment
        let ResultComment = await db.query(
          "SELECT u.*, c.created_at as cm_create, c.content FROM comments as c INNER JOIN users as u ON u.id_user = c.id_user WHERE c.id_tasks = $1 ORDER BY c.created_at",
          [req.query.id_tasks]
        );
        let comments = ResultComment.rows;

        for (let i = 0; i < comments.length; i++) {
          comments[i].cm_create = formatDate(comments[i].cm_create);
        }
        // nếu chưa đăng nhập
        if (!req.session.user) {
          // chưa đăng nhập vẫn được xem với điều kiện task được đăng công khai
          if (parseInt(results.rows[0].type) != 1) {
            // Render lại view với dữ liệu
            return res.render("./tasks/detail_task.ejs", {
              user: req.session.user,
              errorMessage: errorMessage,
              tasks: tasks,
              tables: tables,
              success: success,
              role: role,
              comments: comments,
            });
          }
          // nếu không được đăng công khai thì cần đăng nhập
          return res.redirect("/login-signUp");
        }
        // nếu là ko được đăng công khai và người dùng ko phải admin
        if (
          parseInt(results.rows[0].type) == 1 &&
          parseInt(results.rows[0].id_user) !=
            parseInt(req.session.user.id_user)
        ) {
          return res.render("./tasks/detail_task.ejs", {
            user: req.session.user,
            errorMessage: errorMessage,
            tasks: tasks,
            tables: tables,
            success: success,
            role: role,
          });
        }
      } else {
        // xử lý ko tồn tại id_tasks
        errorMessage = errorMessages[2];
      }
      if (req.query.errorMessage) {
        errorMessage = errorMessages[req.query.errorMessage];
      }
      // xác định quyền người dùng đối với tasks
      let resultRole = await db.query(
        "SELECT role FROM user_tasks WHERE id_tasks = $1 AND id_user = $2",
        [req.query.id_tasks, req.session.user.id_user]
      );
      role = resultRole.rows[0].role;
      // lấy dữ liệu comment
      let ResultComment = await db.query(
        "SELECT u.*, c.created_at as cm_create, c.content FROM comments as c INNER JOIN users as u ON u.id_user = c.id_user WHERE c.id_tasks = $1 ORDER BY c.created_at",
        [req.query.id_tasks]
      );
      let comments = ResultComment.rows;

      for (let i = 0; i < comments.length; i++) {
        comments[i].cm_create = formatDate(comments[i].cm_create);
      }

      // Render lại view với dữ liệu
      res.render("./tasks/detail_task.ejs", {
        user: req.session.user,
        errorMessage: errorMessage,
        tasks: tasks,
        tables: tables,
        success: success,
        role: role,
        comments: comments,
      });
    } catch (err) {
      console.error(err);
      res.redirect("/?errorAddTask=1");
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
    return res.redirect("/login-signUp");
  }

  if (!req.query.id_tasks) {
    return res.redirect("/?errorAddTask=1");
  }

  let errorMessage = null;
  let success = null;

  if (req.query.errorMessage) {
    const errorMessages = {
      1: "Bạn chưa điền đủ thông tin!",
      2: "Không tìm thấy task!",
      5: "Bạn không có quyền chỉnh sửa task này!",
    };
    errorMessage = errorMessages[req.query.errorMessage];
  }

  if (req.query.success) {
    const successMessages = {
      1: "Thành công",
    };
    success = successMessages[req.query.success];
  }

  try {
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

    if (role > 2) {
      return res.redirect(
        `/detail_task?id_tasks=${req.query.id_tasks}&errorMessage=5`
      );
    }

    const taskResult = await db.query(
      "SELECT * FROM tasks WHERE id_tasks = $1",
      [req.query.id_tasks]
    );

    if (taskResult.rows.length === 0) {
      return res.redirect("/?errorAddTask=2");
    }

    res.render("./tasks/edit_task.ejs", {
      user: req.session.user,
      tasks: taskResult.rows[0],
      errorMessage: errorMessage,
      success: success,
    });
  } catch (err) {
    res.redirect("/?errorAddTask=1");
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
            `/detail_task?id_tasks=${req.body.id_tasks}&errorMessage=3`
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

async function addPersonGet(req, res) {
  if (req.session.user) {
    let tasks = null;
    let friends = [];
    if (req.query.id_tasks) {
      try {
        const resultTask = await db.query(
          "SELECT * FROM tasks WHERE id_tasks = $1",
          [req.query.id_tasks]
        );

        if (resultTask.rows.length === 0) {
          return res.redirect(
            `/detail_task?id_tasks=${req.query.id_tasks}&errorMessage=5`
          );
        }
        tasks = resultTask.rows[0];
        tasks.start_date_formart = formatDate(tasks.start_date);
        tasks.due_date_formart = formatDate(tasks.due_date);
        const roleResult = await db.query(
          "SELECT * FROM user_tasks WHERE id_user = $1 AND id_tasks = $2",
          [req.session.user.id_user, req.query.id_tasks]
        );

        if (
          roleResult.rows.length === 0 ||
          (roleResult.rows[0].role !== "1" && roleResult.rows[0].role !== "2")
        ) {
          return res.redirect(
            `/detail_task?id_tasks=${req.query.id_tasks}&errorMessage=5`
          );
        }

        const resultFriend = await db.query(
          "SELECT * FROM friend WHERE accept = 1 AND (id_user = $1 OR id_friend = $1)",
          [req.session.user.id_user]
        );

        if (resultFriend.rows.length === 0) {
          return res.redirect("/friend?errorMessage=1");
        }

        for (const friend of resultFriend.rows) {
          const friend_id =
            friend.id_user === req.session.user.id_user
              ? friend.id_friend
              : friend.id_user;
          const friendInfoResult = await db.query(
            "SELECT * FROM users WHERE id_user = $1",
            [friend_id]
          );

          if (friendInfoResult.rows.length > 0) {
            friends.push(friendInfoResult.rows[0]);
          }
        }
      } catch (error) {
        console.error(error);
        return res.redirect("/?errorAddTask=1");
      }
    }

    res.render("./tasks/add_person.ejs", {
      user: req.session.user,
      tasks: tasks,
      friends: friends,
    });
  } else {
    return res.redirect("/login-signUp");
  }
}

async function addPersonPost(req, res) {
  if (req.session.user) {
    let { type, id_tasks, name, role } = req.body;

    if (!type || !name || !role || !id_tasks) {
      // chuyển hướng lại giao diện nãy và báo lỗi
      return res.redirect(`/addPerson?id_tasks=${id_tasks}`);
    }
    // nếu task đang để chế độ business
    if (type != 1) {
      if (!Array.isArray(name)) {
        name = [name];
      }
      if (!Array.isArray(role)) {
        role = [role];
      }

      try {
        for (let index = 0; index < name.length; index++) {
          await db.query(
            `DO $$ BEGIN
                  IF NOT EXISTS (SELECT 1 FROM user_tasks WHERE id_tasks = ${id_tasks} AND id_user = ${name[index]}) THEN
                      INSERT INTO user_tasks (id_tasks, id_user, role)
                      VALUES (${id_tasks}, ${name[index]}, ${role[index]});
                  END IF;
              END
            $$;`
          );
        }
        res.redirect(`/detail_task?id_tasks=${id_tasks}&success=1`);
      } catch (error) {
        console.log(error);
        return res.redirect("/?errorAddTask=1");
      }
    } else {
      return res.redirect("/?errorAddTask=1");
    }
  } else {
    return res.redirect("/login-signUp");
  }
}

// hiển thị danh sách người tham gia task
async function personTaskGet(req, res) {
  const id_tasks = req.query.id_tasks;
  let errorMessage = null;
  let type = await db.query("SELECT type FROM tasks WHERE id_tasks = $1", [
    id_tasks,
  ]);
  let errorMessages = { 1: "Bạn không có quyền này" };
  // nếu như là personal thì ko được phép xem
  if (type.rows[0] == 1) {
    return res.redirect(`/detail_task?id_tasks=${id_tasks}&errorMessage=6`);
  }
  let tasks = [];
  let userInTasks = [];
  try {
    let resultAllPerson = await db.query(
      "SELECT t.*, ut.role, u.name as username, ut.id_user as id_username FROM tasks as t INNER JOIN user_tasks as ut ON ut.id_tasks = t.id_tasks INNER JOIN users as u ON u.id_user = ut.id_user WHERE t.id_tasks = $1 ORDER BY ut.role",
      [id_tasks]
    );
    // nếu như ko có phần tử nào thì báo lỗi về trang chi tiết của nó
    if (resultAllPerson.rows.length == 0) {
      return res.redirect(`/detail_task?id_tasks=${id_tasks}&errorMessage=2`);
    }
    tasks = resultAllPerson.rows[0];
    tasks.start_date_formart = formatDate(tasks.start_date);
    tasks.due_date_formart = formatDate(tasks.due_date);
    userInTasks = resultAllPerson.rows;
  } catch (error) {
    console.log(error);

    return res.redirect("/?errorAddTask=1");
  }
  if (req.query.errorMessage) {
    errorMessage = errorMessages[req.query.errorMessage];
  }
  res.render("./tasks/person_tasks.ejs", {
    user: req.session.user,
    tasks: tasks,
    userInTasks: userInTasks,
    errorMessage: errorMessage,
  });
}

export {
  addTask,
  allTask,
  detailTask,
  editTask,
  editTaskPost,
  deleteTask,
  addPersonGet,
  addPersonPost,
  personTaskGet,
};
