const Joi = require("joi");

const addLedgerSchema = Joi.object({
    name: Joi.string().required().description("Name of the ledger"),
    description: Joi.string().allow("", null),
});

module.exports = { addLedgerSchema };
