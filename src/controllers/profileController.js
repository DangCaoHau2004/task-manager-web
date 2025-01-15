import db from "../config/database.js";
async function profileController(req, res) {
  let errorMessage = null;

  // Kiểm tra lỗi profile (nếu có)
  if (req.query.errorProfile) {
    const errorMessages = {
      1: "Bạn chưa điền đủ thông tin",
      2: "Có lỗi xảy ra, vui lòng thử lại sau",
    };
    errorMessage =
      errorMessages[req.query.errorProfile] || "Lỗi không xác định";
  }

  // Kiểm tra id_user
  if (req.query.id_user) {
    const idUser = req.query.id_user;
    let id_friend_tb = null;
    let accept = null;
    let send_req_friend = null;

    // Nếu id_user trùng với session người dùng hiện tại
    if (req.session.user && idUser == req.session.user.id_user) {
      return res.render("profile.ejs", {
        user: req.session.user,
        errorMessage: errorMessage,
        session: req.session.user,
      });
    }

    try {
      const result = await db.query("SELECT * FROM users WHERE id_user = $1", [
        idUser,
      ]);

      // Nếu không tìm thấy người dùng
      if (result.rows.length === 0) {
        return res.redirect("/?errorProfile=2");
      }

      let data = [idUser];
      // Kiểm tra nếu tồn tại session
      if (req.session.user) {
        // id_user là người gửi lời mời
        // id_friend là người nhận lời mời
        // nếu người gửi là mình thì phải có nút hủy
        // nếu người gửi là nó thì có nút xác nhận
        const req_friend_data = await db.query(
          "SELECT f.id_friend_tb, f.accept, f.id_friend FROM users as u INNER JOIN friend as f ON u.id_user = f.id_user  WHERE (f.id_user = $1 AND f.id_friend = $2) OR (f.id_friend = $1 AND f.id_user = $2)",
          [req.session.user.id_user, idUser]
        );

        if (req_friend_data.rows[0]) {
          // Người gửi là id_friend thì họ đã gửi yêu cầu kết bạn

          if (parseInt(req_friend_data.rows[0].id_friend) == idUser) {
            send_req_friend = "dong_y"; // "Hủy"
          } else {
            send_req_friend = "huy"; // "Đồng ý"
          }
          id_friend_tb = req_friend_data.rows[0].id_friend_tb;
          accept = req_friend_data.rows[0].accept;
        }
      }

      // Render trang với thông tin người dùng khác
      return res.render("profile.ejs", {
        userOther: result.rows[0],
        errorMessage: errorMessage,
        user: req.session.user,
        id_friend_tb: id_friend_tb,
        accept: accept,
        send_req_friend: send_req_friend,
      });
    } catch (error) {
      console.error(error);
      return res.redirect("/?errorProfile=1");
    }
  } else {
    if (req.session.user) {
      return res.redirect(`/profile?id_user=${req.session.user.id_user}`);
    } else {
      res.redirect("/login-signUp");
    }
  }
}

function editProfile(req, res) {
  let name = req.body.name;
  let email = req.body.email;
  let id_user = req.body.id_user;
  if (id_user == "") {
    res.redirect("/login-signUp");
  } else if (name == "" || email == "") {
    res.redirect("/profile?errorProfile=1");
  } else {
    db.query(
      "UPDATE users SET name = $1, email = $2 WHERE id_user = $3",
      [name, email, id_user],
      (err, value) => {
        if (err) {
          res.redirect("/profile?errorProfile=2");
        } else {
          req.session.user.name = name;
          req.session.user.email = email;
          res.redirect("/profile");
        }
      }
    );
  }
}
export { profileController, editProfile };
