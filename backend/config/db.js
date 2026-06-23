const mysql =
  require("mysql2");

const getEnv = (name) =>
  String(
    process.env[name] || ""
  ).trim();

const dbHost =
  getEnv("DB_HOST");

const dbPort =
  Number(
    getEnv("DB_PORT") ||
    3306
  );

const dbName =
  getEnv("DB_NAME");

const dbUser =
  getEnv("DB_USER");

if (
  dbHost.includes("\n") ||
  dbHost.includes("\r") ||
  dbHost.includes("=")
) {
  throw new Error(
    "Invalid DB_HOST. Set DB_HOST to only the database hostname, not the full .env block."
  );
}

console.log(
  "Database configuration:",
  {
    host: dbHost || "not-set",
    port: dbPort,
    database: dbName || "not-set",
    user: dbUser || "not-set",
    passwordPresent: Boolean(
      getEnv("DB_PASSWORD")
    )
  }
);

const pool =
  mysql.createPool({

    host:
      dbHost,

    user:
      dbUser,

    password:
      getEnv("DB_PASSWORD"),

    database:
      dbName,
    
    port:
      dbPort,

       ssl: {
    rejectUnauthorized: false,
     },
    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0,

  });

module.exports =
  pool.promise();
