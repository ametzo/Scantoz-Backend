const { isValidObjectId } = require("mongoose");
const sendErrorResponse = require("../../../helper/sendErrorResponse");
const { Support } = require("../../../models");

module.exports = {
    addnewSupports: async (req, res) => {
        try {
            const { userId, subject } = req.body;

            if (!isValidObjectId(userId)) {
                return sendErrorResponse(res, 400, "invalid userId");
            }

            if (!subject) {
                return sendErrorResponse(res, 404, "subject not found");
            }
            const newSupport = new Support({
                userId,
                subject,
                adminId: req.admin?._id,
                status: "created",
                isDeleted: false,
            });
            await newSupport.save();

            res.status(200).json({
                message: "new  support successfully added",
                _id: newSupport?._id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    deleteSupports: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid Supportsid");
            }

            const support = await Support.findOneAndUpdate(
                {
                    _id: id,
                    isDeleted: false,
                },
                { $set: { isDeleted: true } }
            );
            if (!support) {
                return sendErrorResponse(res, 404, "Supports not found");
            }

            res.status(200).json({
                message: " support successfully deleted",
                _id: id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getAllSupports: async (req, res) => {
        try {
            const { skip = 0, limit = 10, searchQuery } = req.query;

            const filters = { isDeleted: false };

            if (searchQuery && searchQuery !== "") {
                filters.subject = { $regex: searchQuery, $options: "i" };
            }

            const supports = await Support.find(filters)
                .populate("userId", "company")
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(limit * skip)
                .lean();

            const totalSupports = await Support.countDocuments(filters);

            res.status(200).json({
                supports,
                totalSupports,
                skip: Number(skip),
                limit: Number(limit),
            });
        } catch (err) {
            console.log(err);
            sendErrorResponse(res, 500, err);
        }
    },

    getSingleSupports: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid Supportsid");
            }

            const support = await Support.findOne({
                isDeleted: false,
                _id: id,
            });

            if (!support) {
                return sendErrorResponse(res, 404, "Supports not found");
            }

            res.status(200).json(support);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    updateSupportStatus: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid Supportsid");
            }

            const { status } = req.body;

            if (!status) {
                return sendErrorResponse(res, 400, " Support status required");
            }

            const support = await Support.findOneAndUpdate(
                {
                    _id: id,
                    isDeleted: false,
                },
                { $set: { status } }
            );
            if (!support) {
                return sendErrorResponse(res, 404, "Supports not found");
            }

            res.status(200).json({
                message: " support successfully updated",
                _id: id,
            });
        } catch (err) {}
    },
};
