import { useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import TableShell from "../../components/TableShell";
import PaginationControls from "../../components/PaginationControls";
import { useEffect } from "react";
import axios from "axios";
import { mapApiPass } from "../../utils/passMapper";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
function MyRequests() {
  const [mobileOpen, setMobileOpen] =
  useState(false);
  const navigate = useNavigate();

  const loggedInUser =
JSON.parse(
  localStorage.getItem(
    "loggedInUser"
  )
) ||
JSON.parse(
  localStorage.getItem(
    "user"
  )
);
const [requests, setRequests] =
  useState([]);
const [loading, setLoading] =
  useState(true);
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

    const myRequests =
      response.data.passes.map(
        mapApiPass
      ).filter(

        (p) =>
          p.requester_id ===
          loggedInUser.id

      );

    setRequests(
      myRequests
    );

  } catch (error) {

    console.log(error);

  } finally {

    setLoading(false);

  }

};

  useEffect(() => {

  loadRequests();

}, []);


  const [searchParams] =
  useSearchParams();

const statusFromUrl =
  searchParams.get("status");

const [statusFilter, setStatusFilter] =
  useState(
    statusFromUrl
      ? statusFromUrl.charAt(0).toUpperCase() +
          statusFromUrl.slice(1)
      : "All"
  );

const [typeFilter, setTypeFilter] =
  useState("All");

   const [searchTerm, setSearchTerm] =
  useState("");

const [dateFilter, setDateFilter] =
  useState("");

const [requesterFilter, setRequesterFilter] =
  useState("");
const [page, setPage] =
  useState(1);
const pageSize = 10;
  
  useEffect(() => {

  if (statusFromUrl) {

    setStatusFilter(
      statusFromUrl.charAt(0).toUpperCase() +
      statusFromUrl.slice(1)
    );

  }

}, [statusFromUrl]);
  
const pendingCount =
  requests.filter(
    (r) => r.status === "Pending"
  ).length;

const approvedCount =
  requests.filter(
    (r) => r.status === "Approved"
  ).length;

const rejectedCount =
  requests.filter(
    (r) => r.status === "Rejected"
  ).length;

const expiredCount =
  requests.filter(
    (r) => r.status === "Expired"
  ).length;

const filteredRequests =
  requests.filter((request) => {

    const matchesSearch =
      !searchTerm ||
      request.passNo
        ?.toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        ) ||
      request.requester
        ?.toLowerCase()
        .includes(
          searchTerm.toLowerCase()
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

    const matchesStatus =
      statusFilter === "All"
        ? true
        : request.status ===
          statusFilter;

    const matchesType =
      typeFilter === "All"
        ? true
        : request.type ===
          typeFilter;

    return (
      matchesSearch &&
      matchesDate &&
      matchesStatus &&
      matchesType &&
      matchesRequester
    );

  });

const paginatedRequests =
  filteredRequests.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

useEffect(() => {
  setPage(1);
}, [
  searchTerm,
  dateFilter,
  statusFilter,
  typeFilter,
  requesterFilter,
]);

 return (
  <div className="flex">

    <Sidebar role={loggedInUser?.role}
    mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen} />

    <div className="flex-1 min-w-0 bg-slate-100 min-h-screen">

      <Navbar role={loggedInUser?.role}
      mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen} />

      <div className="p-6">

        {/* Header */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-slate-800">
            My Requests
          </h1>

          <p className="text-slate-500 mt-2">
            Track and monitor all your gate pass requests
          </p>

        </div>

        {/* Stats */}

        <div className="grid md:grid-cols-5 gap-5 mb-8">

          <div className="bg-white rounded-xl shadow p-5">

            <h3 className="text-gray-500">
              Total Requests
            </h3>

            <p className="text-3xl font-bold text-blue-600">
              {requests.length}
            </p>

          </div>

          <div className="bg-white rounded-xl shadow p-5">

            <h3 className="text-gray-500">
              Pending
            </h3>

            <p className="text-3xl font-bold text-yellow-600">
              {pendingCount}
            </p>

          </div>

          <div className="bg-white rounded-xl shadow p-5">

            <h3 className="text-gray-500">
              Approved
            </h3>

            <p className="text-3xl font-bold text-green-600">
              {approvedCount}
            </p>

          </div>

          <div className="bg-white rounded-xl shadow p-5">

            <h3 className="text-gray-500">
              Rejected
            </h3>

            <p className="text-3xl font-bold text-red-600">
              {rejectedCount}
            </p>

          </div>

          <div className="bg-white rounded-xl shadow p-5">

            <h3 className="text-gray-500">
              Expired
            </h3>

            <p className="text-3xl font-bold text-slate-600">
              {expiredCount}
            </p>

          </div>

        </div>

        {/* Search & Filter */}

        <div className="bg-white rounded-2xl shadow p-5 mb-6">

          <h3 className="font-semibold text-slate-700 mb-4">
            Search & Filter
          </h3>

          <div className="grid md:grid-cols-3 gap-4 mb-5">

            <div>
              <label className="block text-sm text-slate-500 mb-1">
                Pass Number
              </label>

              <input
                type="text"
                placeholder="Search pass number"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl px-4 py-3 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-500 mb-1">
                Date
              </label>

              <input
                type="date"
                value={dateFilter}
                onChange={(e) =>
                  setDateFilter(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl px-4 py-3 shadow-sm"
              />
            </div>

            

          </div>

  <h3 className="font-semibold text-slate-700 mb-3">
    Status
  </h3>

  <div className="flex gap-3 flex-wrap mb-5">

    {[
      "All",
      "Pending",
      "Approved",
      "Rejected",
      "Expired",
    ].map((item) => (

      <button
        key={item}
        onClick={() =>
          setStatusFilter(item)
        }
        className={`px-5 py-2 rounded-lg font-medium transition-all ${
          statusFilter === item
            ? "bg-blue-600 text-white"
            : "bg-slate-100 hover:bg-slate-200"
        }`}
      >
        {item}
      </button>

    ))}

  </div>

  <h3 className="font-semibold text-slate-700 mb-3">
    Type
  </h3>

  <div className="flex gap-3 flex-wrap">

    {[
      "All",
      "Visitor",
      "Regular",
      "CKD",
    ].map((item) => (

      <button
        key={item}
        onClick={() =>
          setTypeFilter(item)
        }
        className={`px-5 py-2 rounded-lg font-medium transition-all ${
          typeFilter === item
            ? "bg-indigo-600 text-white"
            : "bg-slate-100 hover:bg-slate-200"
        }`}
      >
        {item}
      </button>

    ))}

  </div>

  <button
    onClick={() => {
      setSearchTerm("");
      setDateFilter("");
      setRequesterFilter("");
      setStatusFilter("All");
      setTypeFilter("All");
    }}
    className="mt-5 px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300"
  >
    Clear Filters
  </button>

</div>

        {/* Table */}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

          <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-5">

            <h2 className="text-white text-xl font-bold">
              My Gate Pass Requests
            </h2>

            <p className="text-blue-100 text-sm">
              Visitor • CKD • Regular
            </p>

          </div>

          <div className="overflow-x-auto">
          {loading ? (
            <LoadingState message="Loading your requests..." />
          ) : (
          <>
          <TableShell>

            <table className="w-full">

              <thead>

                <tr className="bg-slate-100">

                  <th className="p-4 text-left">
                    Pass No
                  </th>

                  <th className="p-4 text-left">
                    Type
                  </th>

                  <th className="p-4 text-left">
                    Date
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>

                  <th className="p-4 text-left">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {paginatedRequests.length >
                0 ? (

                  paginatedRequests.map(
                    (request) => (

                      <tr
                        key={
                          request.passNo
                        }
                        className="border-b hover:bg-slate-50"
                      >

                        <td className="p-4">

                          <button
                            onClick={() =>
                              navigate(
                                `/employee/request-details/${request.passNo}`
                              )
                            }
                            className="text-blue-600 font-semibold hover:underline"
                          >
                            {
                              request.passNo
                            }
                          </button>

                        </td>

                        <td className="p-4">

                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                            {
                              request.type
                            }
                          </span>

                        </td>

                        <td className="p-4">
                          {
                            request.date
                          }
                        </td>

                        <td className="p-4">

                          <span
                            className={`px-4 py-1 rounded-full text-sm font-medium ${
                              request.status ===
                              "Approved"
                                ? "bg-green-100 text-green-700"
                                : request.status ===
                                  "Rejected"
                                ? "bg-red-100 text-red-700"
                                : request.status ===
                                  "Expired"
                                ? "bg-slate-200 text-slate-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {
                              request.status
                            }
                          </span>

                        </td>

                        <td className="p-4">

                          <button
                            onClick={() =>
                              navigate(
                                `/employee/request-details/${request.passNo}`
                              )
                            }
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                          >
                            View
                          </button>

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="5"
                      className="p-0"
                    >
                      <EmptyState
                        title="No Requests Found"
                        message="Your matching gate pass requests will appear here."
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

  </div>
);
}
export default MyRequests;

