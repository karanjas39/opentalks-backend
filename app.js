const express = require("express");
const app = express();

const cors = require("cors");

const path = require("path");

const functions = require("./MODULES/functions");

const adminRoutes = require("./ROUTES/adminRoutes");
const userRoutes = require("./ROUTES/userRoutes");

// MIDDLEWARES
app.use(cors());
app.use(express.static(path.join(__dirname, "/PUBLIC")));
app.use(express.json());
app.use(express.urlencoded());
app.get("/", (req, res) => {
  res.json({ message: "Opentalks backend is working." });
});
app.use("/admin", adminRoutes);
app.use("/api", userRoutes);

// UNHANDLES ROUTES
app.route("*").all(functions.unhandledRoutes);

module.exports = app;
