USE lmc_gatepass_db;

ALTER TABLE visitor_details
  ADD COLUMN visitor_photo LONGTEXT DEFAULT NULL;
