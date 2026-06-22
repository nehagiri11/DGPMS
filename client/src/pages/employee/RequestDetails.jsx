import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { mapApiPass } from "../../utils/passMapper";

function RequestDetails() {
  const [mobileOpen, setMobileOpen] =
  useState(false);

  const { passNo } = useParams();

  const loggedInUser =
    JSON.parse(
      localStorage.getItem("loggedInUser")
    ) ||
    JSON.parse(
      localStorage.getItem("user")
    );

  const role =
    loggedInUser?.role || "REQUESTER";

  const [request, setRequest] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const loadRequest = async () => {

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

        setRequest(
          mapApiPass(response.data.pass)
        );

      } catch {

        setRequest(null);

      } finally {

        setLoading(false);

      }

    };

    loadRequest();

  }, [passNo]);

  if (loading) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold">
          Loading Request...
        </h1>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold">
          Request Not Found
        </h1>
      </div>
    );
  }

  return (
    <div className="flex">

      <Sidebar role={role} 
      mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen}/>

      <div className="flex-1 bg-slate-100 min-h-screen">

        <Navbar role={role} 
        mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen}/>

        <div className="p-6">

          {/* Header */}

          <div className="mb-8">

            <h1 className="text-4xl font-bold text-slate-800">
              Request Details
            </h1>

            <p className="text-slate-500 mt-2">
              View complete gate pass information
            </p>

          </div>

          {/* Summary */}

          <div
            className="
              bg-white
              rounded-3xl
              shadow-xl
              border
              border-slate-200
              p-8
              mb-8
            "
          >

            <div className="flex justify-between items-center mb-8">

              <div>

                <h2 className="text-3xl font-bold">
                  {request.passNo}
                </h2>

                <p className="text-slate-500">
                  Gate Pass Summary
                </p>

              </div>

              <span
                className={`px-5 py-2 rounded-full font-semibold
                ${
                  request.status === "Approved"
                    ? "bg-green-100 text-green-700"
                    : request.status === "Rejected"
                    ? "bg-red-100 text-red-700"
                    : request.status === "Expired"
                    ? "bg-slate-200 text-slate-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {request.status}
              </span>

            </div>

            <div className="grid md:grid-cols-4 gap-6">

              <div className="bg-slate-50 rounded-2xl p-5">

                <p className="text-gray-500 text-sm">
                  Pass Type
                </p>

                <p className="font-bold text-lg mt-2">
                  {request.type}
                </p>

              </div>

              <div className="bg-slate-50 rounded-2xl p-5">

                <p className="text-gray-500 text-sm">
                  Requester
                </p>

                <p className="font-bold text-lg mt-2">
                  {request.requester}
                </p>

              </div>

              <div className="bg-slate-50 rounded-2xl p-5">

                <p className="text-gray-500 text-sm">
                  Request Date
                </p>

                <p className="font-bold text-lg mt-2">
                  {request.date}
                </p>

              </div>

              <div className="bg-slate-50 rounded-2xl p-5">

                <p className="text-gray-500 text-sm">
                  Pass Number
                </p>

                <p className="font-bold text-lg mt-2">
                  {request.passNo}
                </p>

              </div>

            </div>

          </div>

          {request.type === "Visitor" && (

<div className="bg-white rounded-3xl shadow-xl p-8 mb-8">

  <h2 className="text-2xl font-bold mb-6">
    Visitor Information
  </h2>

  <div className="grid md:grid-cols-2 gap-6">

    <div>
      <p className="text-gray-500">
        Host Name
      </p>

      <p className="font-semibold">
        {request.hostName}
      </p>
    </div>

    <div>
      <p className="text-gray-500">
        Department
      </p>

      <p className="font-semibold">
        {request.hostDepartment}
      </p>
    </div>

    <div>
      <p className="text-gray-500">
        Purpose
      </p>

      <p className="font-semibold">
        {request.purpose}
      </p>
    </div>

    <div>
      <p className="text-gray-500">
        Vehicle Number
      </p>

      <p className="font-semibold">
        {request.vehicleNo}
      </p>
    </div>

  </div>

</div>

)}

{request.type === "Visitor" &&
request.visitors?.length > 0 && (

<div className="bg-white rounded-3xl shadow-xl p-8 mb-8">

  <h2 className="text-2xl font-bold mb-6">
    Visitors
  </h2>

  {request.visitors.map(
    (visitor, index) => (

      <div
        key={index}
        className="border rounded-xl p-4 mb-4"
      >

        <h3 className="font-bold mb-2">
          Visitor {index + 1}
        </h3>

        <p>
          <strong>Name:</strong>{" "}
          {visitor.name}
        </p>

        <p>
          <strong>Company:</strong>{" "}
          {visitor.company}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {visitor.email}
        </p>

        <p>
          <strong>Contact:</strong>{" "}
          {visitor.contact}
        </p>

      </div>

    )
  )}

</div>

)}

{request.type === "CKD" && (

<div className="bg-white rounded-3xl shadow-xl p-8 mb-8">

  <h2 className="text-2xl font-bold mb-6">
    CKD Information
  </h2>

  <div className="grid md:grid-cols-2 gap-6">

    <div>
      <p className="text-gray-500">
        Company Name
      </p>

      <p className="font-semibold">
        {request.companyName}
      </p>
    </div>

    <div>
      <p className="text-gray-500">
        Driver Name
      </p>

      <p className="font-semibold">
        {request.driverName}
      </p>
    </div>

    <div>
      <p className="text-gray-500">
        Driver Number
      </p>

      <p className="font-semibold">
        {request.driverNumber}
      </p>
    </div>

    <div>
      <p className="text-gray-500">
        Truck Number
      </p>

      <p className="font-semibold">
        {request.truckNumber}
      </p>
    </div>

    <div>
      <p className="text-gray-500">
        Seal Number
      </p>

      <p className="font-semibold">
        {request.sealNumber}
      </p>
    </div>

  </div>

</div>

)}

{request.type === "CKD" &&
request.items?.length > 0 && (

<div className="bg-white rounded-3xl shadow-xl p-8 mb-8">

  <h2 className="text-2xl font-bold mb-6">
    Material Details
  </h2>

  <table className="w-full">

    <thead>

      <tr className="bg-slate-100">

        <th className="p-3 text-left">
          Description
        </th>

        <th className="p-3 text-left">
          Quantity
        </th>

        <th className="p-3 text-left">
          Remarks
        </th>

      </tr>

    </thead>

    <tbody>

      {request.items.map(
        (item, index) => (

          <tr key={index}>

            <td className="p-3">
              {item.itemDescription}
            </td>

            <td className="p-3">
              {item.quantity}
            </td>

            <td className="p-3">
              {item.remarks}
            </td>

          </tr>

        )
      )}

    </tbody>

  </table>

</div>

)}

{request.type === "Regular" && (

<div className="bg-white rounded-3xl shadow-xl p-8 mb-8">

  <h2 className="text-2xl font-bold mb-6">
    Regular Pass Information
  </h2>

  <div className="grid md:grid-cols-2 gap-6">

    <div>
      <p className="text-gray-500">
        Company Name
      </p>

      <p className="font-semibold">
        {request.companyName}
      </p>
    </div>

    <div>
      <p className="text-gray-500">
        Driver Name
      </p>

      <p className="font-semibold">
        {request.driverName}
      </p>
    </div>

    <div>
      <p className="text-gray-500">
        Driver Number
      </p>

      <p className="font-semibold">
        {request.driverNumber}
      </p>
    </div>

    <div>
      <p className="text-gray-500">
        Vehicle Number
      </p>

      <p className="font-semibold">
        {request.vehicleNumber}
      </p>
    </div>

    <div>
      <p className="text-gray-500">
        Category
      </p>

      <p className="font-semibold">
        {request.category}
      </p>
    </div>

  </div>

</div>

)}

          
          {/* Approval Information */}

          {request.status === "Expired" && (

            <div
              className="
                bg-slate-100
                rounded-3xl
                p-8
                shadow-lg
                border
                border-slate-200
                mb-8
              "
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Request Expired
                  </h2>
                  <p className="text-slate-600 mt-2">
                    This request was not approved within its valid date.
                  </p>
                </div>
                <span className="px-4 py-2 rounded-full font-semibold bg-slate-200 text-slate-700">
                  Expired
                </span>
              </div>
            </div>

          )}

          {["Approved", "Rejected"].includes(request.status) && (

            <div
              className="
                bg-gradient-to-r
                from-green-50
                to-blue-50
                rounded-3xl
                p-8
                shadow-lg
                border
                border-slate-200
                mb-8
              "
            >

              <div className="flex justify-between items-center mb-6">

                <h2 className="text-2xl font-bold text-slate-800">
                  Approval Information
                </h2>

                <span
                  className={`px-4 py-2 rounded-full font-semibold
                  ${
                    request.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {request.status}
                </span>

              </div>

              <div className="grid md:grid-cols-3 gap-6">

                <div className="bg-white rounded-2xl p-5 shadow">

                  <p className="text-gray-500 text-sm">
                    Approved By
                  </p>

                  <p className="font-bold text-lg mt-2">
                    {request.approvedBy || "Manager"}
                  </p>

                </div>

                <div className="bg-white rounded-2xl p-5 shadow">

                  <p className="text-gray-500 text-sm">
                    Approval Date
                  </p>

                  <p className="font-bold text-lg mt-2">
                    {request.approvedDate || "N/A"}
                  </p>

                </div>

                <div className="bg-white rounded-2xl p-5 shadow">

                  <p className="text-gray-500 text-sm">
                    Approver Remarks
                  </p>

                  <p className="font-bold mt-2">
                    {request.approverRemarks ||
                      "No remarks provided"}
                  </p>

                </div>

              </div>

            </div>

          )}

          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              Security Action Logs
            </h2>

            {request.entryExitLogs?.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-3 text-left">
                      Action
                    </th>
                    <th className="p-3 text-left">
                      Security User
                    </th>
                    <th className="p-3 text-left">
                      Gate Status
                    </th>
                    <th className="p-3 text-left">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {request.entryExitLogs.map((log) => (
                    <tr
                      key={log.log_id}
                      className="border-b"
                    >
                      <td className="p-3">
                        {log.action}
                      </td>
                      <td className="p-3">
                        {log.securityUserName ||
                          log.security_user_name ||
                          "-"}
                      </td>
                      <td className="p-3">
                        {log.gateStatusAfter ||
                          log.gate_status_after ||
                          "-"}
                      </td>
                      <td>
  {new Date(log.created_at)
    .toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }
    )}
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-slate-500">
                No security entry/exit activity recorded yet.
              </p>
            )}
          </div>

          {/* Print Button */}

          {request.status === "Approved" && (

 <div className="flex justify-center mt-5">

  <button
    onClick={() =>
      window.open(
        `/print-pass/${request.passNo}`,
        "_blank"
      )
    }
    className="
      bg-indigo-600
      hover:bg-indigo-700
      text-white
      px-8
      py-3
      rounded-lg
      font-medium
      shadow-md
    "
  >
    Print Pass
  </button>

</div>



          )}

        </div>

      </div>

    </div>
  );
}

export default RequestDetails;

