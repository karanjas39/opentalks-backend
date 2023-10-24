// @collapse
const like_forum = require(".././MODEL/forumLikeModel");
const user = require(".././MODEL/userModel");
const forum = require(".././MODEL/forumModel");
const join_forum = require(".././MODEL/joinForumModel");
const notification = require(".././MODEL/notificationModel");

module.exports = { rateForum, getForumRating, getTopForums, getReviews };

async function rateForum(req, res) {
  try {
    let { userId, forumId, rating } = req.body;
    let invalidFields = [];
    if (!forumId) {
      invalidFields.push("forumid");
    }
    if (!userId) {
      invalidFields.push("userid");
    }

    if (!rating) {
      invalidFields.push("rating");
    }

    if (invalidFields.length != 0) {
      return res.send({
        success: false,
        status: 404,
        message: `Required fields: ${invalidFields.join(", ")}`,
      });
    }

    let isForum = await forum.findById(forumId);
    if (!isForum) {
      return res.send({
        success: false,
        status: 404,
        message: "Forum does not exist",
      });
    }

    let isLiked = await like_forum.findOne({ userId, forumId });

    if (!!isLiked) {
      if (isLiked.rating == rating) {
        res.send({
          success: false,
          status: 400,
          message: "Forum rating is already submitted",
        });
      } else {
        await like_forum.updateOne({ userId, forumId }, { rating });

        if (rating == -1) {
          isForum.dislikes++;
          isForum.likes--;
        } else {
          isForum.likes++;
          isForum.dislikes--;
        }

        await isForum.save();

        res.send({
          success: true,
          status: 200,
          message: "Forum rating updated successfully",
        });
      }
    } else {
      const newLike = new like_forum({ userId, forumId, rating });
      await newLike.save();

      if (rating == -1) {
        isForum.dislikes++;
      } else {
        isForum.likes++;
      }
      await isForum.save();
      res.send({
        success: true,
        status: 200,
        message: "Thank you for your feedback!",
      });
    }
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in rateForumB`,
    });
  }
}

async function getForumRating(req, res) {
  try {
    let { userId, forumId } = req.body;
    let invalidFields = [];
    if (!forumId) {
      invalidFields.push("forumid");
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

    let isForum = await forum.findById(forumId);
    if (!isForum) {
      return res.send({
        success: false,
        status: 404,
        message: "Forum does not exist",
      });
    }
    let isLiked = await like_forum.findOne({ userId, forumId });
    if (!isLiked) {
      return res.send({
        success: false,
        status: 404,
        message: "Not rated the forum yet",
      });
    }
    res.send({
      success: true,
      status: 200,
      rating: isLiked.rating,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in rateForumB`,
    });
  }
}

async function getTopForums(req, res) {
  try {
    let query =
      !!req.body.byAdmin && req.body.byAdmin == true
        ? { active: true }
        : { active: true };
    let topforums = await forum
      .find(query)
      .sort({ likes: -1 })
      .populate("userId", "name")
      .limit(3);

    if (topforums.length != 0) {
      for (let i = 0; i < topforums.length; i++) {
        let memberCount = await join_forum.countDocuments({
          forumId: topforums[i]._id,
          active: true,
        });
        topforums[i] = {
          ...topforums[i].toObject(),
          members: memberCount,
        };
      }

      return res.send({
        success: true,
        status: 200,
        forums: topforums,
      });
    }
    res.send({
      success: false,
      status: 404,
      message: "No forum found",
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in getTop3Forums`,
    });
  }
}

async function getReviews(req, res) {
  try {
    let { forumId, startPoint = 0 } = req.body;
    let total, likes;
    if (!forumId) {
      return res.send({
        success: false,
        status: 404,
        message: "Forumid is required",
      });
    }

    if (startPoint == 0) {
      let data = await Promise.all([
        like_forum.countDocuments({ forumId }),
        like_forum.countDocuments({ forumId, rating: 1 }),
      ]);
      total = data[0];
      likes = data[1];
    }

    let reviews = await like_forum
      .find({ forumId })
      .populate("userId", "name image")
      .skip(startPoint)
      .limit(5)
      .sort({ createdAt: -1 });

    if (reviews.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No reviews found yet.",
      });
    }

    res.send({
      success: true,
      status: 200,
      reviews,
      nextStartPoint: startPoint + 5,
      total,
      likes,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in getReviewsB`,
    });
  }
}
