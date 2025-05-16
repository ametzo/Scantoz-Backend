const router = require("express").Router();

const {
    getAllLedgers,
    addNewLedgers,
    deleteLedgers,
    getSingleLedgers,
    updateLedgers,
    getLedgerAll,
} = require("../../controller/Ledger/ledgerController");
const checkPermission = require("../../middleware/checkPermission");

router.use(checkPermission());

router.get("/all", getAllLedgers);
router.get("/single/:id", getSingleLedgers);
router.post("/add", addNewLedgers);
router.patch("/update/:id", updateLedgers);
router.delete("/delete/:id", deleteLedgers);
router.get("/list", getLedgerAll);

module.exports = router;
