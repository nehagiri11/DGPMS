const db =
  require("../config/db");

const createNotification =
  async (
    userId,
    title,
    message,
    type,
    passId = null
  ) => {

    await db.query(
      `
      INSERT INTO notifications
      (
        user_id,
        title,
        message,
        type,
        pass_id
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        userId,
        title,
        message,
        type,
        passId
      ]
    );

  };

module.exports = {
  createNotification
};