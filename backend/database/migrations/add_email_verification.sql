USE lmc_gatepass_db;

SET @email_verified_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'email_verified'
);

SET @add_email_verified_sql = IF(
  @email_verified_column_exists = 0,
  'ALTER TABLE users ADD COLUMN email_verified TINYINT(1) DEFAULT 1',
  'SELECT 1'
);

PREPARE add_email_verified_stmt FROM @add_email_verified_sql;
EXECUTE add_email_verified_stmt;
DEALLOCATE PREPARE add_email_verified_stmt;

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  verification_id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (verification_id),
  UNIQUE KEY token_hash (token_hash),
  KEY idx_email_verification_user (user_id),
  KEY idx_email_verification_expires_at (expires_at),
  CONSTRAINT fk_email_verification_user
    FOREIGN KEY (user_id)
    REFERENCES users (user_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET @email_verification_used_at_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'email_verification_tokens'
    AND COLUMN_NAME = 'used_at'
);

SET @add_email_verification_used_at_sql = IF(
  @email_verification_used_at_exists = 0,
  'ALTER TABLE email_verification_tokens ADD COLUMN used_at DATETIME DEFAULT NULL',
  'SELECT 1'
);

PREPARE add_email_verification_used_at_stmt FROM @add_email_verification_used_at_sql;
EXECUTE add_email_verification_used_at_stmt;
DEALLOCATE PREPARE add_email_verification_used_at_stmt;
