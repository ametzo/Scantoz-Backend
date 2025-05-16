const router = require("express").Router();

const checkPermission = require("../../middleware/checkPermission");

const {
    updateInvoice,
    getSingleCustomerInvoices,
    downloadInvoices,
    deleteInvoice,
} = require("../../controller/document/invoiceController");

router.use(checkPermission());

router.patch("/update/:id", updateInvoice);
router.get("/:customerId/all", getSingleCustomerInvoices);
router.get("/:customerId/invoice", downloadInvoices);
router.delete("/delete/:id", deleteInvoice);

module.exports = router;
