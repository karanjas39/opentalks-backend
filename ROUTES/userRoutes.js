const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const functions = require("../MODULES/functions");

const userController = require("../CONTROLLERS/userControllers");
const forumControllers = require("../CONTROLLERS/forumControllers");
const postControllers = require(".././CONTROLLERS/postControllers");
const notificationController = require(".././CONTROLLERS/notificationControllers");
const replyController = require(".././CONTROLLERS/replyControllers");
const postLikeControllers = require(".././CONTROLLERS/postLikeControllers");
const forumLikeControllers = require(".././CONTROLLERS/forumLikeContaollers");
const departmentControllers = require(".././CONTROLLERS/departmentControllers");
const complaintControllers = require(".././CONTROLLERS/complaintControllers");
const responseControllers = require(".././CONTROLLERS/responseControllers");
const generalControllers = require(".././CONTROLLERS/generalControllers");

const middlewares = require(".././MIDDLEWARES/userAuthorization");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "PUBLIC/user-profile-pic/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

router.route("/login").post(userController.userLogin);
router.route("/register").post(userController.createUser);

// MIDDLEWARES
router.use(middlewares.verify);

// USERS
router.route("/detail").post(userController.getUser);
router.route("/update/password").post(userController.updateUserPassword);
router
  .route("/update/details")
  .post(middlewares.verifyUser, userController.updateUserDetails);
router
  .route("/update/image")
  .post(
    upload.single("image"),
    middlewares.verifyUserFormData,
    userController.updateUserImage
  );
router.route("/password/confirm").post(userController.confirmPassword);
router.route("/password/forget").post(notificationController.forgetPassword);

// FORUMS
router
  .route("/forum/add")
  .post(middlewares.verifyUser, forumControllers.createForum);
router.route("/forum/search").post(forumControllers.getForum);
router.route("/forum/post/search").post(postControllers.postSearchInForum);
router.route("/forum/detail").post(forumControllers.getForumDetails);
router
  .route("/forum/delete")
  .post(middlewares.verifyUser, forumControllers.deleteForum);
router
  .route("/forum/update")
  .post(middlewares.verifyUser, forumControllers.updateForum);
router.route("/forum/rate").post(forumLikeControllers.rateForum);
router.route("/forum/rate/get").post(forumLikeControllers.getForumRating);
router.route("/forum/rate/all").post(forumLikeControllers.getReviews);
router.route("/forum/top").post(generalControllers.getTopForums);
router.route("/forum/join").post(forumControllers.joinForum);
router.route("/forum/join/request").post(forumControllers.joinForumRequest);
router.route("/forum/join/detail").post(forumControllers.getJoinedForums);
router.route("/forum/created/detail").post(forumControllers.getAllForum);
router
  .route("/forum/join/left")
  .post(middlewares.verifyUser, forumControllers.leftJoinedForum);
router
  .route("/forum/join/member/search")
  .post(forumControllers.getJoinedMember);
router
  .route("/forum/join/member/search/filter")
  .post(forumControllers.forumFilterUser);
router.route("/forum/join/member").post(forumControllers.getJoinedMemberList);
router
  .route("/forum/join/request/list")
  .post(forumControllers.showJoinRequests);

// POSTS
router
  .route("/post/add")
  .post(middlewares.verifyUser, postControllers.createPost);
router.route("/post/detail").post(postControllers.getPost);
router
  .route("/post/delete")
  .post(middlewares.verifyUser, postControllers.deletePost);
router.route("/post/all").post(postControllers.getAllPost);
router.route("/post/search").post(postControllers.postSearch);
router.route("/post/favourite").post(postControllers.getFavouritePosts);
router.route("/post/like/user").post(postLikeControllers.whoLikedPost);
router.route("/post/like").post(postLikeControllers.likePost);
router.route("/post/unlike").post(postLikeControllers.unlikePost);
router.route("/post/top").post(postControllers.getPostsTop);
router.route("/post/recent").post(postControllers.getRecentPosts);
router.route("/post/recent/5").post(postControllers.getRecent5Posts);

// NOTIFICATIONS
router
  .route("/notification/all")
  .post(notificationController.getAllNotifications);
router
  .route("/notification/delete/all")
  .post(notificationController.deleteNotificatiosAll);

// REPLY
router.route("/post/reply/add").post(replyController.createReply);
router
  .route("/post/reply/delete")
  .post(middlewares.verifyUser, replyController.deleteReply);
router.route("/post/reply/all").post(replyController.getPostReply);
router.route("/post/reply/recent").post(replyController.loadRecentReplies);

// DEPARTMENT
router.route("/department/all").post(departmentControllers.getDepartmentsAll);

// COMPLAINTS
router.route("/forum/complaint").post(complaintControllers.createComplaint);
router
  .route("/forum/complaint/search")
  .post(complaintControllers.searchComplaint);
router.route("/forum/complaint/all").post(complaintControllers.getComplaints);
router
  .route("/forum/complaint/user/all")
  .post(complaintControllers.getComplaintsUser);

// RESPONSES
router.route("/forum/response").post(responseControllers.createResponse);
router.route("/forum/response/all").post(responseControllers.getResponses);

// GENERAL PURPOSE
router.route("/stats").post(generalControllers.getStatsUsers);

// UNHANDLES ROUTES
router.route("*").all(functions.unhandledRoutes);

module.exports = router;
