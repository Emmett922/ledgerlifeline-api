const asyncHandler = require("express-async-handler");
const puppeteer = require("puppeteer");
const { uploadFileToS3 } = require("../utils/s3helper"); // S3 helper for file uploads
const { JSDOM } = require("jsdom");

// -- Controller Functions -- //

// @desc generate trial balance
// @route POST /files/generate-trial-balance
// @access Private
const generateTrialBalance = asyncHandler(async (req, res) => {
  let { htmlContent } = req.body; // HTML passed from the client

  try {
    // Function to remove form element outlines and replace with text content
    const replaceFormElementsWithText = (html) => {
      const { JSDOM } = require("jsdom");
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Helper function to format date as MM/DD/YYYY without time zone shift
      // Helper function to format date as MM/DD/YYYY without time zone shift
      const formatDate = (dateValue) => {
        // Check if dateValue is valid
        if (!dateValue) return "";

        // Split the date string into year, month, and day
        const [year, month, day] = dateValue.split("-");

        // Return the date in MM/DD/YYYY format
        return `${month}/${day}/${year}`;
      };

      // Loop through all input and select elements
      document.querySelectorAll("input, select").forEach((element) => {
        let textContent = element.value || ""; // Default text content to element's value

        // Check if the input is of type 'date' and format it if so
        if (
          element.tagName.toLowerCase() === "input" &&
          element.type === "date"
        ) {
          textContent = formatDate(textContent); // Format the date
        }

        // Create text nodes with spaces around them
        const textNode = document.createTextNode(` ${textContent} `); // Space before and after

        // Replace the form element with the new text node
        element.parentNode.replaceChild(textNode, element);
      });

      // Return the modified HTML content
      return document.documentElement.outerHTML;
    };

    // Modify the HTML content to replace form elements with text
    htmlContent = replaceFormElementsWithText(htmlContent);

    // Launch Puppeteer and create a PDF from the modified HTML content
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the modified HTML content directly
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
    await uploadFileToS3(file);

    const fileUrl = `https://ledger-lifeline-files.s3.us-east-2.amazonaws.com/${fileName}`;

    // Return the URL of the uploaded PDF to the client
    res.status(200).json({
      message: "PDF generated and uploaded successfully!",
      pdfUrl: fileUrl, // S3 URL of the uploaded PDF
    });
  } catch (error) {
    console.error("Error generating and uploading PDF:", error);
    res.status(500).json({
      message: "Failed to generate and upload PDF",
      error: error.message,
    });
  }
});

// @desc generate income statement
// @route POST /files/generate-income-statement
// @access Private
const generateIncomeStatement = asyncHandler(async (req, res) => {
  let { htmlContent } = req.body; // HTML passed from the client

  try {
    // Function to remove form element outlines and replace with text content
    const replaceFormElementsWithText = (html) => {
      const { JSDOM } = require("jsdom");
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Helper function to format date as MM/DD/YYYY
      // Helper function to format date as MM/DD/YYYY without time zone shift
      const formatDate = (dateValue) => {
        // Check if dateValue is valid
        if (!dateValue) return "";

        // Split the date string into year, month, and day
        const [year, month, day] = dateValue.split("-");

        // Return the date in MM/DD/YYYY format
        return `${month}/${day}/${year}`;
      };

      // Loop through all input and select elements
      document.querySelectorAll("input, select").forEach((element) => {
        let textContent = element.value || ""; // Default text content to element's value

        // Check if the input is of type 'date' and format it if so
        if (
          element.tagName.toLowerCase() === "input" &&
          element.type === "date"
        ) {
          textContent = formatDate(textContent); // Format the date
        }

        // Create text nodes with spaces around them
        const textNode = document.createTextNode(` ${textContent} `); // Space before and after

        // Replace the form element with the new text node
        element.parentNode.replaceChild(textNode, element);
      });

      // Return the modified HTML content
      return document.documentElement.outerHTML;
    };

    // Modify the HTML content to replace form elements with text
    htmlContent = replaceFormElementsWithText(htmlContent);

    // Launch Puppeteer and create a PDF from the modified HTML content
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the modified HTML content directly
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
    await uploadFileToS3(file);

    const fileUrl = `https://ledger-lifeline-files.s3.us-east-2.amazonaws.com/${fileName}`;

    // Return the URL of the uploaded PDF to the client
    res.status(200).json({
      message: "PDF generated and uploaded successfully!",
      pdfUrl: fileUrl, // S3 URL of the uploaded PDF
    });
  } catch (error) {
    console.error("Error generating and uploading PDF:", error);
    res.status(500).json({
      message: "Failed to generate and upload PDF",
      error: error.message,
    });
  }
});

// @desc generate balance sheet
// @route POST /files/generate-balance-sheet
// @access Private
const generateBalanceSheet = asyncHandler(async (req, res) => {
  let { htmlContent } = req.body; // HTML passed from the client

  try {
    // Function to remove form element outlines and replace with text content
    const replaceFormElementsWithText = (html) => {
      const { JSDOM } = require("jsdom");
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Helper function to format date as MM/DD/YYYY
      // Helper function to format date as MM/DD/YYYY without time zone shift
      const formatDate = (dateValue) => {
        // Check if dateValue is valid
        if (!dateValue) return "";

        // Split the date string into year, month, and day
        const [year, month, day] = dateValue.split("-");

        // Return the date in MM/DD/YYYY format
        return `${month}/${day}/${year}`;
      };

      // Loop through all input and select elements
      document.querySelectorAll("input, select").forEach((element) => {
        let textContent = element.value || ""; // Default text content to element's value

        // Check if the input is of type 'date' and format it if so
        if (
          element.tagName.toLowerCase() === "input" &&
          element.type === "date"
        ) {
          textContent = formatDate(textContent); // Format the date
        }

        // Create text nodes with spaces around them
        const textNode = document.createTextNode(` ${textContent} `); // Space before and after

        // Replace the form element with the new text node
        element.parentNode.replaceChild(textNode, element);
      });

      // Return the modified HTML content
      return document.documentElement.outerHTML;
    };

    // Modify the HTML content to replace form elements with text
    htmlContent = replaceFormElementsWithText(htmlContent);

    // Launch Puppeteer and create a PDF from the modified HTML content
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the modified HTML content directly
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
    await uploadFileToS3(file);

    const fileUrl = `https://ledger-lifeline-files.s3.us-east-2.amazonaws.com/${fileName}`;

    // Return the URL of the uploaded PDF to the client
    res.status(200).json({
      message: "PDF generated and uploaded successfully!",
      pdfUrl: fileUrl, // S3 URL of the uploaded PDF
    });
  } catch (error) {
    console.error("Error generating and uploading PDF:", error);
    res.status(500).json({
      message: "Failed to generate and upload PDF",
      error: error.message,
    });
  }
});

// @desc generate retained earnings statement
// @route POST /files/generate-retained-earnings
// @access Private
const generateEarningsStatement = asyncHandler(async (req, res) => {
  let { htmlContent } = req.body; // HTML passed from the client

  try {
    // Function to remove form element outlines and replace with text content
    const replaceFormElementsWithText = (html) => {
      const { JSDOM } = require("jsdom");
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Helper function to format date as MM/DD/YYYY
      // Helper function to format date as MM/DD/YYYY without time zone shift
      const formatDate = (dateValue) => {
        // Check if dateValue is valid
        if (!dateValue) return "";

        // Split the date string into year, month, and day
        const [year, month, day] = dateValue.split("-");

        // Return the date in MM/DD/YYYY format
        return `${month}/${day}/${year}`;
      };

      // Loop through all input and select elements
      document.querySelectorAll("input, select").forEach((element) => {
        let textContent = element.value || ""; // Default text content to element's value

        // Check if the input is of type 'date' and format it if so
        if (
          element.tagName.toLowerCase() === "input" &&
          element.type === "date"
        ) {
          textContent = formatDate(textContent); // Format the date
        }

        // Create text nodes with spaces around them
        const textNode = document.createTextNode(` ${textContent} `); // Space before and after

        // Replace the form element with the new text node
        element.parentNode.replaceChild(textNode, element);
      });

      // Return the modified HTML content
      return document.documentElement.outerHTML;
    };

    // Modify the HTML content to replace form elements with text
    htmlContent = replaceFormElementsWithText(htmlContent);

    // Launch Puppeteer and create a PDF from the modified HTML content
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the modified HTML content directly
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
    await uploadFileToS3(file);

    const fileUrl = `https://ledger-lifeline-files.s3.us-east-2.amazonaws.com/${fileName}`;

    // Return the URL of the uploaded PDF to the client
    res.status(200).json({
      message: "PDF generated and uploaded successfully!",
      pdfUrl: fileUrl, // S3 URL of the uploaded PDF
    });
  } catch (error) {
    console.error("Error generating and uploading PDF:", error);
    res.status(500).json({
      message: "Failed to generate and upload PDF",
      error: error.message,
    });
  }
});

// @desc Download PDF
// @route GET /files/download/:fileName
// @access Private
const downloadPDF = asyncHandler(async (req, res) => {
  const { fileUrl } = req.params;
  try {
    res.status(200).json({ url: fileUrl });
  } catch (error) {
    res.status(500).json({ message: "Error downloading PDF" });
  }
});

module.exports = {
  generateTrialBalance,
  generateIncomeStatement,
  generateBalanceSheet,
  generateEarningsStatement,
  downloadPDF,
};
