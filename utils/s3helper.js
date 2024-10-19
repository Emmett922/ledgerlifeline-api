const AWS = require("aws-sdk");

// Configure the AWS SDK with the specified access key and secret
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Function to upload files to S3
const uploadFileToS3 = async (file) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME, // Use the bucket name from the environment variable
    Key: file.originalname, // Use the original name of the file
    Body: file.buffer, // Use the buffer if the file is uploaded with multer memory storage
    ContentType: file.mimetype, // Set the content type
  };

  // Upload the file and get the result
  const uploadResult = await s3.upload(params).promise();

  // Return the URL of the uploaded file
  return {
    url: uploadResult.Location,
    Key: uploadResult.Key,
    Size: uploadResult.ContentLength,
  };
};

module.exports = {
  uploadFileToS3,
};
