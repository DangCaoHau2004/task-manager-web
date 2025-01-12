function homePageController(req, res) {
  let errorMessage = null;

  if (req.query.errorAddTask) {
    const errorMessages = {
      1: "Có lỗi xảy ra vui lòng thử lại sau",
      2: "Bạn chưa điền đủ thông tin",
    };
    errorMessage = errorMessages[req.query.errorAddTask];
  }
  res.render("index.ejs", {
    user: req.session.user,
    errorMessage: errorMessage,
  });
}

export default homePageController;
