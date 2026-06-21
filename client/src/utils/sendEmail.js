const nodemailer = require("nodemailer");

const transporter =
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

const sendEmail = async (
  to,
  subject,
  html
) => {

  try {

    const info =
      await transporter.sendMail({

        from:
          `"DGPMS" <${process.env.EMAIL_USER}>`,

        to,

        subject,

        html

      });

    console.log(
      "EMAIL SENT:",
      info.messageId
    );

  } catch (error) {

    console.error(
      "EMAIL ERROR:",
      error
    );

  }

};

module.exports = {
  sendEmail
};