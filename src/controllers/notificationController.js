import db from "../config/database.js";
import { formatDate } from "../utils/formatDate.js";

async function notificationGetController(req, res) {
  if (req.session.user) {
    let notification = [];
    let resultNotif = await db.query(
      "SELECT * FROM notifications WHERE id_user = $1 ORDER BY created_at",
      [req.session.user.id_user]
    );
    if (resultNotif.rows.length > 0) {
      notification = resultNotif.rows;
      for (let index = 0; index < notification.length; index++) {
        notification[index].created_at = formatDate(
          notification[index].created_at
        );
      }
    }

    res.render("notification.ejs", {
      user: req.session.user,
      notification: notification,
    });
  } else {
    res.redirect("/login-signUp");
  }
}
export { notificationGetController };
