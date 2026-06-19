// src/data/requests.js
import {
  addAuditLog
} from "./auditLogs";

export const getRequests = () => {
  const requests =
    JSON.parse(
      localStorage.getItem("requests")
    ) || [];

  return requests;
};

export const addRequest = (request) => {

  const requests =
    JSON.parse(
      localStorage.getItem("requests")
    ) || [];

  requests.push(request);

  localStorage.setItem(
    "requests",
    JSON.stringify(requests)
  );
};

export const updateRequestStatus = (
  passNo,
  status
) => {

  const requests =
    JSON.parse(
      localStorage.getItem("requests")
    ) || [];

  const updatedRequests =
    requests.map((request) =>
      request.passNo === passNo
        ? {
            ...request,
            status,
          }
        : request
    );

  localStorage.setItem(
    "requests",
    JSON.stringify(updatedRequests)
  );
};

export const deleteRequest = (
  passNo
) => {

  const requests =
    JSON.parse(
      localStorage.getItem("requests")
    ) || [];

  const updatedRequests =
    requests.filter(
      (request) =>
        request.passNo !== passNo
    );

  localStorage.setItem(
    "requests",
    JSON.stringify(updatedRequests)
  );
};

export const getRequestByPassNo = (
  passNo
) => {

  const requests =
    JSON.parse(
      localStorage.getItem("requests")
    ) || [];

  return requests.find(
    (request) =>
      request.passNo === passNo
  );
};

export const clearAllRequests = () => {

  localStorage.removeItem(
    "requests"
  );
};
export const updateRequestWithRemarks = (
  passNo,
  status,
  remarks
) => {

  let requests =
    JSON.parse(
      localStorage.getItem("requests")
    ) || [];

  requests = requests.map(
    (request) =>
      request.passNo === passNo
        ? {
            ...request,
            status,
            approverRemarks: remarks,
            approvedDate:
              new Date().toLocaleDateString(),

            approvedBy:
              JSON.parse(
                localStorage.getItem(
                  "loggedInUser"
                )
              )?.name || "Approver"
          }
        : request
  );

  localStorage.setItem(
    "requests",
    JSON.stringify(requests)
  );
};
export function generatePassNumber(
  prefix
) {

  const requests =
    getRequests();

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

  const sameTypeToday =
    requests.filter(
      (r) =>
        r.passNo?.startsWith(
          `${prefix}_${datePart}`
        )
    );

  const counter =
    String(
      sameTypeToday.length + 1
    ).padStart(4, "0");

  return `${prefix}_${datePart}_${counter}`;

};

export const markEntry = (
  passNo,
  securityUser
) => {

  const requests =
    getRequests();

  const updated =
    requests.map((request) =>

      request.passNo === passNo
        ? {
            ...request,
            gateStatus: "INSIDE",

            entryStatus: true,

            entryTime:
              new Date().toLocaleTimeString(),

            enteredBy:
              securityUser,
          }
        : request

    );

  localStorage.setItem(
    "requests",
    JSON.stringify(updated)
  );
  addAuditLog(

    securityUser,

    "ENTRY_RECORDED",

    passNo

  );

};

export const markExit = (
  passNo,
  securityUser
) => {

  const requests =
    getRequests();

  const updated =
    requests.map((request) =>

      request.passNo === passNo
        ? {
            ...request,

            gateStatus:
              "COMPLETED",

            exitStatus: true,

            exitTime:
              new Date().toLocaleTimeString(),

            exitedBy:
              securityUser,
          }
        : request

    );

  localStorage.setItem(
    "requests",
    JSON.stringify(updated)
  );

  addAuditLog(

    securityUser,

    "EXIT_RECORDED",

    passNo

  );

};

export function updateRequest(
  passNo,
  updates
) {

  const requests =
    getRequests();

  const updated =
    requests.map(
      (request) =>

        request.passNo === passNo
          ? {
              ...request,
              ...updates,
            }
          : request
    );

  localStorage.setItem(
    "requests",
    JSON.stringify(updated)
  );

}
