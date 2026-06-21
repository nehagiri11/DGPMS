const nodemailer =
  require("nodemailer");

const isEmailConfigured =
  Boolean(
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASSWORD
  );

const transporter =
  isEmailConfigured
    ? nodemailer.createTransport({
        service: "gmail",

        auth: {
          user:
            process.env.EMAIL_USER,

          pass:
            process.env.EMAIL_PASSWORD,
        },
      })
    : null;

const sendEmail =
  async (
    to,
    subject,
    html
  ) => {

    if (!transporter) {
      console.log(
        "Email skipped: EMAIL_USER/EMAIL_PASSWORD is not configured"
      );
      return;
    }

    await transporter.sendMail({
      from:
        process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

  };

module.exports = {
  sendEmail,
};
