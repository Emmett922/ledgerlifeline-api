const express = require("express");
const multer = require("multer");
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const path = require("path");
const statementGenerator = require("../controllers/statementGenerator");

const router = express.Router();
require("dotenv").config();

// Configure AWS SDK with credentials
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION, // Example: 'us-east-1'
});

// Create S3 instance
const s3 = new aws.S3();

// Configure Multer to use S3 for storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME, // Name of your S3 bucket
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      // Set the file name in the bucket
      cb(null, `${Date.now().toString()}-${path.basename(file.originalname)}`);
    },
  }),
});

// Endpoint to upload files
router.post("/upload", upload.array("files"), (req, res) => {
  try {
    const uploadedFiles = req.files.map((file) => ({
      url: file.location, // S3 URL of the uploaded file
      key: file.key, // The key of the file in S3
      originalname: file.originalname,
    }));

    res.status(200).json({
      message: "Files uploaded successfully!",
      files: uploadedFiles,
    });
  } catch (err) {
    res.status(500).json({ message: "Error uploading files", error: err });
  }
});

// Endpoint to download files
router.get("/download/:key", (req, res) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: req.params.key, // The key (filename) in S3
  };

  s3.getObject(params, (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error downloading file", error: err });
    }
    // Set headers to initiate a file download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${req.params.key}"`
    ); // Ensure the correct filename
    res.setHeader("Content-Type", "application/pdf");
    res.send(data.Body);
  });
});

// Routes for statementGenerator controller
router.post("/generate-trial-balance", statementGenerator.generateTrialBalance);
router.post(
  "/generate-income-statement",
  statementGenerator.generateIncomeStatement
);
router.post("/generate-balance-sheet", statementGenerator.generateBalanceSheet);
router.post(
  "/generate-retained-earnings",
  statementGenerator.generateEarningsStatement
);

module.exports = router;
