const sendErrorResponse = require("../../../helper/sendErrorResponse");
const { GeneratedDetail } = require("../../../models");

module.exports = {
    getPriceDetails: async (req, res) => {
        try {
            const {
                fromDate,
                toDate,
                type = "purchase-invoice",
                filterBy = "invoiceDate",
            } = req.query;

            const filters = { status: "approved" };

            if (filterBy && (fromDate || toDate)) {
                if (filterBy === "invoiceDate") {
                    if (fromDate && toDate) {
                        filters.$and = [
                            { invoiceDate: { $gte: new Date(fromDate) } },
                            { invoiceDate: { $lte: new Date(toDate) } },
                        ];
                    } else if (fromDate) {
                        filters["invoiceDate"] = { $gte: new Date(fromDate) };
                    } else if (toDate) {
                        filters["invoiceDate"] = { $lte: new Date(toDate) };
                    }
                }
            }

            const filter2 = {};

            if (type) {
                filter2["document.documentType"] = type;
            }

            filter2["document.customer"] = req.user?.customerId?._id;

            const invoices = await GeneratedDetail.aggregate([
                { $match: { ...filters, documentId: { $exists: true } } },
                {
                    $lookup: {
                        from: "documents",
                        localField: "documentId",
                        foreignField: "_id",
                        as: "document",
                    },
                },
                {
                    $unwind: {
                        path: "$document",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                { $match: filter2 },
                {
                    $group: {
                        _id: null,
                        totalVatAmount: {
                            $sum: {
                                $toDouble: {
                                    $replaceAll: {
                                        input: "$vatAmount",
                                        find: ",",
                                        replacement: "",
                                    },
                                },
                            },
                        },
                        totalGrossAmount: {
                            $sum: {
                                $toDouble: {
                                    $replaceAll: {
                                        input: "$grossAmount",
                                        find: ",",
                                        replacement: "",
                                    },
                                },
                            },
                        },
                        totalTotalAmount: {
                            $sum: {
                                $toDouble: {
                                    $replaceAll: {
                                        input: "$totalAmount",
                                        find: ",",
                                        replacement: "",
                                    },
                                },
                            },
                        },
                        totalProfit: {
                            $sum: {
                                $subtract: [
                                    {
                                        $toDouble: {
                                            $replaceAll: {
                                                input: "$totalAmount",
                                                find: ",",
                                                replacement: "",
                                            },
                                        },
                                    },
                                    {
                                        $toDouble: {
                                            $replaceAll: {
                                                input: "$grossAmount",
                                                find: ",",
                                                replacement: "",
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            ]);

            res.status(200).json({
                totalTotalAmount: invoices[0]?.totalTotalAmount.toFixed(2) || 0,
                totalGrossAmount: invoices[0]?.totalGrossAmount.toFixed(2) || 0,
                totalVatAmount: invoices[0]?.totalVatAmount.toFixed(2) || 0,
                totalProfit: invoices[0]?.totalProfit.toFixed(2) || 0,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getChartDetails: async (req, res) => {
        try {
            const { year = 2025, type = "purchase-invoice" } = req.query;

            const filters = { status: "approved" };

            const filter2 = {};

            // if (type) {
            //     filter2["document.documentType"] = type;
            // }

            filter2["document.customer"] = req.user?.customerId?._id;

            const purchaseExpenseinvoicesAndSales =
                await GeneratedDetail.aggregate([
                    {
                        $match: {
                            ...filters,
                            documentId: { $exists: true },
                            invoiceDate: {
                                $gte: new Date(`${year}-01-01`),
                                $lte: new Date(`${year}-12-31`),
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: "documents",
                            localField: "documentId",
                            foreignField: "_id",
                            as: "document",
                        },
                    },
                    {
                        $unwind: {
                            path: "$document",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    { $match: filter2 },
                    {
                        $project: {
                            totalAmount: {
                                $toDouble: {
                                    $replaceAll: {
                                        input: "$totalAmount",
                                        find: ",",
                                        replacement: "",
                                    },
                                },
                            },
                            month: { $month: "$invoiceDate" },
                            documentType: "$document.documentType",
                        },
                    },
                    {
                        $match: { month: { $gte: 1, $lte: 12 } },
                    },
                    {
                        $group: {
                            _id: "$month",
                            purchaseExpense: {
                                $sum: {
                                    $cond: [
                                        {
                                            $in: [
                                                "$documentType",
                                                ["purchase-invoice", "expense"],
                                            ],
                                        },
                                        "$totalAmount",
                                        0,
                                    ],
                                },
                            },
                            sales: {
                                $sum: {
                                    $cond: [
                                        {
                                            $eq: [
                                                "$documentType",
                                                "sales-invoice",
                                            ],
                                        },
                                        "$totalAmount",
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            month: "$_id",
                            purchaseExpense: 1,
                            sales: 1,
                        },
                    },
                ]);

            res.status(200).json(purchaseExpenseinvoicesAndSales || []);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getLedgerReportDetails: async (req, res) => {
        try {
            const {
                fromDate,
                toDate,
                type = "sales-invoice",
                filterBy = "invoiceDate",
            } = req.query;

            const filters = { status: "approved" };
            const filter2 = {};

            filter2["document.customer"] = req.user?.customerId?._id;

            filter2["document.documentType"] = {
                $in: ["purchase-invoice", "expense"],
            };

            if (filterBy && (fromDate || toDate)) {
                if (filterBy === "invoiceDate") {
                    if (fromDate && toDate) {
                        filters.$and = [
                            { invoiceDate: { $gte: new Date(fromDate) } },
                            { invoiceDate: { $lte: new Date(toDate) } },
                        ];
                    } else if (fromDate) {
                        filters["invoiceDate"] = { $gte: new Date(fromDate) };
                    } else if (toDate) {
                        filters["invoiceDate"] = { $lte: new Date(toDate) };
                    }
                }
            }

            const invoices = await GeneratedDetail.aggregate([
                {
                    $match: {
                        ...filters,
                        documentId: { $exists: true },
                    },
                },
                {
                    $lookup: {
                        from: "documents",
                        localField: "documentId",
                        foreignField: "_id",
                        as: "document",
                    },
                },
                {
                    $unwind: {
                        path: "$document",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                { $match: filter2 },

                {
                    $lookup: {
                        from: "ledgers",
                        localField: "ledgerId",
                        foreignField: "_id",
                        as: "ledger",
                    },
                },
                {
                    $unwind: {
                        path: "$ledger",
                    },
                },
                {
                    $group: {
                        _id: "$ledgerId", // Group by ledgerId
                        amount: {
                            $sum: {
                                $toDouble: {
                                    $replaceAll: {
                                        input: "$totalAmount",
                                        find: ",",
                                        replacement: "",
                                    },
                                },
                            },
                        },
                        ledgerName: {
                            $first: "$ledger.name", // Get the ledger name
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        ledgers: {
                            $push: {
                                ledgerId: "$_id",
                                amount: "$amount",
                                ledgerName: "$ledgerName",
                            },
                        },
                        totalAmountSum: { $sum: "$amount" }, // Calculate the total amount across all ledgers
                    },
                },
                {
                    $project: {
                        ledgers: 1,
                        totalAmountSum: 1,
                        ledgersWithPercentage: {
                            $map: {
                                input: "$ledgers",
                                as: "ledger",
                                in: {
                                    ledgerId: "$$ledger.ledgerId",
                                    ledgerName: "$$ledger.ledgerName",
                                    amount: "$$ledger.amount",
                                    percentage: {
                                        $round: [
                                            {
                                                $multiply: [
                                                    {
                                                        $cond: {
                                                            if: {
                                                                $eq: [
                                                                    "$totalAmountSum",
                                                                    0,
                                                                ],
                                                            },
                                                            then: 0,
                                                            else: {
                                                                $divide: [
                                                                    "$$ledger.amount",
                                                                    "$totalAmountSum",
                                                                ],
                                                            },
                                                        },
                                                    },
                                                    10,
                                                ],
                                            },
                                            2,
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },

                {
                    $project: {
                        _id: 0,
                        totalAmountSum: 1,
                        ledgersWithPercentage: 1,
                    },
                },
            ]);

            res.status(200).json({
                totalAmount: invoices[0]?.totalAmountSum || 0,
                ledgers: invoices[0]?.ledgersWithPercentage || [],
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
};
