const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const sharp = require("sharp"); // Import sharp for image compression
const fs = require("fs");
const {
    generateSingleTextFromImage,
    generateMultipleTextFromImage,
    getAllDocuments,
    createDocument,
    deleteDocument,
    getSingleDocument,
    regenerateImage,
    downloadSingleDocumentExcel,
} = require("../../controller/document/documentController");
const {
    convertPdfToImage,
    compressImage,
} = require("../../../helper/imageHelper");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/images/documents");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            // file.fieldname +
            //     "-" +
            uniqueSuffix + "." + file.originalname.split(".")[1]
        );
    },
});

const upload = multer({
    limits: {
        fileSize: 20000000,
    },
    fileFilter: (req, file, cb) => {
        const allowed = [
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
            ".pdf",
            ".heic",
            ".HEIC",
        ];
        console.log(file, "file.originalname");
        const ext = path.extname(file.originalname);
        if (!allowed.includes(ext)) {
            return cb(new Error("Please upload jpg, jpeg, webp, heic  or png"));
        }
        cb(undefined, true);
    },
    storage: storage,
});

router.post(
    "/single/update",
    upload.single("image"),
    async (req, res, next) => {
        try {
            if (
                req.file &&
                path.extname(req.file.originalname).toLowerCase() === ".pdf"
            ) {
                await convertPdfToImage(req.file);
            }
            if (
                req.file &&
                ["jpg", "jpeg", "png", "webp", "heic", "HEIC"].includes(
                    path.extname(req.file.originalname).toLowerCase()
                )
            ) {
                await compressImage(req.file);
            }
            await generateSingleTextFromImage(req, res);
        } catch (err) {
            next(err);
        }
    }
);

router.post(
    "/update/multiple",
    upload.array("images"),
    async (req, res, next) => {
        try {
            const imageFiles = req.files.filter((file) =>
                [".jpg", ".jpeg", ".png", ".webp", ".heic", ".HEIC"].includes(
                    path.extname(file.originalname).toLowerCase()
                )
            );
            const pdfFiles = req.files.filter(
                (file) =>
                    path.extname(file.originalname).toLowerCase() === ".pdf"
            );

            let files = [];

            if (imageFiles.length > 0) {
                for (let file of imageFiles) {
                    await compressImage(file);
                    files.push(file);
                }
            }

            if (pdfFiles.length > 0) {
                for (let file of pdfFiles) {
                    await convertPdfToImage(file);
                    await compressImage(file);
                    files.push(file);
                }
            }

            await generateMultipleTextFromImage(files, req, res);
        } catch (err) {
            next(err);
        }
    }
);

router.get("/all/:customerId", getAllDocuments);
router.get("/single/:id", getSingleDocument);
router.get("/single/:id/excel", downloadSingleDocumentExcel);

router.post("/add", upload.single("document"), async (req, res, next) => {
    try {
        let file;
        if (
            req.file &&
            path.extname(req.file.originalname).toLowerCase() === ".pdf"
        ) {
            await convertPdfToImage(req.file);
            await compressImage(req.file);
            file = req.file;
        }

        if (
            req.file &&
            ["jpg", "jpeg", "png", "webp", "heic", "HEIC"].includes(
                path.extname(req.file.originalname).toLowerCase()
            )
        ) {
            await compressImage(req.file);
            file = req.file;
        }

        console.log(req.file);
        await createDocument(req.file, req, res);
    } catch (err) {
        next(err);
    }
});
// router.patch("/update/:id", updateDocument);
router.delete("/delete/:id", deleteDocument);
router.patch("/regenerate/:id", regenerateImage);

module.exports = router;
