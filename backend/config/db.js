const mysql =
  require("mysql2");

const getEnv = (name) =>
  String(
    process.env[name] || ""
  ).trim();

const dbHost =
  getEnv("DB_HOST");

if (
  dbHost.includes("\n") ||
  dbHost.includes("\r") ||
  dbHost.includes("=")
) {
  throw new Error(
    "Invalid DB_HOST. Set DB_HOST to only the database hostname, not the full .env block."
  );
}

const pool =
  mysql.createPool({

    host:
      dbHost,

    user:
      getEnv("DB_USER"),

    password:
      getEnv("DB_PASSWORD"),

    database:
      getEnv("DB_NAME"),
    
    port:
      Number(
        getEnv("DB_PORT") ||
        3306
      ),

       ssl: {
    rejectUnauthorized: false,
     },
    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0,

  });

module.exports =
  pool.promise();
