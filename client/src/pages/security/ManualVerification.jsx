import { useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import EmptyState from "../../components/EmptyState";
import TableShell from "../../components/TableShell";
import { useToast } from "../../components/ToastProvider";
import { mapApiPass } from "../../utils/passMapper";
import {
  FaSignInAlt,
  FaSignOutAlt,
} from "react-icons/fa";

function ManualVerification() {
  const showToast =
    useToast();

  const [mobileOpen, setMobileOpen] =
  useState(false);

  const [passNo, setPassNo] =
    useState("");

  const [request, setRequest] =
    useState(null);

  const [searched, setSearched] =
    useState(false);

  const withVerificationStatus = (pass) => {

    const verifiedRequest = {
      ...pass
    };

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    if (
      verifiedRequest.type ===
      "Visitor"
    ) {

      if (
        today < verifiedRequest.arrivalDate ||
        today > verifiedRequest.departureDate
      ) {

        verifiedRequest.verificationStatus =
          "EXPIRED";

      }

    }

    if (
      verifiedRequest.type === "Regular" ||
      verifiedRequest.type === "CKD"
    ) {

      if (
        verifiedRequest.date !== today
      ) {

        verifiedRequest.verificationStatus =
          "EXPIRED";

      }

    }

    if (
      verifiedRequest.type !== "Visitor" &&
      verifiedRequest.gateStatus ===
      "COMPLETED"
    ) {

      verifiedRequest.verificationStatus =
        "USED";

    }

    if (
      !verifiedRequest.verificationStatus
    ) {

      verifiedRequest.verificationStatus =
        "VALID";

    }

    return verifiedRequest;

  };
  

  const formatLogTime = (value) => {

    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  };

    const handleSearch = async () => {

  try {

    const token =
      localStorage.getItem("token");

    const response =
      await axios.get(

        `/api/passes/verify/${passNo}`,

        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }

      );

    const verifiedRequest =
      withVerificationStatus(
        mapApiPass(
        response.data.pass
        )
      );

setRequest(
  verifiedRequest
);
setSearched(true);

  } catch (error) {

    setRequest(null);

    setSearched(true);

  }

};

  return (

    <div className="flex">

      <Sidebar role="SECURITY" 
      mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen}/>

      <div className="flex-1 bg-slate-100 min-h-screen">

        <Navbar role="SECURITY"
        mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen} />

        <div className="p-8">

          <h1 className="text-3xl font-bold mb-6">
            Manual Verification
          </h1>

          <div className="bg-white p-6 rounded-2xl shadow">

            <div className="flex gap-4">

              <input
                type="text"
                placeholder="Enter Pass Number"
                value={passNo}
                onChange={(e) =>
                  setPassNo(
                    e.target.value
                  )
                }
                className="
                  flex-1
                  border
                  rounded-lg
                  p-3
                "
              />

              <button
                onClick={
                  handleSearch
                }
                className="
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  px-6
                  rounded-lg
                "
              >
                Verify
              </button>

            </div>

          </div>

          {request && (

            <div className="bg-white rounded-2xl shadow p-6 mt-6">

              {request.verificationStatus ===
"USED" ? (

  <div className="
    bg-red-100
    text-red-700
    p-4
    rounded-xl
    mb-4
    font-bold
  ">
    PASS ALREADY USED
  </div>

) : request.verificationStatus ===
"EXPIRED" ? (

  <div className="
    bg-yellow-100
    text-yellow-700
    p-4
    rounded-xl
    mb-4
    font-bold
  ">
    PASS EXPIRED
  </div>

) : (

  <div className="
    bg-green-100
    text-green-700
    p-4
    rounded-xl
    mb-4
    font-bold
  ">
    PASS VALID
  </div>

)}
              <h2 className="text-2xl font-bold mb-4">
                Pass Found
              </h2>

              <div className="grid md:grid-cols-2 gap-6">

                <div>

                  <p className="text-gray-500">
                    Pass Number
                  </p>

                  <p className="font-bold">
                    {request.passNo}
                  </p>

                </div>

                <div>

                  <p className="text-gray-500">
                    Type
                  </p>

                  <p className="font-bold">
                    {request.type}
                  </p>

                </div>

                <div>

                  <p className="text-gray-500">
                    Requester
                  </p>

                  <p className="font-bold">
                    {request.requester}
                  </p>

                </div>

                <div>

                  <p className="text-gray-500">
                    Status
                  </p>

                  <p
                    className={`font-bold ${
                      request.status ===
                      "Approved"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {request.status}
                  </p>

                </div>

                <div>

                  <p className="text-gray-500">
                    Approved By
                  </p>

                  <p className="font-bold">
                    {request.approvedBy || "-"}
                  </p>

                </div>

                <div>

                  <p className="text-gray-500">
                    Approval Date
                  </p>

                  <p className="font-bold">
                    {request.approvedDate || "-"}
                  </p>

                </div>

                <div>

                  <p className="text-gray-500">
                    Gate Status
                  </p>

                  <p className="font-bold">
                    {request.gateStatus}
                  </p>

                </div>

                <div>

                  <p className="text-gray-500">
                    Entry Time
                  </p>

                  <p className="font-bold">
                    {request.entryTime || "-"}
                  </p>

                </div>

                <div>

                  <p className="text-gray-500">
                    Exit Time
                  </p>

                  <p className="font-bold">
                    {request.exitTime || "-"}
                  </p>

                </div>

              </div>

              {request.type ===
              "Visitor" && (

                <div className="
                  mt-6
                  bg-blue-50
                  p-4
                  rounded-xl
                ">

                  <h3 className="
                    font-bold
                    text-lg
                    mb-2
                  ">
                    Visit Validity
                  </h3>

                  <p>
                    Valid From:
                    {" "}
                    {request.arrivalDate}
                  </p>

                  <p>
                    Valid To:
                    {" "}
                    {request.departureDate}
                  </p>
                  <p className="mt-2">
  Number of Visitors:
  {" "}
  <strong>
    {request.numberOfVisitors}
  </strong>
</p>

                </div>

              )}

              <div className="
                mt-6
                bg-slate-50
                p-4
                rounded-xl
              ">

                <h3 className="
                  font-bold
                  text-lg
                  mb-3
                ">
                  Entry / Exit History
                </h3>

                <TableShell>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white">
                        <th className="p-3 text-left">
                          Action
                        </th>
                        <th className="p-3 text-left">
                          Time
                        </th>
                        <th className="p-3 text-left">
                          Security
                        </th>
                        <th className="p-3 text-left">
                          Gate Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {request.entryExitLogs?.length > 0 ? (
                        request.entryExitLogs.map((log) => (
                          <tr
                            key={log.log_id}
                            className="border-b"
                          >
                            <td className="p-3">
                              {log.action}
                            </td>
                            <td className="p-3">
                              {formatLogTime(
                                log.createdAt
                              )}
                            </td>
                            <td className="p-3">
                              {log.securityUserName ||
                                "-"}
                            </td>
                            <td className="p-3">
                              {log.gateStatusAfter ||
                                "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="p-0"
                          >
                            <EmptyState
                              title="No Gate Activity"
                              message="Entry and exit scans will appear here."
                            />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </TableShell>

              </div>
{request.verificationStatus ===
"VALID" &&
(
  request.gateStatus ===
  "NOT_USED" ||
  (
    request.type === "Visitor" &&
    request.gateStatus ===
    "CHECKED_OUT"
  )
) && (

  <button
    className="
      mt-6
      inline-flex
      items-center
      gap-3
      bg-green-600
      hover:bg-green-700
      text-white
      px-6
      py-3
      rounded-xl
      font-bold
      shadow-md
      transition
    "

    onClick={async () => {

  try {

    const token =
      localStorage.getItem("token");

    await axios.put(

      `/api/passes/${request.pass_id}/entry`,

      {},

      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }

    );

    const updated =
      await axios.get(

        `/api/passes/${request.pass_id}`,

        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }

      );

    setRequest(
      withVerificationStatus(
        mapApiPass(
          updated.data.pass
        )
      )
    );

  } catch (error) {

    showToast?.(
      error.response?.data?.message ||
      "Entry failed",
      "error"
    );

  }

}}

  >
    <FaSignInAlt />
    Scan In
  </button>

)}
{request.verificationStatus ===
"VALID" &&
request.gateStatus ===
"INSIDE" && (

  <button
  className="
    mt-6
    inline-flex
    items-center
    gap-3
    bg-red-600
    hover:bg-red-700
    text-white
    px-6
    py-3
    rounded-xl
    font-bold
    shadow-md
    transition
  "
  onClick={async () => {

  try {

    const token =
      localStorage.getItem("token");

    await axios.put(

      `/api/passes/${request.pass_id}/exit`,

      {},

      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }

    );

    const updated =
      await axios.get(

        `/api/passes/${request.pass_id}`,

        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }

      );

    setRequest(
      withVerificationStatus(
        mapApiPass(
          updated.data.pass
        )
      )
    );

  } catch (error) {

    showToast?.(
      error.response?.data?.message ||
      "Exit failed",
      "error"
    );

  }

}}

   
  >
    <FaSignOutAlt />
    Scan Out
  </button>

)}


            </div>

          )}

          {searched &&
           !request && (

            <div className="
              bg-red-100
              text-red-700
              p-4
              rounded-xl
              mt-6
              font-bold
            ">
              PASS NOT FOUND
            </div>

          )}

        </div>

      </div>

    </div>

  );

}


export default ManualVerification;

