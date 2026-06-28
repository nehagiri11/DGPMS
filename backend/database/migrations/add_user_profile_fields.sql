USE lmc_gatepass_db;

SET @users_department_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'department'
);

SET @add_users_department_sql = IF(
  @users_department_exists = 0,
  'ALTER TABLE users ADD COLUMN department VARCHAR(100) DEFAULT NULL',
  'SELECT 1'
);

PREPARE add_users_department_stmt FROM @add_users_department_sql;
EXECUTE add_users_department_stmt;
DEALLOCATE PREPARE add_users_department_stmt;

SET @users_profile_image_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'profile_image'
);

SET @add_users_profile_image_sql = IF(
  @users_profile_image_exists = 0,
  'ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) DEFAULT NULL',
  'SELECT 1'
);

PREPARE add_users_profile_image_stmt FROM @add_users_profile_image_sql;
EXECUTE add_users_profile_image_stmt;
DEALLOCATE PREPARE add_users_profile_image_stmt;
