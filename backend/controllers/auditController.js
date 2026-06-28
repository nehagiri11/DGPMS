const db =
require("../config/db");

async function formatAuditDetails(log) {

  const userIdActionMatch =
    String(log.details || "").match(
      /^User\s+"?(\d+)"?\s+(updated|approved|deleted)(.*)$/i
    );

  if (userIdActionMatch) {
    const [users] =
      await db.query(
        `
        SELECT full_name
        FROM users
        WHERE user_id = ?
        `,
        [userIdActionMatch[1]]
      );

    if (users[0]?.full_name) {
      return {
        ...log,
        details:
          `User "${users[0].full_name}" ` +
          `${userIdActionMatch[2].toLowerCase()}` +
          `${userIdActionMatch[3] || ""}`
      };
    }
  }

  const createdMatch =
    String(log.details || "").match(
      /^(Visitor pass|Regular pass|CKD pass)\s+(.+?)\s+created$/i
    );

  if (createdMatch) {
    return {
      ...log,
      details: `${createdMatch[2]} created`
    };
  }

  const actionMatch =
    String(log.details || "").match(
      /^Pass\s+(\d+)\s+(approved|rejected)$/i
    );

  if (!actionMatch) {
    return log;
  }

  const [passes] =
    await db.query(
      `
      SELECT pass_no
      FROM gate_passes
      WHERE pass_id = ?
      `,
      [actionMatch[1]]
    );

  return {
    ...log,
    details:
      `${passes[0]?.pass_no || `Pass ${actionMatch[1]}`} ` +
      `${actionMatch[2].toLowerCase()} by ${log.user_name || "System"}`
  };

}

exports.getAuditLogs =
async (req, res) => {

  try {

    const { range } =
      req.query;

    let query = `
      SELECT
        audit_id,
        user_name,
        action,
        details,
        created_at
      FROM audit_logs
    `;

    if (
      range === "daily"
    ) {

      query += `
        WHERE DATE(created_at)
        = CURDATE()
      `;

    }

    else if (
      range === "monthly"
    ) {

      query += `
        WHERE MONTH(created_at)
          = MONTH(NOW())
        AND YEAR(created_at)
          = YEAR(NOW())
      `;

    }

    else if (
      range === "yearly"
    ) {

      query += `
        WHERE YEAR(created_at)
          = YEAR(NOW())
      `;

    }

    query += `
      ORDER BY created_at DESC
    `;

    const [logs] =
      await db.query(query);

    const formattedLogs =
      await Promise.all(
        logs.map(formatAuditDetails)
      );

    res.json({

      success: true,

      logs: formattedLogs

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

exports.createAuditLog =
async (req, res) => {

  try {

    const {
      user,
      action,
      details
    } = req.body;

    if (
      !user ||
      !action
    ) {

      return res.status(400).json({
        success: false,
        message: "User and action are required"
      });

    }

    await db.query(

      `
      INSERT INTO audit_logs
      (
        user_name,
        action,
        details
      )
      VALUES
      (?, ?, ?)
      `,

      [
        user,
        action,
        details
      ]

    );

    res.json({

      success: true,

      message:
        "Audit log created"

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
