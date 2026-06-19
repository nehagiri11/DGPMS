const titleCaseStatus = (status) => {
  if (!status) {
    return "Pending";
  }

  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const displayType = (type) => {
  if (type === "VISITOR") {
    return "Visitor";
  }

  if (type === "REGULAR") {
    return "Regular";
  }

  return type || "Visitor";
};

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return value;
  }

  const date =
    new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-CA"
  ).format(date);
};

const formatTime = (value) => {
  if (!value) {
    return "";
  }

  if (
    typeof value === "string" &&
    /^\d{2}:\d{2}/.test(value)
  ) {
    return value.slice(0, 5);
  }

  const date =
    new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  ).format(date);
};

export const mapApiVisitor = (visitor) => ({
  ...visitor,
  name: visitor.name || visitor.visitor_name || "",
  company: visitor.company || "",
  email: visitor.email || "",
  contact: visitor.contact || "",
  photo: visitor.photo || visitor.visitor_photo || "",
});

const mapEntryExitLog = (log) => ({
  ...log,
  createdAt:
    log.createdAt ||
    log.created_at ||
    "",
  securityUserName:
    log.securityUserName ||
    log.security_user_name ||
    "",
  gateStatusAfter:
    log.gateStatusAfter ||
    log.gate_status_after ||
    "",
});

export const mapApiPass = (pass) => {
  const type = displayType(pass.type || pass.pass_type);

  return {
    ...pass,
    passNo: pass.passNo || pass.pass_no,
    type,
    status: titleCaseStatus(pass.status),
    rawStatus: pass.status,
    requester: pass.requester || pass.requester_name || "N/A",
    hostName: pass.hostName || pass.host_name || "",
    hostDepartment: pass.hostDepartment || pass.host_department || "",
    arrivalDate: formatDate(pass.arrivalDate || pass.arrival_date),
    departureDate: formatDate(pass.departureDate || pass.departure_date),
    vehicleNo: pass.vehicleNo || pass.vehicle_no || "",
    vehicleNumber: pass.vehicleNumber || pass.vehicle_no || "",
    companyName: pass.companyName || pass.company_name || "",
    driverName: pass.driverName || pass.driver_name || "",
    driverNumber: pass.driverNumber || pass.driver_number || "",
    truckNumber: pass.truckNumber || pass.truck_number || "",
    sealNumber: pass.sealNumber || pass.seal_number || "",
    category: pass.category || "",
    date:
      formatDate(
        pass.date ||
        pass.created_at ||
        pass.arrivalDate ||
        pass.arrival_date
      ),
    approvedBy:
      pass.approvedByName ||
      pass.approved_by_name ||
      pass.approvedBy ||
      pass.approved_by ||
      "",
    approvedDate: formatDate(pass.approvedDate || pass.approved_date),
    approverRemarks: pass.approverRemarks || pass.approver_remarks || "",
    gateStatus: pass.gateStatus || pass.gate_status || "NOT_USED",
    entryTime: formatTime(pass.entryTime || pass.entry_time),
    exitTime: formatTime(pass.exitTime || pass.exit_time),
    lastGateAction: pass.lastGateAction || pass.last_gate_action || "",
    lastSecurityUser: pass.lastSecurityUser || pass.last_security_user || "",
    lastGateTime: pass.lastGateTime || pass.last_gate_time || "",
    visitors: pass.visitors?.map(mapApiVisitor) || [],
    items: pass.items || [],
    entryExitLogs:
      pass.entryExitLogs?.map(
        mapEntryExitLog
      ) || [],
    numberOfVisitors:
      pass.numberOfVisitors ||
      pass.visitors?.length ||
      0,
    numberOfItems:
      pass.numberOfItems ||
      pass.items?.length ||
      0,
  };
};
