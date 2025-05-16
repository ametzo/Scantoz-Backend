const { Schema, model } = require("mongoose");

const stateSchema = new Schema(
    {
        company: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        userStatus: {
            type: String,
            required: true,
        },
        // assigned: {
        //     type: Schema.Types.ObjectId,
        //     ref: "Admin",
        //     required: true,
        // },
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

const Customer = model("Customer", stateSchema);

module.exports = Customer;
