const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const {
    userLogin,
    getUser,
    createForgetPassword,
    completeForgetPassword,
    changePassword,
} = require("../../controller/user/userController");
const userAuth = require("../../middleware/userAuth");

router.post("/login", userLogin);
router.post("/forgot-password/create", createForgetPassword);
router.post("/forgot-password/complete", completeForgetPassword);

router.use(userAuth);

router.get("/my-account", getUser);
router.post("/change/password", changePassword);

module.exports = router;
