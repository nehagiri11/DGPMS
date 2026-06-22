const nodemailer =
  require("nodemailer");

const maskEmail = (email) => {
  if (!email) {
    return "not-set";
  }

  const [name, domain] =
    String(email).split("@");

  return `${name?.slice(0, 2) || "**"}***@${domain || "***"}`;
};

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

console.log(
  "Email configuration:",
  {
    configured: isEmailConfigured,
    user: maskEmail(process.env.EMAIL_USER),
    passwordPresent: Boolean(process.env.EMAIL_PASSWORD),
    verifyOnStart:
      process.env.EMAIL_VERIFY_ON_START === "true"
  }
);

if (
  transporter &&
  process.env.EMAIL_VERIFY_ON_START === "true"
) {
  transporter
    .verify()
    .then(() => {
      console.log("Email SMTP verification succeeded");
    })
    .catch((error) => {
      console.error(
        "Email SMTP verification failed:",
        {
          message: error.message,
          code: error.code,
          command: error.command,
          response: error.response,
          responseCode: error.responseCode
        }
      );
    });
}

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

    console.log(
      "Email sending:",
      {
        from: maskEmail(process.env.EMAIL_USER),
        to: maskEmail(to),
        subject
      }
    );

    const result =
      await transporter.sendMail({
      from:
        process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

    console.log(
      "Email sent:",
      {
        accepted: result.accepted,
        rejected: result.rejected,
        response: result.response
      }
    );

  };

module.exports = {
  sendEmail,
};
