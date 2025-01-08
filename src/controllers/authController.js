// login
// UI
import db from "../config/database.js";

function login_signUp(req, res) {
  let errorMessage = null;

  if (req.query.errorLogin) {
    const errorMessages = {
      1: "Lỗi! vui lòng thử lại",
      2: "Sai tên đăng nhập hoặc mật khẩu",
      3: "Vui lòng nhập đầy đủ thông tin",
      4: "Email không hợp lệ",
      5: "Tài khoản hoặc email đã tồn tại",
      6: "Vui lòng đăng nhập để thực hiện chức năng này",
    };
    errorMessage = errorMessages[req.query.errorLogin];
  }
  res.render("login-signUp.ejs", {
    user: req.session.user,
    errorMessage: errorMessage,
  });
}
// feature
function login(req, res) {
  const { username, password } = req.body;
  if (username === "" || password === "") {
    res.redirect("/login-signUp?errorLogin=3");
    return;
  }
  db.query(
    "SELECT * FROM users WHERE username = $1 AND password = $2",
    [username, password],
    (err, result) => {
      if (err) {
        console.log("Error: ", err);
        res.redirect("/login-signUp?errorLogin=1");
        return;
      } else {
        if (result.rows.length > 0) {
          req.session.user = result.rows[0];
          res.redirect("/");
          return;
        } else {
          res.redirect("/login-signUp?errorLogin=2");
          return;
        }
      }
    }
  );
}

function register(req, res) {
  const { name, username, email, password } = req.body;
  if (name === "" || username === "" || email === "" || password === "") {
    res.redirect("/login-signUp?errorLogin=3");
    return;
  } else if (email.indexOf("@") === -1) {
    res.redirect("/login-signUp?errorLogin=4");
  } else {
    db.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email],
      (err, result) => {
        if (err) {
          console.log("Error: ", err);
          res.redirect("/login-signUp?errorLogin=1");
          return;
        } else {
          if (result.rows.length > 0) {
            res.redirect("/login-signUp?errorLogin=5");
            return;
          } else {
            db.query(
              "INSERT INTO users (name, username, email, password) VALUES ($1, $2, $3, $4)",
              [name, username, email, password],
              (err, sub_result) => {
                if (err) {
                  console.log("Error: ", err);
                  res.redirect("/login-signUp?errorLogin=1");
                  return;
                } else {
                  // tìm kiếm user vừa tạo
                  db.query(
                    "SELECT * FROM users WHERE username = $1",
                    [username],
                    (err, result) => {
                      if (err) {
                        console.log("Error: ", err);
                        res.redirect("/");
                        return;
                      } else {
                        if (result.rows.length > 0) {
                          // tạo phiên cho user vừa đăng kí
                          req.session.user = result.rows[0];
                          res.redirect("/");
                          return;
                        } else {
                          res.redirect("/");
                          return;
                        }
                      }
                    }
                  );
                }
              }
            );
            return;
          }
        }
      }
    );
  }
}

function logout(req, res) {
  req.session.destroy();
  res.redirect("/");
}

export { login_signUp, login, register, logout };
