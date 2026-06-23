import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import TableShell from "../../components/TableShell";
import PaginationControls from "../../components/PaginationControls";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { mapApiPass } from "../../utils/passMapper";

function PendingRequests() {
  const [mobileOpen, setMobileOpen] =
  useState(false);

  const navigate = useNavigate();
  const [searchParams] =
    useSearchParams();

  const [requests, setRequests] =
    useState([]);
  const [loading, setLoading] =
    useState(true);
  const [passNumberFilter,
  setPassNumberFilter] =
    useState("");
  const [dateFilter, setDateFilter] =
    useState("");
  const [statusFilter, setStatusFilter] =
    useState(
      searchParams.get("status") ||
      "Pending"
    );
  const [typeFilter, setTypeFilter] =
    useState("All");
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

      } catch (error) {

        setRequests([]);

      } finally {

        setLoading(false);

      }

    };

    loadRequests();

  }, []);

  const filteredRequests =
    requests.filter(
      (request) => {

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

        const matchesStatus =
          statusFilter === "All" ||
          request.status ===
            statusFilter;

        const matchesType =
          typeFilter === "All" ||
          request.type ===
            typeFilter;

        const matchesRequester =
          !requesterFilter ||
          request.requester
            ?.toLowerCase()
            .includes(
              requesterFilter.toLowerCase()
            );

        return (
          matchesPassNumber &&
          matchesDate &&
          matchesStatus &&
          matchesType &&
          matchesRequester
        );

      }
    );

  const paginatedRequests =
    filteredRequests.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

  useEffect(() => {
    setPage(1);
  }, [
    passNumberFilter,
    dateFilter,
    statusFilter,
    typeFilter,
    requesterFilter,
  ]);

  return (
    <div className="flex">

      <Sidebar role="APPROVER" 
      mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen}/>

      <div className="flex-1 min-w-0 bg-slate-100 min-h-screen">

        <Navbar role="APPROVER" 
        mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen}/>

        <div className="p-6">

          <h1 className="text-3xl font-bold mb-6">
            Pending Requests
          </h1>

          <div className="bg-white rounded-2xl shadow p-5 mb-6">

            <h3 className="font-semibold text-slate-700 mb-4">
              Search & Filter
            </h3>

            <div className="grid md:grid-cols-3 gap-4 mb-4">

              <input
                type="text"
                placeholder="Pass Number"
                value={passNumberFilter}
                onChange={(e) =>
                  setPassNumberFilter(
                    e.target.value
                  )
                }
                className="border p-3 rounded-lg"
              />

              <input
                type="date"
                value={dateFilter}
                onChange={(e) =>
                  setDateFilter(
                    e.target.value
                  )
                }
                className="border p-3 rounded-lg"
              />

              <input
                type="text"
                placeholder="Requester"
                value={requesterFilter}
                onChange={(e) =>
                  setRequesterFilter(
                    e.target.value
                  )
                }
                className="border p-3 rounded-lg"
              />

            </div>

            <div className="grid md:grid-cols-2 gap-4">

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="border p-3 rounded-lg"
              >
                <option value="All">
                  All Status
                </option>
                <option value="Pending">
                  Pending
                </option>
                <option value="Approved">
                  Approved
                </option>
                <option value="Rejected">
                  Rejected
                </option>
                <option value="Expired">
                  Expired
                </option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(
                    e.target.value
                  )
                }
                className="border p-3 rounded-lg"
              >
                <option value="All">
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

            </div>

            <button
              onClick={() => {
                setPassNumberFilter("");
                setDateFilter("");
                setRequesterFilter("");
                setStatusFilter("Pending");
                setTypeFilter("All");
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300"
            >
              Clear Filters
            </button>

          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            {loading ? (
              <LoadingState message="Loading pending requests..." />
            ) : (
            <>
            <TableShell>

            <table className="w-full">

              <thead className="bg-slate-200">

                <tr>

                  <th className="p-4 text-left">
                    Pass No
                  </th>

                  <th className="text-left">
                    Type
                  </th>

                  <th className="text-left">
                    Requester
                  </th>

                  <th className="text-left">
                    Date
                  </th>

                  <th className="text-left">
                    Status
                  </th>

                  <th className="text-left">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {paginatedRequests.length > 0 ? paginatedRequests.map(
                  (request) => (

                    <tr
                      key={request.passNo}
                      className="border-t"
                    >

                      <td className="p-4">
                        {request.passNo}
                      </td>

                      <td>
                        {request.type}
                      </td>

                      <td>
                        {request.requester}
                      </td>

                      <td>
                        {request.date || "-"}
                      </td>

                      <td>
                        {request.status}
                      </td>

                      <td>

                        <button
                          onClick={() =>
                            navigate(
                              `/approver/request-details/${request.passNo}`
                            )
                          }
                          className="bg-blue-600 text-white px-3 py-1 rounded"
                        >
                          Review
                        </button>

                      </td>

                    </tr>

                  )
                ) : (
                  <tr>
                    <td colSpan="6" className="p-0">
                      <EmptyState
                        title="No Pending Requests"
                        message="Requests waiting for approval will appear here."
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

export default PendingRequests;
