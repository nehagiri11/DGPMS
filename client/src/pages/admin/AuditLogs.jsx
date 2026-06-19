import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import TableShell from "../../components/TableShell";
import PaginationControls from "../../components/PaginationControls";

function AuditLogs() {
  const [mobileOpen, setMobileOpen] =
  useState(false);

  const [logs, setLogs] =
    useState([]);
  const [loading, setLoading] =
    useState(true);
  const [userFilter, setUserFilter] =
    useState("");
  const [actionFilter, setActionFilter] =
    useState("ALL");
  const [dateFilter, setDateFilter] =
    useState("");
  const [page, setPage] =
    useState(1);
  const [range, setRange] =
    useState("all");
  const pageSize = 10;

  useEffect(() => {

    const loadLogs = async () => {

      try {
        setLoading(true);

        const token =
          localStorage.getItem("token");

        const response =
          await axios.get(
            `/api/audit-logs?range=${range}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        setLogs(
          response.data.logs.map(
            (log) => ({
              timestamp:
                log.created_at,
              user:
                log.user_name,
              action:
                log.action,
              details:
                log.details
            })
          )
        );

      } catch {

        setLogs([]);

      } finally {

        setLoading(false);

      }

    };

    loadLogs();

  }, [range]);

  const formatDate = (value) => {

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

    return date.toLocaleString();

  };

  const toDateInputValue = (value) => {

    if (!value) {
      return "";
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

  };

  const actions =
    [
      "ALL",
      ...new Set(
        logs
          .map((log) => log.action)
          .filter(Boolean)
      )
    ];

  const filteredLogs =
    logs.filter((log) => {

      const matchesUser =
        !userFilter ||
        log.user
          ?.toLowerCase()
          .includes(
            userFilter.toLowerCase()
          );

      const matchesAction =
        actionFilter === "ALL" ||
        log.action === actionFilter;

      const matchesDate =
        !dateFilter ||
        toDateInputValue(
          log.timestamp
        ) === dateFilter;

      return (
        matchesUser &&
        matchesAction &&
        matchesDate
      );

    });

  const paginatedLogs =
    filteredLogs.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

  const reportCounts = {
    total: filteredLogs.length,
    created:
      filteredLogs.filter(
        (log) => log.action === "PASS_CREATED"
      ).length,
    approved:
      filteredLogs.filter(
        (log) => log.action === "PASS_APPROVED"
      ).length,
    rejected:
      filteredLogs.filter(
        (log) => log.action === "PASS_REJECTED"
      ).length,
  };

  const exportCSV = () => {

    const headers = [
      "Timestamp",
      "User",
      "Action",
      "Details"
    ];

    const rows =
      filteredLogs.map((log) => [
        formatDate(log.timestamp),
        log.user || "",
        log.action || "",
        log.details || ""
      ]);

    const csv =
      [headers, ...rows]
        .map((row) =>
          row.map((value) =>
            `"${String(value).replaceAll(
              "\"",
              "\"\""
            )}"`
          ).join(",")
        )
        .join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;"
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      `audit-logs-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);

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

            Audit Logs

          </h1>

          <div className="
            bg-white
            rounded-2xl
            shadow
            p-5
            mb-6
          ">

            <h2 className="text-xl font-bold mb-4">
              Search & Filter
            </h2>

            <div className="
              grid
              md:grid-cols-4
              gap-4
            ">

              <input
                value={userFilter}
                onChange={(e) => {
                  setUserFilter(
                    e.target.value
                  );
                  setPage(1);
                }}
                placeholder="User"
                className="border rounded-lg p-3"
              />

              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(
                    e.target.value
                  );
                  setPage(1);
                }}
                className="border rounded-lg p-3"
              >
                {actions.map((action) => (
                  <option
                    key={action}
                    value={action}
                  >
                    {action === "ALL"
                      ? "All Actions"
                      : action}
                  </option>
                ))}
              </select>
              <select
  value={range}
  onChange={(e) => {
    setRange(
      e.target.value
    );
    setPage(1);
  }}
  className="border rounded-lg p-3"
>

  <option value="all">
    All Logs
  </option>

  <option value="daily">
    Daily Logs
  </option>

  <option value="monthly">
    Monthly Logs
  </option>

  <option value="yearly">
    Yearly Logs
  </option>

</select>

              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(
                    e.target.value
                  );
                  setPage(1);
                }}
                className="border rounded-lg p-3"
              />

            </div>

            <div className="
              flex
              flex-wrap
              gap-3
              mt-4
            ">

              <button
                onClick={() => {
                  setUserFilter("");
                  setActionFilter("ALL");
                  setDateFilter("");
                  setRange("all");
                  setPage(1);
                }}
                className="
                  px-4
                  py-2
                  rounded-lg
                  bg-slate-200
                  hover:bg-slate-300
                "
              >
                Clear Filters
              </button>

              <button
                onClick={exportCSV}
                disabled={
                  filteredLogs.length === 0
                }
                className="
                  px-4
                  py-2
                  rounded-lg
                  bg-green-600
                  text-white
                  hover:bg-green-700
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                "
              >
                Export CSV
              </button>

            </div>

          </div>

          <div className="
            grid
            md:grid-cols-4
            gap-4
            mb-6
          ">
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-slate-500">
                Total Logs
              </p>
              <p className="text-2xl font-bold">
                {reportCounts.total}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-slate-500">
                Created
              </p>
              <p className="text-2xl font-bold text-blue-700">
                {reportCounts.created}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-slate-500">
                Approved
              </p>
              <p className="text-2xl font-bold text-green-700">
                {reportCounts.approved}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-slate-500">
                Rejected
              </p>
              <p className="text-2xl font-bold text-red-700">
                {reportCounts.rejected}
              </p>
            </div>
          </div>

          <div className="
            bg-white
            rounded-2xl
            shadow-lg
            overflow-hidden
          ">

            {loading ? (
              <LoadingState message="Loading audit logs..." />
            ) : (
            <>
            <TableShell>
            <table className="w-full">

              <thead>

                <tr className="bg-slate-100">

                  <th className="p-4 text-left">
                    Timestamp
                  </th>

                  <th className="p-4 text-left">
                    User
                  </th>

                  <th className="p-4 text-left">
                    Action
                  </th>

                  <th className="p-4 text-left">
                    Details
                  </th>

                </tr>

              </thead>

              <tbody>

                {paginatedLogs.length > 0 ? paginatedLogs.map(

                  (
                    log,
                    index
                  ) => (

                    <tr
                      key={index}
                      className="border-b"
                    >

                      <td className="p-4">

                        {
                          formatDate(
                            log.timestamp
                          )
                        }

                      </td>

                      <td className="p-4">

                        {
                          log.user
                        }

                      </td>

                      <td className="p-4">

                        {
                          log.action
                        }

                      </td>

                      <td className="p-4">

                        {
                          log.details
                        }

                      </td>

                    </tr>

                  )

                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="p-0"
                    >
                      <EmptyState
                        title="No Audit Logs Found"
                        message="Matching audit activity will appear here."
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
              totalItems={filteredLogs.length}
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

export default AuditLogs;
