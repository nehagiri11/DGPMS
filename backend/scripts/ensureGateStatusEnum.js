require("dotenv").config();

const db =
  require("../config/db");

async function ensureGateStatusEnum() {

  await db.query(`
    ALTER TABLE gate_passes
    MODIFY gate_status
    ENUM('NOT_USED', 'INSIDE', 'CHECKED_OUT', 'COMPLETED')
    DEFAULT 'NOT_USED'
  `);

  console.log(
    "gate_status enum updated"
  );

  await db.end();

}

ensureGateStatusEnum()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
