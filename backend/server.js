require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const authRoutes =
require(
  "./routes/authRoutes"
);

const usersRoutes =
require(
  "./routes/usersRoutes"
);
const passRoutes =
require(
  "./routes/passRoutes"
);
const auditRoutes =
require(
  "./routes/auditRoutes"
);
const notificationRoutes =
require(
  "./routes/notificationRoutes"
);


const app = express();

app.use(cors());
app.use(
  express.json({
    limit: "10mb"
  })
);
console.log("MY BACKEND IS RUNNING");
app.use(
  "/api/auth",
  authRoutes
);
app.use(
  "/api/users",
  usersRoutes
);
app.use(
  "/api/passes",
  passRoutes
);
app.use(
  "/api/audit-logs",
  auditRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.get("/", async (req, res) => {

  try {

    const [rows] =
      await db.query(
        "SELECT NOW() AS currentTime"
      );

    res.json({
      success: true,
      dbConnected: true,
      time: rows[0].currentTime
    });

  } catch (error) {

    res.json({
      success: false,
      dbConnected: false,
      error: error.message
    });

  }

});

app.listen(
  process.env.PORT || 5000,
  () => {
    console.log(
      "Server running on port 5000"
    );
  }
);

