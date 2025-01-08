function profileController(req, res) {
  res.render("profile.ejs", { user: req.session.user });
}

export { profileController };
