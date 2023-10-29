// @collapse
const AllowedUser = require(".././MODEL/allowedUsersModel");
const User = require(".././MODEL/userModel");

module.exports = {
  createAllowedUser,
  getRecentAllowedUser,
  getAllowedUser,
  deleteAllowedUser,
};

async function createAllowedUser(req, res) {
  try {
    let { registration_number } = req.body;

    if (!registration_number) {
      return res.send({
        success: false,
        status: 404,
        message: "Registration Number is required.",
      });
    }

    if (registration_number.toString().length != 8) {
      return res.send({
        success: false,
        status: 400,
        message: "Registration Number is not of valid length.",
      });
    }

    let is_exist = await AllowedUser.findOne({ registration_number });

    if (!!is_exist) {
      return res.send({
        success: false,
        status: 400,
        message: "User is already allowed to register.",
      });
    }

    let is_exist2 = await User.findOne({
      registration_number: Number(registration_number),
    });

    if (!!is_exist2) {
      return res.send({
        success: false,
        status: 400,
        message: "User is already member of Opentalks community.",
      });
    }

    let newAllowance = await AllowedUser.create({
      registration_number: Number(registration_number),
    });

    if (!newAllowance) {
      return res.send({
        success: false,
        status: 400,
        message: "User is not added to allowed users successfully.",
      });
    }

    res.send({
      success: true,
      status: 200,
      message: "User is added to allowed users successfully.",
      user: newAllowance,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in createAllowedUserB`,
    });
  }
}

async function getRecentAllowedUser(req, res) {
  try {
    let { startPoint = 0 } = req.body;
    let results;

    if (startPoint == 0) {
      results = await AllowedUser.countDocuments();
    }

    let users = await AllowedUser.find()
      .skip(startPoint)
      .limit(5)
      .sort({ createdAt: -1 });

    if (users.length == 0) {
      return res.send({
        status: 404,
        success: false,
        message: "No allowed user is found.",
      });
    }

    res.send({
      success: true,
      status: 200,
      users,
      nextStartPoint: startPoint + 5,
      results,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in getAllAllowedUserB`,
    });
  }
}

async function getAllowedUser(req, res) {
  try {
    let { registration_number } = req.body;

    if (!registration_number) {
      return res.send({
        success: false,
        status: 404,
        message: "Registration Number is required.",
      });
    }

    let user = await AllowedUser.findOne({ registration_number });

    if (!user) {
      return res.send({
        success: false,
        status: 404,
        message: "No such user found.",
      });
    }

    res.send({
      success: true,
      status: 200,
      user,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in getAllowedUserB`,
    });
  }
}

async function deleteAllowedUser(req, res) {
  try {
    let { registration_number } = req.body;

    if (!registration_number) {
      return res.send({
        success: false,
        status: 404,
        message: "Registration Number is required.",
      });
    }

    let user = await AllowedUser.findOne({ registration_number });

    if (!user) {
      return res.send({
        success: false,
        status: 404,
        message: "No such user found.",
      });
    }

    await AllowedUser.deleteOne({ registration_number });

    res.send({
      success: true,
      status: 200,
      message: "User deleted from allowed users successfully.",
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in deleteAllowedUserB`,
    });
  }
}
