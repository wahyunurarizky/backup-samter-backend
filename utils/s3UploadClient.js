const S3 = require('aws-sdk/clients/s3');

const s3 = new S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

exports.uploadFile = (buffer, filename) => {
  const uploadBuffer = {
    Bucket: process.env.S3_BUCKET,
    Body: buffer,
    Key: filename,
  };

  return s3.upload(uploadBuffer).promise();
};

exports.getFileStream = (fileKey) => {
  const downloadParams = {
    Key: fileKey,
    Bucket: process.env.S3_BUCKET,
  };

  return s3.getObject(downloadParams).createReadStream();
};
