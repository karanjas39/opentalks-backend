// @collapse
const forum = require(".././MODEL/forumModel");
const user = require(".././MODEL/userModel");
const join_forum = require(".././MODEL/joinForumModel");
const posts = require(".././MODEL/postModel");
const notification = require(".././MODEL/notificationModel");
const reply = require(".././MODEL/replyModel");
const forum_like = require(".././MODEL/forumLikeModel");
const response = require(".././MODEL/responseModel");
const complaint = require(".././MODEL/complaintModel");
const post_likes = require(".././MODEL/postLikeModel");

module.exports = {
  createForum,
  createForumByAdmin,
  getForum,
  getForumName,
  getForumDetails,
  forumFilterByAdmin,
  forumFilterUser,
  deleteForum,
  updateForum,
  getAllForum,
  joinForum,
  joinForumByAdmin,
  joinForumRequest,
  getJoinedForums,
  leftJoinedForum,
  showJoinRequests,
  getJoinedMember,
  getJoinedMemberList,
  recentJoinee,
  searchJoinee,
  filterJoinee,
};

async function createForum(req, res) {
  try {
    let formData = req.body;
    let invalidFields = [];
    if (!formData.name) {
      invalidFields.push("name");
    }
    if (!formData.description) {
      invalidFields.push("description");
    }
    if (!formData.departmentId) {
      invalidFields.push("department Id");
    }
    if (!formData.userId) {
      invalidFields.push("user Id");
    }
    if (invalidFields.length != 0) {
      res.send({
        success: false,
        status: 400,
        message: `Required Fields: ${invalidFields.join(", ")}`,
      });
    } else {
      let data = await forum.findOne({ name: formData.name, active: true });
      if (!!data) {
        res.send({
          success: false,
          status: 400,
          message: "Forum name already exist",
        });
      } else {
        let newForum = await forum.create(formData);
        if (!newForum) {
          return res.send({
            success: false,
            status: 400,
            message: "Forum does not created successfully",
          });
        }
        res.send({
          success: true,
          status: 200,
          message: "Forum created successfully",
          new_forum: newForum,
        });
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

async function createForumByAdmin(req, res) {
  try {
    let { registration_number, name, description, departmentId } = req.body;
    let invalidFields = [];

    if (!registration_number) {
      invalidFields.push("regis_no");
    }
    if (!name) {
      invalidFields.push("name");
    }
    if (!description) {
      invalidFields.push("description");
    }
    if (!departmentId) {
      invalidFields.push("departmentid");
    }

    if (invalidFields.length != 0) {
      return res.send({
        success: false,
        status: 404,
        message: `Required fields: ${invalidFields.join(", ")}`,
      });
    }

    let [isAdminExist, isForumExist] = await Promise.all([
      user.findOne({ registration_number }),
      forum.findOne({ name }),
    ]);

    if (!isAdminExist) {
      return res.send({
        success: false,
        status: 404,
        message: "The new forum admin not found",
      });
    }
    if (!!isForumExist) {
      return res.send({
        success: false,
        status: 400,
        message: "The forum already exist",
      });
    }

    await forum.create({
      name,
      description,
      departmentId,
      userId: isAdminExist._id,
    });

    notification.create({
      userId: isAdminExist._id,
      message: `Opentalks administrator made you the admin of newly created forum ${name}`,
    });

    res.send({
      success: true,
      status: 200,
      message: "Forum created",
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in createForumByAdminB`,
    });
  }
}

async function getForum(req, res) {
  try {
    let { searchQuery, byAdmin } = req.body;

    if (!searchQuery) {
      res.send({
        success: false,
        status: 400,
        message: "Searchquery is mandatory",
      });
    } else {
      let searchRegex = new RegExp(searchQuery, "i");

      let query =
        !!byAdmin && byAdmin == true
          ? {
              $or: [{ name: searchRegex }, { description: searchRegex }],
            }
          : {
              $or: [
                { name: searchRegex, active: true },
                { description: searchRegex, active: true },
              ],
            };

      let startPoint = !!req.body.startPoint ? req.body.startPoint : 0;
      let results;
      if (startPoint == 0) {
        results = await forum.countDocuments(query);
      }
      let foundForums = await forum
        .find(query)
        .populate("userId", "name image")
        .skip(startPoint)
        .limit(10);

      if (foundForums.length == 0) {
        res.send({
          success: false,
          status: 400,
          message: "Forum not found",
        });
      } else {
        res.send({
          success: true,
          status: 200,
          message: "Forum found",
          forums: foundForums,
          results,
          nextStartPoint: startPoint + 10,
        });
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

async function getForumDetails(req, res) {
  try {
    let { _id, byAdmin } = req.body;
    if (!_id) {
      return res.send({
        success: false,
        status: 404,
        message: "_id is madatory",
      });
    }
    let query = !!byAdmin && byAdmin == true ? { _id } : { _id, active: true };
    let data = await Promise.all([
      forum.findOne(query).populate("userId", "name").populate("departmentId"),
      join_forum.countDocuments({ forumId: _id, active: true }),
    ]);

    let forumDetails = data[0];

    if (!forumDetails) {
      return res.send({
        success: false,
        status: 404,
        message: "No forum found",
      });
    }
    let members = data[1];
    res.send({
      success: true,
      status: 200,
      forum: forumDetails,
      members,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in getForumDetailsB`,
    });
  }
}

async function forumFilterByAdmin(req, res) {
  try {
    let { filter } = req.body;
    let query = {},
      results;

    if (filter.departmentId) {
      query.departmentId = filter.departmentId;
    }

    if (filter.registration_number) {
      let userID = await user
        .findOne({ registration_number: filter.registration_number })
        .select("_id");
      if (!userID) {
        return res.send({
          success: false,
          status: 404,
          message: `User with ${filter.registration_number} not found`,
        });
      }
      query.userId = userID._id;
    }

    if (filter.name) {
      const matchingUsers = await user.find(
        { name: { $regex: filter.name, $options: "i" } },
        "_id"
      );
      const userIds = matchingUsers.map((user) => user._id);

      query.userId = { $in: userIds };
    }

    if (filter.createdAt) {
      query.createdAt = { $gte: new Date(filter.createdAt) };
    }

    if (filter.updatedAt) {
      query.updatedAt = { $gte: new Date(filter.updatedAt) };
    }

    if (filter.active !== undefined) {
      query.active = filter.active;
    }

    const sortBy = filter.sortBy || { likes: -1 };
    const startPoint = !!req.body.startPoint ? req.body.startPoint : 0;

    if (startPoint == 0) {
      results = await forum.countDocuments(query);
    }
    const forums = await forum
      .find(query)
      .skip(startPoint)
      .limit(10)
      .populate("userId", "name")
      .sort(sortBy);

    if (forums.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No result found",
      });
    }

    res.send({
      success: true,
      status: 200,
      forums,
      results,
      nextStartPoint: startPoint + 10,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in forumFilterByAdminB`,
    });
  }
}

async function forumFilterUser(req, res) {
  try {
    let { name, departmentId, createdAt, startPoint = 0 } = req.body;
    let query = {},
      results;
    if (!!name) {
      const matchingUsers = await user.find(
        { name: { $regex: name, $options: "i" } },
        "_id"
      );
      const userIds = matchingUsers.map((user) => user._id);

      query.userId = { $in: userIds };
    }
    if (!!departmentId) {
      query.departmentId = departmentId;
    }

    if (!!createdAt) {
      query.createdAt = { $gte: new Date(createdAt) };
    }

    if (startPoint == 0) {
      results = await forum.countDocuments({ ...query, active: true });
    }

    const forums = await forum
      .find({ ...query, active: true })
      .skip(startPoint)
      .limit(10)
      .populate("userId", "name image")
      .sort({ createdAt: -1 });

    if (forums.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No result found",
      });
    }

    res.send({
      success: true,
      status: 200,
      forums,
      results,
      nextStartPoint: startPoint + 10,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in forumFilterUserB`,
    });
  }
}

async function deleteForum(req, res) {
  try {
    let { _id, byAdmin } = req.body;
    if (!_id) {
      return res.send({
        success: false,
        status: 400,
        message: "ID is mandatory",
      });
    }
    let query = !!byAdmin && byAdmin == true ? { _id } : { _id, active: true };

    let data = await forum
      .findOne(query)
      .populate("departmentId", "name")
      .populate("userId", (select = "name registration_number"));

    if (!data) {
      return res.send({
        success: false,
        status: 404,
        message: "Forum not found",
      });
    }

    if (!!byAdmin && byAdmin == true) {
      await forum.deleteOne({ _id });

      (await join_forum.find({ forumId: _id })).forEach(async (el) => {
        await notification.create({
          userId: el.userId,
          message: `${data.name} forum is deleted by the Opentalks Administrator`,
        });
      });

      await join_forum.deleteMany({ forumId: _id });
      await posts.deleteMany({ forumId: _id });
      await reply.deleteMany({ forumId: _id });
      await forum_like.deleteMany({ forumId: _id });
      await response.deleteMany({ forumId: _id });
      await complaint.deleteMany({ forumId: _id });
      await post_likes.deleteMany({ forumId: _id });

      res.send({
        success: true,
        status: 200,
        message: "Forum deleted",
        deleted_forum: data,
      });

      await notification.create({
        userId: data.userId._id,
        message: `${data.name} forum is deleted by the Opentalks Administrator`,
      });
    } else {
      await forum.updateOne({ _id }, { active: false });

      (await join_forum.find({ forumId: _id })).forEach(async (el) => {
        await notification.create({
          userId: el.userId,
          message: `${data.name} forum is deleted by admin ${data.userId.name}`,
        });
      });

      await join_forum.updateMany({ forumId: _id }, { active: false });
      await posts.updateMany({ forumId: _id }, { active: false });
      await reply.updateMany({ forumId: _id }, { active: false });
      await response.updateMany({ forumId: _id }, { active: false });
      await complaint.updateMany({ forumId: _id }, { active: false });

      res.send({
        success: true,
        status: 200,
        message: "Forum deleted",
        deleted_forum: data,
      });
    }
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()}`,
    });
  }
}

async function updateForum(req, res) {
  try {
    let { _id } = req.body;
    if (!_id) {
      res.send({
        success: false,
        status: 400,
        message: "ID is mandatory",
      });
    } else {
      if (!!req.body.userId && !!req.body.byAdmin == false) {
        res.send({
          success: false,
          status: 400,
          message: "User who created the post can't be updated",
        });
      } else {
        if (!!req.body.name) {
          let data = await forum.findOne({ name: req.body.name });
          if (!!data) {
            res.send({
              success: false,
              status: 404,
              message: "Forum name already exist",
            });
          } else {
            let data = await forum
              .findByIdAndUpdate(
                { _id },
                { ...req.body, updatedAt: Date.now() },
                { new: true }
              )
              .populate("departmentId", "name")
              .populate("userId", (select = "name registration_number"));
            if (!data) {
              res.send({
                success: false,
                status: 404,
                message: "Forum not found",
              });
            } else {
              res.send({
                success: true,
                status: 200,
                message: "Forum updated",
                updated_forum: data,
              });
            }
          }
        } else {
          let data = await forum
            .findByIdAndUpdate(
              { _id },
              { ...req.body, updatedAt: Date.now() },
              { new: true }
            )
            .populate("departmentId", "name")
            .populate("userId", (select = "name registration_number"));

          if (!data) {
            res.send({
              success: false,
              status: 404,
              message: "Forum not found",
            });
          } else {
            res.send({
              success: true,
              status: 200,
              message: "Forum updated",
              updated_forum: data,
            });
          }
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

async function getForumName(req, res) {
  try {
    let forum_names = await forum.find({ active: true }).select("name");
    if (forum_names.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No forum found",
      });
    }
    res.send({
      success: true,
      status: 200,
      forums: forum_names,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in getForumNameB`,
    });
  }
}

async function getAllForum(req, res) {
  try {
    let data = await forum
      .find({ ...req.body, active: true })
      .populate("departmentId", "name")
      .populate("userId", (select = "name registration_number"));

    if (data.length == 0) {
      res.send({
        success: false,
        status: 404,
        message: "No forum exist",
      });
    } else {
      res.send({
        success: true,
        status: 200,
        results: data.length,
        forums: data,
      });
    }
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()}`,
    });
  }
}

async function joinForumRequest(req, res) {
  try {
    let { userId, forumId } = req.body;
    let invalidFields = [];
    if (!userId) {
      invalidFields.push("userId");
    }
    if (!forumId) {
      invalidFields.push("forumId");
    }
    if (invalidFields.length != 0) {
      return res.send({
        success: false,
        status: 400,
        message: `Required fields: ${invalidFields.join(", ")}`,
      });
    }

    let isUser = await user.findById(userId);
    if (!isUser) {
      res.send({
        success: false,
        status: 404,
        message: "User not found",
      });
    } else {
      let isForum = await forum.findOne({ _id: forumId, active: true });
      if (!isForum) {
        res.send({
          success: false,
          status: 404,
          message: "Forum not found",
        });
      } else {
        let isUserForumOwner = await forum.findOne({
          userId,
          _id: forumId,
          active: true,
        });
        if (!!isUserForumOwner) {
          return res.send({
            success: false,
            status: 400,
            message: "User is already admin of the requested forum",
          });
        }
        let isAlreadyJoined = await join_forum.findOne({
          userId,
          forumId,
          active: true,
        });
        if (!!isAlreadyJoined) {
          return res.send({
            success: false,
            status: 400,
            message: "User already joined the forum",
          });
        }
        let isAlreadyRequested = await forum.findOne({
          _id: forumId,
          "joinRequests.userId": userId,
          active: true,
        });
        if (!!isAlreadyRequested) {
          return res.send({
            success: false,
            status: 400,
            message: "User already sent a join request for this forum",
          });
        }
        isForum.joinRequests.push({ userId });
        await isForum.save();
        await notification.create({
          userId: isForum.userId,
          message: `${isUser.name} requested to join ${isForum.name} forum`,
        });

        res.send({
          success: true,
          status: 200,
          message: "Join request sent successfully",
        });
      }
    }
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in joinForumRequest`,
    });
  }
}

async function showJoinRequests(req, res) {
  let { forumId, userId, byAdmin = false } = req.body;
  let invalidFields = [];
  if (!userId) {
    invalidFields.push("userId");
  }
  if (!forumId) {
    invalidFields.push("forumId");
  }
  if (invalidFields.length != 0) {
    res.send({
      success: false,
      status: 400,
      message: `Required fields: ${invalidFields.join(", ")}`,
    });
  } else {
    let query =
      byAdmin == false
        ? { _id: forumId, userId, active: true }
        : { _id: forumId };

    let isUserAdmin = await forum
      .findOne(query)
      .populate({
        path: "joinRequests.userId",
        select: "name image",
      })
      .skip(0)
      .limit(4);

    if (!isUserAdmin && byAdmin == false) {
      res.send({
        success: false,
        status: 404,
        message: "User is not admin of the forum",
      });
    } else {
      res.send({
        success: true,
        status: 200,
        message: "Join list found",
        results: isUserAdmin.joinRequests.length,
        join_request_list: isUserAdmin.joinRequests,
      });
    }
  }
}

async function joinForum(req, res) {
  try {
    let { userId, forumId, status, requestId } = req.body;
    let invalidFields = [];
    if (!userId) {
      invalidFields.push("userId");
    }
    if (!forumId) {
      invalidFields.push("forumId");
    }
    if (!status) {
      invalidFields.push("status");
    }
    if (!requestId) {
      invalidFields.push("requestId");
    }
    if (invalidFields.length != 0) {
      return res.send({
        success: false,
        status: 400,
        message: `Required fields: ${invalidFields.join(", ")}`,
      });
    }

    let isRequest = await forum.findOne({
      _id: forumId,
      "joinRequests.userId": userId,
      active: true,
    });

    if (!isRequest) {
      return res.send({
        success: false,
        status: 404,
        message: "No request found",
      });
    }

    await forum.findByIdAndUpdate(forumId, {
      $pull: { joinRequests: { _id: requestId } },
    });

    let isAlreadyJoined = await join_forum.findOne({
      userId,
      forumId,
    });

    let forumName = await forum.findById(forumId).select("name userId");

    if (!!isAlreadyJoined) {
      if (isAlreadyJoined.active == false && status == "accepted") {
        await join_forum.updateOne(
          { _id: isAlreadyJoined._id },
          { active: true }
        );
        await posts.updateMany({ userId, forumId }, { active: true });
        await reply.updateMany({ byWhom: userId, forumId }, { active: true });
        await complaint.updateMany({ userId, forumId }, { active: true });
        await response.updateMany({ userId, forumId }, { active: true });
        await notification.create({
          userId,
          message: `Request accepted for ${forumName.name} forum and your previous data is restored`,
        });
        return res.send({
          success: true,
          status: 200,
          result: 1,
          message: "Request accepted",
        });
      } else if (isAlreadyJoined.active == false && status == "rejected") {
        await notification.create({
          userId,
          message: `Request rejected for ${forumName.name} forum`,
        });
        return res.send({
          success: true,
          status: 200,
          result: 0,
          message: "Request rejected",
        });
      }
      return res.send({
        success: false,
        status: 400,
        message: "User already joined the forum",
      });
    }

    if (status == "rejected") {
      await notification.create({
        userId,
        message: `Request rejected for ${forumName.name} forum`,
      });
      res.send({
        success: true,
        status: 200,
        result: 0,
        message: "Request rejected",
      });
    }

    if (status == "accepted") {
      await notification.create({
        userId,
        message: `Request accepted for ${forumName.name} forum`,
      });

      await join_forum.create({ userId, forumId, adminId: forumName.userId });
      res.send({
        success: true,
        status: 200,
        result: 1,
        message: "Request accepted",
      });
    }
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in join forum`,
    });
  }
}

async function joinForumByAdmin(req, res) {
  try {
    let { registration_number, forumId } = req.body;
    let invalidFields = [];
    if (!registration_number) {
      invalidFields.push("adm_number");
    }
    if (!forumId) {
      invalidFields.push("forumId");
    }
    if (invalidFields.length != 0) {
      return res.send({
        success: false,
        status: 404,
        message: `Required Fields: ${invalidFields.join(", ")}`,
      });
    }

    let requestedUser = await user.findOne({
      registration_number: Number(registration_number),
    });

    if (!requestedUser) {
      return res.send({
        success: false,
        status: 404,
        message: "User not exist",
      });
    }
    let forumName = await forum.findById(forumId).select("name userId");

    if (forumName.userId.equals(requestedUser._id)) {
      return res.send({
        success: false,
        status: 400,
        message: "User is already admin of this forum",
      });
    }

    let isUserjoined = await join_forum
      .findOne({
        userId: requestedUser._id,
        forumId,
      })
      .populate("forumId", "name");
    if (!!isUserjoined) {
      if (isUserjoined.active == true) {
        return res.send({
          success: false,
          status: 400,
          message: "User is already member of the forum",
        });
      } else {
        await join_forum.updateOne({ _id: isUserjoined._id }, { active: true });
        await posts.updateMany(
          { userId: requestedUser._id, forumId },
          { active: true }
        );
        await reply.updateMany(
          { byWhom: requestedUser._id, forumId },
          { active: true }
        );
        await complaint.updateMany(
          { userId: requestedUser._id, forumId },
          { active: true }
        );
        await response.updateMany(
          { userId: requestedUser._id, forumId },
          { active: true }
        );
        await notification.create({
          userId: requestedUser._id,
          message: `You are added to ${isUserjoined.forumId.name} forum by Opentalks Administartor and your previous data is restored`,
        });
        await notification.create({
          userId: forumName.userId,
          message: `${requestedUser.name} is added back to your forum ${isUserjoined.forumId.name} by Opentalks Administartor and his/her previous data is restored`,
        });
        return res.send({
          success: true,
          status: 200,
          message: "User added and previous forum data is restored",
        });
      }
    }

    let forumRequestes = await forum
      .findOne({ _id: forumId })
      .select("joinRequests");

    for (const el of forumRequestes.joinRequests) {
      if (el.userId.equals(requestedUser._id)) {
        return res.send({
          success: false,
          status: 400,
          message: `User has already request to join forum and request status is ${el.status}`,
        });
      }
    }

    await join_forum.create({
      userId: requestedUser._id,
      forumId,
      adminId: forumName.userId,
    });

    await notification.create({
      userId: requestedUser._id,
      message: `You are added to ${forumName.name} forum by Opentalks Administartor`,
    });
    await notification.create({
      userId: forumName.userId,
      message: `${requestedUser.name} is added to your forum ${forumName.name} by Opentalks Administartor`,
    });

    res.send({
      success: true,
      status: 200,
      message: "User added to the forum",
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in joinForumByAdminB`,
    });
  }
}

async function getJoinedMember(req, res) {
  try {
    let { forumId, searchInput, startPoint = 0, byAdmin = false } = req.body;
    let invalidFields = [];

    if (!forumId) {
      invalidFields.push("forumId");
    }

    if (!searchInput) {
      invalidFields.push("searchInput");
    }

    if (invalidFields.length !== 0) {
      return res.send({
        success: false,
        status: 404,
        message: `Required fields: ${invalidFields.join(", ")}`,
      });
    }

    const userMatches = await user
      .find({
        name: { $regex: new RegExp(searchInput, "i") },
      })
      .select("_id");

    const userIds = userMatches.map((user) => user._id);

    let query =
      !!byAdmin && byAdmin == true
        ? { forumId: forumId, userId: { $in: userIds } }
        : { forumId: forumId, userId: { $in: userIds }, active: true };

    const joinForumQuery = await join_forum
      .find(query)
      .populate("userId", "_id name registration_number image")
      .sort({ createdAt: -1 })
      .skip(startPoint)
      .limit(5);

    // let searchResults = joinForumQuery.filter(
    //   (result) => result.userId !== null
    // );

    if (joinForumQuery.length === 0) {
      return res.send({
        success: false,
        status: 400,
        message: "No result found",
      });
    }

    res.send({
      success: true,
      status: 200,
      results: joinForumQuery,
      nextStartPoint: startPoint + 5,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `${error.toString()} in getJoinedMember`,
    });
  }
}

async function getJoinedMemberList(req, res) {
  try {
    let { forumId, userId, startPoint_forum = 0 } = req.body;
    let query;
    if (!!forumId) {
      query = { active: true, forumId };
      let members = await join_forum
        .find(query)
        .select("userId createdAt")
        .populate("userId", "name registration_number image")
        .sort({ createdAt: -1 })
        .limit(5);

      if (members.length == 0) {
        return res.send({
          success: false,
          status: 404,
          message: "No user found for this forum",
        });
      }
      return res.send({
        success: true,
        status: 200,
        members,
      });
    }
    if (!!userId) {
      query = { active: true, userId };
      let forums = await join_forum
        .find(query)
        .select("forumId createdAt")
        .populate("forumId", "name description image");

      if (forums.length == 0) {
        return res.send({
          success: false,
          status: 404,
          message: "No forum joined yet",
        });
      }
      return res.send({
        success: true,
        status: 200,
        forums,
      });
    }
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in getJoinedMemberListB`,
    });
  }
}

async function getJoinedForums(req, res) {
  try {
    let { byAdmin, forumId, userId, onlyName } = req.body;
    let query = !byAdmin
      ? onlyName == true
        ? { active: true, userId }
        : { forumId, active: true }
      : { forumId };

    let data = await join_forum
      .find(query)
      .populate("forumId")
      .skip(0)
      .limit(10)
      .populate("userId", (select = "_id name registration_number image"))
      .sort({ createdAt: -1 });

    if (data.length == 0) {
      res.send({
        success: false,
        status: 404,
        message: "No forum joined",
      });
    } else {
      res.send({
        success: true,
        status: 200,
        joined_forums: data,
      });
    }
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()}`,
    });
  }
}

async function leftJoinedForum(req, res) {
  try {
    let { userId, forumId, byAdmin = false } = req.body;
    let invalidFields = [];
    if (!userId && byAdmin == false) {
      invalidFields.push("userId");
    }
    if (!forumId) {
      invalidFields.push("forumId");
    }
    if (invalidFields.length != 0) {
      res.send({
        success: false,
        status: 400,
        message: `Required fields: ${invalidFields.join(", ")}`,
      });
    } else {
      let byAdmin = !!req.body.byAdmin ? req.body.byAdmin : false;
      if (!!byAdmin) {
        userId = req.body.user;
      }
      let query = {
        $and: [{ userId: userId }, { forumId: forumId }],
      };
      let data = await join_forum
        .findOne(query)
        .populate("forumId", "name userId")
        .populate("userId", "name");
      if (!!data) {
        await join_forum.updateOne({ _id: data._id }, { active: false });
        await posts.updateMany({ userId, forumId }, { active: false });
        await reply.updateMany({ byWhom: userId, forumId }, { active: false });
        await complaint.updateMany({ userId, forumId }, { active: false });
        await response.updateMany({ userId, forumId }, { active: false });

        if (!!byAdmin && byAdmin == true) {
          await notification.create({
            userId: data.forumId.userId,
            message: `Opentalks Administrator removed ${data.userId.name} from ${data.forumId.name} forum`,
          });
          await notification.create({
            userId: data.userId._id,
            message: `Opentalks Administrator removed you from ${data.forumId.name} forum`,
          });
        } else {
          await notification.create({
            userId: data.forumId.userId,
            message: `${data.userId.name} left ${data.forumId.name} forum`,
          });
          await notification.create({
            userId: data.userId._id,
            message: `You successfuly left the ${data.forumId.name} forum`,
          });
        }
        res.send({
          success: true,
          status: 200,
          message: "Forum left successfully",
        });
      } else {
        res.send({
          success: false,
          status: 404,
          message: "User is not registered with the requested forum",
        });
      }
    }
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} 2`,
    });
  }
}

async function recentJoinee(req, res) {
  try {
    let { startPoint = 0 } = req.body;

    let joinees = await join_forum
      .find()
      .skip(startPoint)
      .limit(10)
      .sort({ createdAt: -1 })
      .populate("userId", "registration_number name image")
      .populate("forumId", "name")
      .populate("adminId", "registration_number name");

    if (joinees.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No joinee found",
      });
    }

    res.send({
      success: true,
      status: 200,
      joinees,
      nextStartPoint: startPoint + 10,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in recentJoineeB`,
    });
  }
}

async function searchJoinee(req, res) {
  try {
    let { registration_number, startPoint = 0 } = req.body;
    let results;

    if (!registration_number) {
      return res.send({
        success: false,
        status: 404,
        message: "Please enter a registration number.",
      });
    }

    let isUser = await user
      .findOne({ registration_number: Number(registration_number) })
      .select("_id");

    if (!isUser) {
      return res.send({
        success: false,
        status: 404,
        message: "No such user exists.",
      });
    }

    if (startPoint == 0) {
      results = await join_forum.countDocuments({ userId: isUser._id });
    }

    let joinees = await join_forum
      .find({ userId: isUser._id })
      .skip(startPoint)
      .limit(5)
      .populate("userId", "registration_number name image")
      .populate("forumId", "name")
      .populate("adminId", "registration_number name")
      .sort({ createdAt: -1 });

    if (joinees.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "User has not and had joined any forum.",
      });
    }

    res.send({
      success: true,
      status: 200,
      joinees,
      results,
      nextStartPoint: startPoint + 5,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in searchJoineeB`,
    });
  }
}

async function filterJoinee(req, res) {
  try {
    let {
      active,
      registration_number,
      forumName,
      createdAt,
      startPoint = 0,
    } = req.body;
    let query = {},
      results;

    if (!!registration_number) {
      let isUser = await user
        .findOne({ registration_number: Number(registration_number) })
        .select("_id");

      if (!!isUser) {
        query.adminId = isUser._id;
      }
    }

    if (!!forumName) {
      const matchingforums = await forum.find(
        { name: { $regex: forumName, $options: "i" } },
        "_id"
      );
      const forumIds = matchingforums.map((forum) => forum._id);

      query.forumId = { $in: forumIds };
    }

    if (!!createdAt) {
      query.createdAt = { $gte: new Date(createdAt) };
    }
    if (startPoint == 0) {
      results = await join_forum.countDocuments({ ...query, active });
    }
    let joinees = await join_forum
      .find({ ...query, active })
      .skip(startPoint)
      .limit(10)
      .populate("userId", "registration_number name image")
      .populate("forumId", "name")
      .populate("adminId", "registration_number name");

    if (joinees.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "User has not and had joined any forum.",
      });
    }

    res.send({
      success: true,
      status: 200,
      joinees,
      results,
      nextStartPoint: startPoint + 10,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in filterJoineeB`,
    });
  }
}
