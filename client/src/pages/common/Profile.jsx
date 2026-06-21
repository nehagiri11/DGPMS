import { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

import { FaUserCircle } from "react-icons/fa";

function Profile() {

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [profile, setProfile] =
    useState(null);

  const [passes, setPasses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [calendarDate, setCalendarDate] =
    useState(new Date());

  const loggedInUser =
    JSON.parse(
      localStorage.getItem("loggedInUser")
    ) ||
    JSON.parse(
      localStorage.getItem("user")
    );

  const role =
    loggedInUser?.role;

  useEffect(() => {

  const loadData = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const profileRes =
        await axios.get(
          "/api/auth/profile",
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const passRes =
        await axios.get(
          "/api/passes",
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      setProfile(
        profileRes.data.user
      );

      setPasses(
        passRes.data.passes || []
      );

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

  loadData();

}, []);
const totalPasses =
  passes.length;

const pendingPasses =
  passes.filter(
    p => p.status === "PENDING"
  ).length;

const approvedPasses =
  passes.filter(
    p => p.status === "APPROVED"
  ).length;

const rejectedPasses =
  passes.filter(
    p => p.status === "REJECTED"
  ).length;

const visitorPasses =
  passes.filter(
    p => p.pass_type === "VISITOR"
  ).length;

const regularPasses =
  passes.filter(
    p => p.pass_type === "REGULAR"
  ).length;

const ckdPasses =
  passes.filter(
    p => p.pass_type === "CKD"
  ).length;
  const statusData = [
  {
    name: "Approved",
    value: approvedPasses
  },
  {
    name: "Pending",
    value: pendingPasses
  },
  {
    name: "Rejected",
    value: rejectedPasses
  }
];
const activityMap = {};

passes.forEach(pass => {

  const day =
    new Date(
      pass.created_at
    ).toLocaleDateString(
      "en-US",
      {
        weekday: "short"
      }
    );

  activityMap[day] =
    (activityMap[day] || 0) + 1;

});

const dailyActivity =
  Object.keys(activityMap).map(
    day => ({
      day,
      count:
        activityMap[day]
    })
  );
return (
  <div className="flex">

    <Sidebar
      role={role}
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
    />

    <div className="flex-1 bg-slate-100 min-h-screen">

      <Navbar
        role={role}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="p-6">

        <h1 className="text-3xl font-bold mb-6">
          My Profile
        </h1>
        

        {loading ? (

          <div className="text-center text-lg">
            Loading...
          </div>

        ) : (

          <>

            <div className="grid lg:grid-cols-3 gap-6 mb-6">

             <div className="
bg-gradient-to-br
from-blue-600
to-indigo-700
text-white
rounded-3xl
shadow-2xl
p-8
border
border-blue-400
">

                <div className="flex flex-col items-center">

                  <FaUserCircle
  size={120}
  className="text-white"
/>

                  <h2 className="text-2xl font-bold mt-4">
                    {profile?.full_name}
                  </h2>

                 <p className="text-blue-100">
                    {profile?.role_name}
                  </p>

                </div>

                <div className="mt-6 space-y-4">

                  <div>
                    <p className="text-blue-100">
                      Employee Code
                    </p>

                    <p className="font-semibold">
                      {profile?.employee_code || "-"}
                    </p>
                  </div>

                  <div>
                   <p className="text-blue-100">
                      Email
                    </p>

                    <p className="font-semibold">
                      {profile?.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-blue-100">
                      Joined
                    </p>

                    <p className="font-semibold">
                      {
                        profile?.created_at
                          ? new Date(
                              profile.created_at
                            ).toLocaleDateString()
                          : "-"
                      }
                    </p>
                  </div>

                </div>

              </div>

              <div className="lg:col-span-2">

                <div className="grid md:grid-cols-4 gap-4">

                  <div className="
bg-gradient-to-r
from-blue-500
to-blue-700
text-white
rounded-2xl
p-6
shadow-xl
hover:scale-105
transition
">
                    <p>Total Passes</p>
                    <h2 className="text-3xl font-bold">
                      {totalPasses}
                    </h2>
                  </div>

                  <div className="bg-gradient-to-r from-amber-400 to-orange-500s text-white rounded-xl p-5 shadow">
                    <p>Pending</p>
                    <h2 className="text-3xl font-bold">
                      {pendingPasses}
                    </h2>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-emerald-700 text-white rounded-xl p-5 shadow">
                    <p>Approved</p>
                    <h2 className="text-3xl font-bold">
                      {approvedPasses}
                    </h2>
                  </div>

                  <div className="bg-gradient-to-r from-red-500 to-rose-700 text-white rounded-xl p-5 shadow">
                    <p>Rejected</p>
                    <h2 className="text-3xl font-bold">
                      {rejectedPasses}
                    </h2>
                  </div>

                </div>
                <div className="grid md:grid-cols-3 gap-4 mb-6">

              <div className="
bg-white
rounded-2xl
shadow-lg
border-l-8
border-blue-500
p-6
hover:shadow-xl
transition
">
                <p className="text-slate-500">
                  Visitor Passes
                </p>

                <h2 className="text-3xl font-bold text-blue-600">
                  {visitorPasses}
                </h2>
              </div>

              <div className="
bg-white
rounded-2xl
shadow-lg
border-l-8
border-green-500
p-6
hover:shadow-xl
transition
">
                <p className="text-slate-500">
                  Regular Passes
                </p>

                <h2 className="text-3xl font-bold text-green-600">
                  {regularPasses}
                </h2>
              </div>

              <div className="
bg-white
rounded-2xl
shadow-lg
border-l-8
border-purple-500
p-6
hover:shadow-xl
transition
">
                <p className="text-slate-500">
                  CKD Passes
                </p>

                <h2 className="text-3xl font-bold text-purple-600">
                  {ckdPasses}
                </h2>
              </div>

            </div>

                 

              </div>
              
            </div>

           

            <div className="grid lg:grid-cols-2 gap-6 mb-6">

             <div className="
bg-white
rounded-3xl
shadow-xl
p-6
border
border-slate-200
">
                <h2 className="text-xl font-bold mb-4">
                  📈 Daily Pass Activity
                </h2>

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <BarChart
                    data={dailyActivity}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="day"
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

              <div className="bg-white rounded-xl shadow p-5">

                <h2 className="text-xl font-bold mb-4">
                 📅 Work Calendar
                </h2>

               <div className="flex justify-center">
  <Calendar
    value={calendarDate}
    onChange={setCalendarDate}
  />
</div>

              </div>

            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">

              <div className="bg-white rounded-xl shadow p-5">

                <h2 className="text-xl font-bold mb-4">
                  📊 Pass Status Analytics
                </h2>

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <PieChart>

                    <Pie
                      data={statusData}
                      dataKey="value"
                      outerRadius={120}
                      label
                    >

                      <Cell fill="#22c55e" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#ef4444" />

                    </Pie>

                    <Tooltip />

                  </PieChart>

                </ResponsiveContainer>

              </div>

              <div className="bg-white rounded-xl shadow p-5">

                <h2 className="text-xl font-bold mb-4">
                  📝 Recent Passes
                </h2>

                <div className="overflow-auto">

                  <table className="w-full text-sm">

                    <thead>

                      <tr className="border-b bg-slate-100">

                        <th className="text-left py-2">
                          Pass No
                        </th>

                        <th className="text-left py-2">
                          Type
                        </th>

                        <th className="text-left py-2">
                          Status
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {passes
                        .slice(0, 5)
                        .map(pass => (

                        <tr
                          key={pass.pass_no}
                          className="border-b"
                        >

                          <td className="py-2">
                            {pass.pass_no}
                          </td>

                          <td>
                            {pass.pass_type}
                          </td>

                          <td>
                            {pass.status}
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

            </div>

          </>

        )}

      </div>

    </div>

  </div>


);
}

export default Profile;