import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import TableShell from "../../components/TableShell";
import PaginationControls from "../../components/PaginationControls";
import { useToast } from "../../components/ToastProvider";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Html5Qrcode,
} from "html5-qrcode";
import { mapApiPass } from "../../utils/passMapper";
import {
  FaSignInAlt,
  FaSignOutAlt,
} from "react-icons/fa";

function SecurityDashboard() {
  const showToast =
    useToast();

  const [mobileOpen, setMobileOpen] =
  useState(false);

 
  const todayDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [scanMode, setScanMode] =
  useState(null);
  const [scanError, setScanError] =
  useState("");

  const [scannerVisible,
  setScannerVisible] =
  useState(false);

  const [selectedView,
  setSelectedView] =
  useState(null);

  const [requests, setRequests] =
    useState([]);
  const [gateLogs, setGateLogs] =
    useState([]);
  const [activityDate, setActivityDate] =
    useState(todayDateString());
  const [activityPassNo, setActivityPassNo] =
    useState("");
  const [loading, setLoading] =
    useState(true);
  const [activityPage, setActivityPage] =
    useState(1);
  const [selectedPage, setSelectedPage] =
    useState(1);
  const pageSize = 10;

  const loadRequests = async (
    filters = {
      date: activityDate,
      passNo: activityPassNo
    }
  ) => {

    try {

      const token =
        localStorage.getItem("token");

      const [passesResponse, logsResponse] =
        await Promise.all([
          axios.get(
            "/api/passes",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          ),
          axios.get(
            "/api/passes/gate-logs/recent",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              },
              params: {
                date:
                  filters.date ||
                  todayDateString(),
                passNo:
                  filters.passNo ||
                  undefined
              }
            }
          )
        ]);

      setRequests(
        passesResponse.data.passes.map(
          mapApiPass
        )
      );

      setGateLogs(
        logsResponse.data.logs || []
      );

    } catch (error) {

      setRequests([]);
      setGateLogs([]);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadRequests({
      date: activityDate,
      passNo: activityPassNo
    });

  }, []);

  const approvedRequests =
  requests.filter(
    (r) =>
      r.status === "Approved" &&
      r.gateStatus === "NOT_USED"
  );

  const insideRequests =
  requests.filter(
    (r) =>
      r.gateStatus ===
      "INSIDE"
  );

  const completedRequests =
  requests.filter(
    (r) =>
      r.gateStatus ===
        "CHECKED_OUT" &&
      r.status !==
        "COMPLETED"
  );

  const fullyCompletedRequests =
  requests.filter(
    (r) =>
      r.gateStatus ===
      "COMPLETED"
  );

  const formatLogDate = (value) => {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString();
  };

  const formatLogTime = (value) => {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };
  const selectedRequests =
    selectedView === "APPROVED"
      ? approvedRequests
      : selectedView === "INSIDE"
      ? insideRequests
      : selectedView === "COMPLETED"
      ? completedRequests
      : selectedView === "FULLY_COMPLETED"
      ? fullyCompletedRequests
      : [];

  const paginatedGateLogs =
    gateLogs.slice(
      (activityPage - 1) * pageSize,
      activityPage * pageSize
    );

  const paginatedSelectedRequests =
    selectedRequests.slice(
      (selectedPage - 1) * pageSize,
      selectedPage * pageSize
    );

  useEffect(() => {
    setActivityPage(1);
  }, [
    activityDate,
    activityPassNo,
    gateLogs.length,
  ]);

  useEffect(() => {
    setSelectedPage(1);
  }, [
    selectedView,
    selectedRequests.length,
  ]);
  
 useEffect(() => {

  if (!scannerVisible) return;

  const scanner =
    new Html5Qrcode(
      "reader"
    );

  const stopScanner = () =>
    scanner.stop()
      .then(() => scanner.clear())
      .catch(() => {});

  scanner.start(
    {
      facingMode: {
        ideal: "environment"
      }
    },
    {
      fps: 10,
      qrbox: {
        width: 250,
        height: 250
      },
      aspectRatio: 1
    },

    async (decodedText) => {

      const passNo =
  decodedText.trim();

      const request =
        requests.find(
          (r) =>
            r.passNo === passNo
        );

      if (!request) {

        setScanError(
   "QR code not recognized."
);

        return;

      }
      const today =
  new Date()
    .toISOString()
    .split("T")[0];

if (
  request.type ===
  "Visitor"
) {

  if (
    today < request.arrivalDate ||
    today > request.departureDate
  ) {

   setScanError(
   "This visitor pass has expired."
);

 stopScanner();

setScannerVisible(false);

    return;

  }

}
if (
  request.type === "Regular" ||
  request.type === "CKD"
) {

  if (
    request.date !== today
  ) {

    setScanError(
 "This pass is no longer valid."
);

stopScanner();

setScannerVisible(false);

    return;

  }

}
if (
  request.type !== "Visitor" &&
  request.gateStatus ===
  "COMPLETED"
) {

  setScanError(
  "This pass has already been checked out."
);

stopScanner();

setScannerVisible(false);

return;

}

      if (
        scanMode === "ENTRY"
      ) {

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

        } catch (error) {

          setScanError(
            error.response?.data?.message ||
            "Entry failed"
          );

          stopScanner();

          setScannerVisible(false);

          return;

        }

       setScanError("");
showToast?.(
  "Entry Recorded Successfully",
  "success"
);

      }

      if (
        scanMode === "EXIT"
      ) {

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

        } catch (error) {

          setScanError(
            error.response?.data?.message ||
            "Exit failed"
          );

          stopScanner();

          setScannerVisible(false);

          return;

        }

       setScanError("");
showToast?.(
  "Exit Recorded Successfully",
  "success"
);

      }

      stopScanner();

      setScannerVisible(
        false
      );

      loadRequests();

    },

    () => {}

  ).catch((error) => {
    setScanError(
      error?.message ||
      "Unable to start camera scanner."
    );
    setScannerVisible(false);
  });

  return () => {

    stopScanner();

  };

}, [scannerVisible, requests, scanMode]);

  return (

    <div className="flex ">

      <Sidebar role="SECURITY" 
      mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen}/>

      <div className="flex-1 min-w-0 bg-slate-100 min-h-screen ">

        <Navbar role="SECURITY" 
        mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen}/>

        <div className="
  p-4
  md:p-6
  overflow-x-hidden
">

          <h1 className="
  text-2xl
  md:text-3xl
  font-bold
  mb-6
">
            Security Dashboard
          </h1>

          {loading && (
            <LoadingState message="Loading gate passes..." />
          )}

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

  <button
    onClick={() => {

      setScanError("");
      setScanMode("ENTRY");
      setScannerVisible(true);

    }}
    className="
      bg-gradient-to-r
      from-green-500
      to-green-700
      text-white
      rounded-2xl
      p-8
      shadow-xl
      hover:shadow-2xl
      transition-all
      duration-300
      md:hover:scale-105
    "
  >

    <FaSignInAlt
      size={40}
      className="mb-4"
    />

    <h2 className="text-lg md:text-3xl font-bold">
      Scan In
    </h2>

    <p className="mt-2 text-green-100">
      Register Entry
    </p>

  </button>

  <button
    onClick={() => {

      setScanError("");
      setScanMode("EXIT");
      setScannerVisible(true);

    }}
    className="
      bg-gradient-to-r
      from-red-500
      to-red-700
      text-white
      rounded-2xl
      p-8
      shadow-xl
      hover:shadow-2xl
      transition-all
      duration-300
      md:hover:scale-105
    "
  >

    <FaSignOutAlt
      size={40}
      className="mb-4"
    />

    <h2 className="text-lg md:text-3xl font-bold">
      Scan Out
    </h2>

    <p className="mt-2 text-red-100">
      Register Exit
    </p>

  </button>

</div>
{scannerVisible && (

<div className="
  bg-white
  rounded-2xl
  shadow-lg
  p-6
  mb-8
">

<h2 className="
  text-2xl
  font-bold
  mb-4
">

{scanMode === "ENTRY"
  ? "Scan Entry QR"
  : "Scan Exit QR"}

</h2>

<div
  id="reader"
  className="w-full max-w-md"
/>

</div>

)}

{scanError && (

  <div
    className="
      bg-red-50
      border-l-8
      border-red-600
      text-red-700
      p-5
      rounded-xl
      shadow-sm
      mb-8
    "
  >

    <h3 className="font-bold text-lg">
      Verification Failed
    </h3>

    <p className="mt-1">
      {scanError}
    </p>

    <button
      onClick={() =>
        setScanError("")
      }
      className="
        mt-4
        bg-red-600
        text-white
        px-4
        py-2
        rounded-lg
      "
    >
      Close
    </button>

  </div>

)}

          <div className="
  grid
  grid-cols-2
  md:grid-cols-4
  gap-4
">
            
           <div
  onClick={() =>
    setSelectedView("APPROVED")
  }
  className="
    bg-white
    rounded-2xl
    shadow-lg
    p-6
    cursor-pointer
    hover:shadow-xl
  "
>

              <h3 className="text-slate-500">
                Approved Passes
              </h3>

              <p className="text-4xl font-bold text-green-600 mt-2">
                {approvedRequests.length}
              </p>

            </div>

            <div
  onClick={() =>
    setSelectedView("INSIDE")
  }
  className="
    bg-white
    rounded-2xl
    shadow-lg
    p-6
    cursor-pointer
    hover:shadow-xl
  "
>

              <h3 className="text-slate-500">
                Currently Inside
              </h3>

              <p className="text-4xl font-bold text-blue-600 mt-2">
                {insideRequests.length}
              </p>

            </div>

            <div
  onClick={() =>
    setSelectedView("COMPLETED")
  }
  className="
    bg-white
    rounded-2xl
    shadow-lg
    p-6
    cursor-pointer
    hover:shadow-xl
  "
>

              <h3 className="text-slate-500">
                Checked Out
              </h3>

              <p className="text-4xl font-bold text-red-600 mt-2">
                {completedRequests.length}
              </p>

            </div>

            <div
  onClick={() =>
    setSelectedView("FULLY_COMPLETED")
  }
  className="
    bg-white
    rounded-2xl
    shadow-lg
    p-6
    cursor-pointer
    hover:shadow-xl
  "
>

              <h3 className="text-slate-500">
                Completed Passes
              </h3>

              <p className="text-4xl font-bold text-slate-600 mt-2">
                {fullyCompletedRequests.length}
              </p>

            </div>

          </div>
          <div className="mt-10">

  
</div>

<div className="
  mt-8
  bg-white
  rounded-2xl
  shadow-lg
  p-6
">

<h2 className="
  text-2xl
  font-bold
  mb-4
">
Day Wise Gate Activity
</h2>

<div className="
  grid
  md:grid-cols-3
  gap-4
  mb-5
">

  <div>
    <label className="block text-sm text-slate-500 mb-1">
      Pass Number
    </label>
    <input
      type="text"
      value={activityPassNo}
      onChange={(e) =>
        setActivityPassNo(
          e.target.value
        )
      }
      placeholder="Search pass number"
      className="
        w-full
        border
        rounded-xl
        px-4
        py-3
        shadow-sm
      "
    />
  </div>

  <div>
    <label className="block text-sm text-slate-500 mb-1">
      Activity Date
    </label>
    <input
      type="date"
      value={activityDate}
      onChange={(e) =>
        setActivityDate(
          e.target.value
        )
      }
      className="
        w-full
        border
        rounded-xl
        px-4
        py-3
        shadow-sm
      "
    />
  </div>

  <div className="
  flex
  flex-col
  md:flex-row
  items-stretch
  md:items-end
  gap-3
">
    <button
      onClick={() =>
        loadRequests({
          date: activityDate,
          passNo: activityPassNo
        })
      }
      className="
        bg-blue-600
        hover:bg-blue-700
        text-white
        px-5
        py-3
        rounded-xl
        font-semibold
      "
    >
      Apply Filter
    </button>

    <button
      onClick={() => {
        const today =
          todayDateString();
        setActivityDate(today);
        setActivityPassNo("");
        loadRequests({
          date: today,
          passNo: ""
        });
      }}
      className="
        bg-slate-200
        hover:bg-slate-300
        text-slate-700
        px-5
        py-3
        rounded-xl
        font-semibold
      "
    >
      Reset
    </button>
  </div>

</div>

<TableShell>
<div className="overflow-x-auto">
  <table className="w-full">

<thead>
<tr className="bg-slate-100">
<th className="p-3 text-left">
Date
</th>
<th className="p-3 text-left">
Pass No
</th>
<th className="p-3 text-left">
Action
</th>
<th className="p-3 text-left">
Security
</th>
<th className="p-3 text-left">
Security ID
</th>
<th className="p-3 text-left">
Time
</th>
<th className="p-3 text-left">
Gate Status
</th>
</tr>
</thead>

<tbody>
{paginatedGateLogs.length > 0 ? paginatedGateLogs.map((log) => (
<tr
  key={log.log_id}
  className="border-b"
>
<td className="p-3">
{formatLogDate(log.created_at)}
</td>
<td className="p-3">
{log.pass_no}
</td>
<td className="p-3">
{log.action}
</td>
<td className="p-3">
{log.security_user_name || "-"}
</td>
<td className="p-3">
{log.security_user_id || "-"}
</td>
<td className="p-3">
{formatLogTime(log.created_at)}
</td>
<td className="p-3">
{log.gate_status_after || "-"}
</td>
</tr>
)) : (
<tr>
<td colSpan="7" className="p-0">
<EmptyState
  title="No Gate Activity"
  message="Today's entry and exit scans will appear here."
/>
</td>
</tr>
)}
</tbody>

</table>
</div>
</TableShell>
<PaginationControls
  page={activityPage}
  pageSize={pageSize}
  totalItems={gateLogs.length}
  onPageChange={setActivityPage}
/>

</div>
{selectedView && (

<div className="
  mt-8
  bg-white
  rounded-2xl
  shadow-lg
  p-6
">

<h2 className="
  text-2xl
  font-bold
  mb-4
">

{selectedView === "APPROVED" &&
  "Approved Pass Details"}

{selectedView === "INSIDE" &&
  "Currently Inside"}

{selectedView === "COMPLETED" &&
  "Checked Out"}

{selectedView === "FULLY_COMPLETED" &&
  "Completed Passes"}

</h2>

<TableShell>
<div className="overflow-x-auto">
  <table className="w-full">

<thead>

<tr className="bg-slate-100">

<th className="p-3">
Pass No
</th>

<th className="p-3">
Type
</th>

<th className="p-3">
Requester
</th>

<th className="p-3">
Status
</th>

<th className="p-3">
Entry Time
</th>

<th className="p-3">
Exit Time
</th>

</tr>

</thead>

<tbody>

{paginatedSelectedRequests.length > 0 ? paginatedSelectedRequests.map((request) => (

<tr
key={request.passNo}
className="border-b"
>

<td className="p-3">
{request.passNo}
</td>

<td className="p-3">
{request.type}
</td>

<td className="p-3">
{request.requester}
</td>

<td className="p-3">
{request.gateStatus}
</td>

<td className="p-3">
{request.entryTime || "-"}
</td>

<td className="p-3">
{request.exitTime || "-"}
</td>

</tr>

)) : (
<tr>
<td colSpan="6" className="p-0">
<EmptyState
  title="No Passes Found"
  message="Matching gate activity will appear here."
/>
</td>
</tr>
)}

</tbody>

</table>
</div>
</TableShell>
<PaginationControls
  page={selectedPage}
  pageSize={pageSize}
  totalItems={selectedRequests.length}
  onPageChange={setSelectedPage}
/>

</div>

)}

        </div>

      </div>

    </div>

    
    

  );

}

export default SecurityDashboard;

