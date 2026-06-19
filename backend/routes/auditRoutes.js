const express =
require("express");

const router =
express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const roleMiddleware =
require("../middleware/roleMiddleware");

const {
  getAuditLogs,
  createAuditLog
} = require("../controllers/auditController");

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  getAuditLogs
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  createAuditLog
);

module.exports =
router;
