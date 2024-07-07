const dotenv = require("dotenv");
dotenv.config({ path: `${__dirname}/config.env` });

const app = require("./app");

const mongoose = require("mongoose");

// VARIABLES
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DATABASE_PATH;

// DATABASE CONNECT
mongoose
  .connect(DB_PATH, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`DATABASE CONNECTED SUCCESSFULLY`);
  })
  .catch((err) => {
    console.log(`Error: ${err}`);
  });

// SERVER START
app.listen(PORT, () => {
  console.log(`SERVER STARTED AT PORT: ${PORT}`);
});
