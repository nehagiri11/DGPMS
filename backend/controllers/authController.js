const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const https = require("https");
const {
  sendEmail
} = require("../services/emailService");
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=])[A-Za-z\d@$!%*?&^#()_\-+=]{8,}$/;
const EMAIL_REGEX =
  /^[A-Za-z0-9._%+-]+@laxmimotocorp\.com$/i;

const isAllowedCompanyEmail = (email) =>

  EMAIL_REGEX.test(

    String(email || "")
      .trim()
      .toLowerCase()

  );
const getGoogleClientId = () =>
  String(
    process.env.GOOGLE_CLIENT_ID ||
    process.env.VITE_GOOGLE_CLIENT_ID ||
    ""
  ).trim();

const fetchJson = (url) =>
  new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let body = "";

        response.on("data", (chunk) => {
          body += chunk;
        });

        response.on("end", () => {
          try {
            resolve({
              ok:
                response.statusCode >= 200 &&
                response.statusCode < 300,
              status:
                response.statusCode,
              data:
                JSON.parse(body || "{}")
            });
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", reject);
  });

const verifyGoogleCredential = async (credential) => {
  const url =
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;

  if (typeof fetch === "function") {
    const response =
      await fetch(url);

    return {
      ok: response.ok,
      status: response.status,
      data:
        await response.json()
          .catch(() => ({}))
    };
  }

  return fetchJson(url);
};

const createLoginResponse = (user) => {
  const token = jwt.sign(
    {
      userId: user.user_id,
      role: user.role_name
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );

  return {
    success: true,
    token,
    user: {
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      role: user.role_name
    }
  };
};

exports.register = async (req, res) => {

  try {

    const {
      full_name,
      employee_code,
      department,
      password
    } = req.body;

    const normalizedEmail =
      String(
        req.body.email || ""
      )
        .trim()
        .toLowerCase();

    const normalizedEmployeeCode =
      String(
        employee_code || ""
      ).trim();

    const normalizedFullName =
      String(
        full_name || ""
      ).trim();
  const normalizedDepartment =
  String(department || "").trim();
    const errors = [];

    if (!normalizedFullName) {
      errors.push("Full name is required");
    }

    if (!normalizedEmployeeCode) {
      errors.push("Employee ID is required");
    }

    if (!normalizedEmail) {
      errors.push("Company email is required");
    } else if (!EMAIL_REGEX.test(normalizedEmail)) {
      errors.push("Only company email addresses are allowed");
    }
    if (!normalizedDepartment) {
  errors.push("Department is required");
}

   if (!password) {

  errors.push("Password is required");

}
else if (!PASSWORD_REGEX.test(password)) {

  errors.push(
    "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character."
  );

}

    if (errors.length > 0) {

      return res.status(400).json({
        success: false,
        message: errors.join("; "),
        errors
      });

    }

    const [existing] =
      await db.query(
        `
        SELECT user_id
        FROM users
        WHERE email = ?
           OR employee_code = ?
        `,
        [
          normalizedEmail,
          normalizedEmployeeCode
        ]
      );

    if (existing.length > 0) {

      return res.status(409).json({
        success: false,
        message: "Email or employee ID already exists"
      });

    }

    const [roles] =
      await db.query(
        `
        SELECT role_id
        FROM roles
        WHERE role_name = 'REQUESTER'
        `
      );

    if (roles.length === 0) {

      return res.status(500).json({
        success: false,
        message: "Requester role is missing"
      });

    }

    const passwordHash =
      await bcrypt.hash(
        password,
        10
      );

    await db.query(
      `
      INSERT INTO users
      (
        employee_code,
        full_name,
        department,
        email,
        password_hash,
        role_id,
        approved
      )
      VALUES
      (?, ?, ?, ?, ?, 0)
      `,
      [
        normalizedEmployeeCode,
        normalizedFullName,
        normalizedDepartment,
        normalizedEmail,
        passwordHash,
        roles[0].role_id
      ]
    );

    res.status(201).json({
      success: true,
      message: "Account created and waiting for admin approval"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};

exports.login = async (req, res) => {

  try {

    const email =
      String(req.body.email || "")
        .trim()
        .toLowerCase();

    const { password } = req.body;

    if (!email || !password) {

      return res.status(400).json({

        success: false,
        message: "Email and password are required"

      });

    }

    if (!isAllowedCompanyEmail(email)) {

      return res.status(400).json({

        success: false,
        message: "Only company email addresses are allowed"

      });

    }

    const [users] = await db.query(

      `
      SELECT
        u.*,
        r.role_name
      FROM users u
      JOIN roles r
        ON u.role_id = r.role_id
      WHERE u.email = ?
      `,

      [email]

    );

    if (users.length === 0) {

      return res.status(401).json({

        success: false,
        message: "Invalid email or password"

      });

    }

    const user = users[0];

    if (!user.approved) {

      return res.status(403).json({

        success: false,
        message: "Your account is waiting for admin approval"

      });

    }

    const isMatch = await bcrypt.compare(

      password,
      user.password_hash

    );

    if (!isMatch) {

      return res.status(401).json({

        success: false,
        message: "Invalid email or password"

      });

    }

    res.json(
      createLoginResponse(user)
    );

  } catch (error) {

    console.log(
      "LOGIN ERROR:",
      {
        message: error.message,
        code: error.code,
        errno: error.errno,
        syscall: error.syscall
      }
    );

    res.status(500).json({

      success: false,
      message:
        error.code === "ENOTFOUND" ||
        error.code === "ECONNREFUSED" ||
        error.code === "ETIMEDOUT"
          ? "Database connection failed. Check backend DB env variables on Render."
          : "Server Error"

    });

  }

};

exports.googleAuth = async (req, res) => {

  try {

    const {
      credential,
      mode = "signin"
    } = req.body;

    const googleClientId =
      getGoogleClientId();

    if (!googleClientId) {

      return res.status(500).json({
        success: false,
        message: "Google sign-in is not configured on the server"
      });

    }

    if (!credential) {

      return res.status(400).json({
        success: false,
        message: "Google credential is required"
      });

    }

    const verifyResponse =
      await verifyGoogleCredential(
        credential
      );

    const googleProfile =
      verifyResponse.data || {};

    if (
      !verifyResponse.ok ||
      googleProfile.aud !== googleClientId ||
      String(googleProfile.email_verified) !== "true"
    ) {

      console.log(
        "GOOGLE AUTH VERIFY FAILED:",
        {
          status: verifyResponse.status,
          expectedAudPresent: Boolean(googleClientId),
          receivedAudPresent: Boolean(googleProfile.aud),
          emailVerified: googleProfile.email_verified,
          error: googleProfile.error,
          errorDescription: googleProfile.error_description
        }
      );

      return res.status(401).json({
        success: false,
        message: "Google sign-in could not be verified"
      });

    }

    const email =
      String(googleProfile.email || "")
        .trim()
        .toLowerCase();

    const [users] =
      await db.query(
        `
        SELECT
          u.*,
          r.role_name
        FROM users u
        JOIN roles r
          ON u.role_id = r.role_id
        WHERE u.email = ?
        `,
        [email]
      );

    if (users.length > 0) {

      const user = users[0];

      if (!user.approved) {

        return res.status(403).json({
          success: false,
          message: "Your account is waiting for admin approval"
        });

      }

      return res.json(
        createLoginResponse(user)
      );

    }

    if (mode !== "signup") {

      return res.status(404).json({
        success: false,
        message: "No account found. Please sign up first."
      });

    }

    const [roles] =
      await db.query(
        `
        SELECT role_id
        FROM roles
        WHERE role_name = 'REQUESTER'
        `
      );

    if (roles.length === 0) {

      return res.status(500).json({
        success: false,
        message: "Requester role is missing"
      });

    }

    const passwordHash =
      await bcrypt.hash(
        crypto.randomBytes(32)
          .toString("hex"),
        10
      );

    await db.query(
      `
      INSERT INTO users
      (
        employee_code,
        full_name,
        email,
        password_hash,
        role_id,
        approved
      )
      VALUES
      (?, ?, ?, ?, ?, 0)
      `,
      [
        null,
        googleProfile.name || email,
        email,
        passwordHash,
        roles[0].role_id
      ]
    );

    res.status(201).json({
      success: true,
      message: "Google account created and waiting for admin approval"
    });

  } catch (error) {

    console.log(
      "GOOGLE AUTH ERROR:",
      {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlMessage: error.sqlMessage
      }
    );

    res.status(500).json({
      success: false,
      message:
        error.code === "ENOTFOUND" ||
        error.code === "ETIMEDOUT" ||
        error.code === "ECONNRESET"
          ? "Server could not reach Google to verify sign-in"
          : error.sqlMessage
          ? "Google account could not be saved in the database"
          : "Google sign-in failed on the server"
    });

  }

};
exports.profile = async (
  req,
  res
) => {

  try {

    const [users] =
      await db.query(

        `
        SELECT
u.user_id,
u.employee_code,
u.full_name,
u.department,
u.email,
u.created_at,
r.role_name
        FROM users u
        JOIN roles r
          ON u.role_id = r.role_id
        WHERE u.user_id = ?
        `,

        [req.user.userId]

      );

    if (users.length === 0) {

      return res.status(404).json({

        success: false,
        message: "User not found"

      });

    }

    res.json({

      success: true,
      user: users[0]

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,
      message: "Server Error"

    });

  }

};

exports.changePassword = async (
  req,
  res
) => {

  try {

    const {
      currentPassword,
      newPassword
    } = req.body;

    if (
      !currentPassword ||
      !newPassword
    ) {

      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });

    }

    if (!PASSWORD_REGEX.test(newPassword)) {

  return res.status(400).json({

    success: false,

    message:
      "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character."

  });

}

    const [users] =
      await db.query(
        `
        SELECT password_hash
        FROM users
        WHERE user_id = ?
        `,
        [req.user.userId]
      );

    if (users.length === 0) {

      return res.status(404).json({
        success: false,
        message: "User not found"
      });

    }

    const isMatch =
      await bcrypt.compare(
        currentPassword,
        users[0].password_hash
      );

    if (!isMatch) {

      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });

    }

    const passwordHash =
      await bcrypt.hash(
        newPassword,
        10
      );

    await db.query(
      `
      UPDATE users
      SET password_hash = ?
      WHERE user_id = ?
      `,
      [
        passwordHash,
        req.user.userId
      ]
    );

    res.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};

exports.forgotPassword = async (
  req,
  res
) => {

  try {

    const email =
      String(req.body.email || "")
        .trim()
        .toLowerCase();

    if (!email) {

      return res.status(400).json({
        success: false,
        message: "Company email is required"
      });

    }

    const [users] =
      await db.query(
        `
        SELECT
          user_id,
          full_name,
          email
        FROM users
        WHERE email = ?
        `,
        [email]
      );

    if (users.length > 0) {

      const token =
        crypto.randomBytes(32)
          .toString("hex");

      const tokenHash =
        crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");

      await db.query(
        `
        DELETE FROM password_reset_tokens
        WHERE user_id = ?
        `,
        [users[0].user_id]
      );

      await db.query(
        `
        INSERT INTO password_reset_tokens
        (
          user_id,
          token_hash,
          expires_at
        )
        VALUES
        (
          ?,
          ?,
          DATE_ADD(NOW(), INTERVAL 30 MINUTE)
        )
        `,
        [
          users[0].user_id,
          tokenHash
        ]
      );

      const frontendUrl =
        process.env.FRONTEND_URL ||
        process.env.CLIENT_URL ||
        `${req.protocol}://${req.get("host")}`;

      const resetUrl =
        `${frontendUrl.replace(/\/$/, "")}/reset-password/${token}`;

      await sendEmail(
        users[0].email,
        "DGPMS Password Reset",
        `
          <h2>Password Reset Request</h2>
          <p>Hello ${users[0].full_name},</p>
          <p>Use the link below to reset your DGPMS password. This link expires in 30 minutes.</p>
          <p><a href="${resetUrl}">Reset Password</a></p>
          <p>If you did not request this, you can ignore this email.</p>
        `
      );

    }

    res.json({
      success: true,
      message: "If this email exists, a password reset link has been sent."
    });

  } catch (error) {

    console.log("FORGOT PASSWORD ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to send password reset email"
    });

  }

};

exports.resetPassword = async (
  req,
  res
) => {

  try {

    const {
      token,
      password
    } = req.body;

    if (
      !token ||
      !password
    ) {

      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required"
      });

    }

    if (!PASSWORD_REGEX.test(password)) {

    return res.status(400).json({

        success:false,

        message:
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character."

    });

}

    const tokenHash =
      crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const [tokens] =
      await db.query(
        `
        SELECT
          reset_id,
          user_id
        FROM password_reset_tokens
        WHERE token_hash = ?
          AND used_at IS NULL
          AND expires_at > NOW()
        `,
        [tokenHash]
      );

    if (tokens.length === 0) {

      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or expired"
      });

    }

    const passwordHash =
      await bcrypt.hash(
        password,
        10
      );

    await db.query(
      `
      UPDATE users
      SET password_hash = ?
      WHERE user_id = ?
      `,
      [
        passwordHash,
        tokens[0].user_id
      ]
    );

    await db.query(
      `
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE reset_id = ?
      `,
      [tokens[0].reset_id]
    );

    res.json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {

    console.log("RESET PASSWORD ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to reset password"
    });

  }

};