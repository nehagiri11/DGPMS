import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import FeedbackMessage from "../../components/FeedbackMessage";
import { useToast } from "../../components/ToastProvider";
import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import axios from "axios";
import { mapApiPass } from "../../utils/passMapper";


function RequestDetails() {
  const [mobileOpen, setMobileOpen] =
  useState(false);

  const navigate = useNavigate();
  const showToast =
    useToast();

  const { passNo } = useParams();
  const [remarks, setRemarks] =
  useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [feedback, setFeedback] =
    useState(null);

  const [request, setRequest] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const approver =
    JSON.parse(
      localStorage.getItem("loggedInUser")
    ) ||
    JSON.parse(
      localStorage.getItem("user")
    );

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

  const approveRequest = async () => {
  if (actionLoading) {
    return;
  }

  setFeedback(null);
  setActionLoading(true);

  try {

    const token =
      localStorage.getItem("token");

    await axios.put(
      `/api/passes/${request.pass_id}/approve`,
      {
        approved_by:
          approver?.id,
        remarks
      },
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  } catch (error) {
  setFeedback({
    type: "error",
    message:
      error.response?.data?.message ||
      "Approval failed. Please check the backend connection."
  });
  setActionLoading(false);
  return;

  }

  showToast?.(
    "Request Approved",
    "success"
  );

  navigate("/approver/pending");
  setActionLoading(false);
};
  const rejectRequest = async () => {
  if (actionLoading) {
    return;
  }

  setFeedback(null);
  setActionLoading(true);

  try {

    const token =
      localStorage.getItem("token");

    await axios.put(
      `/api/passes/${request.pass_id}/reject`,
      {
        rejected_by:
          approver?.id,
        remarks
      },
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  } catch (error) {
  setFeedback({
    type: "error",
    message:
      error.response?.data?.message ||
      "Rejection failed. Please check the backend connection."
  });
  setActionLoading(false);
  return;

  }

  showToast?.(
    "Request Rejected",
    "success"
  );

  navigate("/approver/pending");
  setActionLoading(false);
};

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

      <Sidebar role="APPROVER"
      mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen} />

      <div className="flex-1 min-w-0 bg-slate-100 min-h-screen">

        <Navbar role="APPROVER"
        mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen} />

        <div className="p-6">

          <h1 className="text-4xl font-bold text-slate-800 mb-6">
            Request Details
          </h1>

          <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-200">

  <FeedbackMessage
    type={feedback?.type}
    message={feedback?.message}
  />

  {/* Header */}

  <div className="border-b pb-6 mb-6">

    <h2 className="text-3xl font-bold">
      {request.passNo}
    </h2>

    <div className="grid md:grid-cols-3 gap-6 mt-4">

      <div>
        <p className="text-gray-500">
          Status
        </p>

        <span
          className={`inline-block px-4 py-1 rounded-full text-sm font-semibold
          ${
            request.status === "Approved"
              ? "bg-green-100 text-green-700"
              : request.status === "Rejected"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {request.status}
        </span>
      </div>

      <div>
        <p className="text-gray-500">
          Request Date
        </p>

        <p className="font-semibold">
          {request.date}
        </p>
      </div>

      <div>
        <p className="text-gray-500">
          Requested By
        </p>

        <p className="font-semibold">
          {request.requester}
        </p>
      </div>

    </div>

  </div>

  {/* Visitor + Visit Details */}

  {request.type === "Visitor" && (

<div className="grid lg:grid-cols-2 gap-6 mb-6">

    <div className="bg-slate-50 rounded-2xl p-6">

      <h2 className="text-2xl font-bold mb-5">
        Visitor Information
      </h2>

      {request.visitors?.map(
        (visitor, index) => (

          <div
            key={index}
            className="border-b pb-4 mb-4"
          >

            <h3 className="font-bold text-lg mb-2">
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
    

    <div className="bg-slate-50 rounded-2xl p-6">

      <h2 className="text-2xl font-bold mb-5">
        Visit Information
      </h2>

      <div className="space-y-3">

        <p>
          <strong>Host Name:</strong>{" "}
          {request.hostName}
        </p>

        <p>
          <strong>Department:</strong>{" "}
          {request.hostDepartment}
        </p>

        <p>
          <strong>Purpose:</strong>{" "}
          {request.purpose}
        </p>

        <p>
          <strong>Vehicle No:</strong>{" "}
          {request.vehicleNo}
        </p>

      </div>

    </div>

  </div>
  )}

  {/* Schedule */}
  {request.type === "Visitor" && (

<div className="bg-slate-50 rounded-2xl p-6 mb-6">

    <h2 className="text-2xl font-bold mb-5">
      Schedule
    </h2>

    <div className="grid md:grid-cols-2 gap-6">

      <div>
        <p className="text-gray-500">
          Arrival Date
        </p>

        <p className="font-semibold">
          {request.arrivalDate}
        </p>
      </div>

      <div>
        <p className="text-gray-500">
          Departure Date
        </p>

        <p className="font-semibold">
          {request.departureDate}
        </p>
      </div>

    </div>

  </div>
  )}

  {request.type === "Regular" && (

<div className="bg-slate-50 rounded-2xl p-6 mb-6">

  <h2 className="text-2xl font-bold mb-5">
    Regular Pass Information
  </h2>

  <div className="grid md:grid-cols-2 gap-6">

    <div>
      <p><strong>Company:</strong> {request.companyName}</p>
      <p><strong>Driver:</strong> {request.driverName}</p>
      <p><strong>Driver Number:</strong> {request.driverNumber}</p>
      <p><strong>Vehicle Number:</strong> {request.vehicleNumber}</p>
      <p><strong>Category:</strong> {request.category}</p>
    </div>

    <div>
      <p><strong>Remarks:</strong></p>

      <textarea
        value={
          request.remarks ||
          "No remarks provided"
        }
        readOnly
        rows="5"
        className="
          w-full
          border
          rounded-xl
          p-3
          bg-white
        "
      />
    </div>

  </div>

</div>

)}

{request.type === "Regular" &&
 request.items?.length > 0 && (

<div className="bg-slate-50 rounded-2xl p-6 mb-6">

  <h2 className="text-2xl font-bold mb-5">
    Material Details
  </h2>

  <table className="w-full border">

    <thead>

      <tr className="bg-slate-200">

        <th className="border p-3">
          Item
        </th>

        <th className="border p-3">
          Quantity
        </th>

        <th className="border p-3">
          Remarks
        </th>

      </tr>

    </thead>

    <tbody>

      {request.items.map(
        (item, index) => (

          <tr key={index}>

            <td className="border p-3">
              {item.itemDescription}
            </td>

            <td className="border p-3">
              {item.quantity}
            </td>

            <td className="border p-3">
              {item.remarks}
            </td>

          </tr>

        )
      )}

    </tbody>

  </table>

</div>

)}

{request.type === "CKD" && (

<div className="bg-slate-50 rounded-2xl p-6 mb-6">

  <h2 className="text-2xl font-bold mb-5">
    CKD Information
  </h2>

  <div className="grid md:grid-cols-2 gap-6">

    <div>

      <p>
        <strong>Company:</strong>{" "}
        {request.companyName}
      </p>

      <p>
        <strong>Driver:</strong>{" "}
        {request.driverName}
      </p>

      <p>
        <strong>Driver Number:</strong>{" "}
        {request.driverNumber}
      </p>

      <p>
        <strong>Truck Number:</strong>{" "}
        {request.truckNumber}
      </p>

      <p>
        <strong>Seal Number:</strong>{" "}
        {request.sealNumber}
      </p>

    </div>

    <div>

      <textarea
        value={
          request.remarks ||
          "No remarks provided"
        }
        readOnly
        rows="5"
        className="
          w-full
          border
          rounded-xl
          p-3
          bg-white
        "
      />

    </div>

  </div>

</div>

)}

{request.type === "CKD" &&
 request.items?.length > 0 && (

<div className="bg-slate-50 rounded-2xl p-6 mb-6">

  <h2 className="text-2xl font-bold mb-5">
    Material Details
  </h2>

  <table className="w-full border">

    <thead>

      <tr className="bg-slate-200">

        <th className="border p-3">
          Item
        </th>

        <th className="border p-3">
          Quantity
        </th>

        <th className="border p-3">
          Remarks
        </th>

      </tr>

    </thead>

    <tbody>

      {request.items.map(
        (item, index) => (

          <tr key={index}>

            <td className="border p-3">
              {item.itemDescription}
            </td>

            <td className="border p-3">
              {item.quantity}
            </td>

            <td className="border p-3">
              {item.remarks}
            </td>

          </tr>

        )
      )}

    </tbody>

  </table>

</div>

)}

  {/* Employee Remarks */}

  <div className="bg-slate-50 rounded-2xl p-6 mb-6">

    <h2 className="text-2xl font-bold mb-4">
      Employee Remarks
    </h2>

    <p>
      {request.remarks ||
        "No remarks provided"}
    </p>

  </div>

  
  <div className="bg-slate-50 rounded-2xl p-6 mb-6">
    <h2 className="text-2xl font-bold mb-4">
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
              <td className="p-3">
                {log.createdAt ||
                  log.created_at ||
                  "-"}
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

  {/* Approval Decision */}

  <div>

   {request.status === "Pending" && (

  <div>

    <h2 className="text-2xl font-bold mb-4">
      Approver Remarks
    </h2>

    <textarea
      rows="4"
      value={remarks}
      onChange={(e) =>
        setRemarks(e.target.value)
      }
      placeholder="Enter remarks before approval/rejection..."
      className="
        w-full
        border
        rounded-xl
        p-4
        mb-6
        focus:ring-2
        focus:ring-blue-500
        outline-none
      "
    />

  </div>

)}
  {request.status === "Pending" ? (
      

  <div className="flex gap-4">

    <button
      onClick={approveRequest}
      disabled={actionLoading}
      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {actionLoading
        ? "Processing..."
        : "Approve Request"}
    </button>

    <button
      onClick={rejectRequest}
      disabled={actionLoading}
      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {actionLoading
        ? "Processing..."
        : "Reject Request"}
    </button>

  </div>

) : (

  <div className="bg-slate-50 rounded-2xl p-6 mb-6">

  <h2 className="text-2xl font-bold mb-6">
    Approval Information
  </h2>

  <div className="grid md:grid-cols-3 gap-6">

    <div>
      <p className="text-gray-500">
        Status
      </p>

      <p className="font-semibold">
        {request.status}
      </p>
    </div>

    <div>
      <p className="text-gray-500">
        Approved Date
      </p>

      <p className="font-semibold">
        {request.approvedDate ||
          "N/A"}
      </p>
    </div>

    <div>
      <p className="text-gray-500">
        Approver Remarks
      </p>

      <p className="font-semibold">
        {request.approverRemarks ||
          "No remarks provided"}
      </p>
    </div>

  </div>
  {request.status === "Approved" && (

  <div className="mt-6 flex justify-center">

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
      "
    >
      Print Pass
    </button>

  </div>

)}

</div>

)}

  </div>


</div>

          
        </div>

      </div>

    </div>
  );
}

export default RequestDetails;

