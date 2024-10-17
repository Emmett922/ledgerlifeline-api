const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");

const app = express();
const upload = multer({ dest: "uploads/" }); // Temporary storage

// Initialize GridFS
const conn = mongoose.createConnection("mongodb://localhost:27017/yourdbname", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
let gfs;

conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// Route to handle file upload
app.post("/upload", upload.single("file"), (req, res) => {
  const { originalname, mimetype } = req.file;

  // Create a write stream to save the file to GridFS
  const writestream = gfs.createWriteStream({
    filename: originalname,
    contentType: mimetype,
  });

  writestream.on("close", (file) => {
    // File stored successfully
    res.json({ fileId: file._id });
  });

  // Pipe the uploaded file into the GridFS stream
  fs.createReadStream(req.file.path).pipe(writestream);
});

module.exports = { upload };
