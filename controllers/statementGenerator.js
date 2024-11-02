const asyncHandler = require("express-async-handler");
const puppeteer = require("puppeteer");
const { uploadFileToS3 } = require("../utils/s3helper"); // S3 helper for file uploads

// -- Controller Functions -- //

// @desc generate trial balance
// @route POST /files/generate-trial-balance
// @access Private
const generateTrialBalance = asyncHandler(async (req, res) => {
  const { htmlContent } = req.body; // HTML passed from the client

  try {
    // Launch Puppeteer and create a PDF from the entire HTML content
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the entire HTML content directly
    await page.setContent(htmlContent);

    // Generate PDF from the rendered HTML content
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    // Generate unique name for PDF
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0].replace(/:/g, "-");
    const fileName = `trial-balance-${date}-${time}.pdf`;

    // Prepare file for S3 upload
    const file = {
      originalname: fileName,
      buffer: pdfBuffer,
      mimetype: "application/pdf",
    };

    // Upload the PDF to S3
    const uploadResult = await uploadFileToS3(file);

    // Return the URL of the uploaded PDF to the client
    res.status(200).json({
      message: "PDF generated and uploaded successfully!",
      pdfUrl: uploadResult.url, // S3 URL of the uploaded PDF
    });
  } catch (error) {
    console.error("Error generating and uploading PDF:", error);
    res
      .status(500)
      .json({
        message: "Failed to generate and upload PDF",
        error: error.message,
      });
  }
});

// @desc generate income statement
// @route POST /files/generate-income-statement
// @access Private
const generateIncomeStatement = asyncHandler(async (req, res) => {
  const { htmlContent } = req.body; // HTML passed from the client

  try {
    // Launch Puppeteer and create a PDF from the entire HTML content
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the entire HTML content directly
    await page.setContent(htmlContent);

    // Generate PDF from the rendered HTML content
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    // Generate unique name for PDF
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0].replace(/:/g, "-");
    const fileName = `income-statement-${date}-${time}.pdf`;

    // Prepare file for S3 upload
    const file = {
      originalname: fileName,
      buffer: pdfBuffer,
      mimetype: "application/pdf",
    };

    // Upload the PDF to S3
    const uploadResult = await uploadFileToS3(file);

    // Return the URL of the uploaded PDF to the client
    res.status(200).json({
      message: "PDF generated and uploaded successfully!",
      pdfUrl: uploadResult.url, // S3 URL of the uploaded PDF
    });
  } catch (error) {
    console.error("Error generating and uploading PDF:", error);
    res
      .status(500)
      .json({
        message: "Failed to generate and upload PDF",
        error: error.message,
      });
  }
});

// @desc generate balance sheet
// @route POST /files/generate-balance-sheet
// @access Private
const generateBalanceSheet = asyncHandler(async (req, res) => {
  const { htmlContent } = req.body; // HTML passed from the client

  try {
    // Launch Puppeteer and create a PDF from the entire HTML content
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the entire HTML content directly
    await page.setContent(htmlContent);

    // Generate PDF from the rendered HTML content
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    // Generate unique name for PDF
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0].replace(/:/g, "-");
    const fileName = `balance-sheet-${date}-${time}.pdf`;

    // Prepare file for S3 upload
    const file = {
      originalname: fileName,
      buffer: pdfBuffer,
      mimetype: "application/pdf",
    };

    // Upload the PDF to S3
    const uploadResult = await uploadFileToS3(file);

    // Return the URL of the uploaded PDF to the client
    res.status(200).json({
      message: "PDF generated and uploaded successfully!",
      pdfUrl: uploadResult.url, // S3 URL of the uploaded PDF
    });
  } catch (error) {
    console.error("Error generating and uploading PDF:", error);
    res
      .status(500)
      .json({
        message: "Failed to generate and upload PDF",
        error: error.message,
      });
  }
});

// @desc generate retained earnings statement
// @route POST /files/generate-retained-earnings
// @access Private
const generateEarningsStatement = asyncHandler(async (req, res) => {
  const { htmlContent } = req.body; // HTML passed from the client

  try {
    // Launch Puppeteer and create a PDF from the entire HTML content
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the entire HTML content directly
    await page.setContent(htmlContent);

    // Generate PDF from the rendered HTML content
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    // Generate unique name for PDF
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0].replace(/:/g, "-");
    const fileName = `earnings-statement-${date}-${time}.pdf`;

    // Prepare file for S3 upload
    const file = {
      originalname: fileName,
      buffer: pdfBuffer,
      mimetype: "application/pdf",
    };

    // Upload the PDF to S3
    const uploadResult = await uploadFileToS3(file);

    // Return the URL of the uploaded PDF to the client
    res.status(200).json({
      message: "PDF generated and uploaded successfully!",
      pdfUrl: uploadResult.url, // S3 URL of the uploaded PDF
    });
  } catch (error) {
    console.error("Error generating and uploading PDF:", error);
    res
      .status(500)
      .json({
        message: "Failed to generate and upload PDF",
        error: error.message,
      });
  }
});

module.exports = {
  generateTrialBalance,
  generateIncomeStatement,
  generateBalanceSheet,
  generateEarningsStatement,
};
