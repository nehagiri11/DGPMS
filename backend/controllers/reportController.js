const db =
  require("../config/db");

exports.exportReport =
async (req, res) => {

  try {

    const [allPasses] =
  await db.query(`
    SELECT

      gp.pass_no               AS "Pass Number",
      gp.pass_type             AS "Pass Type",
      gp.status                AS "Status",

      u.full_name              AS "Requester",

      approver.full_name       AS "Approved By",

      gp.created_at            AS "Created Date",

      gp.approved_date         AS "Approved Date",

      gp.arrival_date          AS "Arrival Date",

      gp.departure_date        AS "Departure Date",

      gp.host_name             AS "Host Name",

      gp.host_department       AS "Department",

      gp.purpose               AS "Purpose",

      gp.vehicle_no            AS "Vehicle Number"

    FROM gate_passes gp

    LEFT JOIN users u
    ON gp.requester_id =
       u.user_id

    LEFT JOIN users approver
    ON gp.approved_by =
       approver.user_id

    ORDER BY gp.created_at DESC
  `);
    const [visitorPasses] =
  await db.query(`
    SELECT

      gp.pass_no        AS "Pass Number",

      vd.visitor_name   AS "Visitor Name",

      vd.company        AS "Company",

      vd.email          AS "Email",

      vd.contact        AS "Contact Number"

    FROM visitor_details vd

    JOIN gate_passes gp
    ON vd.pass_id =
       gp.pass_id

    ORDER BY gp.created_at DESC
  `);
    const [regularPasses] =
  await db.query(`
    SELECT

  gp.pass_no            AS "Pass Number",

  rpd.company_name      AS "Company",

  rpd.driver_name       AS "Driver Name",

  rpd.driver_number     AS "Driver Number",

  rpd.vehicle_no        AS "Vehicle Number",

  rpd.category          AS "Category",

  pi.item_description   AS "Item Description",

  pi.quantity           AS "Quantity",

  pi.remarks            AS "Item Remarks",

  rpd.remarks           AS "Pass Remarks"

FROM regular_pass_details rpd

JOIN gate_passes gp
ON rpd.pass_id = gp.pass_id

LEFT JOIN pass_items pi
ON gp.pass_id = pi.pass_id

WHERE gp.pass_type = 'REGULAR'

ORDER BY gp.created_at DESC
  `);
   const [ckdPasses] =
  await db.query(`
   SELECT

  gp.pass_no           AS "Pass Number",

  cpd.company_name     AS "Company",

  cpd.driver_name      AS "Driver Name",

  cpd.driver_number    AS "Driver Number",

  cpd.truck_number     AS "Truck Number",

  cpd.seal_number      AS "Seal Number",

  pi.item_description  AS "Item Description",

  pi.quantity          AS "Quantity",

  pi.remarks           AS "Item Remarks",

  cpd.remarks          AS "Pass Remarks"

FROM ckd_pass_details cpd

JOIN gate_passes gp
ON cpd.pass_id = gp.pass_id

LEFT JOIN pass_items pi
ON gp.pass_id = pi.pass_id

WHERE gp.pass_type = 'CKD'

ORDER BY gp.created_at DESC
  `);

   
   const [gateLogs] =
  await db.query(`
    SELECT

      gp.pass_no          AS "Pass Number",

      eel.action          AS "Action",

      eel.created_at      AS "Date Time"

    FROM entry_exit_logs eel

    JOIN gate_passes gp
    ON eel.pass_id =
       gp.pass_id

    ORDER BY eel.created_at DESC
  `);
    res.json({

      success: true,

      allPasses,

      visitorPasses,

      regularPasses,

      ckdPasses,


      gateLogs

    });

  } catch (error) {

  console.log("EXPORT ERROR:");
  console.log(error);

  res.status(500).json({
    success: false,
    message: error.message
  });

}

};