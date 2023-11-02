const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const user = require(".././MODEL/userModel");

const secretKey = process.env.SECRET_KEY;

module.exports = {
  verify,
  verifyAdmin,
  verifyUser,
  verifyUserFormData,
  imageUploadRestriction,
};

async function verify(req, res, next) {
  let { authorization } = req.headers;
  if (!authorization) {
    return res.send({
      success: false,
      status: 409,
      message: "Token is required",
    });
  }

  try {
    let decoded = jwt.verify(authorization, secretKey);
    if (!!decoded) {
      next();
    }
  } catch (err) {
    res.send({
      success: false,
      status: 403,
      message: "Unauthorized Access",
    });
  }
}

async function verifyAdmin(req, res, next) {
  try {
    let userIdA, password;
    if (Boolean(req.headers.admin) == true) {
      userIdA = req.headers.userida;
      password = req.headers.password;
    } else {
      userIdA = req.body.userIdA;
      password = req.body.password;
    }
    if (!userIdA || !password) {
      return res.send({
        success: false,
        status: 404,
        message: "UserId or password is missing for admin confirmation",
      });
    }
    let admin = await user.findById(userIdA);
    if (!!admin) {
      let isAdmin = bcrypt.compareSync(password, admin.password);
      if (isAdmin == true && admin.admin == true) {
        return next();
      }
      return res.send({
        success: false,
        status: 400,
        message: "Admin password does not match",
      });
    }
    return res.send({
      success: false,
      status: 400,
      message: "Provided userId is not of admin",
    });
  } catch (error) {
    res.send({
      success: false,
      statu: 403,
      message: "Admin authorization failed",
    });
  }
}

async function verifyUser(req, res, next) {
  try {
    let { user_id, user_password } = req.body;
    let userA = await user.findById(user_id);
    if (!!userA) {
      let isUser = bcrypt.compareSync(user_password, userA.password);
      if (isUser == true) {
        return next();
      }
      return res.send({
        success: false,
        status: 400,
        message: "User password does not match",
      });
    }
    return res.send({
      success: false,
      status: 400,
      message: "Provided user_id does not found",
    });
  } catch (error) {
    res.send({
      success: false,
      status: 403,
      message: "User authorization failed",
    });
  }
}

async function verifyUserFormData(req, res, next) {
  try {
    const { user_id, user_password } = req.body;

    if (!user_id || !user_password) {
      return res.send({
        success: false,
        status: 400,
        message: "Missing user_id and/or user_password in formData",
      });
    }

    const userA = await user.findById(user_id);

    if (!userA) {
      return res.send({
        success: false,
        status: 400,
        message: "Provided user_id not found",
      });
    }

    const isUser = bcrypt.compareSync(user_password, userA.password);

    if (isUser) {
      next();
    } else {
      return res.send({
        success: false,
        status: 400,
        message: "User password does not match",
      });
    }
  } catch (error) {
    res.send({
      success: false,
      status: 403,
      message: "User authorization failed",
    });
  }
}

function imageUploadRestriction(req, res, next) {
  try {
    res.send({
      success: false,
      status: 400,
      message: "This feature is not supported in production.",
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in imageUploadRestrictionB`,
    });
  }
}
