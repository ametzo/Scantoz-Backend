const {
    getPriceDetails,
    getChartDetails,
    getLedgerReportDetails,
} = require("../../controller/dashboard/dashboardController");
const userAuth = require("../../middleware/userAuth");

const router = require("express").Router();

router.use(userAuth);
router.get("/general", getPriceDetails);
router.get("/chart", getChartDetails);
router.get("/ledger", getLedgerReportDetails);

module.exports = router;
