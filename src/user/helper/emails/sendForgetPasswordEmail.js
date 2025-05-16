const sendEmailHelper = require("../../../helper/senEmailHelper");

const sendForgetPasswordEmail = (email, name, subject, otp) => {
    try {
        sendEmailHelper({
            email: email,
            subject: subject,
            text: `
            <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Forget Password - OTP</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                            color: #333;
                        }
                        .email-container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            border-radius: 8px;
                            padding: 20px;
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            background-color: #ececec;
                            padding: 20px;
                            border-radius: 8px 8px 0 0;
                            text-align: center;
                            color: #333;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 24px;
                            color: #333;
                        }
                        .content {
                            padding: 20px;
                        }
                        .content h2 {
                            font-size: 20px;
                            color: #333;
                        }
                        .content p {
                            font-size: 16px;
                            line-height: 1.6;
                            color: #555;
                        }
                        .otp-code {
                            display: inline-block;
                            padding: 12px 25px;
                            margin: 20px 0;
                            background-color: #ececec;
                            color: #333;
                            font-size: 24px;
                            border-radius: 5px;
                            font-weight: bold;
                        }
                        .footer {
                            text-align: center;
                            font-size: 12px;
                            color: #999;
                            padding: 10px 0;
                            border-top: 1px solid #ececec;
                        }
                        .footer p {
                            margin: 5px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <h1>Forget Password OTP</h1>
                        </div>
                        <div class="content">
                            <h2>Hello ${name},</h2>
                            <p>
                                We received a request to reset your password. Below is your
                                One-Time Password (OTP) to proceed:
                            </p>
            
                           
                            <div class="otp-code">${otp}</div>
            
                            <p>
                                Enter this OTP on the password reset page to continue.
                                Please note, the OTP is valid for the next 10 minutes.
                            </p>
            
                            <p>
                                If you did not request this, please ignore this email or
                                contact our support team.
                            </p>
            
                            <p>Best regards,</p>
                            <p>Your Company Team</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2024 Your Company, All rights reserved.</p>
                            <p>1234 Street Name, City, Country</p>
                        </div>
                    </div>
                </body>
            </html>
            

   `,
        });
    } catch (err) {
        console.log(err);
    }
};

module.exports = sendForgetPasswordEmail;
