// @collapse
let user = require(".././MODEL/userModel");
let complaint = require(".././MODEL/complaintModel");
let forum = require(".././MODEL/forumModel");
let forumJoined = require(".././MODEL/joinForumModel");
let post = require(".././MODEL/postModel");
let reply = require(".././MODEL/replyModel");

module.exports = {
  getStats,
  recentPosts,
  recentForums,
  getStatsUsers,
  getTopForums,
};

async function getStats(req, res) {
  try {
    let usersCount = user.countDocuments({ active: true });
    let usersCountTotal = user.countDocuments();
    let forumsCount = forum.countDocuments({ active: true });
    let forumsCountTotal = forum.countDocuments();
    let postsCount = post.countDocuments({ active: true });
    let postsCountTotal = post.countDocuments();
    let complaintsCount = complaint.countDocuments({ active: true });
    let complaintsCountTotal = complaint.countDocuments();

    let stats = await Promise.all([
      usersCount,
      usersCountTotal,
      forumsCount,
      forumsCountTotal,
      postsCount,
      postsCountTotal,
      complaintsCount,
      complaintsCountTotal,
    ]);

    res.send({
      success: true,
      status: 200,
      stats: {
        activePosts: stats[4],
        postsTotal: stats[5] - stats[4],
        activeForums: stats[2],
        forumsTotal: stats[3] - stats[2],
        activeUsers: stats[0],
        usersTotal: stats[1] - stats[0],
        activeComplaints: stats[6],
        complaintsTotal: stats[7] - stats[6],
      },
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `error: ${error.toString()} in getStatsB`,
    });
  }
}

async function getStatsUsers(req, res) {
  try {
    let { _id } = req.body;
    if (!_id) {
      return res.send({
        success: false,
        status: 404,
        message: "id is mandatory",
      });
    }

    let forumsJoinedCount = forumJoined.countDocuments({
      userId: _id,
      active: true,
    });
    let forumsJoinedCountTotal = forumJoined.countDocuments({ userId: _id });
    let forumsCreatedCount = forum.countDocuments({
      userId: _id,
      active: true,
    });
    let forumsCreatedCountTotal = forum.countDocuments({ userId: _id });
    let postsCount = post.countDocuments({ userId: _id, active: true });
    let postsCountTotal = post.countDocuments({ userId: _id });
    let repliesCount = reply.countDocuments({ byWhom: _id, active: true });
    let repliesCountTotal = reply.countDocuments({ byWhom: _id });

    let stats = await Promise.all([
      forumsCreatedCount,
      forumsCreatedCountTotal,
      forumsJoinedCount,
      forumsJoinedCountTotal,
      postsCount,
      postsCountTotal,
      repliesCount,
      repliesCountTotal,
    ]);

    res.send({
      success: true,
      status: 200,
      stats: {
        activePosts: stats[4],
        postsTotal: stats[5] - stats[4],
        activeCreatedForums: stats[0],
        forumsCreatedTotal: stats[1] - stats[0],
        activeJoinedForums: stats[2],
        joinedForumsTotal: stats[3] - stats[2],
        activeReplies: stats[6],
        repliesTotal: stats[7] - stats[6],
      },
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${eeeor.toString()} in getStatsUsersB`,
    });
  }
}

async function recentPosts(req, res) {
  try {
    let { startPoint = 0 } = req.body;

    let posts = await post
      .find({ active: true })
      .skip(startPoint)
      .limit(10)
      .select("title description userId createdAt forumId")
      .populate("userId", "name image")
      .populate("forumId", "name")
      .sort({ createdAt: -1 });

    if (posts.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No more posts",
      });
    }
    res.send({
      success: true,
      status: 200,
      posts,
      nextStartPoint: startPoint + 10,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `error: ${error.toString()} in recentPostB`,
    });
  }
}

async function recentForums(req, res) {
  try {
    let { startPoint = 0 } = req.body;

    let forums = await forum
      .find({ active: true })
      .skip(startPoint)
      .limit(10)
      .select("name description userId createdAt")
      .populate("userId", "name image")
      .sort({ createdAt: -1 });

    if (forums.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No more forums",
      });
    }
    res.send({
      success: true,
      status: 200,
      forums,
      nextStartPoint: startPoint + 10,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `error: ${error.toString()} in recentForumsB`,
    });
  }
}

async function getTopForums(req, res) {
  try {
    let { startPoint = 0 } = req.body;
    let query =
      !!req.body.byAdmin && req.body.byAdmin == true
        ? { active: true }
        : { active: true };
    let topforums = await forum
      .find(query)
      .sort({ likes: -1 })
      .populate("userId", "name image")
      .skip(startPoint)
      .limit(5);

    if (topforums.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No forum found",
      });
    }
    res.send({
      success: true,
      status: 200,
      forums: topforums,
      nextStartPoint: startPoint + 5,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in getTop3Forums`,
    });
  }
}
