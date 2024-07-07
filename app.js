const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

const functions = require("./MODULES/functions");
const adminRoutes = require("./ROUTES/adminRoutes");
const userRoutes = require("./ROUTES/userRoutes");

// MIDDLEWARES
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/admin", adminRoutes);
app.use("/api", userRoutes);

// UNHANDLED ROUTES
app.all("*", functions.unhandledRoutes);

module.exports = app;
