//@collapse
const notification = require(".././MODEL/notificationModel");
const user = require(".././MODEL/userModel");

module.exports = {
  getAllNotifications,
  deleteNotificatiosAll,
  recentNotifications,
  searchNotification,
  adminNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  forgetPassword,
};

async function getAllNotifications(req, res) {
  let { userId, startPoint = 0 } = req.body;
  if (!userId) {
    return res.send({
      success: false,
      status: 404,
      message: "UserId is needed",
    });
  }

  let notifications = await notification
    .find({ userId, active: true })
    .skip(startPoint)
    .limit(10)
    .sort({ createdAt: -1 });

  if (notifications.length == 0) {
    return res.send({
      success: false,
      status: 400,
      message: "No new notification",
    });
  }

  res.send({
    success: true,
    status: 200,
    message: "New notifications",
    notifications,
    nextStartPoint: startPoint + 10,
  });
}

async function deleteNotificatiosAll(req, res) {
  let { userId } = req.body;
  if (!userId) {
    return res.send({
      success: false,
      status: 404,
      message: "UserId is needed",
    });
  }

  await notification.updateMany({ userId }, { active: false });
  res.send({
    success: true,
    status: 200,
    message: "Notifications cleared",
  });
}

async function recentNotifications(req, res) {
  try {
    let notifications = await notification
      .find()
      .populate("userId", "name image registration_number")
      .sort({ createdAt: -1 })
      .limit(5);

    if (notifications.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No notifications found",
      });
    }
    res.send({
      success: true,
      status: 200,
      notifications,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in recentNotificationsB`,
    });
  }
}

async function searchNotification(req, res) {
  try {
    let { registration_number, startPoint = 0 } = req.body;
    let results;

    if (!registration_number) {
      return res.send({
        success: false,
        status: 404,
        message: "regis no is required",
      });
    }

    let isUser = await user.findOne({ registration_number });

    if (!isUser) {
      return res.send({
        success: false,
        status: 404,
        message: "No such user found",
      });
    }

    if (startPoint == 0) {
      results = await notification.countDocuments({ userId: isUser._id });
    }

    let notifications = await notification
      .find({ userId: isUser._id })
      .populate("userId", "name image registration_number")
      .skip(startPoint)
      .limit(10)
      .sort({ createdAt: -1 });

    if (notifications.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No notifications found",
      });
    }

    res.send({
      success: true,
      status: 200,
      notifications,
      results,
      nextStartPoint: startPoint + 10,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in searchNotificationB`,
    });
  }
}

async function adminNotifications(req, res) {
  try {
    let { startPoint = 0 } = req.body;

    let notifications = await notification
      .find({ forAdmin: true })
      .populate("userId", "name image registration_number")
      .skip(startPoint)
      .limit(10);

    if (notifications.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No notifications found",
      });
    }

    res.send({
      success: true,
      status: 200,
      notifications,
      nextStartPoint: startPoint + 10,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in adminNotificationsB`,
    });
  }
}

async function createNotification(req, res) {
  try {
    let { registration_number, message } = req.body;

    let invalidFields = [];
    if (!registration_number) {
      invalidFields.push("RegisNo");
    }
    if (!message) {
      invalidFields.push("message");
    }
    if (invalidFields.length != 0) {
      return res.send({
        success: false,
        status: 404,
        message: `Required: ${invalidFields.join(", ")}`,
      });
    }

    let isUser = await user.findOne({ registration_number });

    if (!isUser) {
      return res.send({
        success: false,
        status: 404,
        message: "No such user found",
      });
    }

    let createdNotification = await notification.create({
      userId: isUser._id,
      message,
    });

    if (!createdNotification) {
      return res.send({
        success: false,
        statu: 400,
        message: "Notification does not created successfully.",
      });
    }

    res.send({
      success: true,
      status: 200,
      message: "Notification created successfully.",
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in createNotificationB`,
    });
  }
}

async function updateNotification(req, res) {
  try {
    let { _id, message } = req.body;
    let invalidFields = [];
    if (!_id) {
      invalidFields.push("id");
    }
    if (!message) {
      invalidFields.push("message");
    }

    if (invalidFields.length != 0) {
      return res.send({
        success: false,
        status: 404,
        message: `Required: ${invalidFields.join(", ")}`,
      });
    }

    let updatedNotification = await notification.updateOne(
      { _id },
      { message },
      { new: true }
    );

    if (!updatedNotification) {
      return res.send({
        success: false,
        statu: 400,
        message: "Notification does not updated successfully.",
      });
    }

    res.send({
      success: true,
      statu: 200,
      message: "Notification updated successfully.",
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in updateNotificationB`,
    });
  }
}

async function deleteNotification(req, res) {
  try {
    let { _id } = req.body;

    if (!_id) {
      return res.send({
        success: false,
        status: 404,
        message: "id is required",
      });
    }

    let isDeleted = await notification.deleteOne({ _id });

    if (!isDeleted) {
      return res.send({
        success: false,
        status: 400,
        message: "Notification does not deleted successfully.",
      });
    }

    res.send({
      success: true,
      status: 200,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in deleteNotificationB`,
    });
  }
}

async function forgetPassword(req, res) {
  try {
    let { userId } = req.body;
    if (!userId) {
      return res.send({
        success: false,
        status: 404,
        message: "id is required",
      });
    }

    let isUser = await user
      .findOne({ _id: userId })
      .select("_id name registration_number");

    if (!isUser) {
      return res.send({
        success: false,
        status: 404,
        message: "No such user found",
      });
    }

    let message = `${isUser.name} having registration number ${isUser.registration_number} requested to change his/her account password.`;

    let newnotification = await notification.create({
      userId: isUser._id,
      forAdmin: true,
      message,
    });

    if (!newnotification) {
      return res.send({
        success: false,
        status: 400,
        message: "Unable to contact administrator.",
      });
    }

    res.send({
      success: true,
      status: 200,
      message: "You will be notified soon by the administrator.",
    });
  } catch (error) {
    console.log(`Error: ${error.toString()} in forgetPasswordB`);
  }
}
