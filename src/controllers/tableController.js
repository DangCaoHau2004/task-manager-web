import db from "../config/database.js";
import { formatDate } from "../utils/formatDate.js";
function tableGetController(req, res) {
  if (req.query.id_table) {
    let errorMessage = null;
    let success = req.query.success ? "Thành công" : null;

    // Kiểm tra sự tồn tại của id_table trong bảng cards
    db.query(
      "SELECT 1 FROM cards WHERE id_table = $1 LIMIT 1",
      [req.query.id_table],
      (err, resultCheck) => {
        if (err) {
          // Nếu có lỗi trong quá trình truy vấn, chuyển hướng về trang chủ với thông báo lỗi
          res.redirect("/?errorAddTask=1");
          return;
        } else {
          let table = null;
          let cards = null;
          if (req.query.errorMessage) {
            let errorMessages = {
              1: "Có lỗi xảy ra, vui lòng thử lại sau!",
              2: "Bạn chưa điền đủ thông tin",
              3: "Bạn không có quyền này!",
            };
            errorMessage = errorMessages[req.query.errorMessage];
          }
          if (resultCheck.rowCount > 0) {
            // Nếu tìm thấy bản ghi, tiếp tục truy vấn lấy thông tin bảng và thẻ
            db.query(
              "SELECT t.*, c.id_card, c.name as name_card, c.status as status_card FROM tables as t INNER JOIN cards c ON c.id_table = t.id_table WHERE t.id_table = $1 ORDER BY c.id_card",
              [req.query.id_table],
              (err, result) => {
                if (err) {
                  res.redirect("/?errorAddTask=1");
                } else {
                  table = result.rows[0];
                  cards = result.rows;

                  let cardUndone = [];
                  let cardComplete = [];
                  for (let card in cards) {
                    if (cards[card].status_card == "Undone") {
                      cardUndone.push(cards[card]);
                    } else {
                      cardComplete.push(cards[card]);
                    }
                  }

                  if (result) {
                    // xử lý ngày cho định dạng dd/mm/yyyy hh:mm
                    table.start_date_formart = formatDate(table.start_date);
                    table.due_date_formart = formatDate(table.due_date);
                  }

                  // Render kết quả ra giao diện
                  res.render("./tables/detail_table.ejs", {
                    user: req.session.user,
                    table: table,
                    cardUndone: cardUndone,
                    cardComplete: cardComplete,
                    errorMessage: errorMessage,
                    success: success,
                  });
                }
              }
            );
          } else {
            db.query(
              "SELECT * FROM tables WHERE id_table = $1",
              [req.query.id_table],
              (err, resultTable) => {
                if (err) {
                  res.redirect("/?errorAddTask=1");
                  return;
                } else {
                  table = resultTable.rows[0];
                  res.render("./tables/detail_table.ejs", {
                    user: req.session.user,
                    table: table,
                    cards: cards,
                    errorMessage: errorMessage,
                    success: success,
                  });
                }
              }
            );
          }
        }
      }
    );
  } else {
    // Nếu không có id_table trong query, chuyển hướng về trang chủ
    res.redirect("/?errorAddTask=1");
  }
}
async function tablePostController(req, res) {
  const {
    project_name,
    description,
    priority,
    startdate,
    enddate,
    id_user,
    id_tasks,
  } = req.body;

  if (req.session.user) {
    // Kiểm tra nếu thiếu thông tin cần thiết
    if (!project_name || !description || !priority || !id_user) {
      return res.redirect(`/detail_task?id_tasks=${id_tasks}&errorMessage=1`);
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

      const role = result.rows[0].role;

      // Nếu quyền người dùng > 2, chuyển hướng
      if (role > 2) {
        return res.redirect(`/detail_task?id_tasks=${id_tasks}&errorMessage=5`);
      }

      // Nếu quyền người dùng <= 2, thực hiện thao tác
      await db.query(
        "INSERT INTO tables (name, description, priority, id_tasks, start_date, due_date, id_user) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
          project_name,
          description,
          priority,
          id_tasks,
          startdate || null,
          enddate || null,
          id_user,
        ]
      );

      return res.redirect(`/detail_task?id_tasks=${id_tasks}&success=1`);
    } catch (err) {
      console.error("Database error:", err);
      return res.redirect(`/detail_task?id_tasks=${id_tasks}&errorMessage=3`);
    }
  } else {
    return res.redirect(`/detail_task?id_tasks=${id_tasks}&errorMessage=4`);
  }
}

async function deleteTable(req, res) {
  if (req.session.user) {
    if (req.body.id_table) {
      const id_table = req.body.id_table;
      const id_tasks = req.body.id_tasks;

      try {
        // Kiểm tra quyền của người dùng
        const result = await db.query(
          "SELECT * FROM user_tasks WHERE id_user = $1 AND id_tasks = $2",
          [req.session.user.id_user, id_tasks]
        );

        // Nếu không tìm thấy bản ghi
        if (result.rows.length === 0) {
          return res.redirect(
            `/detail_table?id_tasks=${id_tasks}&errorMessage=5`
          );
        }

        const role = result.rows[0].role;

        // Nếu quyền người dùng > 2, chuyển hướng
        if (role > 2) {
          return res.redirect(
            `/detail_task?id_tasks=${id_tasks}&errorMessage=5`
          );
        }

        if (role <= 2) {
          await db.query("DELETE FROM tables WHERE id_table = $1", [id_table]);

          return res.redirect(`/detail_task?id_tasks=${id_tasks}`);
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

export { tableGetController, tablePostController, deleteTable };
