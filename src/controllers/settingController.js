import db from "../config/database.js";

function settingController(req, res) {
  let errorMessage = null;
  if (req.query.errorChangePassword) {
    const errorMessages = {
      1: "Vui lòng nhập đầy đủ thông tin",
      2: "Mật khẩu cũ không đúng",
      3: "Mật khẩu mới không khớp",
      4: "Lỗi! vui lòng thử lại",
    };
    errorMessage = errorMessages[req.query.errorChangePassword];
  }
  res.render("setting.ejs", {
    user: req.session.user,
    errorMessage: errorMessage,
  });
}

function changePassword(req, res) {
  const { old_password, new_password, re_new_password } = req.body;
  const user = req.session.user;

  // kiểm tra nếu chưa đăng nhập
  if (!user) {
    res.redirect("/login-signUp?errorLogin=6");
    return;
  }
  // kiểm tra dữ liệu
  if (old_password === "" || new_password === "" || re_new_password === "") {
    res.redirect("/setting?errorChangePassword=1");
    return;
  } else {
    if (old_password !== user.password) {
      res.redirect("/setting?errorChangePassword=2");
      return;
    } else if (new_password !== re_new_password) {
      res.redirect("/setting?errorChangePassword=3");
      return;
    } else {
      db.query(
        "UPDATE users SET password = $1 WHERE id_user = $2",
        [new_password, user.id_user],
        (err, result) => {
          if (err) {
            console.log("Error: ", err);
            res.redirect("/setting?errorChangePassword=4");
            return;
          } else {
            req.session.destroy();
            res.redirect("/login-signUp");
            return;
          }
        }
      );
    }
  }
}
export { settingController, changePassword };
