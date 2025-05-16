const {
    userAuthRouter,
    serviceRouter,
    pushNotificationRouter,
    documentsRouter,
    invoiceRouter,
    dashboardRouter,
} = require("./router");
const { supportRouter, supportMessageRouter } = require("./router/support");

const router = require("express").Router();

router.use("/auth", userAuthRouter);
router.use("/services", serviceRouter);
router.use("/supports", supportRouter);
router.use("/supports/message", supportMessageRouter);
router.use("/notification", pushNotificationRouter);
router.use("/notification", pushNotificationRouter);
router.use("/document", documentsRouter);
router.use("/invoice", invoiceRouter);
router.use("/dashboard", dashboardRouter);

module.exports = router;
