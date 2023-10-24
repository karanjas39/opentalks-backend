const Complaint = require(".././MODEL/complaintModel");
const user = require(".././MODEL/userModel");
const notification = require(".././MODEL/notificationModel");
const forum = require(".././MODEL/forumModel");

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintsUser,
  searchComplaint,
};

async function createComplaint(req, res) {
  try {
    let { userId, forumId, complaint } = req.body;
    let invalidFields = [];
    if (!userId) {
      invalidFields.push("userid");
    }
    if (!forumId) {
      invalidFields.push("forumid");
    }
    if (!complaint) {
      invalidFields.push("complaint");
    }
    if (invalidFields.length != 0) {
      return res.send({
        success: false,
        status: 404,
        message: `Required fields: ${invalidFields.join(", ")}`,
      });
    }
    let isUser = await user.findOne({ _id: userId });
    if (!isUser) {
      return res.send({
        success: false,
        status: 404,
        message: "User who want to complaint does not exist",
      });
    }
    let isForum = await forum.findOne({ _id: forumId });
    if (!isForum) {
      return res.send({
        success: false,
        status: 404,
        message: "Forum does not exist",
      });
    }
    let newComplaint = await Complaint.create({
      userId,
      forumId,
      complaint,
      adminId: isForum.userId,
    });
    if (!newComplaint) {
      return res.send({
        success: false,
        status: 400,
        message: "Complaint not created successfully",
      });
    }

    res.send({
      success: true,
      status: 200,
      message: "Complaint created",
      complaint: newComplaint,
    });
    await notification.create({
      userId: isForum.userId,
      message: `Dear admin, ${isUser.name} complained in ${isForum.name} forum`,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in createComplaintB`,
    });
  }
}

// FOR FORUM ADMIN
async function getComplaints(req, res) {
  try {
    let { forumId, byAdmin, startPoint = 0 } = req.body;
    if (!forumId) {
      return res.send({
        success: false,
        status: 404,
        message: "ForumId is required",
      });
    }
    let query = !byAdmin ? { forumId, active: true } : { forumId };
    let isForum = await forum.findOne({ _id: forumId });
    if (!isForum) {
      return res.send({
        success: false,
        status: 404,
        message: "Forum not exist",
      });
    }
    let complaints = await Complaint.find(query)
      .populate("userId", "name image")
      .sort({ createdAt: -1 })
      .skip(startPoint)
      .limit(5);
    if (complaints.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No complants found",
      });
    }
    res.send({
      success: true,
      status: 200,
      complaints,
      nextStartPoint: startPoint + 5,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in createComplaintB`,
    });
  }
}

// FOR FORUM USER
async function getComplaintsUser(req, res) {
  try {
    let { userId, forumId, startPoint = 0, limitPoint = 10 } = req.body;
    let invalidFields = [];
    if (!userId) {
      invalidFields.push("userid");
    }
    if (!forumId) {
      invalidFields.push("forumid");
    }
    if (invalidFields.length != 0) {
      return res.send({
        success: false,
        status: 404,
        message: `Required fields: ${invalidFields.join(", ")}`,
      });
    }
    let complaints = await Complaint.find({
      userId,
      forumId,
      active: true,
    })
      .sort({
        createdAt: -1,
      })
      .skip(startPoint)
      .limit(limitPoint);

    if (complaints.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No complants found",
      });
    }

    res.send({
      success: true,
      status: 200,
      complaints,
      nextStartPoint: startPoint + limitPoint,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in getComplaintsUser`,
    });
  }
}

async function searchComplaint(req, res) {
  try {
    let { complaint_number, forumId, userId } = req.body;
    let invalidFields = [];
    if (!complaint_number) {
      invalidFields.push("complaint_number");
    }
    if (!forumId) {
      invalidFields.push("forumid");
    }
    if (invalidFields.length != 0) {
      return res.send({
        success: false,
        status: 404,
        message: `Required fields: ${invalidFields.join(", ")}`,
      });
    }

    let query = !!userId
      ? { complaint_number, forumId, userId }
      : { complaint_number, forumId };

    let complaint = await Complaint.findOne(query).populate(
      "userId",
      "_id name image"
    );
    if (!complaint) {
      return res.send({
        success: false,
        status: 404,
        message: "No complaint found",
      });
    }

    res.send({
      success: true,
      status: 200,
      complaint,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error:${error.toString()} in searchComplaintB`,
    });
  }
}
