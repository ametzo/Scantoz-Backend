const router = require("express").Router();

const {
    updateInvoice,
    getSingleCustomerInvoices,
    downloadInvoices,
} = require("../../controller/documents/invoiceController");
const userAuth = require("../../middleware/userAuth");


router.use(userAuth);

router.patch("/update/:id", updateInvoice);
router.get("/all", getSingleCustomerInvoices);
router.get("/excel", downloadInvoices);

module.exports = router;
