const dotenv = require("dotenv");
dotenv.config({ path: `${__dirname}/config.env` });

const app = require("./app");

const mongoose = require("mongoose");

// VARIABLES
const PORT = process.env.PORT;
const DB_PATH = process.env.DATABASE_PATH;

// ADMIN
require("./CONFIG/seed");

// DATABASE CONNECT
mongoose
  .connect(DB_PATH)
  .then((data) => {
    console.log(`DATABASE CONNECTED SUCCESFULLY`);
  })
  .catch((err) => {
    console.log(`Error : ${err.toString()}`);
  });

//   SERVER START
app.listen(PORT, () => {
  console.log(`SERVER STARTED AT PORT: ${PORT}`);
});
