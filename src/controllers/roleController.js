import db from "../config/database.js";
async function editRole(req, res) {
  if (req.session.user) {
    const { id_tasks, id_user, roleChange } = req.body;
    // nếu không hợp lệ chuyển về trang chủ và báo lỗi
    if (!id_tasks || !id_user || !roleChange) {
      return res.redirect("/?errorAddTask=1");
    }

    let checkRole = await db.query(
      "SELECT role FROM user_tasks WHERE id_tasks = $1 AND id_user = $2",
      [id_tasks, req.session.user.id_user]
    );

    // nếu như là admin thì mới có thể sửa quyền
    if (checkRole.rows.length == 0 || checkRole.rows[0]["role"] != 1) {
      // báo lỗi ko có quyền đổi
      return res.redirect(`/personTask?id_tasks=${id_tasks}&errorMessage=1`);
    }

    try {
      await db.query(
        "UPDATE user_tasks SET role = $1 WHERE id_tasks = $2 AND id_user = $3",
        [roleChange, id_tasks, id_user]
      );
      return res.redirect(`/personTask?id_tasks=${id_tasks}`);
    } catch (error) {
      return res.redirect("/?errorAddTask=1");
    }
  } else {
    return res.redirect("/login-signUp");
  }
}
async function deleteRole(req, res) {
  if (req.session.user) {
    const { id_tasks, id_user } = req.body;
    if (!id_tasks || !id_user) {
      return res.redirect("/?errorAddTask=1");
    }
    // kiểm tra quyền của người đang thao tác
    let checkRole = await db.query(
      "SELECT role FROM user_tasks WHERE id_tasks = $1 AND id_user = $2",
      [id_tasks, req.session.user.id_user]
    );
    // nếu như không tồn tại quyền hoặc quyền người dùng bằng 3 (chỉ là nhân viên)
    if (checkRole.rows.length == 0 || checkRole.rows[0]["role"] == 3) {
      return res.redirect(`/personTask?id_tasks=${id_tasks}&errorMessage=1`);
    }
    try {
      // kiểm tra quyền của người cần xóa
      let checkRoleDelete = await db.query(
        "SELECT role FROM user_tasks WHERE id_tasks = $1 AND id_user = $2",
        [id_tasks, id_user]
      );
      if (
        checkRoleDelete.rows.length == 0 ||
        checkRoleDelete.rows[0]["role"] == 1
      ) {
        return res.redirect(`/personTask?id_tasks=${id_tasks}&errorMessage=1`);
      }
      // tiến hành xóa
      await db.query(
        "DELETE FROM user_tasks WHERE id_tasks = $1 AND id_user = $2",
        [id_tasks, id_user]
      );
      return res.redirect(`/personTask?id_tasks=${id_tasks}`);
    } catch (error) {
      console.log(error);

      return res.redirect("/?errorAddTask=1");
    }
  } else {
    return res.redirect("/login-signUp");
  }
}
export { editRole, deleteRole };
