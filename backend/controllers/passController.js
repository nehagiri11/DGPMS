const db =
require("../config/db");

const {
  writeAuditLog
} = require(
  "../utils/auditLogger"
);
const {
  createNotification
} = require(
  "../utils/notificationHelper"
);
const {
  sendEmail
} = require(
  "../services/emailService"
);

function formatPass(pass) {

  const computedStatus =
    getComputedPassStatus(pass);

  return {

    ...pass,

    status:
      computedStatus,

    passNo:
      pass.pass_no,

    type:
      pass.pass_type,

    gateStatus:
      pass.gate_status,

    approvedBy:
      pass.approved_by_name ||
      pass.approved_by,

    approvedByName:
      pass.approved_by_name ||
      "",

    approvedDate:
      pass.approved_date,

    entryTime:
      pass.entry_time,

    exitTime:
      pass.exit_time,

    arrivalDate:
      pass.arrival_date,

    departureDate:
      pass.departure_date,

    companyName:
      pass.company_name,

    driverName:
      pass.driver_name,

    driverNumber:
      pass.driver_number,

    truckNumber:
      pass.truck_number,

    sealNumber:
      pass.seal_number,

    vehicleNumber:
      pass.vehicle_no,

    requester:
  pass.requester_name ||
  pass.requester ||
  "N/A",

lastGateAction:
  pass.last_gate_action,

lastSecurityUser:
  pass.last_security_user,

lastGateTime:
  pass.last_gate_time

  };

}

function toDateOnly(value) {

  if (!value) {
    return "";
  }

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}/.test(value)
  ) {
    return value.slice(0, 10);
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;

}

function getComputedPassStatus(pass) {

  const today =
    todayDateString();

  if (
    pass.status === "PENDING"
  ) {

    const appliedDate =
      toDateOnly(
        pass.created_at
      );

    if (
      appliedDate &&
      appliedDate < today
    ) {

      return "EXPIRED";

    }

  }

  if (
    pass.status === "APPROVED" &&
    (
      !pass.gate_status ||
      pass.gate_status === "NOT_USED"
    )
  ) {

    if (
      pass.pass_type === "VISITOR"
    ) {

      const departureDate =
        toDateOnly(
          pass.departure_date
        );

      if (
        departureDate &&
        departureDate < today
      ) {

        return "EXPIRED";

      }

    } else {

      const appliedDate =
        toDateOnly(
          pass.created_at
        );

      if (
        appliedDate &&
        appliedDate < today
      ) {

        return "EXPIRED";

      }

    }

  }

  return pass.status;

}

function getPassValidityError(pass) {

  const today =
    todayDateString();

  if (
    pass.pass_type === "VISITOR"
  ) {

    const arrivalDate =
      toDateOnly(
        pass.arrival_date
      );

    const departureDate =
      toDateOnly(
        pass.departure_date
      );

    if (
      arrivalDate &&
      today < arrivalDate
    ) {

      return "Visitor pass is not valid before arrival date";

    }

    if (
      departureDate &&
      today > departureDate
    ) {

      return "Visitor pass has expired";

    }

    return "";

  }

  const appliedDate =
    toDateOnly(
      pass.created_at
    );

  if (
    appliedDate &&
    appliedDate !== today
  ) {

    return "CKD and Regular passes are valid only on the applied date";

  }

  return "";

}

async function completeExpiredCheckedOutVisitorPasses() {

  await db.query(

    `
    UPDATE gate_passes
    SET gate_status = 'COMPLETED'
    WHERE pass_type = 'VISITOR'
      AND gate_status = 'CHECKED_OUT'
      AND departure_date IS NOT NULL
      AND departure_date < CURDATE()
    `

  );

}

async function syncExpiredPassStatuses() {

  await db.query(

    `
    UPDATE gate_passes
    SET status = 'EXPIRED'
    WHERE status = 'PENDING'
      AND DATE(created_at) < CURDATE()
    `

  );

  await db.query(

    `
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
      )
    `

  );

}

async function refreshPassLifecycleState() {

  await syncExpiredPassStatuses();
  await completeExpiredCheckedOutVisitorPasses();

}

async function getUserName(
  userId
) {

  if (!userId) {

    return null;

  }

  const [users] =
    await db.query(

      `
      SELECT full_name
      FROM users
      WHERE user_id = ?
      `,

      [userId]

    );

  return users[0]?.full_name ||
    null;

}

function requiredText(value) {

  return Boolean(
    String(value || "").trim()
  );

}

function isValidPhoneNumber(value) {

  return /^\d{10}$/.test(
    String(value || "").trim()
  );

}

function hasQuantityValue(value) {

  return requiredText(value);

}

function todayDateString() {

  const date =
    new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;

}

function getItemValidationErrors(
  items = []
) {

  const errors = [];

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {

    return [
      "At least one item row is required"
    ];

  }

  items.forEach(
    (item, index) => {

      const rowNumber =
        index + 1;

      const hasAnyValue =
        requiredText(item.itemDescription) ||
        requiredText(item.quantity) ||
        requiredText(item.remarks);

      if (!hasAnyValue) {

        errors.push(
          `Item ${rowNumber}: remove the empty row or fill description and quantity`
        );

        return;

      }

      if (
        !requiredText(
          item.itemDescription
        )
      ) {

        errors.push(
          `Item ${rowNumber}: description is required`
        );

      }

      if (
        !hasQuantityValue(
          item.quantity
        )
      ) {

        errors.push(
          `Item ${rowNumber}: quantity is required`
        );

      }

    }
  );

  return errors;

}

function validationError(
  res,
  errors
) {

  return res.status(400).json({
    success: false,
    message: errors.join("; "),
    errors
  });

}

async function runSideEffect(
  label,
  task
) {

  try {

    await task();

  } catch (error) {

    console.error(
      `${label} failed:`,
      error.message
    );

  }

}

function getFrontendUrl() {

  return String(
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    "https://dgpms.vercel.app"
  ).replace(/\/$/, "");

}

function getPassLink(
  passNo,
  audience = "employee"
) {

  const encodedPassNo =
    encodeURIComponent(passNo);

  const passPath =
    audience === "approver"
      ? `/approver/request-details/${encodedPassNo}`
      : audience === "admin"
      ? `/admin/pass-details/${encodedPassNo}`
      : `/employee/request-details/${encodedPassNo}`;

  return `${getFrontendUrl()}/?redirect=${encodeURIComponent(passPath)}`;

}

async function notifyApprovers(
  title,
  message,
  passId
) {

  await runSideEffect(
    "Approver notification",
    async () => {

      const [approvers] =
        await db.query(
          `
          SELECT u.user_id
          FROM users u
          JOIN roles r
            ON u.role_id = r.role_id
          WHERE r.role_name = 'APPROVER'
          `
        );

      for (
        const approver
        of approvers
      ) {

        await createNotification(
          approver.user_id,
          title,
          message,
          "PASS_CREATED",
          passId
        );

      }

    }
  );

}

async function emailApprovers(
  passNo
) {

  await runSideEffect(
    "Approver email",
    async () => {

      const [approversEmails] =
        await db.query(
          `
          SELECT u.email
          FROM users u
          JOIN roles r
            ON u.role_id = r.role_id
          WHERE r.role_name = 'APPROVER'
          `
        );

      console.log(
        "Approver email recipients found:",
        approversEmails.length
      );

      const passLink =
        getPassLink(
          passNo,
          "approver"
        );

      for (
        const approver
        of approversEmails
      ) {

        try {

          const result =
            await sendEmail(
              approver.email,
              "New Gate Pass Requires Approval",
              `
                <h2>DGPMS Notification</h2>

                <p>A new pass has been submitted.</p>

                <p><b>Pass Number:</b> ${passNo}</p>

                <p>Please login to approve or reject it.</p>

                <p>
                  <a href="${passLink}" style="display:inline-block;background:#1d4ed8;color:#ffffff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:700;">
                    Open Pass
                  </a>
                </p>

                <p>If the button does not work, copy this link:<br />
                  <a href="${passLink}">${passLink}</a>
                </p>
              `
            );

          console.log(
            "Approver email result:",
            {
              to: approver.email,
              accepted: result?.accepted || [],
              rejected: result?.rejected || []
            }
          );

        } catch (error) {

          console.error(
            "Approver email failed:",
            {
              to: approver.email,
              message: error.message,
              code: error.code,
              response: error.response,
              responseCode: error.responseCode
            }
          );

        }

      }

    }
  );

}

async function notifyPassRequester(
  passId,
  title,
  message,
  type,
  emailSubject,
  emailBody
) {

  await runSideEffect(
    "Requester notification",
    async () => {

      const [requester] =
        await db.query(
          `
          SELECT
            u.user_id,
            u.email,
            u.full_name,
            r.role_name,
            gp.pass_no
          FROM gate_passes gp
          JOIN users u
            ON gp.requester_id =
               u.user_id
          JOIN roles r
            ON u.role_id =
               r.role_id
          WHERE gp.pass_id = ?
          `,
          [passId]
        );

      if (
        requester.length === 0
      ) {

        console.log(
          "Requester email skipped: requester not found for pass",
          passId
        );

        return;

      }

      await createNotification(
        requester[0].user_id,
        title,
        message(
          requester[0].pass_no
        ),
        type,
        passId
      );

      console.log(
        "Requester email recipient:",
        requester[0].email
      );

      const result =
      await sendEmail(
          requester[0].email,
          emailSubject,
          emailBody(
            requester[0],
            getPassLink(
              requester[0].pass_no,
              requester[0].role_name === "APPROVER"
                ? "approver"
                : requester[0].role_name === "ADMIN"
                ? "admin"
                : "employee"
            )
          )
        );

      console.log(
        "Requester email result:",
        {
          to: requester[0].email,
          accepted: result?.accepted || [],
          rejected: result?.rejected || []
        }
      );

    }
  );

}

function validateVisitorPass(body) {

  const errors = [];

  if (!requiredText(body.host_name)) {
    errors.push("Host employee name is required");
  }

  if (!requiredText(body.host_department)) {
    errors.push("Host department is required");
  }

  if (!requiredText(body.arrival_date)) {
    errors.push("Arrival date is required");
  }

  if (!requiredText(body.departure_date)) {
    errors.push("Departure date is required");
  }

  if (!requiredText(body.purpose)) {
    errors.push("Purpose of visit is required");
  }

  if (
    body.arrival_date &&
    body.arrival_date < todayDateString()
  ) {
    errors.push("Arrival date cannot be before today");
  }

  if (
    body.arrival_date &&
    body.departure_date &&
    body.arrival_date > body.departure_date
  ) {
    errors.push("Departure date must be the same as or after arrival date");
  }

  if (
    !Array.isArray(body.visitors) ||
    body.visitors.length === 0
  ) {
    errors.push("At least one visitor is required");
  } else {

    body.visitors.forEach(
      (visitor, index) => {

        const rowNumber =
          index + 1;

        if (!requiredText(visitor.name)) {
          errors.push(`Visitor ${rowNumber}: name is required`);
        }

        if (!requiredText(visitor.company)) {
          errors.push(`Visitor ${rowNumber}: company is required`);
        }

        if (
          requiredText(visitor.email) &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            visitor.email.trim()
          )
        ) {
          errors.push(`Visitor ${rowNumber}: valid email is required`);
        }

        if (
          requiredText(visitor.contact) &&
          !isValidPhoneNumber(
            visitor.contact
          )
        ) {
          errors.push(`Visitor ${rowNumber}: contact number must be exactly 10 digits`);
        }

        if (
          !requiredText(
            visitor.photo ||
            visitor.visitor_photo
          )
        ) {
          errors.push(`Visitor ${rowNumber}: photo is required`);
        }

      }
    );

  }

  return errors;

}

function validateRegularPass(body) {

  const errors = [];

  if (!requiredText(body.company_name)) {
    errors.push("Company name is required");
  }

  if (!requiredText(body.driver_name)) {
    errors.push("Driver name is required");
  }

  if (!requiredText(body.driver_number)) {
    errors.push("Driver number is required");
  } else if (
    !isValidPhoneNumber(
      body.driver_number
    )
  ) {
    errors.push("Driver number must be exactly 10 digits");
  }

  if (!requiredText(body.vehicle_no)) {
    errors.push("Vehicle number is required");
  }

  if (!requiredText(body.category)) {
    errors.push("Pass category is required");
  }

  return [
    ...errors,
    ...getItemValidationErrors(
      body.items
    )
  ];

}

function validateCKDPass(body) {

  const errors = [];

  if (!requiredText(body.company_name)) {
    errors.push("Company name is required");
  }

  if (!requiredText(body.driver_name)) {
    errors.push("Driver name is required");
  }

  if (!requiredText(body.driver_number)) {
    errors.push("Driver number is required");
  } else if (
    !isValidPhoneNumber(
      body.driver_number
    )
  ) {
    errors.push("Driver number must be exactly 10 digits");
  }

  if (!requiredText(body.truck_number)) {
    errors.push("Truck number is required");
  }

  if (!requiredText(body.seal_number)) {
    errors.push("Seal number is required");
  }

  return [
    ...errors,
    ...getItemValidationErrors(
      body.items
    )
  ];

}

function canReadPass(
  user,
  pass
) {

  if (
    [
      "ADMIN",
      "APPROVER",
      "SECURITY"
    ].includes(user?.role)
  ) {

    return true;

  }

  return Number(pass.requester_id) ===
    Number(user?.userId);

}

async function addEntryExitLogs(
  pass
) {

  const [logs] =
    await db.query(

      `
      SELECT
        log_id,
        action,
        security_user_name,
        gate_status_after,
        created_at
      FROM entry_exit_logs
      WHERE pass_id = ?
      ORDER BY created_at DESC
      `,

      [pass.pass_id]

    );

  pass.entryExitLogs =
    logs;

}

async function insertEntryExitLog(
  passId,
  passNo,
  action,
  securityUserId,
  gateStatusAfter
) {

  const securityUserName =
    await getUserName(
      securityUserId
    );

  await db.query(

    `
    INSERT INTO entry_exit_logs
    (
      pass_id,
      pass_no,
      action,
      security_user_id,
      security_user_name,
      gate_status_after
    )
    VALUES
    (?, ?, ?, ?, ?, ?)
    `,

    [
      passId,
      passNo,
      action,
      securityUserId || null,
      securityUserName,
      gateStatusAfter
    ]

  );

}

async function resolvePassNo(
  requestedPassNo,
  prefix
) {

  void requestedPassNo;

  const today =
    new Date();

  const day =
    String(
      today.getDate()
    ).padStart(2, "0");

  const month =
    String(
      today.getMonth() + 1
    ).padStart(2, "0");

  const year =
    String(
      today.getFullYear()
    ).slice(-2);

  const datePart =
    `${day}-${month}-${year}`;

  const [passes] =
    await db.query(

      `
      SELECT pass_no
      FROM gate_passes
      WHERE pass_no LIKE ?
      `,

      [`${prefix}_%`]

    );

  const highest =
    passes.reduce(
      (max, pass) => {

        const value =
          Number(
            pass.pass_no
              .split("_")
              .pop()
          );

        return Number.isNaN(value)
          ? max
          : Math.max(max, value);

      },
      0
    );

  const counter =
    String(
      highest + 1
    ).padStart(4, "0");

  return `${prefix}_${datePart}_${counter}`;

}

async function insertPassItems(
  passId,
  items = []
) {

  for (
    const item
    of items
  ) {

    await db.query(

      `
      INSERT INTO pass_items
      (
        pass_id,
        item_description,
        quantity,
        remarks
      )
      VALUES
      (?, ?, ?, ?)
      `,

      [
        passId,
        item.itemDescription,
        item.quantity,
        item.remarks
      ]

    );

  }

}

async function addPassItems(
  pass
) {

  const [items] =
    await db.query(

      `
      SELECT
        item_description AS itemDescription,
        quantity,
        remarks
      FROM pass_items
      WHERE pass_id = ?
      `,

      [pass.pass_id]

    );

  pass.items =
    items;

  pass.numberOfItems =
    items.length;

}

async function addRegularDetails(
  pass
) {

  const [details] =
    await db.query(

      `
      SELECT
        company_name,
        driver_name,
        driver_number,
        vehicle_no,
        category,
        remarks
      FROM regular_pass_details
      WHERE pass_id = ?
      `,

      [pass.pass_id]

    );

  if (
    details.length > 0
  ) {

    pass.companyName =
      details[0].company_name;

    pass.driverName =
      details[0].driver_name;

    pass.driverNumber =
      details[0].driver_number;

    pass.vehicleNo =
      details[0].vehicle_no;

    pass.vehicleNumber =
      details[0].vehicle_no;

    pass.category =
      details[0].category;

    pass.remarks =
      details[0].remarks;

  }

}

async function addCKDDetails(
  pass
) {

  const [details] =
    await db.query(

      `
      SELECT
        company_name,
        driver_name,
        driver_number,
        truck_number,
        seal_number,
        remarks
      FROM ckd_pass_details
      WHERE pass_id = ?
      `,

      [pass.pass_id]

    );

  if (
    details.length > 0
  ) {

    pass.companyName =
      details[0].company_name;

    pass.driverName =
      details[0].driver_name;

    pass.driverNumber =
      details[0].driver_number;

    pass.truckNumber =
      details[0].truck_number;

    pass.sealNumber =
      details[0].seal_number;

    pass.remarks =
      details[0].remarks;

  }

}

exports.createVisitorPass =
async (req, res) => {

  try {

    const {

      pass_no,

      requester_id,

      host_name,

      host_department,

      arrival_date,

      departure_date,

      purpose,

      vehicle_no,

      remarks,

      visitors

      } = req.body;

    const errors =
      validateVisitorPass(
        req.body
      );

    if (errors.length > 0) {

      return validationError(
        res,
        errors
      );

    }

    const passNo =
      await resolvePassNo(
        pass_no,
        "VIS"
      );

    const requesterId =
      requester_id ||
      req.user.userId;

    const [result] =
      await db.query(

        `
        INSERT INTO gate_passes
        (
          pass_no,
          pass_type,
          requester_id,
          host_name,
          host_department,
          arrival_date,
          departure_date,
          purpose,
          vehicle_no,
          remarks
        )

        VALUES
        (?, 'VISITOR', ?, ?, ?, ?, ?, ?, ?, ?)
        `,

        [
          passNo,
          requesterId,
          host_name,
          host_department,
          arrival_date,
          departure_date,
          purpose,
          vehicle_no,
          remarks
        ]

      );

    const passId =
      result.insertId;

    for (
      const visitor
      of visitors
    ) {

      await db.query(

        `
        INSERT INTO visitor_details
        (
          pass_id,
          visitor_name,
          company,
          email,
          contact,
          visitor_photo
        )

        VALUES
        (?, ?, ?, ?, ?, ?)
        `,

        [
          passId,
          visitor.name,
          visitor.company,
          visitor.email,
          visitor.contact,
          visitor.photo ||
            visitor.visitor_photo ||
            null
        ]

      );

    }

   await writeAuditLog(
   requesterId,
  "PASS_CREATED",
  `${passNo} created`
);
    await notifyApprovers(
      "New Visitor Pass Submitted",
      `${passNo} requires approval`,
      passId
    );

    await emailApprovers(
      passNo
    );

    res.json({

      success: true,

      pass_id:
        passId,

      pass_no:
        passNo,

      message:
        "Visitor Pass Created"

    });

  } catch (error) {
  console.error(error);

  res.status(500).json({
    success: false,
    error: error.message
  });
}

};

exports.createRegularPass =
async (req, res) => {

  try {

    const {
      pass_no,
      requester_id,
      company_name,
      driver_name,
      driver_number,
      vehicle_no,
      category,
      remarks,
      items
      } = req.body;

    const errors =
      validateRegularPass(
        req.body
      );

    if (errors.length > 0) {

      return validationError(
        res,
        errors
      );

    }
    if (
  request.items &&
  request.items.length > 5
) {
  return res.status(400).json({
    success: false,
    message:
      "Maximum 5 items allowed per pass"
  });
}

    const passNo =
      await resolvePassNo(
        pass_no,
        "REG"
      );

    const requesterId =
      requester_id ||
      req.user.userId;

    const [result] =
      await db.query(

        `
        INSERT INTO gate_passes
        (
          pass_no,
          pass_type,
          requester_id
        )
        VALUES
        (?, 'REGULAR', ?)
        `,

        [
          passNo,
          requesterId
        ]

      );

    await db.query(

      `
      INSERT INTO regular_pass_details
      (
        pass_id,
        company_name,
        driver_name,
        driver_number,
        vehicle_no,
        category,
        remarks
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?)
      `,

      [
        result.insertId,
          company_name,
          driver_name,
          driver_number,
          vehicle_no,
          category,
          remarks
        ]

      );

    await insertPassItems(
      result.insertId,
      items
    );

    await writeAuditLog(
  requesterId,
  "PASS_CREATED",
  `${passNo} created`
);

    await notifyApprovers(
      "New Regular Pass Submitted",
      `${passNo} requires approval`,
      result.insertId
    );

    await emailApprovers(
      passNo
    );

    res.json({

      success: true,

      pass_id:
        result.insertId,

      pass_no:
        passNo,

      message:
        "Regular Pass Created"

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Server Error"

    });

  }

};

exports.createCKDPass =
async (req, res) => {

  try {

    const {
      pass_no,
      requester_id,
      company_name,
      driver_name,
      driver_number,
      truck_number,
      seal_number,
      remarks,
      items
      } = req.body;

    const errors =
      validateCKDPass(
        req.body
      );

    if (errors.length > 0) {

      return validationError(
        res,
        errors
      );

    }
    if (
  request.items &&
  request.items.length > 5
) {
  return res.status(400).json({
    success: false,
    message:
      "Maximum 5 items allowed per pass"
  });
}

    const passNo =
      await resolvePassNo(
        pass_no,
        "CKD"
      );

    const requesterId =
      requester_id ||
      req.user.userId;

    const [result] =
      await db.query(

        `
        INSERT INTO gate_passes
        (
          pass_no,
          pass_type,
          requester_id
        )
        VALUES
        (?, 'CKD', ?)
        `,

        [
          passNo,
          requesterId
        ]

      );

    await db.query(

      `
      INSERT INTO ckd_pass_details
      (
        pass_id,
        company_name,
        driver_name,
        driver_number,
        truck_number,
        seal_number,
        remarks
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?)
      `,

      [
        result.insertId,
          company_name,
          driver_name,
          driver_number,
          truck_number,
          seal_number,
          remarks
        ]

      );

    await insertPassItems(
      result.insertId,
      items
    );

    await writeAuditLog(
  requesterId,
  "PASS_CREATED",
  `${passNo} created`
);

    await notifyApprovers(
      "New CKD Pass Submitted",
      `${passNo} requires approval`,
      result.insertId
    );

    await emailApprovers(
      passNo
    );

    res.json({

      success: true,

      pass_id:
        result.insertId,

      pass_no:
        passNo,

      message:
        "CKD Pass Created"

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Server Error"

    });

  }

};



exports.getAllPasses =
async (req, res) => {
   

  try {

    await refreshPassLifecycleState();

    const {
      status,
      type,
      requester,
      passNo,
      date,
      page = 1,
      limit = 100
    } = req.query;

    const conditions = [];
    const params = [];

    if (req.user.role === "REQUESTER") {

      conditions.push(
        "gp.requester_id = ?"
      );
      params.push(
        req.user.userId
      );

    }

    if (status) {

      conditions.push(
        "gp.status = ?"
      );
      params.push(
        status.toUpperCase()
      );

    }

    if (type) {

      conditions.push(
        "gp.pass_type = ?"
      );
      params.push(
        type.toUpperCase()
      );

    }

    if (requester) {

      conditions.push(
        "u.full_name LIKE ?"
      );
      params.push(
        `%${requester}%`
      );

    }

    if (passNo) {

      conditions.push(
        "gp.pass_no LIKE ?"
      );
      params.push(
        `%${passNo}%`
      );

    }

    if (date) {

      conditions.push(
        `
        (
          DATE(gp.created_at) = ?
          OR gp.arrival_date = ?
          OR gp.departure_date = ?
        )
        `
      );
      params.push(
        date,
        date,
        date
      );

    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const pageNumber =
      Math.max(
        Number(page) || 1,
        1
      );

    const limitNumber =
      Math.min(
        Math.max(
          Number(limit) || 100,
          1
        ),
        500
      );

    const offset =
      (pageNumber - 1) *
      limitNumber;

    const [passes] =
      await db.query(

        `
        SELECT
          gp.*,
          u.full_name AS requester_name,
          approver.full_name AS approved_by_name,
          latest_log.action AS last_gate_action,
          latest_log.security_user_name AS last_security_user,
          latest_log.created_at AS last_gate_time
        FROM gate_passes gp

        LEFT JOIN users u
        ON gp.requester_id =
           u.user_id

        LEFT JOIN users approver
        ON gp.approved_by =
           approver.user_id

        LEFT JOIN entry_exit_logs latest_log
ON latest_log.log_id = (
    SELECT log_id
    FROM entry_exit_logs
    WHERE pass_id = gp.pass_id
    ORDER BY log_id DESC
    LIMIT 1
)

        ${whereClause}

        ORDER BY
        gp.created_at DESC

        LIMIT ?
        OFFSET ?
        `

        ,
        [
          ...params,
          limitNumber,
          offset
        ]
      );

    const [countRows] =
      await db.query(
        `
        SELECT COUNT(*) AS total
        FROM gate_passes gp
        LEFT JOIN users u
        ON gp.requester_id =
           u.user_id
        ${whereClause}
        `,
        params
      );
  
  const formattedPasses =
  passes.map(
    formatPass
  );
console.log(
  "FORMATTED PASSES:",
  JSON.stringify(formattedPasses, null, 2)
);
res.json({
  
  success: true,

  passes:
    formattedPasses,

  pagination: {
    page: pageNumber,
    limit: limitNumber,
    total: countRows[0].total
  }

});

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Server Error"

    });

  }

};
exports.getPassById =
async (req, res) => {

  try {

    await refreshPassLifecycleState();

    const { id } =
      req.params;

    const [passes] =
      await db.query(

        `
        SELECT
          gp.*,
          u.full_name AS requester_name,
          approver.full_name AS approved_by_name
        FROM gate_passes gp
        LEFT JOIN users u
        ON gp.requester_id =
           u.user_id
        LEFT JOIN users approver
        ON gp.approved_by =
           approver.user_id
        WHERE gp.pass_id = ?
        `,

        [id]

      );

    if (
      passes.length === 0
    ) {

      return res.status(404).json({

        success: false,

        message:
          "Pass not found"

      });

    }

    const pass =
  formatPass(
    passes[0]
  );

    if (
      !canReadPass(
        req.user,
        pass
      )
    ) {

      return res.status(403).json({
        success: false,
        message: "Access denied"
      });

    }

    if (
      pass.pass_type ===
      "VISITOR"
    ) {

      const [visitors] =
        await db.query(

          `
          SELECT *
          FROM visitor_details
          WHERE pass_id = ?
          `,

          [id]

        );

      pass.visitors =
        visitors;

    }

    if (
      pass.pass_type ===
        "REGULAR" ||
      pass.pass_type ===
        "CKD"
    ) {

      await addPassItems(
        pass
      );

    }

    if (
      pass.pass_type ===
      "REGULAR"
    ) {

      await addRegularDetails(
        pass
      );

    }

    if (
      pass.pass_type ===
      "CKD"
    ) {

      await addCKDDetails(
        pass
      );

    }

    await addEntryExitLogs(
      pass
    );

    res.json({

  success: true,

  pass

});

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Server Error"

    });

  }

};
exports.approvePass =
async (req, res) => {

  try {

    await refreshPassLifecycleState();

    const { id } =
      req.params;

    const {
      approved_by,
      remarks
    } = req.body;

    const [passes] =
      await db.query(
        `
        SELECT status, created_at
        FROM gate_passes
        WHERE pass_id = ?
        `,
        [id]
      );

    if (
      passes.length === 0
    ) {

      return res.status(404).json({
        success: false,
        message: "Pass not found"
      });

    }

    if (
      getComputedPassStatus(
        passes[0]
      ) === "EXPIRED"
    ) {

      return res.status(400).json({
        success: false,
        message: "This pass request has expired and cannot be approved"
      });

    }

    await db.query(

      `
      UPDATE gate_passes

      SET

      status = 'APPROVED',

      approved_by = ?,

      approved_date = NOW(),

      approver_remarks = ?

      WHERE pass_id = ?

      `,

      [
        approved_by ||
          req.user?.userId,
        remarks,
        id
      ]

    );
    const [passRows] =
      await db.query(
        `
        SELECT pass_no
        FROM gate_passes
        WHERE pass_id = ?
        `,
        [id]
      );

    const passNo =
      passRows[0]?.pass_no ||
      `Pass ${id}`;

    await notifyPassRequester(
      id,
      "Pass Approved",
      (number) =>
        `${number} has been approved`,
      "PASS_APPROVED",
      "Gate Pass Approved",
      (requester, passLink) => `
        <h2>DGPMS Notification</h2>

        <p>Hello ${requester.full_name},</p>

        <p>Your pass has been approved.</p>

        <p><b>Pass Number:</b>
        ${requester.pass_no}</p>

        <p>
          <a href="${passLink}" style="display:inline-block;background:#16a34a;color:#ffffff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:700;">
            Open Approved Pass
          </a>
        </p>

        <p>If the button does not work, copy this link:<br />
          <a href="${passLink}">${passLink}</a>
        </p>
      `
    );

   await writeAuditLog(
  req.user?.userId,
  "PASS_APPROVED",
  `${passNo} approved by ${await getUserName(req.user?.userId)}`
);

    res.json({

      success: true,

      message:
        "Pass Approved"

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Server Error"

    });

  }

};

exports.rejectPass =
async (req, res) => {

  try {

    const { id } =
      req.params;

    const {
      rejected_by,
      remarks
    } = req.body;

    await db.query(

      `
      UPDATE gate_passes
      SET
      status = 'REJECTED',
      approved_by = ?,
      approved_date = NOW(),
      approver_remarks = ?
      WHERE pass_id = ?
      `,

      [
        rejected_by,
        remarks,
        id
      ]

    );
    const [passRows] =
      await db.query(
        `
        SELECT pass_no
        FROM gate_passes
        WHERE pass_id = ?
        `,
        [id]
      );

    const passNo =
      passRows[0]?.pass_no ||
      `Pass ${id}`;

    await notifyPassRequester(
      id,
      "Pass Rejected",
      (number) =>
        `${number} has been rejected`,
      "PASS_REJECTED",
      "Gate Pass Rejected",
      (requester, passLink) => `
        <h2>DGPMS Notification</h2>

        <p>Hello ${requester.full_name},</p>

        <p>Your pass has been rejected.</p>

        <p><b>Pass Number:</b>
        ${requester.pass_no}</p>

        <p><b>Remarks:</b>
        ${remarks || "No remarks"}</p>

        <p>
          <a href="${passLink}" style="display:inline-block;background:#dc2626;color:#ffffff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:700;">
            Open Rejected Pass
          </a>
        </p>

        <p>If the button does not work, copy this link:<br />
          <a href="${passLink}">${passLink}</a>
        </p>
      `
    );

   await writeAuditLog(
  req.user?.userId,
  "PASS_REJECTED",
  `${passNo} rejected by ${await getUserName(req.user?.userId)}`
);

    res.json({

      success: true,

      message:
        "Pass Rejected"

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Server Error"

    });

  }

};
exports.markEntry =
async (req, res) => {

  try {

    const { id } =
      req.params;

    const [passes] =
      await db.query(

        `
        SELECT
          pass_id,
          pass_no,
          status,
          gate_status,
          pass_type,
          created_at,
          DATE_FORMAT(
            arrival_date,
            '%Y-%m-%d'
          ) AS arrival_date,
          DATE_FORMAT(
            departure_date,
            '%Y-%m-%d'
          ) AS departure_date
        FROM gate_passes
        WHERE pass_id = ?
        `,

        [id]

      );

    if (
      passes.length === 0
    ) {

      return res.status(404).json({

        success: false,

        message:
          "Pass not found"

      });

    }

   const pass =
  formatPass(
    passes[0]
  );

    if (
      !canReadPass(
        req.user,
        pass
      )
    ) {

      return res.status(403).json({
        success: false,
        message: "Access denied"
      });

    }

    if (
      pass.status !==
      "APPROVED"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Only approved passes can enter"

      });

    }

    if (
      pass.gateStatus ===
      "INSIDE"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Pass already inside"

      });

    }

    if (
      pass.gateStatus === "CHECKED_OUT" &&
      pass.type?.toUpperCase() !== "VISITOR"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Pass already checked out"

      });

    }

    if (
      pass.gateStatus ===
      "COMPLETED"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Pass already completed"

      });

    }

    const validityError =
      getPassValidityError(
        passes[0]
      );

    if (validityError) {

      return res.status(400).json({

        success: false,

        message:
          validityError

      });

    }

    const allowedEntryGateStatuses =
      pass.type?.toUpperCase() === "VISITOR"
        ? [
            "NOT_USED",
            "CHECKED_OUT"
          ]
        : [
            "NOT_USED"
          ];

    const [entryResult] =
      await db.query(

      `
      UPDATE gate_passes

      SET

      gate_status = 'INSIDE',

      entry_time = NOW()

      WHERE pass_id = ?
        AND gate_status IN (?)

      `,

      [
        id,
        allowedEntryGateStatuses
      ]

    );

    if (
      entryResult.affectedRows === 0
    ) {

      return res.status(409).json({

        success: false,

        message:
          "Pass was already scanned. Please refresh and check the current gate status."

      });

    }

    await insertEntryExitLog(
      id,
      passes[0].pass_no,
      "ENTRY",
      req.user?.userId,
      "INSIDE"
    );

    await writeAuditLog(
      req.user?.userId,
      "ENTRY_RECORDED",
      ` ${passes[0].pass_no}`
    );

    res.json({

      success: true,

      message:
        "Entry Recorded"

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Server Error"

    });

  }

};
exports.markExit =
async (req, res) => {

  try {

    const { id } =
      req.params;

    const [passes] =
      await db.query(

        `
        SELECT
          pass_id,
          pass_no,
          gate_status,
          pass_type,
          created_at,
          DATE_FORMAT(
            arrival_date,
            '%Y-%m-%d'
          ) AS arrival_date,
          DATE_FORMAT(
            departure_date,
            '%Y-%m-%d'
          ) AS departure_date
        FROM gate_passes
        WHERE pass_id = ?
        `,

        [id]

      );

    if (
      passes.length === 0
    ) {

      return res.status(404).json({

        success: false,

        message:
          "Pass not found"

      });

    }

    const pass =
  formatPass(
    passes[0]
  );

  if (
    pass.gateStatus ===
    "CHECKED_OUT"
  ) {

    return res.status(400).json({
      success: false,
      message: "Pass already checked out"
    });

  }

  if (
    pass.gateStatus ===
    "COMPLETED"
  ) {

    return res.status(400).json({
      success: false,
      message: "Pass already completed"
    });

  }

    if (
      pass.gateStatus !==
      "INSIDE"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Pass has not entered yet"

      });

    }

    const validityError =
      getPassValidityError(
        passes[0]
      );

    if (validityError) {

      return res.status(400).json({

        success: false,

        message:
          validityError

      });

    }

      const nextGateStatus =
  pass.type?.toUpperCase() === "VISITOR"
    ? "CHECKED_OUT"
    : "COMPLETED";

      const [exitResult] =
        await db.query(

        `
        UPDATE gate_passes

        SET

        gate_status = ?,

        exit_time = NOW()

        WHERE pass_id = ?
          AND gate_status = 'INSIDE'

        `,

        [
          nextGateStatus,
          id
        ]

      );

      if (
        exitResult.affectedRows === 0
      ) {

        return res.status(409).json({

          success: false,

          message:
            "Pass was already scanned. Please refresh and check the current gate status."

        });

      }

      await insertEntryExitLog(
        id,
        passes[0].pass_no,
        "EXIT",
        req.user?.userId,
        nextGateStatus
      );

      await writeAuditLog(
        req.user?.userId,
        "EXIT_RECORDED",
        ` ${passes[0].pass_no}`
      );

    res.json({

      success: true,

      message:
        "Exit Recorded"

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Server Error"

    });

  }

};
exports.verifyPass =
async (req, res) => {

  try {

    await refreshPassLifecycleState();

    const { passNo } =
      req.params;

    const [passes] =
      await db.query(

        `
        SELECT
          gp.*,
          u.full_name AS requester_name,
          approver.full_name AS approved_by_name
        FROM gate_passes gp
        LEFT JOIN users u
        ON gp.requester_id =
           u.user_id
        LEFT JOIN users approver
        ON gp.approved_by =
           approver.user_id
        WHERE gp.pass_no = ?
        `,

        [passNo]

      );

    if (
      passes.length === 0
    ) {

      return res.status(404).json({

        success: false,

        message:
          "Pass not found"

      });

    }

   const pass =
  formatPass(
    passes[0]
  );

    if (
      !canReadPass(
        req.user,
        pass
      )
    ) {

      return res.status(403).json({
        success: false,
        message: "Access denied"
      });

    }

    if (
      pass.type ===
      "VISITOR"
    ) {

      const [visitors] =
        await db.query(

          `
          SELECT *
          FROM visitor_details
          WHERE pass_id = ?
          `,

          [pass.pass_id]

        );

      pass.visitors =
        visitors;

    }

    if (
      pass.type ===
        "REGULAR" ||
      pass.type ===
        "CKD"
    ) {

      await addPassItems(
        pass
      );

    }

    if (
      pass.type ===
      "REGULAR"
    ) {

      await addRegularDetails(
        pass
      );

    }

    if (
      pass.type ===
      "CKD"
    ) {

      await addCKDDetails(
        pass
      );

    }

    await addEntryExitLogs(
      pass
    );

    res.json({

      success: true,

      pass

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Server Error"

    });

  }

};

exports.getEntryExitLogs =
async (req, res) => {

  try {

    const { id } =
      req.params;

    const [logs] =
      await db.query(

        `
        SELECT
          log_id,
          pass_id,
          pass_no,
          action,
          security_user_name,
          gate_status_after,
          created_at
        FROM entry_exit_logs
        WHERE pass_id = ?
        ORDER BY created_at DESC
        `,

        [id]

      );

    res.json({

      success: true,

      logs

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        "Server Error"

    });

  }

};

exports.getRecentGateLogs =
async (req, res) => {

  try {

    await refreshPassLifecycleState();

    const {
      date = todayDateString(),
      passNo = "",
      limit = 100
    } = req.query;

    const limitNumber =
      Math.min(
        Math.max(
          Number(limit) || 100,
          1
        ),
        500
      );

    const conditions = [
      "DATE(eel.created_at) = ?"
    ];

    const params = [
      date
    ];

    if (
      String(passNo || "").trim()
    ) {

      conditions.push(
        "eel.pass_no LIKE ?"
      );

      params.push(
        `%${String(passNo).trim()}%`
      );

    }

    const [logs] =
      await db.query(

        `
        SELECT
          eel.log_id,
          eel.pass_id,
          eel.pass_no,
          eel.action,
          eel.security_user_id,
          COALESCE(u.full_name, eel.security_user_name) AS security_user_name,
          u.email AS security_user_email,
          eel.gate_status_after,
          eel.created_at
        FROM entry_exit_logs eel
        LEFT JOIN users u
          ON eel.security_user_id = u.user_id
        WHERE ${conditions.join(" AND ")}
        ORDER BY eel.created_at DESC
        LIMIT ?
        `,

        [
          ...params,
          limitNumber
        ]

      );

    res.json({
      success: true,
      date,
      logs
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};
