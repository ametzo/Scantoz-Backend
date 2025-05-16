const Joi = require("joi");

const addWorkerSchema = Joi.object({
    employeeName: Joi.string().required().description("Name of the employee"),
    address: Joi.string().required().description("Address of the employee"),
    // jobTitle: Joi.string().required().description("Job title of the employee"),
    phone: Joi.string()
        // .pattern(/^[0-9]{10}$/) // Assuming phone number should be 10 digits
        .required()
        .description("Phone number of the employee"),
    // email: Joi.string()
    //     .email()
    //     .required()
    //     .description("Email address of the employee"),
    // location: Joi.string().required().description("Location of the employee"),
    // joinDate: Joi.date().required().description("Joining date of the employee"),
    // expDate: Joi.date()
    //     .required()
    //     .description("Expiration date of the employee's contract"),
    // emergencyName: Joi.string()
    //     .required()
    //     .description("Emergency contact name"),
    // salary: Joi.number()
    //     .positive()
    //     .required()
    //     .description("Salary of the employee"),
    // emergencyPhone: Joi.string()
    //     // .pattern(/^[0-9]{10}$/) // Assuming emergency phone should be 10 digits
    //     .required()
    //     .description("Emergency contact phone number"),
    // userId: Joi.string().required().description("User ID for the employee"),
    // password: Joi.string()
    //     .min(6)
    //     .required()
    //     .description("Password for the employee"),
    // bankAccount: Joi.string()
    //     .required()
    //     .description("Bank account number of the employee"),
});

module.exports = { addWorkerSchema };
