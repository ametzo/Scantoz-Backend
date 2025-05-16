const Joi = require("joi");

const addDocumentSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow("", null),
    customer: Joi.string().required(),
    documentType: Joi.string()
        .valid(
            "sales-invoice",
            "purchase-invoice",
            "expense",
            "legal-document",
            "other-document"
        )
        .required()
        .description("Type of the document"),
    paymentMode: Joi.string()
        .valid("cash", "credit", "bank", "other")
        .allow("", null),
    generatedInvoice: Joi.array()
        .items({
            _id: Joi.string().required(),
            imagePath: Joi.string().required(),
            fileName: Joi.string().required(),
            imageSize: Joi.number().required(),
            invoiceNumber: Joi.string().allow("", null),
            invoiceDate: Joi.string().allow("", null),
            tnrNumber: Joi.string().allow("", null),
            companyName: Joi.string().required(),
            grossAmount: Joi.string().allow("", null),
            vatAmount: Joi.string().allow("", null),
            totalAmount: Joi.string().allow("", null),
            currency: Joi.string().allow("", null),
        })
        .when("documentType", {
            is: Joi.valid("purchase-invoice", "expense"),
            then: Joi.required(),
            otherwise: Joi.allow("", null),
        }),
    companyName: Joi.string().when("documentType", {
        is: "sales-invoice",
        then: Joi.allow("", null),
        otherwise: Joi.allow("", null),
    }),
    grossAmount: Joi.number().when("documentType", {
        is: "sales-invoice",
        then: Joi.required(),
        otherwise: Joi.allow("", null),
    }),
    vatAmount: Joi.number().when("documentType", {
        is: "sales-invoice",
        then: Joi.required(),
        otherwise: Joi.allow("", null),
    }),
    totalAmount: Joi.number().when("documentType", {
        is: "sales-invoice",
        then: Joi.required(),
        otherwise: Joi.allow("", null),
    }),
    invoiceDate: Joi.string().when("documentType", {
        is: "sales-invoice",
        then: Joi.allow("", null),
        otherwise: Joi.allow("", null),
    }),
});

module.exports = { addDocumentSchema };
