// @collapse
const posts = require(".././MODEL/postModel");
const forum = require(".././MODEL/forumModel");
const join_forum = require(".././MODEL/joinForumModel");
const reply = require(".././MODEL/replyModel");
const post_like = require(".././MODEL/postLikeModel");
const User = require(".././MODEL/userModel");
const notification = require(".././MODEL/notificationModel");
const user = require(".././MODEL/userModel");
const postLike = require(".././MODEL/postLikeModel");

module.exports = {
  createPost,
  createPostByAdmin,
  getAllPost,
  getAllPostAdmin,
  getPost,
  deletePost,
  updatePost,
  postSearch,
  postSearchInForum,
  postSearchByAdmin,
  getPostsTop,
  getTop10PostsAdmin,
  getRecentPosts,
  getRecent5Posts,
  getFavouritePosts,
};

async function createPost(req, res) {
  try {
    let { byAdmin } = req.body;
    let formData = req.body;
    let invalidFields = [];
    if (!formData.title) {
      invalidFields.push("Title");
    }
    if (!formData.description) {
      invalidFields.push("Description");
    }
    if (!formData.forumId) {
      invalidFields.push("Forum Id");
    }
    if (!formData.userId) {
      invalidFields.push("User Id");
    }
    if (invalidFields.length != 0) {
      return res.send({
        success: false,
        status: 400,
        message: `Required fields: ${invalidFields.join(", ")}`,
      });
    }

    let isForum = await forum.findOne({ _id: formData.forumId });
    if (!isForum) {
      return res.send({
        success: false,
        status: 404,
        message: "Forum not found",
      });
    }

    let post = await posts.create(formData);

    if (!post) {
      return res.send({
        success: false,
        status: 400,
        message: "Post does not created",
      });
    }

    res.send({
      success: true,
      status: 200,
      message: "Post created",
      post,
    });
    if (!!byAdmin && byAdmin == true) {
      notification.create({
        userId: req.body.userId,
        message: `Opentalks administrator created a post having title ${req.body.title} by your name in ${isForum.name} forum`,
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

async function createPostByAdmin(req, res) {
  try {
    let { title, description, registration_number, forumId } = req.body;

    let invalidFields = [];
    if (!title) {
      invalidFields.push("title");
    }
    if (!description) {
      invalidFields.push("description");
    }
    if (!registration_number) {
      invalidFields.push("registrationNo");
    }
    if (!forumId) {
      invalidFields.push("forumName");
    }

    if (invalidFields.length != 0) {
      return res.send({
        success: false,
        status: 404,
        message: `Required fields: ${invalidFields.join(", ")}`,
      });
    }

    let isUser = await user.findOne({ registration_number });
    if (!isUser) {
      return res.send({
        success: false,
        status: 404,
        message: "User not found",
      });
    }
    let isForum = await forum.findOne({ _id: forumId });

    if (!isForum) {
      return res.send({
        success: false,
        status: 404,
        message: "Forum not found",
      });
    }

    let isMember = await join_forum.findOne({
      userId: isUser._id,
      forumId: isForum._id,
    });
    if (!isMember && !isForum.userId.equals(isUser._id)) {
      return res.send({
        success: false,
        status: 400,
        message: `User is not member of ${isForum.name} forum`,
      });
    }

    await posts.create({
      title,
      description,
      userId: isUser._id,
      forumId: isForum._id,
    });

    await notification.create({
      userId: isUser._id,
      message: `Opentalks Administrator added a post by title ${title} in forum ${isForum.name} by your name`,
    });

    res.send({
      success: true,
      status: 200,
      message: "Post added",
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in createPostByAdminB`,
    });
  }
}

async function getPost(req, res) {
  try {
    let { postId } = req.body;
    if (!postId) {
      res.send({
        success: false,
        status: 404,
        message: "PostId is mandatory",
      });
    } else {
      let post = await posts
        .findOne({ _id: postId, active: true })
        .populate("userId", "name")
        .populate("forumId", "name");

      if (!post) {
        res.send({
          success: false,
          status: 404,
          message: "Post not found",
        });
      } else {
        res.send({
          success: true,
          status: 200,
          message: "Post found",
          post,
        });
      }
    }
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error}`,
    });
  }
}

async function getAllPost(req, res) {
  let { forumId, userId } = req.body;
  let invalidFields = [];
  if (!forumId && !userId) {
    invalidFields.push("forumId");
  }
  if (!userId) {
    invalidFields.push("userId");
  }
  if (invalidFields.length != 0) {
    return res.send({
      success: false,
      status: 400,
      message: `Required fields: ${invalidFields.join(", ")}`,
    });
  }

  let query = { forumId, active: true };
  let startPoint = !req.body.startPoint ? 0 : req.body.startPoint;
  try {
    let userPosts = await posts
      .find(query)
      .sort({ createdAt: -1 })
      .skip(startPoint)
      .limit(10)
      .populate("forumId", "name")
      .populate("userId", (select = "name image"))
      .lean();

    if (userPosts.length == 0) {
      return res.send({
        success: false,
        status: 400,
        message: "Post not found",
      });
    }

    let likedPostIds = await post_like.find({ userId }, "postId").lean();

    userPosts = userPosts.map((post) => {
      post.isLiked = likedPostIds.some(
        (like) => like.postId.toString() === post._id.toString()
      );
      return post;
    });

    res.send({
      success: true,
      status: 200,
      result: await posts.countDocuments(query),
      post: userPosts,
      nextStartPoint: startPoint + 10,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()}`,
    });
  }
}

async function getAllPostAdmin(req, res) {
  try {
    let { forumId } = req.body;
    if (!forumId) {
      return res.send({
        success: false,
        status: 404,
        message: "forumid is required",
      });
    }
    let startPoint = !req.body.startPoint ? 0 : req.body.startPoint;

    let userPosts = await posts
      .find({ forumId })
      .sort({ createdAt: -1 })
      .skip(startPoint)
      .limit(10)
      .populate("forumId", "name")
      .populate("userId", (select = "name image"));

    if (!userPosts) {
      return res.send({
        success: false,
        status: 404,
        message: "No post found",
      });
    }
    res.send({
      success: true,
      status: 200,
      posts: userPosts,
      nextStartPoint: startPoint + 10,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in getAllPostAdminB`,
    });
  }
}

async function deletePost(req, res) {
  try {
    let { postId, byAdmin } = req.body;
    if (!postId) {
      res.send({
        success: false,
        status: 400,
        message: "PostId required",
      });
    } else {
      let deletedPost = await posts.updateOne(
        { _id: postId },
        { active: false }
      );
      let deletedReplies = await reply.updateMany(
        { postId },
        { active: false }
      );

      await post_like.updateOne({ postId }, { active: false });

      if (deletedPost.modifiedCount === 1) {
        if (deletedReplies.modifiedCount > 0) {
          res.send({
            success: true,
            status: 200,
            message: "Post and replies are deleted",
          });
        } else {
          res.send({
            success: true,
            status: 200,
            message: "Post deleted but no reply found",
          });
        }
        if (!!byAdmin && byAdmin) {
          let deletePost = await posts.findOne({ _id: postId });
          if (!!deletePost) {
            await notification.create({
              userId: deletePost.userId,
              message: `Your post ${deletePost.title} is deleted by the Opentalks Administrator`,
            });
          }
        }
      } else {
        res.send({
          success: false,
          status: 404,
          message: "Post not found or unable to delete",
        });
      }
    }
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error} in delete post backend`,
    });
  }
}

// Only update : TITLE AND  DESCRIPTION
async function updatePost(req, res) {
  try {
    let { postId, title, description } = req.body;
    if (!postId) {
      return res.send({
        success: false,
        status: 400,
        message: "PostId is required",
      });
    }

    let post = await posts.findOne({ _id: postId });
    if (!post) {
      return res.send({
        success: false,
        status: 404,
        message: "Post does not found",
      });
    }

    let updatedPost = await posts.findByIdAndUpdate(
      { _id: postId },
      { title, description, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedPost) {
      return res.send({
        success: false,
        status: 404,
        message: "Post could not be updated",
      });
    }

    res.send({
      success: true,
      status: 200,
      message: "Post updated",
      updatedPost,
    });
    await notification.create({
      userId: `${post.userId}`,
      message: `Your post ${post.title} had been updated by the Opentalks Administrator`,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error}`,
    });
  }
}

async function postSearch(req, res) {
  try {
    let searchTerm = req.body.search;
    let userId = req.body.userId;

    if (!searchTerm) {
      return res.send({
        success: false,
        status: 400,
        message: "Search parameter is required",
      });
    }
    if (!userId) {
      return res.send({
        success: false,
        status: 400,
        message: "userid is required",
      });
    }
    let { startPoint = 0 } = req.body;
    searchTerm = searchTerm.trim();
    let query = {
      $or: [
        {
          title: { $regex: searchTerm, $options: "i" },
          active: true,
          userId,
        },
        {
          description: { $regex: searchTerm, $options: "i" },
          active: true,
          userId,
        },
      ],
      userId,
      active: true,
    };

    let results = await posts
      .find(query)
      .populate("forumId", "name")
      .sort({ createdAt: -1 })
      .skip(startPoint)
      .limit(5);

    if (results.length == 0) {
      return res.send({
        success: false,
        status: 400,
        message: "No result found",
      });
    }
    res.send({
      success: true,
      status: 200,
      result: await posts.countDocuments(query),
      results,
      nextStartPoint: startPoint + 5,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error}`,
    });
  }
}

async function postSearchByAdmin(req, res) {
  try {
    let { search, isFilter } = req.body;
    if (!search && !isFilter) {
      return res.send({
        success: false,
        status: 404,
        message: "Search_query is mandatroy",
      });
    }
    let query, totalResults;
    if (!!isFilter && isFilter == true) {
      let filter = { ...req.body.filter };
      let newFilter = {};
      let userId = !!filter.registration_number
        ? await user
            .findOne({ registration_number: filter.registration_number })
            .select("_id")
        : "";
      if (!!userId) {
        newFilter.userId = userId._id;
      }
      if (!userId && !!filter.registration_number) {
        return res.send({
          success: false,
          status: 404,
          message: "User not found",
        });
      }
      let forumId = !!filter.forum_name
        ? await forum
            .find({ name: { $regex: new RegExp(filter.forum_name, "i") } })
            .select("_id")
        : [];

      if (forumId.length > 0) {
        let ids = forumId.map((element) => element._id);
        newFilter.forumId = { $in: ids };
      }
      if (!!filter.updatedAt) {
        newFilter.updatedAt = { $gte: filter.updatedAt };
      }
      if (!!filter.createdAt) {
        newFilter.createdAt = { $gte: filter.createdAt };
      }
      if (!!filter.active) {
        newFilter.active = true;
      } else {
        newFilter.active = false;
      }
      query = { ...newFilter };
      totalResults = await posts.countDocuments(query);
    } else {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      };
      totalResults = await posts.countDocuments({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      });
    }
    let startPoint = !req.body.startPoint ? 0 : req.body.startPoint;
    let post = await posts
      .find(query)
      .populate("userId", "name image")
      .populate("forumId", "name")
      .skip(startPoint)
      .limit(10)
      .sort({ likes: -1 });

    if (post.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No result found",
      });
    }

    res.send({
      success: true,
      status: 200,
      posts: post,
      nextStartPoint: (startPoint += 10),
      results: totalResults,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in postSearchByAdminB`,
    });
  }
}

async function getPostsTop(req, res) {
  try {
    let { userId, startPoint = 0 } = req.body;

    if (!userId) {
      return res.send({
        success: false,
        status: 400,
        message: `userid is required`,
      });
    }

    let topPosts = await posts
      .find({ userId, active: true })
      .skip(startPoint)
      .populate("forumId", "name")
      .select("title description createdAt likes")
      .sort({ likes: -1 })
      .limit(5);

    if (topPosts.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No more post found",
      });
    }

    res.send({
      success: true,
      status: 200,
      topPosts,
      nextStartPoint: startPoint + 5,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.tostring()} in getTopsPostsB`,
    });
  }
}

async function getTop10PostsAdmin(req, res) {
  try {
    let topPosts = await posts
      .find({ active: true })
      .populate("forumId", "name")
      .populate("userId", "name image")
      .sort({ likes: -1, createdAt: 1 })
      .limit(10);

    if (topPosts.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No post found",
      });
    }

    res.send({
      success: true,
      status: 200,
      topPosts,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in getTop10PostsAdminB`,
    });
  }
}

async function getRecentPosts(req, res) {
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

    let forums = await Promise.all([
      forum.find({ userId, active: true }),
      join_forum.find({ userId, active: true }),
    ]);

    let forumIds = [
      ...forums[0].map((forum) => forum._id),
      ...forums[1].map((joinForum) => joinForum.forumId),
    ];

    let query = {
      createdAt: { $gt: lastLogin },
      forumId: { $in: forumIds },
      active: true,
      userId: { $ne: userId },
    };
    let recentPosts = await posts
      .find(query)
      .populate("forumId", "name")
      .populate("userId", "name image")
      .select("title description createdAt")
      .skip(startPoint)
      .limit(5)
      .sort({ createdAt: -1 });

    res.send({
      success: true,
      status: 200,
      recentPosts,
      nextStartPoint: startPoint + 5,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in getRecentPostsB`,
    });
  }
}

async function getRecent5Posts(req, res) {
  try {
    let { userId, startPoint = 0 } = req.body;
    let invalidFields = [];
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
    let recentPosts = await posts
      .find({ userId, active: true })
      .skip(startPoint)
      .populate("forumId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    if (recentPosts.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No more post found",
      });
    }

    res.send({
      success: true,
      status: 200,
      recentPosts,
      nextStartPoint: startPoint + 5,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in getRecent5PostsB`,
    });
  }
}

async function getFavouritePosts(req, res) {
  try {
    let { userId, startPoint = 0 } = req.body;

    if (!userId) {
      return res.send({
        success: false,
        status: 404,
        message: "userid is required",
      });
    }

    let posts = await postLike
      .find({ userId, active: true })
      .populate({
        path: "postId",
        select: "userId title description likes",
        populate: {
          path: "userId",
          select: "name image",
        },
      })
      .populate("forumId", "name")
      .skip(startPoint)
      .limit(5)
      .sort({ createdAt: -1 });

    if (posts.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No like found",
      });
    }
    res.send({
      success: true,
      status: 200,
      posts,
      nextStartPoint: startPoint + 5,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in getFavouritePostsB`,
    });
  }
}

async function postSearchInForum(req, res) {
  try {
    let {
      search,
      forumId,
      byNumber,
      startPoint = 0,
      limitPoint = 10,
      cUserId,
    } = req.body;
    let invalidFields = [],
      query,
      result;
    if (!search) {
      invalidFields.push("search");
    }
    if (!forumId) {
      invalidFields.push("forumid");
    }
    if (!cUserId) {
      invalidFields.push("userid");
    }
    if (invalidFields.length != 0) {
      return res.send({
        success: false,
        status: 404,
        message: `Required fields: ${invalidFields.join(", ")}`,
      });
    }

    if (byNumber == false) {
      query = {
        $or: [
          {
            title: { $regex: search, $options: "i" },
            active: true,
            forumId,
          },
          {
            description: { $regex: search, $options: "i" },
            active: true,
            forumId,
          },
        ],
      };
    } else {
      let userId = await user
        .findOne({ registration_number: search, active: true })
        .select("_id");
      if (!userId) {
        return res.send({
          success: false,
          status: 404,
          message: "Requested user does not exist",
        });
      }

      let isMember = await join_forum.findOne({
        $or: [
          {
            forumId,
            userId: userId._id,
            active: true,
          },
          {
            forumId,
            adminId: userId._id,
            active: true,
          },
        ],
      });
      if (!isMember) {
        return res.send({
          success: false,
          status: 404,
          message: "Requested user is not a member of this forum",
        });
      }

      query = { forumId, userId: userId._id, active: true };
    }

    let Posts = await posts
      .find(query)
      .populate("userId", "name image")
      .skip(startPoint)
      .limit(limitPoint)
      .lean();
    if (Posts.length == 0) {
      return res.send({
        success: false,
        status: 404,
        message: "No post found",
      });
    }
    if (startPoint == 0) {
      result = await posts.countDocuments(query);
    } else {
      result = 0;
    }
    let likedPostIds = await post_like
      .find({ userId: cUserId }, "postId")
      .lean();

    Posts = Posts.map((post) => {
      post.isLiked = likedPostIds.some(
        (like) => like.postId.toString() === post._id.toString()
      );
      return post;
    });

    res.send({
      success: true,
      status: 200,
      result,
      posts: Posts,
      nextStartPoint: startPoint + limitPoint,
    });
  } catch (error) {
    res.send({
      success: false,
      status: 500,
      message: `Error: ${error.toString()} in postSearchInForumB`,
    });
  }
}
