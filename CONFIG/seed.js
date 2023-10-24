const user = require(".././MODEL/userModel");
const bcrypt = require("bcrypt");

user
  .findOne({ registration_number: 12100838 })
  .then((data) => {
    if (!data) {
      const cred = {
        name: "Jaskaran Singh",
        registration_number: 12100838,
        email: "dhillonjaskaran4486@gmail.com",
        password: bcrypt.hashSync("1234", 10),
        image: "/user-profile-pic/default.png",
        admin: true,
        departmentId: "6493d582f853ab9a02a9860b",
      };
      const admin = new user(cred);
      admin
        .save()
        .then((data) => {
          console.log("ADMIN CREATED");
        })
        .catch((err) => {
          console.log(err.toString());
        });
    }
  })
  .catch((err) => {
    console.log(err.toString());
  });
