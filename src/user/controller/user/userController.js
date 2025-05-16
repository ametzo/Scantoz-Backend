const { isValidObjectId } = require("mongoose");
const sendErrorResponse = require("../../../helper/sendErrorResponse");
const { Lead, LeadComment, CustomerEmployee } = require("../../../models");
const { userLoginSchema } = require("../validations/userAuth.schema");
const { hash, compare } = require("bcryptjs");
const sendForgetPasswordEmail = require("../../helper/emails/sendForgetPasswordEmail");
const crypto = require("crypto");
const { generateOtp } = require("../../../helper/otpGenerator");
const OTP_EXPIRATION_TIME = 5 * 60 * 1000;
// const OTP_EXPIRATION_TIME = 3 * 1000;

module.exports = {
    userLogin: async (req, res) => {
        try {
            const { userName, password } = req.body;

            const { error } = userLoginSchema.validate(req.body);
            if (error) {
                return sendErrorResponse(
                    res,
                    400,
                    error.details ? error?.details[0]?.message : error.message
                );
            }

            const user = await CustomerEmployee.findOne({
                $or: [
                    { userName: userName },
                    {
                        email: userName,
                    },
                ],
                isLoggin: true,
                isDeleted: false,
            })
                .populate("customerId", "company phone email city")
                .select("name  designation  phone email password");

            if (!user) {
                return sendErrorResponse(res, 400, "Invalid credentials");
            }

            const isMatch = await compare(password, user.password);
            if (!isMatch) {
                return sendErrorResponse(
                    res,
                    400,
                    "Invalid Password credentials"
                );
            }

            const jwtToken = await user.generateAuthToken();
            await user.save();

            res.status(200).json({
                status: user.status,
                user: user,
                jwtToken,
            });
        } catch (err) {
            console.log(err);
            sendErrorResponse(res, 500, err);
        }
    },

    getUser: async (req, res) => {
        try {
            res.status(200).json(req.user);
        } catch (err) {
            sendErrorResponse(res, 500, err);
        }
    },
    createForgetPassword: async (req, res) => {
        const { email } = req.body;

        if (!email) {
            return sendErrorResponse(res, 400, "Invalid credentials");
        }

        const user = await CustomerEmployee.findOne({
            email,
            isDeleted: false,
        });

        if (!user) {
            return sendErrorResponse(res, 400, "Invalid credentials");
        }

        // const otp = await generateOtp();
        const otp = 12345;
        const otpExpires = Date.now() + OTP_EXPIRATION_TIME;

        await sendForgetPasswordEmail({
            name: user.name,
            otp,
            email: user.email,
            subject: `Forgot Password Otp `,
        });

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        res.status(200).json({
            userId: user._id,
            message: "forget password email sent successfully",
        });
    },
    completeForgetPassword: async (req, res) => {
        const { otp, password, confirmPassword, userId } = req.body;

        if (!otp) {
            return sendErrorResponse(res, 400, "please enter otp");
        }

        if (!isValidObjectId(userId)) {
            return sendErrorResponse(res, 400, "invalid userId");
        }

        if (password !== confirmPassword) {
            return sendErrorResponse(
                res,
                400,
                "please enter correct confirm pawword "
            );
        }

        const user = await CustomerEmployee.findOne({
            _id: userId,
            otp: otp,
            isDeleted: false,
        });

        if (!user || user.otp !== otp) {
            return sendErrorResponse(
                res,
                400,
                "Incorrect OTP, please try again"
            );
        }

        if (Date.now() > user.otpExpires) {
            user.otp = null;
            user.otpExpires = null;
            await user.save();

            return sendErrorResponse(
                res,
                400,
                "OTP has expired, please request a new one"
            );
        }

        const hashedPassword = await hash(password, 8);

        user.password = hashedPassword;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.status(200).json({
            userId: user._id,
            message: "Password has been updated  successfully",
        });
    },
    changePassword: async (req, res) => {
        const { password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return sendErrorResponse(
                res,
                400,
                "please enter correct confirm pawword "
            );
        }

        const user = await CustomerEmployee.findOne({
            _id: req.user.id,

            isDeleted: false,
        });

        if (!user) {
            return sendErrorResponse(res, 400, "user does not exist");
        }

        const hashedPassword = await hash(password, 8);

        user.password = hashedPassword;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.status(200).json({
            userId: user._id,
            message: "Password has been updated  successfully",
        });
    },
};
