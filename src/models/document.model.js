const mongoose = require("mongoose");
const { Schema } = mongoose;

const documentSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        documentType: {
            type: String,
            enum: [
                "sales-invoice",
                "purchase-invoice",
                "expense",
                "legal-document",
                "other-document",
            ],
            required: true,
        },
        paymentMode: {
            type: String,
            // enum: ["cash", "credit", "bank", "other"],
            // required: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
            required: true,
        },
    },
    { timestamps: true }
);

const Document = mongoose.model("Document", documentSchema);

module.exports = Document;
