const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) create a transporter

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // activate in gmail "less secure app" option
  });

  // 2) define the email options
  const mailOptions = {
    from: 'Rifil Sampter <Sampter@Rifil.go.id>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html
  };
  // 3) actually send the email with nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
