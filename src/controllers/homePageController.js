function homePageController(req, res) {
  res.render("index.ejs", {
    user: req.session.user,
  });
}

export default homePageController;
