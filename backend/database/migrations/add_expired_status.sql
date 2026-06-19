USE lmc_gatepass_db;

ALTER TABLE gate_passes
  MODIFY COLUMN status ENUM('PENDING','APPROVED','REJECTED','EXPIRED') DEFAULT 'PENDING';

UPDATE gate_passes
SET status = 'EXPIRED'
WHERE status = 'PENDING'
  AND DATE(created_at) < CURDATE();

UPDATE gate_passes
SET status = 'EXPIRED'
WHERE status = 'APPROVED'
  AND gate_status = 'NOT_USED'
  AND (
    (
      pass_type = 'VISITOR'
      AND departure_date IS NOT NULL
      AND departure_date < CURDATE()
    )
    OR
    (
      pass_type IN ('REGULAR', 'CKD')
      AND DATE(created_at) < CURDATE()
    )
  );
