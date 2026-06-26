
const express =
require("express");

const router =
express.Router();

const authController = require("../controllers/authController");

const authMiddleware =
require(
  "../middleware/authMiddleware"
);

const {
  sendEmail,
} = require(
  "../services/emailService"
);

const verifyRecaptcha =
require("../middleware/verifyRecaptcha");

const uploadProfile =
require("../middleware/uploadProfile");

router.post(
  "/register",
  verifyRecaptcha,
  authController.register
);
router.post(
  "/google",
  authController.googleAuth
);

router.post(
"/login",
verifyRecaptcha,
authController.login
);



router.post(
"/forgot-password",
verifyRecaptcha,
authController.forgotPassword
);
router.post("/reset-password", verifyRecaptcha, authController.resetPassword);
router.get(
  "/verify-email/:token",
  authController.verifyEmail
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
  authController.profile
);
router.put(
  "/profile",
  authMiddleware,
  authController.updateProfile
);

router.put(
  "/change-password",
  authMiddleware,
  authController.changePassword
);
router.put(

"/profile-image",

authMiddleware,

uploadProfile.single("image"),

authController.uploadProfileImage

);
router.get(
  "/test-email",
  async (req, res) => {

    try {

      const recipient =
        req.query.to ||
        process.env.EMAIL_TEST_TO ||
        process.env.EMAIL_USER;

      if (!recipient) {

        return res.status(400).json({
          success: false,
          message: "Set EMAIL_USER or pass ?to=email@example.com"
        });

      }

      await sendEmail(
        recipient,
        "DGPMS Test Email",
        `
          <h2>DGPMS Working</h2>
          <p>Email notification system is working.</p>
        `
      );

      res.json({
        success: true,
        sentTo: recipient
      });

    } catch (error) {

      console.error(
        "TEST EMAIL ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message,
        code:
          error.code,
        command:
          error.command,
        response:
          error.response,
        responseCode:
          error.responseCode
      });

    }

  }
);


module.exports =
router;
