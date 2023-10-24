const reply = require(".././MODEL/replyModel");
const forum = require(".././MODEL/forumModel");
const post = require(".././MODEL/postModel");
const notification = require("../MODEL/notificationModel");
const user = require(".././MODEL/userModel");

module.exports = {
  createReply,
  getPostReply,
  deleteReply,
  loadRecentReplies,
  updateReply,
  reactivatereply,
};

async function createReply(req, res) {
  try {
    let { byWhom, postId, forumId, message } = req.body;

    let invalidFields = [];

    if (!byWhom) {
      invalidFields.push("byWhom");
    }
    if (!postId) {
      invalidFields.push("postId");
    }
    if (!forumId) {
      invalidFields.push("forumId");
    }
    if (!message) {
      invalidFields.push("message");
    }

    if (invalidFields.length != 0) {
      res.send({
        success: false,
        status: 400,
        message: `Required fields: ${invalidFields.join(", ")}`,
      });
    } else {
      let isByWhom = await user.findById(byWhom).select("name");
      if (!isByWhom) {
        return res.send({
          success: false,
          status: 404,
          message: "User not found",
        });
      }
      let isForum = await forum.findById(forumId);
      if (!isForum) {
        return res.send({
          success: false,
          status: 404,
          message: "Forum not found",
        });
      }

      let isPost = await post
        .findById(postId)
        .populate({
          path: "userId",
          select: "_id",
        })
        .select("title");
      if (!isPost) {
        return res.send({
          success: false,
          status: 404,
          message: "Post not found",
        });
      }
      let newReply = await reply.create({ byWhom, postId, forumId, message });

      await newReply.populate("byWhom", "name image");

      await newReply.save();
      if (!newReply) {
        return res.send({
          success: false,
          status: 400,
          message: "Failed to create reply",
        });
      }
      res.send({
        success: true,
        status: 200,
        message: "Reply created",
        newReply,
      });
      if (isPost.userId._id != byWhom) {
        await notification.create({
          userId: isPost.userId._id,
          message: `${isByWhom.name} replied to your post "${isPost.title}" in ${isForum.name} forum`,
        });
      }
    }
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in createreply`,
    });
  }
}

async function getPostReply(req, res) {
  let { postId } = req.body;
  if (!postId) {
    return res.send({
      success: false,
      status: 404,
      message: "PostId is required",
    });
  }

  let query = !!req.body.byAdmin ? { postId } : { postId, active: true };

  let replies = await reply.find(query).populate("byWhom", "name image");

  if (replies.length == 0) {
    return res.send({
      success: false,
      status: 404,
      message: "No reply found",
    });
  }
  res.send({
    success: true,
    status: 200,
    result: replies.length,
    message: "Replies found",
    replies,
  });
}

async function deleteReply(req, res) {
  try {
    let { _id } = req.body;
    if (!_id) {
      return res.send({
        success: false,
        status: 404,
        message: "replyId is required",
      });
    }
    await reply.updateOne({ _id }, { active: false });

    if (!!req.body.byAdmin && req.body.byAdmin == true) {
      let updatedReply = await reply
        .findOne({ _id })
        .populate({
          path: "postId",
          select: "title userId",
          populate: {
            path: "userId",
            select: "name",
          },
        })
        .populate({
          path: "forumId",
          select: "name",
        });
      await notification.create({
        userId: updatedReply.byWhom,
        message: `Your reply on ${updatedReply.postId.userId.name}'s post ${updatedReply.postId.title} in ${updatedReply.forumId.name} forum has been deleted by the Opentalks administrator`,
      });
    }

    res.send({
      success: true,
      status: 200,
      message: "Reply deleted",
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in deleteReply`,
    });
  }
}

async function updateReply(req, res) {
  try {
    let { _id, byAdmin, message } = req.body;
    let invalidFields = [];
    if (!_id) {
      invalidFields.push("_id");
    }
    if (!byAdmin) {
      invalidFields.push("byAdmin");
    }
    if (!message) {
      invalidFields.push("message");
    }
    if (invalidFields.length != 0) {
      return res.send({
        siccess: false,
        status: 404,
        message: `Required fields: ${invalidFields.join(", ")}`,
      });
    }

    let isUpdated = await reply.updateOne({ _id, active: true }, { message });
    if (isUpdated.modifiedCount == 1) {
      res.send({
        success: true,
        status: 200,
        message: "Reply updated",
      });

      let getreply = await reply
        .findOne({ _id, active: true })
        .populate({
          path: "postId",
          select: "title userId",
          populate: {
            path: "userId",
            select: "name",
          },
        })
        .populate({
          path: "forumId",
          select: "name",
        });
      await notification.create({
        userId: getreply.byWhom,
        message: `Your reply on ${getreply.postId.userId.name}'s post ${getreply.postId.title} in forum ${getreply.forumId.name} has been updated by the Opentalks Administrator`,
      });
    }
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in updateReply`,
    });
  }
}

async function reactivatereply(req, res) {
  try {
    let { _id, byAdmin } = req.body;
    let invalidFields = [];
    if (!_id) {
      invalidFields.push("_id");
    }
    if (!byAdmin) {
      invalidFields.push("byAdmin");
    }
    if (invalidFields.length != 0) {
      return res.send({
        siccess: false,
        status: 404,
        message: `Required fields: ${invalidFields.join(", ")}`,
      });
    }

    let getreply = await reply
      .findOne({ _id })
      .populate({
        path: "postId",
        select: "title userId active",
        populate: {
          path: "userId",
          select: "name",
        },
      })
      .populate({
        path: "forumId",
        select: "name",
      });

    if (getreply.postId.active == false) {
      return res.send({
        success: false,
        status: 400,
        message: "Post on which the user replied is deleted",
      });
    }

    await reply.updateOne({ _id }, { active: true });

    res.send({
      success: true,
      status: 200,
      message: "Reply is activated",
    });

    await notification.create({
      userId: getreply.byWhom,
      message: `Your reply on ${getreply.postId.userId.name}'s post ${getreply.postId.title} in forum ${getreply.forumId.name} has been activated by the Opentalks Administrator`,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in reactivatereplyB`,
    });
  }
}

async function loadRecentReplies(req, res) {
  try {
    let { userId, lastLogin, startPoint = 0 } = req.body;
    let invalidFields = [];
    if (!userId) {
      invalidFields.push("userid");
    }
    if (!lastLogin) {
      invalidFields.push("lastlogin");
    }
    if (invalidFields.length != 0) {
      return res.send({
        success: false,
        status: 404,
        message: `Required fields: ${invalidFields.join(", ")}`,
      });
    }

    let allPosts = await post.find({ userId, active: true });

    let query = {
      createdAt: { $gt: lastLogin },
      active: true,
      postId: { $in: allPosts },
      byWhom: { $ne: userId },
    };

    let recentReplies = await reply
      .find(query)
      .populate("forumId", "name")
      .populate("byWhom", "name image")
      .populate("postId", "title")
      .skip(startPoint)
      .limit(5)
      .sort({ createdAt: -1 });

    res.send({
      success: true,
      status: 200,
      message: "Replies found",
      recentReplies,
      nextStartPoint: startPoint + 5,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in GetRecentRepliesB`,
    });
  }
}
