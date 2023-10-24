const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const userController = require(".././CONTROLLERS/userControllers");
const departmentControllers = require(".././CONTROLLERS/departmentControllers");
const forumControllers = require(".././CONTROLLERS/forumControllers");
const postControllers = require(".././CONTROLLERS/postControllers");
const postLikeController = require(".././CONTROLLERS/postLikeControllers");
const forumLikeControllers = require(".././CONTROLLERS/forumLikeContaollers");
const replyContainer = require(".././CONTROLLERS/replyControllers");
const complaintControllers = require(".././CONTROLLERS/complaintControllers");
const responseControllers = require(".././CONTROLLERS/responseControllers");
const notificationController = require(".././CONTROLLERS/notificationControllers");
const generalControllers = require(".././CONTROLLERS/generalControllers");

const middlewares = require(".././MIDDLEWARES/userAuthorization");

const functions = require(".././MODULES/functions");

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

// LOGIN
router.route("/login").post(userController.userLogin);

router.use(middlewares.verify);

// USERS
router
  .route("/user/add")
  .post(middlewares.verifyAdmin, userController.createUserByAdmin);
router.route("/user/detail").post(userController.getUserByAdmin);
router
  .route("/user/update/detail")
  .post(middlewares.verifyAdmin, userController.updateUserDetailsByAdmin);
router
  .route("/user/update/password")
  .post(middlewares.verifyAdmin, userController.updateUserPasswordByAdmin);
router
  .route("/user/update/image")
  .post(
    middlewares.verifyAdmin,
    upload.single("image"),
    userController.updateUserImageByAdmin
  );

router.route("/user/all").post(userController.getAll);
router.route("/user/search").post(userController.searchUserByAdmin);
router
  .route("/user/search/filter")
  .post(userController.searchUserWithFilterByAdmin);
router.route("/user/recent").post(userController.getRecent5Users);

// DEPARTMENTS
router
  .route("/department/create")
  .post(middlewares.verifyAdmin, departmentControllers.createDepartment);
router.route("/department/detail").post(departmentControllers.getDepartment);
router
  .route("/department/delete")
  .post(middlewares.verifyAdmin, departmentControllers.deleteDepartment);
router
  .route("/department/update")
  .post(middlewares.verifyAdmin, departmentControllers.updateDepartment);
router.route("/department/all").post(departmentControllers.getDepartmentsAll);
router.route("/department/search").post(departmentControllers.searchDepartment);

// FORUMS
router
  .route("/forum/add")
  .post(middlewares.verifyAdmin, forumControllers.createForumByAdmin);
router.route("/forum/search").post(forumControllers.getForum);
router.route("/forum/detail").post(forumControllers.getForumDetails);
router
  .route("/forum/delete")
  .post(middlewares.verifyAdmin, forumControllers.deleteForum);
router
  .route("/forum/update")
  .post(middlewares.verifyAdmin, forumControllers.updateForum);
router.route("/forum/all").post(forumControllers.getAllForum);
router.route("/forum/name/all").post(forumControllers.getForumName);
router.route("/forum/top").post(forumLikeControllers.getTopForums);
router.route("/forum/rate/all").post(forumLikeControllers.getReviews);
router.route("/forum/members").post(forumControllers.getJoinedForums);
router
  .route("/forum/member/add")
  .post(middlewares.verifyAdmin, forumControllers.joinForumByAdmin);
router.route("/forum/member/search").post(forumControllers.getJoinedMember);
router
  .route("/forum/member/delete")
  .post(middlewares.verifyAdmin, forumControllers.leftJoinedForum);
router.route("/forum/join/list").post(forumControllers.showJoinRequests);
router
  .route("/forum/join")
  .post(middlewares.verifyAdmin, forumControllers.joinForum);
router.route("/forum/search/filter").post(forumControllers.forumFilterByAdmin);

// POSTS
router
  .route("/post/add")
  .post(middlewares.verifyAdmin, postControllers.createPost);
router
  .route("/post/add/main")
  .post(middlewares.verifyAdmin, postControllers.createPostByAdmin);
router.route("/post/detail").post(postControllers.getPost);
router
  .route("/post/update")
  .post(middlewares.verifyAdmin, postControllers.updatePost);
router
  .route("/post/delete")
  .post(middlewares.verifyAdmin, postControllers.deletePost);
router.route("/post/all").post(postControllers.getAllPostAdmin);
router.route("/post/top").post(postControllers.getTop10PostsAdmin);
router.route("/post/search").post(postControllers.postSearchByAdmin);
router.route("/post/likes").post(postLikeController.whoLikedPost);
router
  .route("/post/unlike")
  .post(middlewares.verifyAdmin, postLikeController.unlikePost);

// REPLIES
router.route("/post/reply/all").post(replyContainer.getPostReply);
router
  .route("/post/reply/delete")
  .post(middlewares.verifyAdmin, replyContainer.deleteReply);
router
  .route("/post/reply/activate")
  .post(middlewares.verifyAdmin, replyContainer.reactivatereply);
router
  .route("/post/reply/update")
  .post(middlewares.verifyAdmin, replyContainer.updateReply);

// COMPLAINTS AND RESPONSES
router.route("/forum/complaints").post(complaintControllers.getComplaints);
router.route("/forum/responses").post(responseControllers.getResponses);

// NOTIFICATIONS
router
  .route("/notification/recent")
  .post(notificationController.recentNotifications);
router
  .route("/notification/search")
  .post(notificationController.searchNotification);
router
  .route("/notification/contact")
  .post(notificationController.adminNotifications);
router
  .route("/notification/create")
  .post(middlewares.verifyAdmin, notificationController.createNotification);
router
  .route("/notification/update")
  .post(middlewares.verifyAdmin, notificationController.updateNotification);
router
  .route("/notification/delete")
  .post(middlewares.verifyAdmin, notificationController.deleteNotification);

// FORUM JOINEES
router.route("/forum/joinee/recent").post(forumControllers.recentJoinee);
router.route("/forum/joinee/search").post(forumControllers.searchJoinee);
router.route("/forum/joinee/search/filter").post(forumControllers.filterJoinee);
router
  .route("/forum/joinee/remove")
  .post(middlewares.verifyAdmin, forumControllers.leftJoinedForum);

// OTHERS
router.route("/stats").post(generalControllers.getStats);
router.route("/recent/posts").post(generalControllers.recentPosts);
router.route("/recent/forums").post(generalControllers.recentForums);

// UNHANDLES ROUTES
router.route("*").all(functions.unhandledRoutes);

module.exports = router;
