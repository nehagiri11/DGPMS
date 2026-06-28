CREATE DATABASE IF NOT EXISTS lmc_gatepass_db;

USE lmc_gatepass_db;

CREATE TABLE IF NOT EXISTS roles (
  role_id INT NOT NULL AUTO_INCREMENT,
  role_name VARCHAR(50) NOT NULL,
  PRIMARY KEY (role_id),
  UNIQUE KEY role_name (role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT IGNORE INTO roles (role_name)
VALUES
  ('ADMIN'),
  ('REQUESTER'),
  ('APPROVER'),
  ('SECURITY');

CREATE TABLE IF NOT EXISTS users (
  user_id INT NOT NULL AUTO_INCREMENT,
  employee_code VARCHAR(20) DEFAULT NULL,
  full_name VARCHAR(100) NOT NULL,
  department VARCHAR(100) DEFAULT NULL,
  email VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  approved TINYINT(1) DEFAULT 1,
  email_verified TINYINT(1) DEFAULT 1,
  profile_image VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY email (email),
  UNIQUE KEY unique_employee_code (employee_code),
  KEY role_id (role_id),
  CONSTRAINT users_ibfk_1
    FOREIGN KEY (role_id)
    REFERENCES roles (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS gate_passes (
  pass_id INT NOT NULL AUTO_INCREMENT,
  pass_no VARCHAR(50) NOT NULL,
  pass_type ENUM('VISITOR','REGULAR','CKD') NOT NULL,
  requester_id INT DEFAULT NULL,
  status ENUM('PENDING','APPROVED','REJECTED','EXPIRED') DEFAULT 'PENDING',
  approved_by INT DEFAULT NULL,
  approved_date DATETIME DEFAULT NULL,
  approver_remarks TEXT,
  gate_status ENUM('NOT_USED','INSIDE','CHECKED_OUT','COMPLETED') DEFAULT 'NOT_USED',
  entry_time DATETIME DEFAULT NULL,
  exit_time DATETIME DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  host_name VARCHAR(100) DEFAULT NULL,
  host_department VARCHAR(100) DEFAULT NULL,
  arrival_date DATE DEFAULT NULL,
  departure_date DATE DEFAULT NULL,
  purpose VARCHAR(255) DEFAULT NULL,
  vehicle_no VARCHAR(50) DEFAULT NULL,
  remarks TEXT,
  company_name VARCHAR(255) DEFAULT NULL,
  driver_name VARCHAR(255) DEFAULT NULL,
  driver_number VARCHAR(50) DEFAULT NULL,
  truck_number VARCHAR(50) DEFAULT NULL,
  seal_number VARCHAR(50) DEFAULT NULL,
  category VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (pass_id),
  UNIQUE KEY pass_no (pass_no),
  KEY requester_id (requester_id),
  KEY approved_by (approved_by),
  KEY idx_gate_passes_status (status),
  KEY idx_gate_passes_type (pass_type),
  KEY idx_gate_passes_created_at (created_at),
  KEY idx_gate_passes_gate_status (gate_status),
  CONSTRAINT gate_passes_ibfk_1
    FOREIGN KEY (requester_id)
    REFERENCES users (user_id),
  CONSTRAINT gate_passes_ibfk_2
    FOREIGN KEY (approved_by)
    REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS visitor_details (
  visitor_id INT NOT NULL AUTO_INCREMENT,
  pass_id INT DEFAULT NULL,
  visitor_name VARCHAR(100) DEFAULT NULL,
  company VARCHAR(100) DEFAULT NULL,
  email VARCHAR(100) DEFAULT NULL,
  contact VARCHAR(30) DEFAULT NULL,
  visitor_photo LONGTEXT DEFAULT NULL,
  PRIMARY KEY (visitor_id),
  KEY pass_id (pass_id),
  CONSTRAINT visitor_details_ibfk_1
    FOREIGN KEY (pass_id)
    REFERENCES gate_passes (pass_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS regular_pass_details (
  regular_id INT NOT NULL AUTO_INCREMENT,
  pass_id INT NOT NULL,
  company_name VARCHAR(255) DEFAULT NULL,
  driver_name VARCHAR(255) DEFAULT NULL,
  driver_number VARCHAR(50) DEFAULT NULL,
  vehicle_no VARCHAR(50) DEFAULT NULL,
  category VARCHAR(100) DEFAULT NULL,
  remarks TEXT,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (regular_id),
  UNIQUE KEY pass_id (pass_id),
  CONSTRAINT regular_pass_details_ibfk_1
    FOREIGN KEY (pass_id)
    REFERENCES gate_passes (pass_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS ckd_pass_details (
  ckd_id INT NOT NULL AUTO_INCREMENT,
  pass_id INT NOT NULL,
  company_name VARCHAR(255) DEFAULT NULL,
  driver_name VARCHAR(255) DEFAULT NULL,
  driver_number VARCHAR(50) DEFAULT NULL,
  truck_number VARCHAR(50) DEFAULT NULL,
  seal_number VARCHAR(50) DEFAULT NULL,
  remarks TEXT,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ckd_id),
  UNIQUE KEY pass_id (pass_id),
  CONSTRAINT ckd_pass_details_ibfk_1
    FOREIGN KEY (pass_id)
    REFERENCES gate_passes (pass_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS pass_items (
  item_id INT NOT NULL AUTO_INCREMENT,
  pass_id INT DEFAULT NULL,
  item_description VARCHAR(255) DEFAULT NULL,
  quantity VARCHAR(100) DEFAULT NULL,
  remarks TEXT,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (item_id),
  KEY pass_id (pass_id),
  CONSTRAINT pass_items_ibfk_1
    FOREIGN KEY (pass_id)
    REFERENCES gate_passes (pass_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  audit_id INT NOT NULL AUTO_INCREMENT,
  user_name VARCHAR(100) DEFAULT NULL,
  action VARCHAR(100) DEFAULT NULL,
  details TEXT,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (audit_id),
  KEY idx_audit_logs_created_at (created_at),
  KEY idx_audit_logs_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(100) DEFAULT NULL,
  pass_id INT DEFAULT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id),
  KEY idx_notifications_user_read (user_id, is_read),
  KEY idx_notifications_created_at (created_at),
  KEY idx_notifications_pass_id (pass_id),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id)
    REFERENCES users (user_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_notifications_pass
    FOREIGN KEY (pass_id)
    REFERENCES gate_passes (pass_id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  reset_id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (reset_id),
  UNIQUE KEY token_hash (token_hash),
  KEY idx_password_reset_user (user_id),
  KEY idx_password_reset_expires_at (expires_at),
  CONSTRAINT fk_password_reset_user
    FOREIGN KEY (user_id)
    REFERENCES users (user_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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

CREATE TABLE IF NOT EXISTS entry_exit_logs (
  log_id INT NOT NULL AUTO_INCREMENT,
  pass_id INT NOT NULL,
  pass_no VARCHAR(100) NOT NULL,
  action ENUM('ENTRY','EXIT') NOT NULL,
  security_user_id INT DEFAULT NULL,
  security_user_name VARCHAR(255) DEFAULT NULL,
  gate_status_after VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (log_id),
  KEY idx_entry_exit_pass_id (pass_id),
  KEY idx_entry_exit_created_at (created_at),
  KEY idx_entry_exit_action (action),
  CONSTRAINT fk_entry_exit_pass
    FOREIGN KEY (pass_id)
    REFERENCES gate_passes (pass_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
