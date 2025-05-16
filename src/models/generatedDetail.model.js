const mongoose = require("mongoose");
const { Schema } = mongoose;

const documentSchema = new Schema(
    {
        imagePath: {
            type: String,
        },
        fileName: {
            type: String,
        },
        imageSize: {
            type: Number,
        },
        invoiceNumber: {
            type: String,
        },
        invoiceDate: {
            type: Date,
        },
        tnrNumber: {
            type: String,
        },
        companyName: {
            type: String,
        },
        grossAmount: {
            type: String,
        },
        vatAmount: {
            type: String,
        },
        totalAmount: {
            type: String,
        },
        currency: {
            type: String,
        },
        status: {
            type: String,
            enum: ["generated", "pending", "reviewed", "approved"],
            required: true,
            default: "generated",
        },
        documentId: {
            type: Schema.Types.ObjectId,
            ref: "Document",
            required: function () {
                return this.status === "pending";
            },
        },
        ledgerId: {
            type: Schema.Types.ObjectId,
            ref: "Ledger",
            required: function () {
                return this.status === "reviewed" || this.status === "approved";
            },
        },
        isDeleted: {
            type: Boolean,
            default: false,
            required: true,
        },
    },
    { timestamps: true }
);

const GeneratedDetail = mongoose.model("GeneratedDetail", documentSchema);

module.exports = GeneratedDetail;
