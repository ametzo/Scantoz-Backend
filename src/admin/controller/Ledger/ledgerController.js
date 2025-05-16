const { isValidObjectId } = require("mongoose");
const sendErrorResponse = require("../../../helper/sendErrorResponse");
const { Ledger } = require("../../../models");
const { addLedgerSchema } = require("../../validations/leader/ledger.schema");

module.exports = {
    addNewLedgers: async (req, res) => {
        try {
            const { name, description } = req.body;

            const { _, error } = addLedgerSchema.validate(req.body);
            if (error) {
                return sendErrorResponse(res, 400, error.details[0].message);
            }

            const newLedger = new Ledger({
                ...req.body,
                isDeleted: false,
                isActive: true,
                createdBy: req.admin._id,
            });
            await newLedger.save();

            res.status(200).json(newLedger);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    updateLedgers: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description } = req.body;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid Ledgers id");
            }

            const { _, error } = addLedgerSchema.validate(req.body);
            if (error) {
                return sendErrorResponse(res, 400, error.details[0].message);
            }

            const Ledger = await Ledger.findOneAndUpdate(
                {
                    _id: id,
                    isDeleted: false,
                },
                {
                    name,
                    description,
                },
                { runValidators: true, new: true }
            );
            if (!Ledger) {
                return sendErrorResponse(res, 404, "Ledgers not found");
            }

            res.status(200).json({
                message: "Ledger successfully updated",
                _id: id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    deleteLedgers: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid Ledgers id");
            }

            const Ledger = await Ledger.findOneAndUpdate(
                {
                    _id: id,
                    isDeleted: false,
                },
                { $set: { isDeleted: true } }
            );

            if (!Ledger) {
                return sendErrorResponse(res, 404, "Ledgers not found");
            }

            res.status(200).json({
                message: "Ledger successfully deleted",
                _id: id,
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getAllLedgers: async (req, res) => {
        try {
            const { skip = 0, limit = 10, searchQuery } = req.query;

            const filters = { isDeleted: false };

            if (searchQuery && searchQuery !== "") {
                filters.$or = [
                    { name: { $regex: searchQuery, $options: "i" } },
                    { company: { $regex: searchQuery, $options: "i" } },
                ];
            }

            const ledgers = await Ledger.find(filters)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(limit * skip)
                .lean();

            const totalLedgers = await Ledger.countDocuments(filters);

            res.status(200).json({
                ledgers,
                totalLedgers,
                skip: Number(skip),
                limit: Number(limit),
            });
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getSingleLedgers: async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return sendErrorResponse(res, 400, "invalid Ledgers id");
            }

            const Ledger = await Ledger.findOne({
                isDeleted: false,
                _id: id,
            });
            if (!Ledger) {
                return sendErrorResponse(res, 404, "Ledgers not found");
            }

            res.status(200).json(Ledger);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },

    getLedgerAll: async (req, res) => {
        try {
            const ledgers = await Ledger.find({ isDeleted: false });

            res.status(200).json(ledgers || []);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
};
