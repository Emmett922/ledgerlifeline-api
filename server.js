// -- Server Imports -- //
require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const { logger, logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConn");
const mongoose = require("mongoose");
const AWS = require("aws-sdk");
const puppeteer = require("puppeteer");
const PORT = process.env.PORT || 3500;

console.log(process.env.NODE_ENV);

// Connect to MongoDB
connectDB();

// Connect to AWS S3
try {
  AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  });
} catch (error) {
  console.error("Failed to configure AWS SDK:", error);
}

// Comes before anything else
app.use(logger);

// Options for api access to the public
app.use(cors(corsOptions));

// Allows app to receive and parse JSON data
app.use(express.json());

// Parse cookies function
app.use(cookieParser());

app.use("/", express.static(path.join(__dirname, "public")));

// -- MAIN ROUTES -- //

// index.html routing for api splash page
app.use("/", require("./routes/root"));
// route for usersController
app.use("/users", require("./routes/userRoutes"));
// route for adminContoller
app.use("/admin", require("./routes/adminRoutes"));
// route for emailHandler
app.use("/email", require("./routes/emailRoutes"));
// route for accountController
app.use("/accounts", require("./routes/accountRoutes"));
// route for eventLogs
app.use("/event-logs", require("./routes/eventLogRoutes"));
// route for journalEntries
app.use("/journal-entry", require("./routes/journalEntryRoutes"));
// route for handling file uploads
app.use("/files", require("./routes/fileUploadRoutes"));
// route for error messages
app.use("/error-message", require("./routes/errorMessageRoutes"));

// 404 error handling
app.all("*", (req, res) => {
  res.status(404);
  // Incorrect request handling depending on request type
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

// Use just before we tell app to listen
app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});

// Graceful shutdown
const shutdown = () => {
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed due to app termination");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
