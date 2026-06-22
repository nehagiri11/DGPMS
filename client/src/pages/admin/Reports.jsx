import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import TableShell from "../../components/TableShell";
import PaginationControls from "../../components/PaginationControls";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { mapApiPass } from "../../utils/passMapper";
import { useNavigate } from "react-router-dom";

function Reports() {
  const [mobileOpen, setMobileOpen] =
  useState(false);

  const navigate =
    useNavigate();

  const [requests, setRequests] =
    useState([]);
  const [loading, setLoading] =
    useState(true);

  const [selectedType,
  setSelectedType] =
  useState("ALL");

  const [selectedStatus,
  setSelectedStatus] =
  useState("ALL");

  const [passNumberFilter,
  setPassNumberFilter] =
  useState("");

  const [dateFilter,
  setDateFilter] =
  useState("");

  const [requesterFilter,
  setRequesterFilter] =
  useState("");
  const [page, setPage] =
    useState(1);
  const pageSize = 10;

  useEffect(() => {

    const loadRequests = async () => {

      try {

        const token =
          localStorage.getItem("token");

        const response =
          await axios.get(
            "/api/passes",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        setRequests(
          response.data.passes.map(
            mapApiPass
          )
        );

      } catch {

        setRequests([]);

      } finally {

        setLoading(false);

      }

    };

    loadRequests();

  }, []);

  const visitorPasses =
    requests.filter(
      (r) =>
        r.type === "Visitor"
    );

  const regularPasses =
    requests.filter(
      (r) =>
        r.type === "Regular"
    );

  const ckdPasses =
    requests.filter(
      (r) =>
        r.type === "CKD"
    );

  const approvedPasses =
    requests.filter(
      (r) =>
        r.status ===
        "Approved"
    );

  const pendingPasses =
    requests.filter(
      (r) =>
        r.status ===
        "Pending"
    );

  const insidePasses =
    requests.filter(
      (r) =>
        r.gateStatus ===
        "INSIDE"
    );

  const completedPasses =
    requests.filter(
      (r) =>
        r.gateStatus ===
        "COMPLETED"
    );

  const filteredRequests =
    requests.filter(
      (request) => {

        const matchesType =
          selectedType ===
            "ALL" ||
          request.type ===
            selectedType;

        const matchesStatus =
          selectedStatus ===
            "ALL" ||
          request.status ===
            selectedStatus;

        const matchesPassNumber =
          !passNumberFilter ||
          request.passNo
            ?.toLowerCase()
            .includes(
              passNumberFilter.toLowerCase()
            );

        const matchesDate =
          !dateFilter ||
          request.date ===
            dateFilter ||
          request.arrivalDate ===
            dateFilter ||
          request.departureDate ===
            dateFilter;

        const matchesRequester =
          !requesterFilter ||
          request.requester
            ?.toLowerCase()
            .includes(
              requesterFilter.toLowerCase()
            );

        return (
          matchesType &&
          matchesStatus &&
          matchesPassNumber &&
          matchesDate &&
          matchesRequester
        );

      }
    );

  const paginatedRequests =
    filteredRequests.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

  const exportPDF = () => {

    const doc =
      new jsPDF();

    doc.setFontSize(18);

    doc.text(
      "DGPMS Report",
      20,
      20
    );

    let y = 40;

    filteredRequests.forEach(
      (request) => {

        doc.text(
          `${request.passNo} | ${request.type} | ${request.requester} | ${request.status}`,
          20,
          y
        );

        y += 10;

      }
    );

    doc.save(
      "DGPMS_Report.pdf"
    );

  };
const exportExcel = async () => {

  try {

    const token =
      localStorage.getItem("token");

    const response =
      await axios.get(
        "/api/reports/export",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const workbook =
      XLSX.utils.book_new();

    const allPassesSheet =
      XLSX.utils.json_to_sheet(
        response.data.allPasses
      );

    XLSX.utils.book_append_sheet(
      workbook,
      allPassesSheet,
      "All Passes"
    );

    const visitorSheet =
      XLSX.utils.json_to_sheet(
        response.data.visitorPasses
      );

    XLSX.utils.book_append_sheet(
      workbook,
      visitorSheet,
      "Visitor Passes"
    );

    const regularSheet =
      XLSX.utils.json_to_sheet(
        response.data.regularPasses
      );

    XLSX.utils.book_append_sheet(
      workbook,
      regularSheet,
      "Regular Passes"
    );

    const ckdSheet =
      XLSX.utils.json_to_sheet(
        response.data.ckdPasses
      );

    XLSX.utils.book_append_sheet(
      workbook,
      ckdSheet,
      "CKD Passes"
    );

    const passItemsSheet =
      XLSX.utils.json_to_sheet(
        response.data.passItems
      );

    XLSX.utils.book_append_sheet(
      workbook,
      passItemsSheet,
      "Pass Items"
    );

    const gateLogsSheet =
      XLSX.utils.json_to_sheet(
        response.data.gateLogs
      );

    XLSX.utils.book_append_sheet(
      workbook,
      gateLogsSheet,
      "Gate Logs"
    );

    XLSX.writeFile(
      workbook,
      `DGPMS_Report_${
        new Date()
          .toISOString()
          .split("T")[0]
      }.xlsx`
    );

  } catch (error) {

    console.log(error);

    alert(
      "Failed to export report"
    );

  }

};
  

  return (

    <div className="flex">

      <Sidebar role="ADMIN" 
      mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen}/>

      <div className="flex-1 min-w-0 bg-slate-100 min-h-screen">

        <Navbar role="ADMIN" 
        mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen}/>

        <div className="p-6">

          <h1 className="text-3xl font-bold mb-8">

            Reports Dashboard

          </h1>

          {/* STATS */}

          <div className="grid md:grid-cols-4 gap-6 mb-8">

            <div className="bg-white p-6 rounded-2xl shadow-lg">

              <h3>Total Passes</h3>

              <p className="text-4xl font-bold text-blue-600">

                {requests.length}

              </p>

            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">

              <h3>Visitor Passes</h3>

              <p className="text-4xl font-bold text-green-600">

                {visitorPasses.length}

              </p>

            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">

              <h3>Regular Passes</h3>

              <p className="text-4xl font-bold text-indigo-600">

                {regularPasses.length}

              </p>

            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">

              <h3>CKD Passes</h3>

              <p className="text-4xl font-bold text-orange-600">

                {ckdPasses.length}

              </p>

            </div>

          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">

            <div className="bg-white p-6 rounded-2xl shadow-lg">

              <h3>Approved</h3>

              <p className="text-4xl font-bold text-green-600">

                {approvedPasses.length}

              </p>

            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">

              <h3>Pending</h3>

              <p className="text-4xl font-bold text-yellow-600">

                {pendingPasses.length}

              </p>

            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">

              <h3>Inside</h3>

              <p className="text-4xl font-bold text-blue-600">

                {insidePasses.length}

              </p>

            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">

              <h3>Completed</h3>

              <p className="text-4xl font-bold text-red-600">

                {completedPasses.length}

              </p>

            </div>

          </div>

          {/* FILTERS */}

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">

            <h2 className="text-xl font-bold mb-4">

              Search & Filter

            </h2>

            <div className="grid md:grid-cols-3 gap-4 mb-4">

              <input
                type="text"
                placeholder="Pass Number"
                value={passNumberFilter}
                onChange={(e) => {
                  setPassNumberFilter(
                    e.target.value
                  );
                  setPage(1);
                }}
                className="border p-3 rounded-lg"
              />

              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(
                    e.target.value
                  );
                  setPage(1);
                }}
                className="border p-3 rounded-lg"
              />

              <input
                type="text"
                placeholder="Requester"
                value={requesterFilter}
                onChange={(e) => {
                  setRequesterFilter(
                    e.target.value
                  );
                  setPage(1);
                }}
                className="border p-3 rounded-lg"
              />

            </div>

            <div className="grid md:grid-cols-2 gap-4">

              <select
                value={
                  selectedType
                }
                onChange={(e) => {
                  setSelectedType(
                    e.target.value
                  );
                  setPage(1);
                }}
                className="border p-3 rounded-lg"
              >

                <option value="ALL">
                  All Types
                </option>

                <option value="Visitor">
                  Visitor
                </option>

                <option value="Regular">
                  Regular
                </option>

                <option value="CKD">
                  CKD
                </option>

              </select>

              <select
                value={
                  selectedStatus
                }
                onChange={(e) => {
                  setSelectedStatus(
                    e.target.value
                  );
                  setPage(1);
                }}
                className="border p-3 rounded-lg"
              >

                <option value="ALL">
                  All Status
                </option>

                <option value="Approved">
                  Approved
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Rejected">
                  Rejected
                </option>

              </select>

            </div>

            <button
              onClick={() => {
                setPassNumberFilter("");
                setDateFilter("");
                setRequesterFilter("");
                setSelectedType("ALL");
                setSelectedStatus("ALL");
                setPage(1);
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300"
            >
              Clear Filters
            </button>

          </div>

          {/* EXPORT */}

          <div className="flex gap-4 mb-8">

            <button
              onClick={
                exportPDF
              }
              className="
                bg-red-600
                text-white
                px-6
                py-3
                rounded-lg
              "
            >
              Export PDF
            </button>

            <button
              onClick={
  exportExcel
}
              className="
                bg-green-600
                text-white
                px-6
                py-3
                rounded-lg
              "
            >
              Export Excel
            </button>

          </div>

          {/* TABLE */}

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {loading ? (
              <LoadingState message="Loading report data..." />
            ) : (
            <>
            <TableShell>

            <table className="w-full">

              <thead>

                <tr className="bg-slate-100">

                  <th className="p-4">
                    Pass No
                  </th>

                  <th className="p-4">
                    Type
                  </th>

                  <th className="p-4">
                    Requester
                  </th>

                  <th className="p-4">
                    Status
                  </th>

                  <th className="p-4">
                    Gate Status
                  </th>

                  <th className="p-4">
                    Entry Time
                  </th>

                  <th className="p-4">
                    Exit Time
                  </th>

                  <th className="p-4">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {paginatedRequests.length > 0 ? paginatedRequests.map(
                  (
                    request
                  ) => (

                    <tr
                      key={
                        request.passNo
                      }
                      className="border-b"
                    >

                      <td className="p-4">

                        {
                          request.passNo
                        }

                      </td>

                      <td className="p-4">

                        {
                          request.type
                        }

                      </td>

                      <td className="p-4">

                        {
                          request.requester
                        }

                      </td>

                      <td className="p-4">

                        {
                          request.status
                        }

                      </td>

                      <td className="p-4">

                        {
                          request.gateStatus ||
                          "-"
                        }

                      </td>

                      <td className="p-4">

                        {
                          request.entryTime ||
                          "-"
                        }

                      </td>

                      <td className="p-4">

                        {
                          request.exitTime ||
                          "-"
                        }

                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/pass-details/${request.passNo}`
                            )
                          }
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          View Details
                        </button>
                      </td>

                    </tr>

                  )
                ) : (
                  <tr>
                    <td colSpan="8" className="p-0">
                      <EmptyState
                        title="No Report Data"
                        message="Try changing the filters or creating a new pass."
                      />
                    </td>
                  </tr>
                )}

              </tbody>

            </table>
            </TableShell>
            <PaginationControls
              page={page}
              pageSize={pageSize}
              totalItems={filteredRequests.length}
              onPageChange={setPage}
            />
            </>
            )}

          </div>

        </div>

      </div>

    </div>

  );

}

export default Reports;

