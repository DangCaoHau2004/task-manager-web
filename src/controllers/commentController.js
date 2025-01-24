import db from "../config/database.js";
async function addCommentController(req, res) {
  if (req.session.user) {
    const { content, id_user, id_tasks } = req.body;

    if (!content || !id_user || !id_tasks) {
      return res.redirect(`detail_task?id_tasks=${id_tasks}&errorMessage=1`);
    }
    try {
      await db.query(
        "INSERT INTO comments(id_tasks, id_user, content) VALUES($1, $2, $3)",
        [id_tasks, id_user, content]
      );
      return res.redirect(`detail_task?id_tasks=${id_tasks}&success=1`);
    } catch (error) {
      console.log(error);
      return res.redirect(`detail_task?id_tasks=${id_tasks}&errorMessage=3`);
    }
  } else {
    return res.redirect("/?errorAddTask=1");
  }
}
export { addCommentController };
