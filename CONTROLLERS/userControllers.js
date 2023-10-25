// @collapse
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const user = require(".././MODEL/userModel");
const department = require(".././MODEL/departmentModel");
const forum = require(".././MODEL/forumModel");
const post = require(".././MODEL/postModel");
const joinedForum = require(".././MODEL/joinForumModel");
const notification = require("../MODEL/notificationModel");
const Allowed_user = require(".././MODEL/allowedUsersModel");

const fs = require("fs");

const SALT = 12;

module.exports = {
  isUserAllowed,
  createNewUser,
  createUserByAdmin,
  getUser,
  getUserByAdmin,
  searchUserByAdmin,
  searchUserWithFilterByAdmin,
  updateUserDetailsByAdmin,
  updateUserPasswordByAdmin,
  updateUserImageByAdmin,
  userLogin,
  getAll,
  getRecent5Users,
  confirmPassword,
  updateUserDetails,
  updateUserImage,
  updateUserPassword,
};

async function confirmPassword(req, res) {
  try {
    let { _id, password } = req.body;
    let invalidFields = [];
    if (!_id) {
      invalidFields.push("_id");
    }
    if (!password) {
      invalidFields.push("password");
    }

    if (invalidFields.length != 0) {
      res.send({
        success: false,
        status: 400,
        message: `Required fields: ${invalidFields.join(", ")}`,
      });
    } else {
      let data = await user.findOne({ _id });
      if (!data) {
        res.send({
          success: false,
          status: 400,
          message: "User not found",
        });
      } else {
        let isPassword = bcrypt.compareSync(password, data.password);
        if (isPassword == true) {
          res.send({
            success: true,
            status: 200,
            message: "Password correct",
          });
        } else {
          res.send({
            success: false,
            status: 400,
            message: "Password not correct",
          });
        }
      }
    }
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()}`,
    });
  }
}

async function isUserAllowed(req, res) {
  let { name, registration_number, email, departmentId } = req.body;
  try {
    let invalidFields = [];
    if (!name) {
      invalidFields.push("name");
    }
    if (!registration_number) {
      invalidFields.push("registration_number");
    }
    if (!email) {
      invalidFields.push("email");
    }
    if (!departmentId) {
      invalidFields.push("department Id");
    }
    if (invalidFields.length != 0) {
      return res.send({
        success: false,
        status: 400,
        message: `Invalid fields: ${invalidFields.join(", ")}`,
      });
    }

    let query = {
      $or: [{ registration_number: registration_number }, { email: email }],
    };

    let isUserExist = await user.findOne(query);

    if (!!isUserExist) {
      return res.send({
        success: false,
        status: 400,
        message: "User already Exist",
      });
    }

    let isDepartmentExist = await department.findOne({
      _id: departmentId,
    });

    if (!isDepartmentExist) {
      return res.send({
        success: false,
        status: 400,
        message: "Department does not exist",
      });
    }

    let isRegistrationLength =
      registration_number.toString().length == 8 ? true : false;

    if (!isRegistrationLength) {
      return res.send({
        success: false,
        status: 400,
        message: "Registration number does not consist valid number of digits.",
      });
    }

    let isUserAllowed = await Allowed_user.findOne({ registration_number });

    if (!isUserAllowed) {
      return res.send({
        success: false,
        status: 404,
        message:
          "The user is not admitted by Opentalks Administrator to create account.",
      });
    }

    res.send({
      success: true,
      status: 200,
      message: "User is allowed to create account.",
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in isuserAllowed`,
      query: { name, registration_number, departmentId, email },
    });
  }
}

async function createNewUser(req, res) {
  try {
    let { name, registration_number, email, password, departmentId } = req.body;
    let invalidFields = [];
    if (!name) {
      invalidFields.push("name");
    }
    if (!registration_number) {
      invalidFields.push("registration_number");
    }
    if (!email) {
      invalidFields.push("email");
    }
    if (!password) {
      invalidFields.push("password");
    }
    if (!departmentId) {
      invalidFields.push("department Id");
    }
    if (invalidFields.length != 0) {
      return res.send({
        success: false,
        status: 400,
        message: `Invalid fields: ${invalidFields.join(", ")}`,
      });
    }

    let query = {
      $or: [{ registration_number: registration_number }, { email: email }],
    };

    let isUserExist = await user.findOne(query);

    if (!!isUserExist) {
      return res.send({
        success: false,
        status: 400,
        message: "User already Exist",
      });
    }

    let isDepartmentExist = await department.findOne({
      _id: departmentId,
    });

    if (!isDepartmentExist) {
      return res.send({
        success: false,
        status: 400,
        message: "Department does not exist",
      });
    }

    let isRegistrationLength =
      registration_number.toString().length == 8 ? true : false;

    if (!isRegistrationLength) {
      return res.send({
        success: false,
        status: 400,
        message: "Registration number does not consist valid number of digits.",
      });
    }

    let isUserAllowed = await Allowed_user.findOne({ registration_number });

    if (!isUserAllowed) {
      return res.send({
        success: false,
        status: 404,
        message:
          "The user is not admitted by Opentalks Administrator to create account.",
      });
    }

    let hashedPasword = bcrypt.hashSync(password, SALT);
    password = hashedPasword;

    let newUser = await user.create({
      name,
      registration_number,
      departmentId,
      password,
      email,
    });

    if (!newUser) {
      return res.send({
        success: false,
        status: 400,
        message: "User is not created successfully.",
      });
    }

    res.send({
      success: true,
      status: 200,
      message: "User created successfully.",
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in CreateNeUsers`,
    });
  }
}

async function createUserByAdmin(req, res) {
  try {
    let formData = req.body.data1;
    let invalidFields = [];
    if (!formData.name) {
      invalidFields.push("name");
    }
    if (!formData.registration_number) {
      invalidFields.push("registration_number");
    }
    if (!formData.email) {
      invalidFields.push("email");
    }
    if (!formData.password) {
      invalidFields.push("password");
    }
    if (!formData.departmentId) {
      invalidFields.push("department Id");
    }
    if (invalidFields.length != 0) {
      return res.send({
        success: false,
        status: 400,
        message: `Invalid fields: ${invalidFields.join(", ")}`,
      });
    }
    let { registration_number, email } = formData;
    let query = {
      $or: [{ registration_number: registration_number }, { email: email }],
    };
    let isUserExist = await user.findOne(query);
    if (!!isUserExist) {
      return res.send({
        success: false,
        status: 400,
        message: "User already Exist",
      });
    }

    let isDepartmentExist = await department.findOne({
      _id: formData.departmentId,
    });
    if (!isDepartmentExist) {
      return res.send({
        success: false,
        status: 400,
        message: "Department does not exist",
      });
    }

    let hashedPasword = bcrypt.hashSync(formData.password, SALT);
    formData.password = hashedPasword;
    let newUser = new user(formData);
    await newUser.save();

    await notification.create({
      userId: newUser._id,
      message: `You are added to Opentalks Community by the Opntalks Administrator`,
    });

    res.send({
      success: true,
      status: 200,
      message: "User Created",
      user: newUser,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in Create-user`,
    });
  }
}

async function getUser(req, res) {
  try {
    let { _id, isAdmin = false } = req.body;
    if (!_id) {
      return res.send({
        success: false,
        status: 400,
        message: `Required Fields: ${invalidFields.join(", ")}`,
      });
    }

    let userFound = await user
      .findOne({ _id })
      .populate("departmentId", "name")
      .select(
        "admin createdAt departmentId email image name registration_number updatedAt _id"
      );

    if (!userFound) {
      return res.send({
        success: false,
        status: 404,
        message: "User not found",
      });
    }

    if (isAdmin == false) {
      let forums_created = forum.countDocuments({ userId: _id });
      let forums_joined = joinedForum.countDocuments({ userId: _id });
      let activePosts = post.countDocuments({ userId: _id, active: true });
      let inactivePosts = post.countDocuments({ userId: _id, active: false });

      let user_data = await Promise.all([
        forums_created,
        forums_joined,
        activePosts,
        inactivePosts,
      ]);

      return res.send({
        success: true,
        status: 200,
        user: userFound,
        other_data: {
          forums_created: user_data[0],
          forums_joined: user_data[1],
          activePosts: user_data[2],
          inactivePosts: user_data[3],
        },
      });
    }

    res.send({
      success: true,
      status: 200,
      message: "user found",
      user: userFound,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in Get-user`,
    });
  }
}

async function getUserByAdmin(req, res) {
  try {
    let { userId } = req.body;
    if (!userId) {
      return res.send({
        success: false,
        status: 404,
        message: "Userid is required",
      });
    }

    let newUser = await user
      .findOne({ _id: userId })
      .select("name registration_number email departmentId image admin");
    if (!newUser) {
      return res.send({
        success: false,
        status: 404,
        message: "No user found",
      });
    }

    res.send({
      success: true,
      status: 200,
      user: newUser,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in getUserByAdminB`,
    });
  }
}

async function searchUserByAdmin(req, res) {
  try {
    let byNumber = req.body.byNumber;
    query = {};

    if (byNumber == true) {
      if (!req.body.registration_number) {
        return res.send({
          success: false,
          status: 404,
          message: "RegNo is required",
        });
      }

      query.registration_number = Number(req.body.registration_number);
      let foundUser = await user
        .findOne(query)
        .select(
          "name registration_number email departmentId image admin active createdAt updatedAt lastLogin"
        )
        .populate("departmentId", "name");
      if (!foundUser) {
        return res.send({
          success: false,
          status: 404,
          message: "User not found",
        });
      }
      return res.send({
        success: true,
        status: 200,
        user: foundUser,
      });
    }

    if (!req.body.name) {
      return res.send({
        success: false,
        status: 404,
        message: "name is required",
      });
    }

    let startPoint = !req.body.startPoint ? 0 : req.body.startPoint;
    let foundUsers = await user
      .find({ name: { $regex: req.body.name, $options: "i" } })
      .select(
        "name registration_number email departmentId image admin active createdAt updatedAt lastLogin"
      )
      .populate("departmentId", "name")
      .skip(startPoint)
      .limit(10);

    if (foundUsers.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No users found",
      });
    }

    res.send({
      success: true,
      status: 200,
      users: foundUsers,
      total: await user.countDocuments({
        name: { $regex: req.body.name, $options: "i" },
      }),
      nextStartPoint: startPoint + 10,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in searchUserByAdminB`,
    });
  }
}

async function searchUserWithFilterByAdmin(req, res) {
  try {
    let filter = { ...req.body.filter };
    if (!!filter.email) {
      filter.email = { $regex: new RegExp(req.body.filter.email, "i") };
    }
    if (!!filter.createdAt) {
      filter.createdAt = { $gte: filter.createdAt };
    }
    if (!!filter.updatedAt) {
      filter.updatedAt = { $gte: filter.updatedAt };
    }
    if (!!filter.lastLogin) {
      filter.lastLogin = { $gte: filter.lastLogin };
    }
    let startPoint = !!req.body.startPoint ? req.body.startPoint : 0;
    let users = await user
      .find(filter)
      .populate("departmentId", "name")
      .skip(startPoint)
      .limit(10);
    if (users.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No user found",
      });
    }
    res.send({
      success: true,
      status: 200,
      users,
      total: await user.countDocuments(filter),
      nextStartPoint: startPoint + 10,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in searchUserWithFilterByAdminB`,
    });
  }
}

async function updateUserDetailsByAdmin(req, res) {
  try {
    let toUpdate = { ...req.body.data1 };
    let userToUpdate = await user.findOne({ _id: toUpdate._id });

    if (!userToUpdate) {
      return res.send({
        success: false,
        status: 404,
        messgae: "User not found",
      });
    }

    await user.updateOne(
      { _id: toUpdate._id },
      { ...toUpdate, updatedAt: Date.now() }
    );
    return res.send({
      success: true,
      status: 200,
      message: "User updated",
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in updateUserDetailsByAdminB`,
    });
  }
}

async function updateUserPasswordByAdmin(req, res) {
  try {
    let toUpdate = { ...req.body.data1 };
    let isUser = await user.findOne({ _id: toUpdate._id });
    if (!isUser) {
      return res.send({
        success: false,
        status: 404,
        message: "User not found",
      });
    }

    let newPassword = bcrypt.hashSync(toUpdate.password, SALT);
    toUpdate.password = newPassword;

    await user.updateOne(
      { _id: toUpdate._id },
      { ...toUpdate, updatedAt: Date.now() }
    );

    await notification.create({
      userId: toUpdate._id,
      message: "Opentalks Administrator changed the password of your account",
    });
    res.send({
      success: true,
      status: 200,
      message: "Password updated",
    });
  } catch (error) {
    res.send({
      success: false,
      status: 200,
      message: `Error: ${error.toString()} in updateUserPasswordByAdminC`,
    });
  }
}

async function updateUserImageByAdmin(req, res) {
  try {
    let { _id } = req.body;

    if (!!req.file) {
      let isUser = await user.findOne({ _id });
      if (!isUser) {
        return res.send({
          success: false,
          status: 400,
          message: "User not found",
        });
      }

      let filePath = "./PUBLIC" + isUser.image;
      if (!!filePath && isUser.image != "/user-profile-pic/default.png") {
        fs.unlink(filePath, (err) => {
          if (err) {
            return res.send({
              Uccess: false,
              status: 400,
              message: `Error: ${err.toString()} as image not deleted`,
            });
          }
        });
      }

      await user.findByIdAndUpdate(
        { _id },
        {
          updatedAt: Date.now(),
          image: "/user-profile-pic/" + req.file.filename,
        }
      );

      await notification.create({
        userId: _id,
        message: "Opentalks administrator updated your profile",
      });

      res.send({
        success: true,
        status: 200,
        message: "User profile updated",
      });
    }
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in updateUserImageByAdminB`,
    });
  }
}

async function userLogin(req, res) {
  try {
    let { password, registration_number } = req.body;
    let invalidFields = [];
    if (!password) {
      invalidFields.push("password");
    }
    if (!registration_number) {
      invalidFields.push("registration_number");
    }
    if (invalidFields.length != 0) {
      return res.send({
        success: false,
        status: 400,
        message: `Required Fields: ${invalidFields.join(", ")}`,
      });
    }
    let isUser = await user.findOne({ registration_number });
    if (!isUser) {
      return res.send({
        success: false,
        status: 404,
        message: "User is not registered with Opentalks.",
      });
    }
    let isPassword = bcrypt.compareSync(password, isUser.password);
    if (!isPassword) {
      return res.send({
        success: false,
        status: 400,
        message: "Invalid credentials. Please try again!!",
      });
    }

    let token = jwt.sign(
      { _id: isUser._id, admin: isUser.admin },
      process.env.SECRET_KEY
    );

    await notification.deleteMany({
      userId: isUser._id,
      createdAt: {
        $lt: new Date(new Date() - 7 * 24 * 60 * 60 * 1000),
      },
    });

    let lastLogin = isUser.lastLogin;

    await user.updateOne(
      { _id: isUser._id },
      { $set: { lastLogin: Date.now() } }
    );

    if (isUser.admin == false) {
      return res.send({
        success: true,
        status: 200,
        message: "Login successful",
        data: {
          _id: isUser._id,
          url: "./user.html",
          token,
          lastLogin,
        },
      });
    }

    res.send({
      success: true,
      status: 200,
      message: "Login successful.",
      data: {
        _id: isUser._id,
        url: "./admin.html",
        token,
        lastLogin,
      },
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in Login-user`,
    });
  }
}

async function getAll(req, res) {
  try {
    let { startPoint } = req.body;
    if (!startPoint) {
      res.send({
        success: false,
        status: 404,
        message: "Start point is required",
      });
    }
    let data = await user
      .find(req.body)
      .populate("departmentId", "name")
      .skip(startPoint)
      .limit(50);
    if (data.length == 0) {
      res.send({
        success: false,
        status: 400,
        message: "No user found",
      });
    } else {
      res.send({
        success: true,
        status: 200,
        results: user.countDocuments(req.body),
        user_list: data,
      });
    }
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in Get-all-user`,
    });
  }
}

async function getRecent5Users(req, res) {
  try {
    let data = await user
      .find()
      .populate("departmentId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    if (data.length == 0) {
      return res.send({
        success: false,
        status: 400,
        message: "No user found",
      });
    }
    res.send({
      success: true,
      status: 200,
      users: data,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in Get-all-user`,
    });
  }
}

async function updateUserDetails(req, res) {
  try {
    let { _id, admin } = req.body;
    if (!!admin) {
      return res.send({
        success: false,
        status: 400,
        message: "This field can't be updated",
      });
    }

    if (!_id) {
      return res.send({
        success: false,
        status: 400,
        message: "ID is mandatory",
      });
    }

    let updated_user = await user
      .findByIdAndUpdate(
        { _id },
        { ...req.body, updatedAt: Date.now() },
        { new: true }
      )
      .select(
        "name registration_number email image departmentId admin lastLogin active createdAt updatedAt"
      )
      .populate("departmentId", "name");
    if (!updated_user) {
      res.send({
        success: false,
        status: 404,
        message: "User not found",
      });
    } else {
      res.send({
        success: true,
        status: 200,
        message: "User updated",
        updated_user,
      });
    }
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in Update-user-details`,
    });
  }
}

async function updateUserImage(req, res) {
  try {
    const { _id } = req.body;
    if (!req.file) {
      return res.send({
        success: false,
        status: 400,
        message: "No image provided in formData",
      });
    }

    let isUser = await user.findOne({ _id });
    if (!isUser) {
      return res.send({
        success: false,
        status: 400,
        message: "User not found",
      });
    }

    // Photo update
    let filePath = "./PUBLIC" + isUser.image;
    if (!!filePath && isUser.image != "/user-profile-pic/default.png") {
      fs.unlink(filePath, (err) => {
        if (err) {
          return res.send({
            success: false,
            status: 400,
            message: "Try agin later, Server issues an error.",
          });
        }
      });
    }

    let updated_user = await user
      .findByIdAndUpdate(
        { _id },
        {
          updatedAt: Date.now(),
          image: "/user-profile-pic/" + req.file.filename,
        },
        { new: true }
      )
      .select("image");

    if (!updated_user) {
      res.send({
        success: false,
        status: 404,
        message: "User image not updated",
      });
    } else {
      res.send({
        success: true,
        status: 200,
        message: "User image updated",
        updated_user,
      });
    }
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in Update-user-image`,
    });
  }
}

async function updateUserPassword(req, res) {
  try {
    let { newPassword, prevPassword, userId } = req.body;
    let invalidFields = [];

    if (!newPassword) {
      invalidFields.push("New Password");
    }
    if (!prevPassword) {
      invalidFields.push("Prev Password");
    }
    if (!userId) {
      invalidFields.push("userid");
    }

    if (invalidFields.length != 0) {
      return res.send({
        success: false,
        status: 404,
        message: `Required fields: ${invalidFields.join(", ")}`,
      });
    }

    let foundUser = await user.findOne({ _id: userId });

    if (!foundUser) {
      return res.send({
        success: false,
        status: 404,
        message: "User not found",
      });
    }

    let isPassword = bcrypt.compareSync(prevPassword, foundUser.password);

    if (!isPassword) {
      return res.send({
        success: false,
        status: 400,
        message: "Previous password is incorrect.",
      });
    }

    let password = bcrypt.hashSync(newPassword, SALT);

    let updatedUser = await user.updateOne(
      { _id: userId },
      { password },
      { new: true }
    );
    if (!updatedUser) {
      return res.send({
        success: false,
        status: 400,
        message: "Password does not changed.",
      });
    }

    res.send({
      success: true,
      status: 200,
      message: "Password updated.",
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `${error.toString()} in Update-user-passwordB`,
    });
  }
}
