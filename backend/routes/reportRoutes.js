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
  exportReport
} =
require(
  "../controllers/reportController"
);

router.get(
  "/export",
  authMiddleware,
  roleMiddleware([
    "ADMIN"
  ]),
  exportReport
);

module.exports =
  router;