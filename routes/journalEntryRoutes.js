const express = require("express");
const router = express.Router();
const journalEntryController = require("../controllers/journalEntryController");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

// router to get all journals and create a journal
router
  .route("/")
  .get(journalEntryController.getAllJournalEntries)
  .post(upload.array("files"), journalEntryController.createJournalEntry)
  .patch(journalEntryController.approveRejectEntry);

module.exports = router;
