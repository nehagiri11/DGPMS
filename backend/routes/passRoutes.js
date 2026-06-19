const express =
require("express");

const router =
express.Router();

const authMiddleware =
require(
  "../middleware/authMiddleware"
);

const roleMiddleware =
require(
  "../middleware/roleMiddleware"
);

const {
  createVisitorPass,
  createRegularPass,
  createCKDPass,
  getAllPasses,
  getPassById,
  approvePass,
  rejectPass,
  markEntry,
  markExit,
  verifyPass,
  getEntryExitLogs,
  getRecentGateLogs
} = require(
  "../controllers/passController"
);


router.post(
  "/visitor",
  authMiddleware,
  roleMiddleware([
    "REQUESTER",
    "APPROVER"
  ]),
  createVisitorPass
);

router.post(
  "/regular",
  authMiddleware,
  roleMiddleware([
    "REQUESTER",
    "APPROVER"
  ]),
  createRegularPass
);

router.post(
  "/ckd",
  authMiddleware,
  roleMiddleware([
    "REQUESTER",
    "APPROVER"
  ]),
  createCKDPass
);
router.get(
  "/test",
  (req, res) => {
    console.log("TEST ROUTE HIT");
    res.json({ success: true });
  }
);

router.get(
  "/",
  authMiddleware,
  getAllPasses
);


router.get(
  "/verify/:passNo",
  authMiddleware,
  verifyPass
);
router.get(
  "/gate-logs/recent",
  authMiddleware,
  roleMiddleware([
    "SECURITY",
    "ADMIN"
  ]),
  getRecentGateLogs
);
router.get(
  "/:id/logs",
  authMiddleware,
  roleMiddleware([
    "SECURITY",
    "ADMIN"
  ]),
  getEntryExitLogs
);
router.get(
  "/:id",
  authMiddleware,
  getPassById
);
router.put(
  "/:id/approve",
  authMiddleware,
  roleMiddleware([
    "APPROVER"
  ]),
  approvePass
);
router.put(
  "/:id/reject",
  authMiddleware,
  roleMiddleware([
    "APPROVER"
  ]),
  rejectPass
);
router.put(
  "/:id/entry",
  authMiddleware,
  roleMiddleware([
    "SECURITY"
  ]),
  markEntry
);

router.put(
  "/:id/exit",
  authMiddleware,
  roleMiddleware([
    "SECURITY"
  ]),
  markExit
);

module.exports =
router;
