const db =
require("../config/db");

async function formatAuditDetails(log) {

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
