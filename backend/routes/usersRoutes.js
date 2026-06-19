
const express =
require("express");

const router =
express.Router();


const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  approveUser
} = require(
  "../controllers/usersController"
);

const authMiddleware =
require(
  "../middleware/authMiddleware"
);

const roleMiddleware =
require(
  "../middleware/roleMiddleware"
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  getUsers
);
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  createUser
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  updateUser
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  deleteUser
);

router.put(
  "/:id/approve",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  approveUser
);
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  getUserById
);

module.exports =
router;
