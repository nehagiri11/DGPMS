import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import TableShell from "../../components/TableShell";

import { mapApiPass } from "../../utils/passMapper";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
function AdminDashboard() {
  const [mobileOpen, setMobileOpen] =
  useState(false);

  const navigate =
    useNavigate();

  const [selectedView,
  setSelectedView] =
  useState(null);

  const [users, setUsers] =
    useState([]);

  const [requests, setRequests] =
    useState([]);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const token =
      localStorage.getItem("token");

    const mapUser = (user) => ({
      id: user.user_id || user.id,
      name: user.full_name || user.name,
      email: user.email,
      role: user.role_name || user.role,
      approved: Boolean(user.approved),
    });

    const loadAdminData = async () => {

      try {

        const [usersResponse, passesResponse] =
          await Promise.all([
            axios.get(
              "/api/users",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`
                }
              }
            ),
            axios.get(
              "/api/passes",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`
                }
              }
            )
          ]);

        setUsers(
          usersResponse.data.users.map(
            mapUser
          )
        );

        setRequests(
          passesResponse.data.passes.map(
            mapApiPass
          )
        );

      } catch {

        setUsers([]);
        setRequests([]);

      } finally {

        setLoading(false);

      }

    };

    loadAdminData();

  }, []);

  const requesters =
    users.filter(
      (u) =>
        u.role === "REQUESTER"
    );

  const approvers =
    users.filter(
      (u) =>
        u.role === "APPROVER"
    );

  const securityUsers =
    users.filter(
      (u) =>
        u.role === "SECURITY"
    );

  const pendingPasses =
    requests.filter(
      (r) =>
        r.status === "Pending"
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
      r.status === "Approved"
  );

const rejectedPasses =
  requests.filter(
    (r) =>
      r.status === "Rejected"
  );

const approvalRate =
  requests.length > 0
    ? (
        approvedPasses.length /
        requests.length
      ) * 100
    : 0;

const pieData = [
  {
    name: "Visitor",
    value:
      visitorPasses.length,
  },
  {
    name: "Regular",
    value:
      regularPasses.length,
  },
  {
    name: "CKD",
    value:
      ckdPasses.length,
  },
];

const barData = [
  {
    name: "Approved",
    count:
      approvedPasses.length,
  },
  {
    name: "Pending",
    count:
      pendingPasses.length,
  },
  {
    name: "Rejected",
    count:
      rejectedPasses.length,
  },
];

const selectedUsers =
  selectedView === "TOTAL_USERS"
    ? users
    : selectedView === "REQUESTERS"
    ? requesters
    : selectedView === "APPROVERS"
    ? approvers
    : selectedView === "SECURITY"
    ? securityUsers
    : [];

const selectedPasses =
  selectedView === "ALL_PASSES"
    ? requests
    : selectedView === "PENDING"
    ? pendingPasses
    : selectedView === "INSIDE"
    ? insidePasses
    : selectedView === "COMPLETED"
    ? completedPasses
    : [];
  

  return (

    <div className="flex">

      <Sidebar role="ADMIN"
      mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen} />

      <div className="flex-1 bg-slate-100 min-h-screen">

        <Navbar role="ADMIN"
        mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen} />

        <div className="p-6">

          <h1 className="text-3xl font-bold mb-8">
            Admin Dashboard
          </h1>

          {loading && (
            <LoadingState message="Loading admin dashboard..." />
          )}

          {/* DASHBOARD CARDS */}

          <div className="grid md:grid-cols-4 gap-6">

            <div
              onClick={() =>
                setSelectedView(
                  "TOTAL_USERS"
                )
              }
              className="
                bg-white
                p-6
                rounded-2xl
                shadow-lg
                cursor-pointer
                hover:shadow-xl
              "
            >
              <h3 className="text-slate-500">
                Total Users
              </h3>

              <p className="text-4xl font-bold text-blue-600 mt-2">
                {users.length}
              </p>
            </div>

            <div
              onClick={() =>
                setSelectedView(
                  "REQUESTERS"
                )
              }
              className="
                bg-white
                p-6
                rounded-2xl
                shadow-lg
                cursor-pointer
                hover:shadow-xl
              "
            >
              <h3 className="text-slate-500">
                Requesters
              </h3>

              <p className="text-4xl font-bold text-green-600 mt-2">
                {requesters.length}
              </p>
            </div>

            <div
              onClick={() =>
                setSelectedView(
                  "APPROVERS"
                )
              }
              className="
                bg-white
                p-6
                rounded-2xl
                shadow-lg
                cursor-pointer
                hover:shadow-xl
              "
            >
              <h3 className="text-slate-500">
                Approvers
              </h3>

              <p className="text-4xl font-bold text-indigo-600 mt-2">
                {approvers.length}
              </p>
            </div>

            <div
              onClick={() =>
                setSelectedView(
                  "SECURITY"
                )
              }
              className="
                bg-white
                p-6
                rounded-2xl
                shadow-lg
                cursor-pointer
                hover:shadow-xl
              "
            >
              <h3 className="text-slate-500">
                Security
              </h3>

              <p className="text-4xl font-bold text-orange-600 mt-2">
                {securityUsers.length}
              </p>
            </div>

          </div>

          <div className="grid md:grid-cols-4 gap-6 mt-6">

            <div
              onClick={() =>
                setSelectedView(
                  "ALL_PASSES"
                )
              }
              className="
                bg-white
                p-6
                rounded-2xl
                shadow-lg
                cursor-pointer
                hover:shadow-xl
              "
            >
              <h3 className="text-slate-500">
                Total Passes
              </h3>

              <p className="text-4xl font-bold text-cyan-600 mt-2">
                {requests.length}
              </p>
            </div>

            <div
              onClick={() =>
                setSelectedView(
                  "PENDING"
                )
              }
              className="
                bg-white
                p-6
                rounded-2xl
                shadow-lg
                cursor-pointer
                hover:shadow-xl
              "
            >
              <h3 className="text-slate-500">
                Pending Approval
              </h3>

              <p className="text-4xl font-bold text-yellow-600 mt-2">
                {pendingPasses.length}
              </p>
            </div>

            <div
              onClick={() =>
                setSelectedView(
                  "INSIDE"
                )
              }
              className="
                bg-white
                p-6
                rounded-2xl
                shadow-lg
                cursor-pointer
                hover:shadow-xl
              "
            >
              <h3 className="text-slate-500">
                Visitors Inside
              </h3>

              <p className="text-4xl font-bold text-green-600 mt-2">
                {insidePasses.length}
              </p>
            </div>

            <div
              onClick={() =>
                setSelectedView(
                  "COMPLETED"
                )
              }
              className="
                bg-white
                p-6
                rounded-2xl
                shadow-lg
                cursor-pointer
                hover:shadow-xl
              "
            >
              <h3 className="text-slate-500">
                Completed Passes
              </h3>

              <p className="text-4xl font-bold text-red-600 mt-2">
                {completedPasses.length}
              </p>
            </div>

          </div>
          <div className="mt-8">

  <h2 className="
    text-2xl
    font-bold
    mb-6
  ">
    Analytics Dashboard
  </h2>

  <div className="
    grid
    md:grid-cols-4
    gap-6
    mb-8
  ">

    <div className="
      bg-gradient-to-r
      from-blue-600
      to-blue-800
      text-white
      p-6
      rounded-2xl
      shadow-lg
    ">
      <h3>Visitor Passes</h3>

      <p className="
        text-4xl
        font-bold
        mt-2
      ">
        {visitorPasses.length}
      </p>
    </div>

    <div className="
      bg-gradient-to-r
      from-green-600
      to-green-800
      text-white
      p-6
      rounded-2xl
      shadow-lg
    ">
      <h3>Regular Passes</h3>

      <p className="
        text-4xl
        font-bold
        mt-2
      ">
        {regularPasses.length}
      </p>
    </div>

    <div className="
      bg-gradient-to-r
      from-orange-600
      to-orange-800
      text-white
      p-6
      rounded-2xl
      shadow-lg
    ">
      <h3>CKD Passes</h3>

      <p className="
        text-4xl
        font-bold
        mt-2
      ">
        {ckdPasses.length}
      </p>
    </div>

    <div className="
      bg-gradient-to-r
      from-purple-600
      to-purple-800
      text-white
      p-6
      rounded-2xl
      shadow-lg
    ">
      <h3>Approval Rate</h3>

      <p className="
        text-4xl
        font-bold
        mt-2
      ">
        {approvalRate.toFixed(0)}%
      </p>
    </div>

  </div>

  <div className="
    grid
    md:grid-cols-2
    gap-8
  ">

    <div className="
      bg-white
      p-6
      rounded-2xl
      shadow-lg
    ">

      <h3 className="
        text-xl
        font-bold
        mb-4
      ">
        Pass Distribution
      </h3>

      <ResponsiveContainer
        width="100%"
        height={300}
      >

        <PieChart>

          <Pie
  data={pieData}
  dataKey="value"
  outerRadius={100}
  labelLine={false}
  label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {

    const RADIAN =
      Math.PI / 180;

    const radius =
      innerRadius +
      (outerRadius - innerRadius) *
      0.5;

    const x =
      cx +
      radius *
      Math.cos(
        -midAngle * RADIAN
      );

    const y =
      cy +
      radius *
      Math.sin(
        -midAngle * RADIAN
      );

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={18}
        fontWeight="bold"
      >
        {value}
      </text>
    );

  }}
>

            <Cell fill="#2563eb" />

            <Cell fill="#16a34a" />

            <Cell fill="#ea580c" />

          </Pie>

          <Tooltip />

        </PieChart>

      </ResponsiveContainer>

    </div>

    <div className="
      bg-white
      p-6
      rounded-2xl
      shadow-lg
    ">

      <h3 className="
        text-xl
        font-bold
        mb-4
      ">
        Approval Statistics
      </h3>

      <ResponsiveContainer
        width="100%"
        height={300}
      >

        <BarChart
          data={barData}
        >

          <CartesianGrid
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="name"
          />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="count"
            fill="#2563eb"
          />

        </BarChart>

      </ResponsiveContainer>

    </div>

  </div>

</div>

          {/* DETAILS SECTION */}

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
                mb-6
              ">
                {selectedView.replaceAll(
                  "_",
                  " "
                )}
              </h2>

              {/* USER TABLE */}

              {[
                "TOTAL_USERS",
                "REQUESTERS",
                "APPROVERS",
                "SECURITY"
              ].includes(
                selectedView
              ) && (

                <TableShell>
                <table className="w-full">

                  <thead>

                    <tr className="bg-slate-100">

                      <th className="p-3 text-left">
                        Name
                      </th>

                      <th className="p-3 text-left">
                        Email
                      </th>

                      <th className="p-3 text-left">
                        Role
                      </th>

                      <th className="p-3 text-left">
                        Approved
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {selectedUsers.length > 0 ? selectedUsers.map((user, index) => (

                      <tr
                        key={index}
                        className="border-b"
                      >

                        <td className="p-3">
                          {user.name ||
                            "N/A"}
                        </td>

                        <td className="p-3">
                          {user.email}
                        </td>

                        <td className="p-3">
                          {user.role}
                        </td>

                        <td className="p-3">
                          {user.approved
                            ? "Yes"
                            : "No"}
                        </td>

                      </tr>

                    )) : (
                      <tr>
                        <td colSpan="4" className="p-0">
                          <EmptyState
                            title="No Users Found"
                            message="Matching users will appear here."
                          />
                        </td>
                      </tr>
                    )}

                  </tbody>

                </table>
                </TableShell>

              )}

              {/* PASS TABLE */}

              {[
                "ALL_PASSES",
                "PENDING",
                "INSIDE",
                "COMPLETED"
              ].includes(
                selectedView
              ) && (

                <TableShell>
                <table className="w-full">

                  <thead>

                    <tr className="bg-slate-100">

                      <th className="p-3 text-left">
                        Pass No
                      </th>

                      <th className="p-3 text-left">
                        Type
                      </th>

                      <th className="p-3 text-left">
                        Requester
                      </th>

                      <th className="p-3 text-left">
                        Status
                      </th>

                      <th className="p-3 text-left">
                        Gate Status
                      </th>

                      <th className="p-3 text-left">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {selectedPasses.length > 0 ? selectedPasses.map((request) => (

                      <tr
                        key={
                          request.passNo
                        }
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
                          {request.status}
                        </td>

                        <td className="p-3">
                          {request.gateStatus ||
                            "-"}
                        </td>

                        <td className="p-3">
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

                    )) : (
                      <tr>
                        <td colSpan="6" className="p-0">
                          <EmptyState
                            title="No Passes Found"
                            message="Matching gate passes will appear here."
                          />
                        </td>
                      </tr>
                    )}

                  </tbody>

                </table>
                </TableShell>

              )}

            </div>

          )}

        </div>

      </div>

    </div>

  );

}

export default AdminDashboard;

