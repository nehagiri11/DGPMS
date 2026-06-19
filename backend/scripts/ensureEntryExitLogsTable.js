require("dotenv").config();

const db =
  require("../config/db");

async function ensureEntryExitLogsTable() {

  await db.query(`
    CREATE TABLE IF NOT EXISTS entry_exit_logs
    (
      log_id INT AUTO_INCREMENT PRIMARY KEY,
      pass_id INT NOT NULL,
      pass_no VARCHAR(100) NOT NULL,
      action ENUM('ENTRY', 'EXIT') NOT NULL,
      security_user_id INT NULL,
      security_user_name VARCHAR(255) NULL,
      gate_status_after VARCHAR(50) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_entry_exit_pass_id (pass_id),
      CONSTRAINT fk_entry_exit_pass
        FOREIGN KEY (pass_id)
        REFERENCES gate_passes(pass_id)
        ON DELETE CASCADE
    )
  `);

  console.log(
    "entry_exit_logs table ready"
  );

  await db.end();

}

ensureEntryExitLogsTable()
  .catch((error) => {

    console.error(error);
    process.exit(1);

  });
