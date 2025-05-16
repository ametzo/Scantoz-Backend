const router = require("express").Router();

const { adminAuthRouter } = require("./router/admin");
const { adminRolesRouter } = require("./router/adminRoles");
const { adminCustomerRouter } = require("./router/customer");
const { adminLeadsRouter } = require("./router/leads");
const { adminServiceRouter } = require("./router/service");
const {
    adminSupportRouter,
    adminSupportMessageRouter,
} = require("./router/support");
const { adminWorkerRouter } = require("./router/worker");
const {
    adminDocumentRouter,
    adminInvoiceRouter,
} = require("./router/document");
const { adminLedgersRouter } = require("./router/ledger");

router.use("/auth", adminAuthRouter);
router.use("/roles", adminRolesRouter);
router.use("/leads", adminLeadsRouter);
router.use("/customers", adminCustomerRouter);
router.use("/workers", adminWorkerRouter);
router.use("/services", adminServiceRouter);
router.use("/supports", adminSupportRouter);
router.use("/supports/message", adminSupportMessageRouter);
router.use("/document", adminDocumentRouter);
router.use("/ledger", adminLedgersRouter);
router.use("/document/invoice", adminInvoiceRouter);

module.exports = router;
