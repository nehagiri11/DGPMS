import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import { mapApiPass } from "../../utils/passMapper";


function Dashboard() {
  const [mobileOpen, setMobileOpen] =
  useState(false);
  const navigate = useNavigate();

  const loggedInUser =
JSON.parse(
  localStorage.getItem("loggedInUser")
);
const [requests, setRequests] =
  useState([]);

useEffect(() => {

  const fetchRequests =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

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

        console.log(
          error
        );

      }

    };

  fetchRequests();

}, []);

  const totalRequests =
    requests.length;

  const pendingRequests =
    requests.filter(
      (r) => r.status?.toUpperCase() === "PENDING"
    ).length;

  const approvedRequests =
    requests.filter(
      (r) => r.status?.toUpperCase() === "APPROVED"
    ).length;

  const rejectedRequests =
    requests.filter(
      (r) => r.status?.toUpperCase() === "REJECTED"
    ).length;

  const expiredRequests =
    requests.filter(
      (r) => r.status?.toUpperCase() === "EXPIRED"
    ).length;

  const recentRequests =
    [...requests]
      .slice(0, 5);

  return (
    <div className="flex">

      <Sidebar
  role={loggedInUser?.role}
  mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen}
/>

      <div className="flex-1 bg-slate-100 min-h-screen">

        <Navbar
  role={loggedInUser?.role}
  mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen}
/>

        <div className="p-6">

  {/* Hero Section */}

  <div
    className="
      bg-gradient-to-r
      from-blue-700
      via-blue-600
      to-indigo-700
      rounded-3xl
      p-8
      shadow-xl
      mb-8
      text-white
    "
  >

    <h1 className="text-4xl font-bold">
      Welcome,
     {loggedInUser?.name}
    </h1>

    <p className="mt-2 text-blue-100">
      Track your gate passes and approvals.
    </p>

  </div>

  {/* KPI Cards */}

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

    <div
      onClick={() =>
        navigate("/employee/requests")
      }
      className="
        bg-white
        rounded-3xl
        p-7
        shadow-lg
        border
        border-slate-200
        cursor-pointer
        hover:shadow-2xl
        hover:-translate-y-2
        transition-all
      "
    >

      <div className="flex justify-between items-center">

        <h3 className="text-slate-500">
          Total Requests
        </h3>

        

      </div>

      <p className="text-5xl font-bold text-blue-600 mt-4">
        {totalRequests}
      </p>

    </div>

    <div
      onClick={() =>
        navigate(
          "/employee/requests?status=pending"
        )
      }
      className="
        bg-white
        rounded-3xl
        p-7
        shadow-lg
        border
        border-slate-200
        cursor-pointer
        hover:shadow-2xl
        hover:-translate-y-2
        transition-all
      "
    >

      <div className="flex justify-between items-center">

        <h3 className="text-slate-500">
          Pending
        </h3>

       

      </div>

      <p className="text-5xl font-bold text-orange-500 mt-4">
        {pendingRequests}
      </p>

    </div>

    <div
      onClick={() =>
        navigate(
          "/employee/requests?status=approved"
        )
      }
      className="
        bg-white
        rounded-3xl
        p-7
        shadow-lg
        border
        border-slate-200
        cursor-pointer
        hover:shadow-2xl
        hover:-translate-y-2
        transition-all
      "
    >

      <div className="flex justify-between items-center">

        <h3 className="text-slate-500">
          Approved
        </h3>

        

      </div>

      <p className="text-5xl font-bold text-green-600 mt-4">
        {approvedRequests}
      </p>

    </div>

    <div
      onClick={() =>
        navigate(
          "/employee/requests?status=rejected"
        )
      }
      className="
        bg-white
        rounded-3xl
        p-7
        shadow-lg
        border
        border-slate-200
        cursor-pointer
        hover:shadow-2xl
        hover:-translate-y-2
        transition-all
      "
    >

      <div className="flex justify-between items-center">

        <h3 className="text-slate-500">
          Rejected
        </h3>

        

      </div>

      <p className="text-5xl font-bold text-red-600 mt-4">
        {rejectedRequests}
      </p>

    </div>

    <div
      onClick={() =>
        navigate(
          "/employee/requests?status=expired"
        )
      }
      className="
        bg-white
        rounded-3xl
        p-7
        shadow-lg
        border
        border-slate-200
        cursor-pointer
        hover:shadow-2xl
        hover:-translate-y-2
        transition-all
      "
    >

      <div className="flex justify-between items-center">

        <h3 className="text-slate-500">
          Expired
        </h3>

      </div>

      <p className="text-5xl font-bold text-slate-500 mt-4">
        {expiredRequests}
      </p>

    </div>

  </div>

  {/* Summary Card */}

  <div className="mt-8 bg-white rounded-3xl shadow-lg p-6 border">

    <h2 className="text-xl font-bold mb-2">
      System Summary
    </h2>

    <p className="text-slate-600">

      You currently have 

      <span className="font-bold text-orange-500">
        {" "}{pendingRequests}  Pending
      </span>

      ,

      <span className="font-bold text-green-600">
        {" "}{approvedRequests}  Approved

      </span>

      ,

      <span className="font-bold text-red-600">
        {" "}{rejectedRequests}  Rejected

      </span>

      {" "}and

      <span className="font-bold text-slate-600">
        {" "}{expiredRequests} Expired
      </span>

      {" "}requests.

    </p>

  </div>

  {/* Quick Actions */}

  <div className="mt-10">

    <h2 className="text-2xl font-bold mb-6">
      Quick Actions
    </h2>

    <div className="grid md:grid-cols-3 gap-8">

      <button
        onClick={() =>
          navigate("/employee/visitor-pass")
        }
        className="
          bg-gradient-to-r
          from-blue-600
          to-blue-800
          text-white
          rounded-3xl
          p-8
          shadow-xl
          hover:scale-105
          transition-all
        "
      >

        <div className="text-5xl mb-4">
          👥
        </div>

        <div className="text-xl font-bold">
          Visitor Pass
        </div>

        <div className="text-blue-100 mt-2">
          Create VIS Request
        </div>

      </button>

      <button
        onClick={() =>
          navigate("/employee/ckd-pass")
        }
        className="
          bg-gradient-to-r
          from-green-600
          to-green-800
          text-white
          rounded-3xl
          p-8
          shadow-xl
          hover:scale-105
          transition-all
        "
      >

        <div className="text-5xl mb-4">
          📦
        </div>

        <div className="text-xl font-bold">
          CKD Pass
        </div>

        <div className="text-green-100 mt-2">
          Create Logistics Pass
        </div>

      </button>

      <button
        onClick={() =>
          navigate("/employee/regular-pass")
        }
        className="
          bg-gradient-to-r
          from-purple-600
          to-purple-800
          text-white
          rounded-3xl
          p-8
          shadow-xl
          hover:scale-105
          transition-all
        "
      >

        <div className="text-5xl mb-4">
          🚚
        </div>

        <div className="text-xl font-bold">
          Regular Pass
        </div>

        <div className="text-purple-100 mt-2">
          Create REG Request
        </div>

      </button>

    </div>

  </div>
          {/* Recent Requests */}

          <div className="mt-10">

            <h2 className="text-2xl font-bold mb-5">
              Recent Requests
            </h2>

            <div
  className="
    bg-white
    rounded-3xl
    shadow-xl
    border
    border-slate-200
    overflow-hidden
  "
>

              <table className="w-full text-sm">

                <thead className="bg-slate-100 text-slate-700">

                  <tr>

                    <th className="text-left p-4">
                      Pass No
                    </th>

                    <th className="text-left">
                      Type
                    </th>

                    <th className="text-left">
                      Status
                    </th>

                    <th className="text-left">
                      Date
                    </th>
                    <th className="text-left">
                     Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {recentRequests.length >
                  0 ? (

                    recentRequests.map(
                      (request) => (

                        <tr
  key={request.passNo}
  onClick={() =>
    navigate(
      `/employee/request-details/${request.passNo}`
    )
  }
  className="
    border-t
    hover:bg-blue-50
    cursor-pointer
    transition-all
  "
>

                          <td className="p-4 font-semibold text-blue-700">
                            {
                              request.passNo
                            }
                          </td>

                          <td>

  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold
    ${
      request.type === "Visitor"
        ? "bg-blue-100 text-blue-700"
        : request.type === "CKD"
        ? "bg-green-100 text-green-700"
        : "bg-purple-100 text-purple-700"
    }`}
  >
    {request.type}
  </span>

</td>

                          <td>

  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold
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

</td>
                          <td>
                            {
                              request.date
                            }
                          </td>
                          <td>

  <button
    onClick={() =>
      navigate(
        `/employee/request/${request.passNo}`
      )
    }
    className="
      bg-blue-600
      text-white
      px-3
      py-1
      rounded-lg
      text-sm
      hover:bg-blue-700
    "
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
                        className="text-center p-8 text-gray-500"
                      >
                        No Requests Found
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
