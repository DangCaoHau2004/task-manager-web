import db from "../config/database.js";

async function friendGetController(req, res) {
  let friend_list = null;
  if (req.query.email) {
    let email_search = req.query.email;
    let result = await db.query("SELECT * FROM users WHERE email = $1", [
      email_search,
    ]);

    friend_list = result.rows[0];
  }
  res.render("./friends/friend_list.ejs");
}

export { friendGetController };
