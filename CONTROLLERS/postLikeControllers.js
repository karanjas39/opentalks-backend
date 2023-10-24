const post_like = require(".././MODEL/postLikeModel");
const post = require(".././MODEL/postModel");
const user = require(".././MODEL/userModel");
const notification = require(".././MODEL/notificationModel");

module.exports = { likePost, unlikePost, whoLikedPost };

async function likePost(req, res) {
  try {
    let { userId, postId, forumId } = req.body;
    let invalidFields = [];
    if (!userId) {
      invalidFields.push("userid");
    }
    if (!postId) {
      invalidFields.push("postid");
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

    let isPost = await post.findOne({ _id: postId, active: true });
    if (!isPost) {
      return res.send({
        success: false,
        status: 404,
        message: "Post does not exist",
      });
    }

    let isUser = await user.findOne({ _id: userId });

    if (!isUser) {
      return res.send({
        success: false,
        status: 404,
        message: "User does not exist",
      });
    }

    let isLiked = await post_like.findOne({ userId, forumId, postId });
    if (!!isLiked) {
      return res.send({
        success: false,
        status: 400,
        message: "Post already liked",
      });
    }

    let postLiked = await post_like.create({ userId, postId, forumId });
    if (!postLiked) {
      return res.send({
        success: false,
        status: 400,
        message: "Post does not get liked",
      });
    }
    res.send({
      success: true,
      status: 200,
      message: "Post liked",
    });

    isPost.likes++;
    await isPost.save();

    if (!isPost.userId.equals(isUser._id)) {
      await notification.create({
        userId: isPost.userId,
        message: `${isUser.name} liked your post ${isPost.title}`,
      });
    }
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in likePost`,
    });
  }
}

async function unlikePost(req, res) {
  try {
    let { userId, postId, forumId } = req.body;
    let invalidFields = [];
    let queryPost;
    if (!userId) {
      invalidFields.push("userid");
    }
    if (!postId) {
      invalidFields.push("postid");
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

    let byAdmin = !!req.body.byAdmin ? req.body.byAdmin : false;

    if (!!byAdmin) {
      queryPost = { _id: postId };
    } else {
      queryPost = { _id: postId, active: true };
    }

    let isUser = await user.findOne({ _id: userId });

    if (!isUser) {
      return res.send({
        success: false,
        status: 404,
        message: "User does not exist",
      });
    }

    let isPost = await post.findOne(queryPost);

    if (!isPost) {
      return res.send({
        success: false,
        status: 404,
        message: "Post not found",
      });
    }

    let isPostLiked = await post_like.findOne({ userId, postId });

    if (!isPostLiked) {
      return res.send({
        success: false,
        status: 404,
        message: "Post is not liked",
      });
    }
    await post_like.deleteOne({ userId, postId, forumId });

    res.send({
      success: true,
      status: 200,
      message: "Post unliked",
    });

    isPost.likes--;
    await isPost.save();

    if (!isPost.userId.equals(isUser._id) && byAdmin != true) {
      await notification.create({
        userId: isPost.userId,
        message: `${isUser.name} disliked your post ${isPost.title}`,
      });
    } else {
      await notification.create({
        userId: isPost.userId,
        message: `Like on your post ${isPost.title} by ${isUser.name} is removed by Opentalks Administrator`,
      });
    }
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in unlikePost`,
    });
  }
}

async function whoLikedPost(req, res) {
  try {
    let { postId, startPoint = 0, byAdmin = false } = req.body;
    if (!postId) {
      return res.send({
        success: false,
        status: 404,
        message: `Postid required`,
      });
    }

    let isPost = await post.findById(postId);
    if (!isPost) {
      return res.send({
        success: false,
        status: 404,
        message: "Post not found",
      });
    }
    let query =
      !!byAdmin && byAdmin == true ? { postId } : { postId, active: true };

    let personWhoLikedPost = await post_like
      .find(query)
      .skip(startPoint)
      .limit(5)
      .sort({ createdAt: -1 })
      .populate("userId", "name image");

    if (personWhoLikedPost.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No user liked the post",
      });
    }

    res.send({
      success: true,
      status: 200,
      person: personWhoLikedPost,
      nextStartPoint: startPoint + 5,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in whoLikedPost`,
    });
  }
}
