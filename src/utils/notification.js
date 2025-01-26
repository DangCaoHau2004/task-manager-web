import db from "../config/database.js";

async function addNotification(
  message,
  id_user,
  title,
  id_tasks = null,
  type = 1
) {
  try {
    // Nếu chỉ là thông báo thông thường: message
    if (type === 1) {
      db.query(
        "INSERT INTO notifications(id_user, message, title) VALUES($1, $2, $3)",
        [id_user, message, title]
      );
    }
    // nếu là thông báo cho một nhóm người với id tasks
    else if (type === 2) {
      let list_idUser = await db.query(
        "SELECT id_user FROM user_tasks WHERE id_tasks = $1",
        [id_tasks]
      );
      for (let index = 0; index < list_idUser.rows.length; index++) {
        db.query(
          "INSERT INTO notifications(id_user, message, title) VALUES($1, $2, $3)",
          [list_idUser.rows[index].id_user, message, title]
        );
      }
    } else {
      throw new Error("Loại thông báo không hợp lệ.");
    }
  } catch (err) {
    console.error("Lỗi khi thêm thông báo:", err.message);
    throw err;
  }
}

export { addNotification };
