const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {

  try {

    const {
      full_name,
      employee_code,
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

    const errors = [];

    if (!normalizedFullName) {
      errors.push("Full name is required");
    }

    if (!normalizedEmployeeCode) {
      errors.push("Employee ID is required");
    }

    if (!normalizedEmail) {
      errors.push("Company email is required");
    } else if (
      !normalizedEmail.endsWith(
        "@laxmimotorcorp.com"
      )
    ) {
      errors.push("Only company email addresses are allowed");
    }

    if (!password || password.length < 6) {
      errors.push("Password must be at least 6 characters");
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

    const { email, password } = req.body;

    if (!email || !password) {

      return res.status(400).json({

        success: false,
        message: "Email and password are required"

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

    res.json({

      success: true,

      token,

      user: {

        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role_name

      }

    });

  } catch (error) {

    console.log("LOGIN ERROR:", error);

    res.status(500).json({

      success: false,
      message: "Server Error"

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
          u.full_name,
          u.email,
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

    if (
      newPassword.length < 6
    ) {

      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters"
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
