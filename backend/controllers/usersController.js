const db =
require("../config/db");

const {
  writeAuditLog
} = require(
  "../utils/auditLogger"
);

async function getRoleId(
  role
) {

  if (
    Number.isInteger(role)
  ) {

    return role;

  }

  const [roles] =
    await db.query(

      `
      SELECT role_id
      FROM roles
      WHERE role_name = ?
      `,

      [role]

    );

  return roles[0]?.role_id;

}

async function getUserDisplayName(
  userId
) {

  const [users] =
    await db.query(
      `
      SELECT full_name
      FROM users
      WHERE user_id = ?
      `,
      [userId]
    );

  return users[0]?.full_name ||
    `User ${userId}`;

}

function normalizeEmail(email) {

  return String(email || "")
    .trim()
    .toLowerCase();

}

exports.getUsers =
async (req, res) => {

  try {

    const [users] =
      await db.query(

        `
        SELECT
          u.user_id,
          u.employee_code,
          u.full_name,
          u.email,
          u.approved,
          r.role_name
        FROM users u
        JOIN roles r
          ON u.role_id = r.role_id
        ORDER BY u.user_id DESC
        `

      );

    res.json({

      success: true,

      users,

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Server Error",

    });

  }

};
exports.createUser =
async (req, res) => {

  try {

    const bcrypt =
      require("bcryptjs");

    const {
      employee_code,
      full_name,
      email,
      password,
      role_id,
      role,
      approved = 1
    } = req.body;

    const normalizedName =
      String(full_name || "").trim();

    const normalizedEmail =
      normalizeEmail(email);

    if (
      !normalizedName ||
      !normalizedEmail ||
      !password
    ) {

      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });

    }

    const resolvedRoleId =
      role_id ||
      await getRoleId(role);

    if (!resolvedRoleId) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid role"

      });

    }

    const hashedPassword =
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
        approved,
        email_verified
      )
      VALUES
      (?, ?, ?, ?, ?, ?, 1)
      `,

      [
        employee_code,
        normalizedName,
        normalizedEmail,
        hashedPassword,
        resolvedRoleId,
        approved ? 1 : 0
      ]

    );

    await writeAuditLog(
      req.user?.userId,
      "USER_CREATED",
      `User ${normalizedName} created`
    );

    res.json({

      success: true,

      message:
        "User created"

    });

  } catch (error) {

    console.log(error);

    if (
      error.code === "ER_DUP_ENTRY"
    ) {

      return res.status(409).json({
        success: false,
        message: "Email or employee code already exists"
      });

    }

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};
exports.updateUser =
async (req, res) => {

  try {

    const { id } =
      req.params;
    const [existingUsers] = await db.query(
  `
  SELECT
    u.full_name,
    u.email,
    u.approved,
    r.role_name
  FROM users u
  JOIN roles r
    ON u.role_id = r.role_id
  WHERE u.user_id = ?
  `,
  [id]
);

if (existingUsers.length === 0) {
  return res.status(404).json({
    success: false,
    message: "User not found"
  });
}

const oldUser = existingUsers[0];

    const {
      full_name,
      email,
      role_id,
      role,
      approved
    } = req.body;

    const normalizedName =
      String(full_name || "").trim();

    const normalizedEmail =
      normalizeEmail(email);

    if (
      !normalizedName ||
      !normalizedEmail
    ) {

      return res.status(400).json({
        success: false,
        message: "Name and email are required"
      });

    }

    const resolvedRoleId =
      role_id ||
      await getRoleId(role);

    if (!resolvedRoleId) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid role"

      });

    }

    await db.query(

      `
      UPDATE users
      SET
      full_name = ?,
      email = ?,
      role_id = ?,
      approved = COALESCE(?, approved)
      WHERE user_id = ?
      `,

      [
        normalizedName,
        normalizedEmail,
        resolvedRoleId,
        approved === undefined
          ? null
          : approved ? 1 : 0,
        id
      ]

    );

   const changes = [];

if (oldUser.full_name !== normalizedName) {
  changes.push(
    `name changed from "${oldUser.full_name}" to "${normalizedName}"`
  );
}

if (oldUser.email !== normalizedEmail) {
  changes.push(
    `email changed from "${oldUser.email}" to "${normalizedEmail}"`
  );
}

const [roleResult] = await db.query(
  `
  SELECT role_name
  FROM roles
  WHERE role_id = ?
  `,
  [resolvedRoleId]
);

const newRole =
  roleResult[0]?.role_name;

if (
  oldUser.role_name !== newRole
) {
  changes.push(
    `role changed from ${oldUser.role_name} to ${newRole}`
  );
}

if (
  approved !== undefined &&
  Number(oldUser.approved) !== Number(approved)
) {
  changes.push(
    `status changed from ${
      oldUser.approved ? "ACTIVE" : "INACTIVE"
    } to ${
      approved ? "ACTIVE" : "INACTIVE"
    }`
  );
}

const details =
  changes.length > 0
    ? `User "${oldUser.full_name}" updated: ${changes.join(", ")}`
    : `User "${oldUser.full_name}" updated`;

await writeAuditLog(
  req.user?.userId,
  "USER_UPDATED",
  details
);

    res.json({

      success: true,

      message:
        "User updated"

    });

  } catch (error) {

    console.log(error);

    if (
      error.code === "ER_DUP_ENTRY"
    ) {

      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });

    }

    res.status(500).json({

      success: false,

      message:
        "Server Error"

    });

  }

};
exports.deleteUser =
async (req, res) => {

  try {

    const { id } =
      req.params;

    const [existingUsers] =
      await db.query(
        `
        SELECT user_id
        FROM users
        WHERE user_id = ?
        `,
        [id]
      );

    if (
      existingUsers.length === 0
    ) {

      return res.status(404).json({
        success: false,
        message: "User not found"
      });

    }

    const deletedUserName =
      await getUserDisplayName(id);

    await db.query(

      `
      DELETE FROM users
      WHERE user_id = ?
      `,

      [id]

    );

    await writeAuditLog(
      req.user?.userId,
      "USER_DELETED",
      `User "${deletedUserName}" deleted`
    );

    res.json({

      success: true,

      message:
        "User deleted"

    });

  } catch (error) {

    console.log(error);

    if (
      error.code === "ER_ROW_IS_REFERENCED_2"
    ) {

      return res.status(409).json({
        success: false,
        message: "User has related records and cannot be deleted. Deactivate the user instead."
      });

    }

    res.status(500).json({

      success: false,

      message:
        "Server Error"

    });

  }

};
exports.approveUser =
async (req, res) => {

  try {

    const { id } =
      req.params;

    const [existingUsers] =
      await db.query(
        `
        SELECT user_id
        FROM users
        WHERE user_id = ?
        `,
        [id]
      );

    if (
      existingUsers.length === 0
    ) {

      return res.status(404).json({
        success: false,
        message: "User not found"
      });

    }

    const approvedUserName =
      await getUserDisplayName(id);

    await db.query(

      `
      UPDATE users
      SET approved = 1
      WHERE user_id = ?
      `,

      [id]

    );

    await writeAuditLog(
      req.user?.userId,
      "USER_APPROVED",
      `User "${approvedUserName}" approved`
    );

    res.json({

      success: true,

      message:
        "User approved"

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Server Error"

    });

  }

};
exports.getUserById =
async (req, res) => {

  try {

    const { id } =
      req.params;

    const [users] =
      await db.query(

        `
        SELECT
          u.user_id,
          u.employee_code,
          u.full_name,
          u.email,
          u.approved,
          r.role_name
        FROM users u
        JOIN roles r
          ON u.role_id = r.role_id
        WHERE u.user_id = ?
        `,

        [id]

      );

    if (
      users.length === 0
    ) {

      return res.status(404).json({

        success: false,

        message:
          "User not found"

      });

    }

    res.json({

      success: true,

      user:
        users[0]

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Server Error"

    });

  }

};
