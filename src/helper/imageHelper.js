const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const { fromPath } = require("pdf2pic");
const crypto = require("crypto");
const convert = require("heic-convert");

const convertPdfToImage = async (file) => {
    try {
        if (path.extname(file.originalname).toLowerCase() === ".pdf") {
            const inputPath = file.path;

           
            const pdfToImage = fromPath(inputPath, {
                saveFilename: file.filename,
                savePath: path.join(__dirname, "../../public/images/documents"),
            });
            const pageToConvertAsImage = 1;

            await pdfToImage(pageToConvertAsImage, {
                responseType: "image",
            }).then((resolve) => {
                const resolvedFilename = path.basename(resolve.path);

                file.path = path.join(
                    "public/images/documents",
                    resolvedFilename
                );
                file.filename = resolvedFilename;

                fs.unlinkSync(inputPath);
            });
        }
    } catch (error) {
        console.error("Error converting PDF to image:", error);
        throw new Error("Error converting PDF to image");
    }
};



const compressImage = async (file) => {
    try {
        const inputPath = file.path;
        const fileExtension = path.extname(inputPath).toLowerCase();

        // Check if file is HEIC, convert to JPEG
        if (fileExtension === ".heic") {
            const inputBuffer = fs.readFileSync(inputPath);
            const outputBuffer = await convert({
                buffer: inputBuffer, // the HEIC file buffer
                format: "JPEG", // output format
                quality: 1, // the jpeg compression quality, between 0 and 1
            });

            const tempFileName = `${crypto
                .randomBytes(16)
                .toString("hex")}-${Date.now()}.jpeg`;
            const tempFilePath = path.join(
                path.dirname(inputPath),
                tempFileName
            );

            // Write the converted file to the temporary path
            fs.writeFileSync(tempFilePath, outputBuffer);

            // Update the file path to the new converted image
            file.path = tempFilePath;
            file.filename = tempFileName;
        }

        const resizedFilePath = path.join(
            path.dirname(inputPath),
            `${crypto.randomBytes(16).toString("hex")}-${Date.now()}.jpeg`
        );
        await sharp(file.path).resize(800).toFile(resizedFilePath);

        fs.renameSync(resizedFilePath, inputPath);

        const imageUrl = `/images/documents/${path.basename(inputPath)}`;

        return imageUrl;
    } catch (error) {
        throw new Error(`Error compressing image: ${error.message}`);
    }
};

module.exports = { convertPdfToImage, compressImage };
