const express = require("express");
const app = express();

const cors = require("cors");

const path = require("path");

const functions = require("./MODULES/functions");

const adminRoutes = require("./ROUTES/adminRoutes");
const userRoutes = require("./ROUTES/userRoutes");

// MIDDLEWARES
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);
app.use(express.static(path.join(__dirname, "/PUBLIC")));
app.use(express.json());
app.use(express.urlencoded());
app.use("/admin", adminRoutes);
app.use("/api", userRoutes);

// UNHANDLES ROUTES
app.route("*").all(functions.unhandledRoutes);

module.exports = app;
