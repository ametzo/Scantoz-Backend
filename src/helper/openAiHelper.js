const fs = require("fs");
const OpenAI = require("openai"); // Make sure OpenAI is properly required
const path = require("path");

// Function to process a single image file
const processImage = async (file) => {
    const imagePath = file.path;
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;
    const imageSize = fs.statSync(imagePath).size;
    const fileName = path.basename(imagePath);

    const openai = new OpenAI({
        apiKey: "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",
    });
    try {
        console.time("single");
        const response = await openai.chat.completions.create({
            model: "gpt-4o-2024-08-06",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Please extract the following information from the bill shown in the image:\n- The company name and return it as the value for the key `companyName`.\n- The VAT amount and return it as the value for the key `vat`.\n- The gross amount and return it as the value for the key `grossAmount`.\n- The invoice date and return it as the value for the key `billDate` and covert date in yyyy-mm-dd.\n- The total amount and return it as the value for the key `totalAmount`.\n- If currency is present, return it as the value for the key `currency`.\n- The TNR number and return it as the value for the key `tnrNumber`.\n- The invoice number and return it as the value for the key `invoiceNumber`.\n\nPlease provide the result in an object format with the respective keys and their corresponding values.Also return response as json",
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageUrl,
                            },
                        },
                    ],
                },
            ],
        });
        console.timeEnd("single");

        const extractedInfo = response?.choices[0]?.message?.content;

        const cleanExtractedInfo = extractedInfo?.replace(
            /(^```json\s*\n|\n\s*```$)/g,
            ""
        );

        let parsedInfo = {};
        try {
            parsedInfo = JSON?.parse(cleanExtractedInfo);
        } catch (error) {
            return {
                imagePath: imagePath,
                imageSize: imageSize,
                fileName: fileName,
            };
        }

        const companyName = parsedInfo.companyName || "Not found";
        const amount = parsedInfo.amount || "Not found";
        const currency = parsedInfo.currency || "Not found";

        return {
            companyName: parsedInfo?.companyName,
            vatAmount: parsedInfo.vat,
            grossAmount: parsedInfo.grossAmount,
            invoiceDate: parsedInfo.billDate
                ? new Date(parsedInfo.billDate)
                : null,
            totalAmount: parsedInfo.totalAmount,
            currency: parsedInfo.currency,
            tnrNumber: parsedInfo.tnrNumber,
            invoiceNumber: parsedInfo.invoiceNumber,
            imagePath: imagePath,
            imageSize: imageSize,
            fileName: fileName,
        };
    } catch (error) {
        console.error("Error with OpenAI API:", error);
        return {}; // Return an empty object on error
    }
};

const processMultipleImage = async (files) => {
    const imageUrls = files
        .map((file) => {
            if (!file || !file.path) {
                console.error("Invalid file format");
                return null; // or return a default value to avoid undefined errors
            }
            const imageBuffer = fs.readFileSync(file.path);
            const base64Image = imageBuffer.toString("base64");
            return `data:image/jpeg;base64,${base64Image}`;
        })
        .filter((url) => url !== null); // Remove null entries, if any

    // console.log(imageUrls, "imageUrls:", imageUrls);

    const openai = new OpenAI({
        apiKey: "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",
    });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-2024-08-06",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Extract the following fields from the bill shown in the image: companyName, invoiceNumber, invoiceDate, trnNumber, grossAmount, vatAmount, and totalAmount. Just return the key-value pairs as shown below:\n\ncompanyName: Natural Frozen & Dehydrated Foods\ninvoiceNumber: EXP/718\ninvoiceDate: 30/01/2024\ntrnNumber: 2410004091\ngrossAmount: 18,582.75\nvatAmount: 0\ntotalAmount: 18,582.75 provide available details ",
                        },
                        ...imageUrls.map((imageUrl) => ({
                            type: "image_url",
                            image_url: { url: imageUrl },
                        })),
                    ],
                },
            ],
        });

        const extractedInfo = response?.choices[0]?.message?.content;
        console.log(extractedInfo, "extracted");
        // const cleanExtractedInfo = extractedInfo.replace(
        //     /^```json\n|\n```$/g,
        //     ""
        // );

        // let parsedInfo = {};
        // try {
        //     parsedInfo = JSON.parse(cleanExtractedInfo);
        // } catch (error) {
        //     console.error("Error parsing extracted info:", error);
        // }

        // const companyName = parsedInfo.companyName || "Not found";
        // const amount = parsedInfo.amount || "Not found";
        // const currency = parsedInfo.currency || "Not found";
        // console.log("Company Name:", companyName);
        // console.log("Total Amount:", amount);
        // console.log("Currency:", currency);

        // return parsedInfo; // Return the result for each file
    } catch (error) {
        console.log("Error with OpenAI API:", error);
        return {}; // Return an empty object on error
    }
};

const processFile = async (file) => {
    try {
        const imagePath = file.path;
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString("base64");
        const imageUrl = `data:image/jpeg;base64,${base64Image}`;
        const imageSize = fs.statSync(imagePath).size;
        const fileName = path.basename(imagePath);

        return {
            imagePath: imagePath,
            imageSize: imageSize,
            fileName: fileName,
        };
    } catch (error) {
        return {};
    }
};
module.exports = { processImage, processMultipleImage, processFile };
