import db from "../config/database.js";
async function addCard(req, res) {
  if (req.session.user) {
    const { name, id_user, id_tasks, id_table } = req.body;

    if (!name || !id_user || !id_tasks || !id_table) {
      res.redirect(`/detail_table?id_table=${id_table}&errorMessage=2`);

      return;
    }
    let status = "Undone";

    try {
      // Kiểm tra quyền người dùng
      const result = await db.query(
        "SELECT * FROM user_tasks WHERE id_user = $1 AND id_tasks = $2",
        [id_user, id_tasks]
      );

      // Nếu không tìm thấy bản ghi
      if (result.rows.length === 0) {
        return res.redirect(
          `/detail_table?id_table=${id_table}&errorMessage=3`
        );
      }

      // Nếu quyền người dùng <= 2, thực hiện thao tác
      await db.query(
        "INSERT INTO cards(name, status, id_table, id_user) VALUES ($1, $2, $3, $4)",
        [name, status, id_table, id_user],
        (err, result) => {
          if (err) {
            res.redirect(`/detail_table?id_table=${id_table}&errorMessage=1`);
          } else {
            res.redirect(`/detail_table?id_table=${id_table}&success=1`);
          }
        }
      );
    } catch (err) {
      console.error("Database error:", err);
      return res.redirect(`/detail_table?id_table=${id_table}&errorMessage=1`);
    }
  } else {
    return res.redirect("/login-signUp");
  }
}

async function updateCard(req, res) {
  if (req.session.user) {
    const { id_card, id_table, id_tasks } = req.body;

    if (id_card && id_table) {
      try {
        const result = await db.query(
          "SELECT * FROM user_tasks WHERE id_user = $1 AND id_tasks = $2",
          [req.session.user.id_user, id_tasks]
        );

        if (result.rows.length === 0) {
          return res.redirect(
            `/detail_table?id_table=${id_table}&errorMessage=3`
          );
        }

        await db.query(
          "UPDATE cards SET status = CASE WHEN status = 'Undone' THEN 'Complete' WHEN status = 'Complete' THEN 'Undone' END WHERE id_card = $1",
          [id_card]
        );

        return res.redirect(`/detail_table?id_table=${id_table}&success=1`);
      } catch (err) {
        console.error("Database error:", err);
        return res.redirect(
          `/detail_table?id_table=${id_table}&errorMessage=1`
        );
      }
    } else {
      return res.redirect("/?errorAddTask=1");
    }
  } else {
    return res.redirect("/login-signUp");
  }
}

export { addCard, updateCard };
