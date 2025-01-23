import db from "../config/database.js";

async function friendGetController(req, res) {
  let friend_search = null;
  let friend_list = [];
  let count_req_add = 0;
  let req_add = null;
  let errorMessage = null;
  let errorMessages = {
    1: "Vui lòng kết bạn để dùng chức năng này", // thêm người vào dự án
  };
  // Kiểm tra nếu người dùng đã đăng nhập
  if (req.session.user) {
    // Kiểm tra lời mời kết bạn
    try {
      let result = await db.query(
        "SELECT u.*, f.id_friend_tb FROM friend as f INNER JOIN users as u ON u.id_user = f.id_user  WHERE f.id_friend = $1 AND f.accept is NULL",
        [req.session.user.id_user]
      );
      req_add = result.rows;
      count_req_add = result.rows.length;
    } catch (error) {
      return res.redirect("/?errorAddTask=1");
    }

    // Kiểm tra tìm kiếm theo email
    if (req.query.email) {
      try {
        let email_search = req.query.email.trim();
        let result_search = await db.query(
          "SELECT * FROM users WHERE email = $1",
          [email_search]
        );

        if (result_search.rows[0]) {
          friend_search = result_search.rows[0];
        } else {
          friend_search = [];
        }
      } catch (error) {
        return res.redirect("/?errorAddTask=1");
      }
    }

    // Lấy danh sách bạn bè đã chấp nhận
    try {
      let result_search = await db.query(
        "SELECT * FROM friend WHERE accept = 1 AND (id_user = $1 OR id_friend = $1)",
        [req.session.user.id_user]
      );

      if (result_search.rows) {
        for (let i = 0; i < result_search.rows.length; i++) {
          let friend_id =
            result_search.rows[i].id_user == req.session.user.id_user
              ? result_search.rows[i].id_friend
              : result_search.rows[i].id_user;

          let friend_info = await db.query(
            "SELECT * FROM users WHERE id_user = $1",
            [friend_id]
          );
          if (friend_info.rows.length > 0) {
            friend_list.push(friend_info.rows[0]);
          }
        }
      }
    } catch (error) {
      return res.redirect("/?errorAddTask=1");
    }
  }
  if (req.query.errorMessage) {
    errorMessage = errorMessages[req.query.errorMessage];
  }
  res.render("./friends/friend_list.ejs", {
    user: req.session.user,
    friend_list: friend_list,
    friend_search: friend_search,
    count_req_add: count_req_add,
    req_add: req_add,
    errorMessage: errorMessage,
  });
}

async function addFriend(req, res) {
  if (req.session.user) {
    const type = req.body.type;
    if (!type) {
      return res.redirect("/?errorAddTask=1");
    }
    if (type == "xn") {
      try {
        const id_friend_tb = req.body.id_friend_tb;
        if (!id_friend_tb) {
          return res.redirect("/?errorAddTask=1");
        }
        await db.query("UPDATE friend SET accept = 1 WHERE id_friend_tb = $1", [
          id_friend_tb,
        ]);
        res.redirect("/friend");
      } catch (error) {
        return res.redirect("/?errorAddTask=1");
      }
    } else if (type == "add") {
      try {
        const id_user = req.body.id_user;
        const id_friend = req.body.id_friend;
        // thêm khi mà ko bị trùng
        await db.query(
          "INSERT INTO friend (id_user, id_friend) SELECT $1, $2 WHERE NOT EXISTS ( SELECT 1 FROM friend WHERE (id_user = $1 AND id_friend = $2) OR (id_friend = $1 AND id_user = $2))",
          [id_user, id_friend]
        );
        res.redirect("/friend");
      } catch (error) {
        return res.redirect("/?errorAddTask=1");
      }
    } else if (type == "huy") {
      try {
        const id_friend_tb = req.body.id_friend_tb;
        if (!id_friend_tb) {
          return res.redirect("/?errorAddTask=1");
        }
        await db.query("DELETE FROM friend WHERE id_friend_tb = $1", [
          id_friend_tb,
        ]);
        res.redirect("/friend");
      } catch (error) {
        return res.redirect("/?errorAddTask=1");
      }
    } else {
      return res.redirect("/?errorAddTask=1");
    }
  } else {
    res.redirect("/login-signUp");
  }
}

export { friendGetController, addFriend };
