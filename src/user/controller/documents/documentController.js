const path = require("path");
const fs = require("fs");
const { isValidObjectId } = require("mongoose");
const { OpenAIApi, OpenAI } = require("openai");
const sendErrorResponse = require("../../../helper/sendErrorResponse");
const {
    processImage,
    processMultipleImage,
    processFile,
} = require("../../../helper/openAiHelper");
const {
    addDocumentSchema,
} = require("../../validations/document/addDocument.schema");
const { Document, GeneratedDetail } = require("../../../models");
const {
    invoiceDownloadHelper,
} = require("../../../helper/invoiceDownloadHelper");
const companyNameRegex = /"([^"]+)"/;
const amountRegex = /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s?[A-Za-z]+)/;

module.exports = {
    generateSingleTextFromImage: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "No image uploaded" });
            }

            const imagePath = req.file.path;

            const imageBuffer = fs.readFileSync(imagePath);

            const base64Image = imageBuffer.toString("base64");

            const imageUrl = `data:image/jpeg;base64,${base64Image}`;

            const openai = new OpenAI({
                apiKey: "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", // Replace with your OpenAI API key
            });

            const response = await openai.chat.completions.create({
                model: "gpt-4o-2024-08-06", // Use GPT-4 multimodal model
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Extract the company name and total amount from the bill shown in the image and just return  companyName as key and name as value  then amount as key also as value currency as key and value if it is present.",
                            },
                            {
                                type: "image_url", // Assuming OpenAI supports direct buffer image upload (this is hypothetical)
                                image_url: {
                                    url: imageUrl, // Send the base64 data URL
                                },
                            },
                        ],
                    },
                ],
                // file: imageBuffer,
            });

            console.log(response, "response.data");
            console.log(
                response?.choices[0]?.message?.content,
                "response.data"
            );
            const extractedInfo = response?.choices[0]?.message?.content;
            const cleanExtractedInfo = extractedInfo.replace(
                /^```json\n|\n```$/g,
                ""
            );
            let parsedInfo = JSON.parse(cleanExtractedInfo);

            const companyName = parsedInfo.companyName;
            const amount = parsedInfo.amount;
            const currency = parsedInfo.currency;
            console.log("Company Name:", companyName);
            console.log("Total Amount:", amount);
            console.log("Currency:", currency);

            return res.status(200).json({
                success: true,
                extractedInfo: extractedInfo,
            });
        } catch (err) {
            console.log(err);
            sendErrorResponse(res, 500, "Internal server error");
        }
    },
    generateMultipleTextFromImage: async (files, req, res) => {
        try {
            if (!files || files.length === 0) {
                return res.status(400).json({ error: "No images uploaded" });
            }

            const extractedResults = await Promise.all(files.map(processImage));
            const details = await GeneratedDetail.insertMany(extractedResults);

            const sanitizedDetails = details.map(({ _doc }) => {
                const {
                    createdAt,
                    updatedAt,
                    status,
                    documentId,
                    isDeleted,
                    __v,
                    ...rest
                } = _doc;
                return rest;
            });

            return res.status(200).json({
                success: true,
                extractedResults: sanitizedDetails,
            });
        } catch (err) {
            console.log(err);
            sendErrorResponse(res, 500, "Internal server error");
        }
    },

    regenerateImage: async (req, res) => {
        try {
            const { id } = req.params;
            const file = {};
            const detail = await GeneratedDetail.findOne({ _id: id });
            file.path = detail?.imagePath;
            const extractedResult = await processImage(file);

            const updatedDetail = await GeneratedDetail.findOneAndUpdate(
                { _id: id },
                { $set: { ...extractedResult } },
                { new: true }
            );

            const plainDetail = updatedDetail.toObject();

            const {
                createdAt,
                updatedAt,
                __v,
                documentId,
                isDeleted,
                status,
                ...rest
            } = plainDetail;

            return res.status(200).json({
                success: true,
                extractedResult: rest,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    createDocument: async (files, req, res) => {
        try {
            const { generatedInvoice } = req.body;

            const parsedGeneratedInvoice = Array.isArray(generatedInvoice)
                ? generatedInvoice
                : JSON.parse(generatedInvoice || "[]");

            const { _, error } = addDocumentSchema.validate({
                ...req.body,
                generatedInvoice: parsedGeneratedInvoice,
            });

            if (error) {
                return sendErrorResponse(res, 400, error.details[0].message);
            }

            const {
                companyName,
                grossAmount,
                vatAmount,
                totalAmount,
                invoiceDate,
                ...documentData
            } = req.body;

            const newDocument = new Document({
                ...documentData,
                customer: req.user?.customerId?._id,
                isDeleted: false,
                isActive: true,
            });

            if (
                newDocument.documentType === "purchase-invoice" ||
                newDocument.documentType === "expense"
            ) {
                if (
                    parsedGeneratedInvoice &&
                    parsedGeneratedInvoice.length > 0
                ) {
                    const updates = parsedGeneratedInvoice.map((detail) => ({
                        updateOne: {
                            filter: { _id: detail._id },
                            update: {
                                $set: {
                                    status: "pending",
                                    documentId: newDocument._id,
                                },
                            },
                        },
                    }));

                    await GeneratedDetail.bulkWrite(updates);
                }
            } else {
                if (!files || files.length === 0) {
                    return sendErrorResponse(
                        res,
                        400,
                        "please upload at least one document"
                    );
                }

                const processedFiles = await Promise.all(
                    files.map(async (file) => {
                        const { imagePath, imageSize, fileName } =
                            await processFile(file);

                        const fileData = {
                            imagePath,
                            imageSize,
                            fileName,
                            status: "pending",
                            documentId: newDocument._id,
                        };

                        if (newDocument.documentType === "sales-invoice") {
                            Object.assign(fileData, {
                                companyName,
                                grossAmount,
                                vatAmount,
                                totalAmount,
                                invoiceDate,
                            });
                        }

                        return fileData;
                    })
                );

                const newGeneratedDetails = await GeneratedDetail.insertMany(
                    processedFiles
                );
            }

            await newDocument.save();

            res.status(200).json({
                message: "new document successfully added",
                _id: newDocument._id,
            });
        } catch (err) {
            console.error(err);
            sendErrorResponse(res, 500, err);
        }
    },
    deleteDocument: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid Leads id");
            }

            const document = await Document.findOneAndUpdate(
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
                message: "document successfully deleted",
                _id: id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
    getAllDocuments: async (req, res) => {
        try {
            const { skip = 0, limit = 10, searchQuery, type } = req.query;

            // const filters = {};
            const filters = { customer: req.user?.customerId?._id };

            if (searchQuery && searchQuery !== "") {
                filters.$or = [
                    { title: { $regex: searchQuery, $options: "i" } },
                    { company: { $regex: searchQuery, $options: "i" } },
                ];
            }

            if (type && type !== "") {
                filters.documentType = type;
            }

            const documents = await Document.find(filters)
                .populate("customer", "company")
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(limit * skip)
                .lean();

            const totalDocuments = await Document.countDocuments(filters);
            res.status(200).json({
                documents,
                totalDocuments,
                skip: Number(skip),
                limit: Number(limit),
            });
            
            // const documents = await Document.aggregate([
            //     { $match: filters },
            //     {
            //         $lookup: {
            //             from: "generateddetails",
            //             let: { docId: "$_id" },
            //             pipeline: [
            //                 {
            //                     $match: {
            //                         $expr: { $eq: ["$documentId", "$$docId"] },
            //                     },
            //                 },
            //                 { $project: { companyName: 1, _id: 0 } },
            //             ],
            //             as: "generateddetails",
            //         },
            //     },
            //     {
            //         $match: {
            //             $or: [
            //                 { title: { $regex: searchQuery, $options: "i" } },
            //                 {
            //                     "generateddetails.companyName": {
            //                         $regex: searchQuery,
            //                         $options: "i",
            //                     },
            //                 },
            //             ],
            //         },
            //     },
            //     {
            //         $project: {
            //             generateddetails: 0,
            //         },
            //     },
            //     {
            //         $facet: {
            //             data: [
            //                 // Optional: Add pagination here
            //                 { $skip: Number(skip) * Number(limit) },
            //                 { $limit: Number(limit) },
            //             ],
            //             totalCount: [{ $count: "count" }],
            //         },
            //     },
            // ]);

            // res.status(200).json({
            //     documents: documents[0]?.data,
            //     totalDocuments: documents[0]?.totalCount[0]?.count || 0,
            //     skip: Number(skip),
            //     limit: Number(limit),
            // });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getSingleDocument: async (req, res) => {
        try {
            const { id } = req.params;

            const {
                skip = 0,
                limit = 10,
                searchQuery,
                type,
                fromDate,
                toDate,
                filterBy = "invoiceDate",
            } = req.query;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "Invalid document ID");
            }

            const filters2 = {};

            const document = await Document.findOne({ _id: id });
            if (!document) {
                return sendErrorResponse(res, 404, "Document not found");
            }

            if (searchQuery && searchQuery !== "") {
                filters2.$or = [
                    { invoiceNumber: { $regex: searchQuery, $options: "i" } },
                    { companyName: { $regex: searchQuery, $options: "i" } },
                ];
            }

            if (filterBy && (fromDate || toDate)) {
                if (filterBy === "invoiceDate") {
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

            const invoices = await GeneratedDetail.find({
                $and: [{ documentId: document._id }, { ...filters2 }],
            });

            res.status(200).json({
                document,
                invoices,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    downloadSingleDocumentExcel: async (req, res) => {
        try {
            const { id } = req.params;

            const {
                skip = 0,
                limit = 10,
                searchQuery,
                type,
                fromDate,
                toDate,
                filterBy = "invoiceDate",
            } = req.query;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "Invalid document ID");
            }

            const filters2 = {};

            const document = await Document.findOne({ _id: id });
            if (!document) {
                return sendErrorResponse(res, 404, "Document not found");
            }

            if (searchQuery && searchQuery !== "") {
                filters2.$or = [
                    { invoiceNumber: { $regex: searchQuery, $options: "i" } },
                    { companyName: { $regex: searchQuery, $options: "i" } },
                ];
            }

            if (filterBy && (fromDate || toDate)) {
                if (filterBy === "invoiceDate") {
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

            const invoices = await GeneratedDetail.find({
                $and: [{ documentId: document._id }, { ...filters2 }],
            });

            await invoiceDownloadHelper({ invoices: invoices, res });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
};
