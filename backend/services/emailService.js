const nodemailer =
  require("nodemailer");
const dns =
  require("dns");

dns.setDefaultResultOrder("ipv4first");

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

const smtpPort =
  Number(process.env.EMAIL_PORT || 587);

const smtpSecure =
  process.env.EMAIL_SECURE
    ? process.env.EMAIL_SECURE === "true"
    : smtpPort === 465;

const smtpHost =
  process.env.EMAIL_HOST ||
  "smtp.gmail.com";

const transporter =
  isEmailConfigured
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        family: 4,
        requireTLS: !smtpSecure,
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,

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
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
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
        subject,
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure
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
