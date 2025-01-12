import db from "../config/database.js";
function profileController(req, res) {
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

    // Nếu id_user trùng với session người dùng hiện tại
    if (req.session.user && idUser == req.session.user.id_user) {
      return res.render("profile.ejs", {
        user: req.session.user,
        errorMessage: errorMessage,
        session: req.session.user,
      });
    }

    // Nếu không trùng, truy vấn cơ sở dữ liệu
    return db.query(
      "SELECT * FROM users WHERE id_user = $1",
      [idUser],
      (err, result) => {
        if (err || result.rows.length === 0) {
          // Chuyển hướng với lỗi nếu không tìm thấy người dùng
          return res.redirect("/?errorProfile=2");
        }

        // Render trang với thông tin người dùng khác
        return res.render("profile.ejs", {
          userOther: result.rows[0],
          errorMessage: errorMessage,
        });
      }
    );
  }

  // Trường hợp không có id_user, render profile của session người dùng
  return res.render("profile.ejs", {
    user: req.session.user,
    errorMessage: errorMessage,
  });
}

function editProfile(req, res) {
  let name = req.body.name;
  let email = req.body.email;
  let id_user = req.body.id_user;
  if (id_user == "") {
    res.redirect("/login");
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
