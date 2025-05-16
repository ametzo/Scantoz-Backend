const { GeneratedDetail, Ledger, Document } = require("../../../models");
const { isValidObjectId } = require("mongoose");
const {
    invoiceDownloadHelper,
} = require("../../../helper/invoiceDownloadHelper");
const sendErrorResponse = require("../../../helper/sendErrorResponse");

module.exports = {
    updateInvoice: async (req, res) => {
        try {
            const { id } = req.params;

            const { status, ledgerId } = req.body;
            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid Leads id");
            }

            if (status === "reviewed" || status === "approved") {
                let ledger = await Ledger.findOne({ _id: ledgerId });
                if (!ledger) {
                    return sendErrorResponse(res, 404, "ledger not found");
                }
            }

            const updateInvoice = await GeneratedDetail.findOneAndUpdate(
                { _id: id },
                {
                    $set: { ...req.body },
                }
            );

            if (!updateInvoice) {
                return sendErrorResponse(res, 404, "invoice not found");
            }

            res.status(200).json({
                message: "invoice successfully deleted",
                _id: id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getSingleCustomerInvoices: async (req, res) => {
        try {
            const { customerId } = req.params;
            const {
                skip = 0,
                limit = 10,
                searchQuery,
                type,
                fromDate,
                toDate,
                filterBy = "createdAt",
            } = req.query;

            if (!isValidObjectId(customerId)) {
                return sendErrorResponse(res, 400, "Invalid customer ID");
            }

            const filters = { customer: customerId, isDeleted: false };
            const filters2 = { isDeleted: false };
            if (searchQuery && searchQuery !== "") {
                filters2.$or = [
                    { invoiceNumber: { $regex: searchQuery, $options: "i" } },
                    { companyName: { $regex: searchQuery, $options: "i" } },
                ];
            }

            if (type && type.trim() !== "") {
                filters.documentType =
                    type === "purchase"
                        ? "purchase-invoice"
                        : type === "sales"
                        ? "sales-invoice"
                        : type;
            }

            if (filterBy && (fromDate || toDate)) {
                if (filterBy === "createdAt") {
                    if (fromDate && toDate) {
                        filters.$and = [
                            { createdAt: { $gte: new Date(fromDate) } },
                            { createdAt: { $lte: new Date(toDate) } },
                        ];
                    } else if (fromDate) {
                        filters["createdAt"] = { $gte: new Date(fromDate) };
                    } else if (toDate) {
                        filters["createdAt"] = { $lte: new Date(toDate) };
                    }
                } else if (filterBy === "invoiceDate") {
                    if (fromDate && toDate) {
                        filters2.$and = [
                            { invoiceDate: { $gte: new Date(fromDate) } },
                            { invoiceDate: { $lte: new Date(toDate) } },
                        ];
                    } else if (fromDate) {
                        filters2["invoiceDate"] = { $gte: new Date(fromDate) };
                    } else if (toDate) {
                        filters2["invoiceDate"] = { $lte: new Date(toDate) };
                    }
                }
            }

            const documents = await Document.find(filters);

            if (!documents.length) {
                return res.status(200).json([]);
            }

            const invoices = await GeneratedDetail.find({
                $and: [
                    { documentId: { $in: documents.map((doc) => doc._id) } },
                    { ...filters2 },
                ],
            }).lean();

            const recordMap = new Map();

            invoices.forEach((invoice) => {
                const key = `${invoice.invoiceDate}_${Number(
                    invoice.totalAmount
                )}_${invoice.companyName.toLowerCase()}`;

                if (recordMap.has(key)) {
                    invoice.duplicate = true;
                    recordMap.get(key).push(invoice);
                } else {
                    recordMap.set(key, [invoice]);
                    invoice.duplicate = false;
                }
            });

            const result = [];
            recordMap.forEach((invoicesArray) => {
                invoicesArray.forEach((invoice) => {
                    result.push(invoice);
                });
            });

            console.log(result);

            res.status(200).json(result || []);
        } catch (err) {
            console.error("Error fetching customer invoices:", err);
            return sendErrorResponse(
                res,
                500,
                "An error occurred while fetching customer invoices."
            );
        }
    },

    downloadInvoices: async (req, res) => {
        try {
            const { customerId } = req.params;
            const {
                skip = 0,
                limit = 10,
                searchQuery,
                type,
                fromDate,
                toDate,
                filterBy = "createdAt",
            } = req.query;

            if (!isValidObjectId(customerId)) {
                return sendErrorResponse(res, 400, "Invalid customer ID");
            }

            const filters = { customer: customerId };
            const filters2 = {};
            if (searchQuery && searchQuery !== "") {
                filters2.$or = [
                    { invoiceNumber: { $regex: searchQuery, $options: "i" } },
                    { companyName: { $regex: searchQuery, $options: "i" } },
                ];
            }

            if (type && type.trim() !== "") {
                filters.documentType =
                    type === "purchase"
                        ? "purchase-invoice"
                        : type === "sales"
                        ? "sales-invoice"
                        : type;
            }

            if (filterBy && (fromDate || toDate)) {
                if (filterBy === "createdAt") {
                    if (fromDate && toDate) {
                        filters.$and = [
                            { createdAt: { $gte: new Date(fromDate) } },
                            { createdAt: { $lte: new Date(toDate) } },
                        ];
                    } else if (fromDate) {
                        filters["createdAt"] = { $gte: new Date(fromDate) };
                    } else if (toDate) {
                        filters["createdAt"] = { $lte: new Date(toDate) };
                    }
                } else if (filterBy === "invoiceDate") {
                    if (fromDate && toDate) {
                        filters2.$and = [
                            { invoiceDate: { $gte: new Date(fromDate) } },
                            { invoiceDate: { $lte: new Date(toDate) } },
                        ];
                    } else if (fromDate) {
                        filters2["invoiceDate"] = { $gte: new Date(fromDate) };
                    } else if (toDate) {
                        filters2["invoiceDate"] = { $lte: new Date(toDate) };
                    }
                }
            }

            const documents = await Document.find(filters);

            if (!documents.length) {
                return res.status(200).json([]);
            }

            const invoices = await GeneratedDetail.find({
                $and: [
                    { documentId: { $in: documents.map((doc) => doc._id) } },
                    { ...filters2 },
                ],
            }).lean();

            const recordMap = new Map();

            invoices.forEach((invoice) => {
                const key = `${invoice.invoiceDate}_${Number(
                    invoice.totalAmount
                )}_${invoice.companyName.toLowerCase()}`;

                if (recordMap.has(key)) {
                    invoice.duplicate = true;
                    recordMap.get(key).push(invoice);
                } else {
                    recordMap.set(key, [invoice]);
                    invoice.duplicate = false;
                }
            });

            const result = [];
            recordMap.forEach((invoicesArray) => {
                invoicesArray.forEach((invoice) => {
                    result.push(invoice);
                });
            });

            console.log(result);

            await invoiceDownloadHelper({ invoices: result, res });
        } catch (err) {
            console.error("Error fetching customer invoices:", err);
            return sendErrorResponse(
                res,
                500,
                "An error occurred while fetching customer invoices."
            );
        }
    },

    deleteInvoice: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid Leads id");
            }

            const document = await GeneratedDetail.findOneAndUpdate(
                {
                    _id: id,
                    isDeleted: false,
                },
                { $set: { isDeleted: true } }
            );

            if (!document) {
                return sendErrorResponse(res, 404, "document not found");
            }

            res.status(200).json({
                message: "invoice successfully deleted",
                _id: id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
};
