const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

const functions = require("./MODULES/functions");
const adminRoutes = require("./ROUTES/adminRoutes");
const userRoutes = require("./ROUTES/userRoutes");

// MIDDLEWARES
app.use(cors());
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.json({ message: "Server is healthy." });
});
app.use("/admin", adminRoutes);
app.use("/api", userRoutes);

// UNHANDLED ROUTES
app.all("*", functions.unhandledRoutes);

module.exports = app;
