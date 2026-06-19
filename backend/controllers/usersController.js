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
        approved
      )
      VALUES
      (?, ?, ?, ?, ?, ?)
      `,

      [
        employee_code,
        full_name,
        email,
        hashedPassword,
        resolvedRoleId,
        approved ? 1 : 0
      ]

    );

    await writeAuditLog(
      req.user?.userId,
      "USER_CREATED",
      `User ${full_name} created`
    );

    res.json({

      success: true,

      message:
        "User created"

    });

  } catch (error) {

    console.log(error);

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

    const {
      full_name,
      email,
      role_id,
      role,
      approved
    } = req.body;

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
        full_name,
        email,
        resolvedRoleId,
        approved === undefined
          ? null
          : approved ? 1 : 0,
        id
      ]

    );

    await writeAuditLog(
      req.user?.userId,
      "USER_UPDATED",
      `User ${id} updated`
    );

    res.json({

      success: true,

      message:
        "User updated"

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
exports.deleteUser =
async (req, res) => {

  try {

    const { id } =
      req.params;

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
      `User ${id} deleted`
    );

    res.json({

      success: true,

      message:
        "User deleted"

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
exports.approveUser =
async (req, res) => {

  try {

    const { id } =
      req.params;

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
      `User ${id} approved`
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
