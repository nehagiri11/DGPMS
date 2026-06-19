const express =
  require("express");

const router =
  express.Router();

const authMiddleware =
  require(
    "../middleware/authMiddleware"
  );

const db =
  require(
    "../config/db"
  );

router.get(
  "/",
  authMiddleware,

  async (
    req,
    res
  ) => {

    try {

      const [rows] =
        await db.query(
          `
          SELECT *
          FROM notifications
          WHERE user_id = ?
          ORDER BY
            created_at DESC
          `,
          [
            req.user.userId
          ]
        );

      res.json({
        success: true,
        notifications:
          rows
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false
      });

    }

  }
);

router.get(
  "/unread-count",
  authMiddleware,
  async (
    req,
    res
  ) => {

    try {

      const [rows] =
        await db.query(
          `
          SELECT COUNT(*) AS count
          FROM notifications
          WHERE user_id = ?
            AND is_read = 0
          `,
          [
            req.user.userId
          ]
        );

      res.json({
        success: true,
        count:
          rows[0].count
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          error.message
      });

    }

  }
);

router.put(
  "/mark-read",
  authMiddleware,
  async (
    req,
    res
  ) => {

    try {

      await db.query(
        `
        UPDATE notifications
        SET is_read = 1
        WHERE user_id = ?
        `,
        [
          req.user.userId
        ]
      );

      res.json({
        success: true
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          error.message
      });

    }

  }
);

module.exports =
  router;
