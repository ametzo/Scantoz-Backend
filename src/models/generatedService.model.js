const { Schema, model } = require("mongoose");

const serviceSchema = new Schema(
    {
        serviceId: {
            type: Schema.Types.ObjectId,
            ref: "Service",
            required: true,
        },
        projectNo: {
            type: String,
            required: true,
        },
        serviceDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            required: true,
            lowercase: true,
            enum: ["pending", "on-going", "approved", "completed"],
        },
        servicedBy: {
            type: Schema.Types.ObjectId,
            ref: "Worker",
            required: true,
        },
        serviceTime: {
            type: String,
            required: true,
        },
        signedBy: {
            type: String,
            required: function () {
                return this.status === "approved";
            },
        },
        signedTime: {
            type: String,
            required: function () {
                return this.status === "approved";
            },
        },
        image: {
            type: String,
            required: function () {
                return this.status === "approved";
            },
        },
        isDeleted: {
            type: Boolean,
            required: true,
            default: false,
        },
        isActive: {
            type: Boolean,
            required: true,
            default: true,
        },
    },
    { timestamps: true }
);

const GenerateService = model("GenerateService", serviceSchema);

module.exports = GenerateService;
