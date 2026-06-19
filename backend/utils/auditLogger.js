const db =
  require("../config/db");

async function getUserName(userId) {

  if (!userId) {
    return "System";
  }

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

async function writeAuditLog(
  userId,
  action,
  details
) {

  try {

    const userName =
      typeof userId === "string" &&
      Number.isNaN(Number(userId))
        ? userId
        : await getUserName(userId);

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
        userName,
        action,
        details
      ]
    );

  } catch (error) {

    console.log(
      "Audit log failed:",
      error.message
    );

  }

}

module.exports = {
  writeAuditLog
};
