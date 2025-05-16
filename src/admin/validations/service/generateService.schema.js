const Joi = require("joi");

const serviceValidationSchema = Joi.object({
    serviceId: Joi.string().required().messages({
        "string.base": "Project number should be a string",
        "any.required": "Project number is required",
    }),
    projectNo: Joi.string().required().messages({
        "string.base": "Project number should be a string",
        "any.required": "Project number is required",
    }),

    serviceDate: Joi.date().required().messages({
        "date.base": "Service date should be a valid date",
        "any.required": "Service date is required",
    }),

    status: Joi.string()
        .valid("on-going", "completed", "pending")
        .required()
        .messages({
            "string.base": "Status should be a string",
            "any.required": "Status is required",
            "any.only": "Status should be one of [Ongoing, Completed, Pending]",
        }),

    servicedBy: Joi.string().hex().length(24).required().messages({
        "string.base": "ServicedBy should be a string",
        "string.hex": "ServicedBy should be a valid ObjectId",
        "any.required": "ServicedBy is required",
    }),

    serviceTime: Joi.string().required().messages({
        "string.base": "Service time should be a string",
        "any.required": "Service time is required",
    }),
});

module.exports = {
    serviceValidationSchema,
};
