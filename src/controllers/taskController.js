import db from "../config/database.js";
function addTask(req, res) {
  const {
    project_name,
    description,
    priority,
    startdate,
    enddate,
    type,
    id_user,
  } = req.body;
  console.log(req.body);
  if (
    project_name === "" ||
    description === "" ||
    priority === "" ||
    id_user === "" ||
    type === ""
  ) {
    res.redirect("/?errorAddTask=2");
    return;
  } else if (startdate === "" || enddate === "") {
    db.query(
      "INSERT INTO tasks (name, description, priority, type, id_user) VALUES ($1, $2, $3, $4, $5)",
      [project_name, description, priority, type, id_user],
      (err, result) => {
        if (err) {
          console.log("Error: ", err);
          res.redirect("/?errorAddTask=1");
          return;
        } else {
          res.redirect("/");
          return;
        }
      }
    );
    return;
  }
  db.query(
    "INSERT INTO tasks (name, description, priority, start_date, due_date, type, id_user) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [project_name, description, priority, startdate, enddate, type, id_user],
    (err, result) => {
      if (err) {
        console.log("Error: ", err);
        res.redirect("/?errorAddTask=1");
        return;
      } else {
        res.redirect("/");
        return;
      }
    }
  );
}
export { addTask };
