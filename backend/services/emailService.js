const nodemailer =
  require("nodemailer");
const dns =
  require("dns");
const net =
  require("net");
const tls =
  require("tls");

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

const emailFrom =
  process.env.EMAIL_FROM ||
  process.env.EMAIL_USER;

const emailCopyTo =
  process.env.EMAIL_COPY_TO || "";

const smtpPort =
  Number(process.env.EMAIL_PORT || 587);

const smtpSecure =
  process.env.EMAIL_SECURE
    ? process.env.EMAIL_SECURE === "true"
    : smtpPort === 465;

const smtpHost =
  process.env.EMAIL_HOST ||
  "smtp.gmail.com";

const smtpLookup =
  (
    hostname,
    options,
    callback
  ) => {
    dns.lookup(
      hostname,
      {
        ...options,
        family: 4,
        all: false
      },
      callback
    );
  };

const createSmtpSocket =
  (
    options,
    callback
  ) => {
    dns.resolve4(
      smtpHost,
      (dnsError, addresses) => {
        if (dnsError) {
          callback(dnsError);
          return;
        }

        const address =
          addresses[0];

        console.log(
          "SMTP IPv4 resolved:",
          {
            host: smtpHost,
            address
          }
        );

        const socketOptions = {
          ...options,
          host: address,
          servername: smtpHost
        };

        const socket =
          smtpSecure
            ? tls.connect(socketOptions)
            : net.connect(socketOptions);

        callback(null, {
          connection: socket
        });
      }
    );
  };

const transporter =
  isEmailConfigured
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        family: 4,
        lookup: smtpLookup,
        getSocket: createSmtpSocket,
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
    from: maskEmail(emailFrom),
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

    if (!to) {
      console.log(
        "Email skipped: recipient is empty",
        {
          subject
        }
      );
      return null;
    }

    if (!transporter) {
      console.log(
        "Email skipped: EMAIL_USER/EMAIL_PASSWORD is not configured"
      );
      return null;
    }

    console.log(
      "Email sending:",
      {
        from: maskEmail(process.env.EMAIL_USER),
        sender: maskEmail(emailFrom),
        copyTo: maskEmail(emailCopyTo),
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
        emailFrom,
      to,
      bcc:
        emailCopyTo || undefined,
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

    return result;

  };

module.exports = {
  sendEmail,
};
