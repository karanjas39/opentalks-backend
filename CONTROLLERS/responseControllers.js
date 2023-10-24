const Response = require(".././MODEL/responseModel");
const Complaint = require(".././MODEL/complaintModel");
const notification = require(".././MODEL/notificationModel");

module.exports = { createResponse, getResponses };

async function createResponse(req, res) {
  try {
    let { complaintId, response, userId, forumId } = req.body;
    let invalidFields = [];
    if (!complaintId) {
      invalidFields.push("complaintid");
    }
    if (!response) {
      invalidFields.push("response");
    }
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

    await Response.create({ complaintId, response, userId, forumId });
    res.send({
      success: true,
      status: 200,
      message: "Response created",
    });
    let complaint = await Complaint.findById(complaintId).populate(
      "forumId",
      "name"
    );
    if (!!complaint) {
      await notification.create({
        userId,
        message: `Admin responded to your complaint Id: ${complaint.complaint_number} in ${complaint.forumId.name} forum`,
      });
    }
    complaint.isResponded = true;
    await complaint.save();
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in createResponseB`,
    });
  }
}

async function getResponses(req, res) {
  try {
    let { userId, forumId, byAdmin, complaintId } = req.body;
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

    let query =
      !!byAdmin && byAdmin == true
        ? { userId, forumId, complaintId }
        : { userId, forumId, complaintId, active: true };
    let responses = await Response.find(query)
      .populate("complaintId", "complaint_number")
      .sort({ createdAt: -1 });

    res.send({
      success: true,
      status: 200,
      responses,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in getResponseB`,
    });
  }
}
