module.exports = {
  unhandledRoutes,
};

function unhandledRoutes(req, res) {
  res.send({
    success: false,
    status: 400,
    message: "URL is invalid",
  });
}
