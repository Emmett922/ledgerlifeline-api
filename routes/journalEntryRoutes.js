const express = require("express");
const router = express.Router();
const journalEntryController = require("../controllers/journalEntryController");

// router to get all journals and create a journal
router
    .route("/")
    .get(journalEntryController.getAllJournalEntries)
    .post(journalEntryController.createJournalEntry)
    .patch(journalEntryController.approveRejectEntry)

module.exports = router;