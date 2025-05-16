const userAuthRouter = require("../router/userRouter/userAuthRouter");
const serviceRouter = require("../router/serviceRouter/serviceRouter");
const pushNotificationRouter = require("../router/pushNotification/pushNotificationRouter");
const documentsRouter = require("../router/document/documentRouter");
const invoiceRouter = require("../router/document/invoiceRouter");
const dashboardRouter = require("../router/dashboard/dashboardRouter");
module.exports = {
    userAuthRouter,
    serviceRouter,
    pushNotificationRouter,
    documentsRouter,
    invoiceRouter,
    dashboardRouter,
};
