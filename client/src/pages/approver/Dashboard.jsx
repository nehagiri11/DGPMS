import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { mapApiPass } from "../../utils/passMapper";



function Dashboard() {
  const [mobileOpen, setMobileOpen] =
  useState(false);

  const navigate = useNavigate();

  const [requests, setRequests] =
    useState([]);

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

      }

    };

    loadRequests();

  }, []);

  const pendingRequests =
    requests.filter(
      (r) => r.status === "Pending"
    ).length;

  const approvedRequests =
    requests.filter(
      (r) => r.status === "Approved"
    ).length;

  const rejectedRequests =
    requests.filter(
      (r) => r.status === "Rejected"
    ).length;

  const totalRequests =
    requests.length;

  const recentPending =
    requests
      .filter(
        (r) => r.status === "Pending"
      )
      .slice(0, 5);

  return (

    <div className="flex">

      <Sidebar role="APPROVER"
      mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen} />

      <div className="flex-1 bg-slate-100 min-h-screen">

        <Navbar role="APPROVER" 
        mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen}/>

        <div className="p-6">

          {/* Hero Section */}

          <div className="bg-gradient-to-r from-indigo-700 to-blue-600 rounded-3xl p-8 text-white shadow-lg mb-8">

            <h1 className="text-4xl font-bold">
              Welcome Back, Approver
            </h1>

            <p className="mt-2 text-blue-100 text-lg">
              You have {pendingRequests} requests waiting for approval.
            </p>

          </div>

          {/* KPI Cards */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            <div
              onClick={() =>
                navigate("/approver/pending")
              }
              className="bg-white rounded-3xl shadow-lg p-6 border-l-4 border-orange-500 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >

              <p className="text-gray-500">
                Pending Requests
              </p>

              <h2 className="text-4xl font-bold text-orange-500 mt-2">
                {pendingRequests}
              </h2>

            </div>

            <div
              onClick={() =>
                navigate("/approver/approved")
              }
              className="bg-white rounded-3xl shadow-lg p-6 border-l-4 border-green-500 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >

              <p className="text-gray-500">
                Approved
              </p>

              <h2 className="text-4xl font-bold text-green-600 mt-2">
                {approvedRequests}
              </h2>

            </div>

            <div
              onClick={() =>
                navigate("/approver/rejected")
              }
              className="bg-white rounded-3xl shadow-lg p-6 border-l-4 border-red-500 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >

              <p className="text-gray-500">
                Rejected
              </p>

              <h2 className="text-4xl font-bold text-red-600 mt-2">
                {rejectedRequests}
              </h2>

            </div>

            <div
              className="bg-white rounded-3xl shadow-lg p-6 border-l-4 border-blue-500"
            >

              <p className="text-gray-500">
                Total Requests
              </p>

              <h2 className="text-4xl font-bold text-blue-600 mt-2">
                {totalRequests}
              </h2>

            </div>

          </div>

          {/* Main Content */}

          <div className="grid lg:grid-cols-2 gap-6">

            {/* Approval Queue */}

            <div className="bg-white rounded-3xl shadow-lg p-6">

              <h2 className="text-xl font-bold mb-5">
                Approval Queue
              </h2>

              {recentPending.length > 0 ? (

                recentPending.map(
                  (request) => (

                    <div
                      key={request.passNo}
                      className="flex justify-between items-center border-b py-4"
                    >

                      <div>

                        <h3 className="font-semibold">
                          {request.passNo}
                        </h3>

                        <p className="text-gray-500 text-sm">
                          {request.type}
                        </p>

                      </div>

                      <button
                        onClick={() =>
                          navigate(
                            `/approver/request-details/${request.passNo}`
                          )
                        }
                        className="text-blue-600 font-medium hover:text-blue-800"
                      >
                        View →
                      </button>

                    </div>

                  )
                )

              ) : (

                <p className="text-gray-500">
                  No pending requests.
                </p>

              )}

            </div>

            {/* Statistics */}

            <div className="bg-white rounded-3xl shadow-lg p-6">

              <h2 className="text-xl font-bold mb-5">
                Request Statistics
              </h2>

              <div className="space-y-5">

                <div className="bg-blue-100 rounded-2xl p-4">

                  <p className="text-blue-700 font-medium">
                    Visitor Requests
                  </p>

                  <h3 className="text-3xl font-bold text-blue-800">
                    {
                      requests.filter(
                        (r) =>
                          r.type === "Visitor"
                      ).length
                    }
                  </h3>

                </div>

                <div className="bg-green-100 rounded-2xl p-4">

                  <p className="text-green-700 font-medium">
                    CKD Requests
                  </p>

                  <h3 className="text-3xl font-bold text-green-800">
                    {
                      requests.filter(
                        (r) =>
                          r.type === "CKD"
                      ).length
                    }
                  </h3>

                </div>

                <div className="bg-purple-100 rounded-2xl p-4">

                  <p className="text-purple-700 font-medium">
                    Regular Requests
                  </p>

                  <h3 className="text-3xl font-bold text-purple-800">
                    {
                      requests.filter(
                        (r) =>
                          r.type === "Regular"
                      ).length
                    }
                  </h3>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}

export default Dashboard;

