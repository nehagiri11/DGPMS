
const express =
require("express");

const router =
express.Router();

const {
  register,
  login,
  profile
} = require(
  "../controllers/authController"
);


const authMiddleware =
require(
  "../middleware/authMiddleware"
);
const {
  sendEmail,
} = require(
  "../services/emailService"
);

router.post(
  "/register",
  register
);

router.post(
  "/login",
  login
);
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth route works"
  });
});

router.get(
  "/profile",
  authMiddleware,
  profile
);
router.get(
  "/test-email",
  async (req, res) => {

    try {

      await sendEmail(
        "foranyuse6342@gmail.com",
        "DGPMS Test Email",
        `
          <h2>DGPMS Working</h2>
          <p>Email notification system is working.</p>
        `
      );

      res.json({
        success: true,
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          error.message,
      });

    }

  }
);


module.exports =
router;
