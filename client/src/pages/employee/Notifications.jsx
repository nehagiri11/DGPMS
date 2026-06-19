import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

function Notifications() {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [notifications,
    setNotifications] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  useEffect(() => {

    const loadNotifications =
      async () => {

        try {

          const token =
            localStorage.getItem(
              "token"
            );

          const response =
            await axios.get(
              "/api/notifications",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`
                }
              }
            );

          setNotifications(
            response.data.notifications || []
          );

          await axios.put(
            "/api/notifications/mark-read",
            {},
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        } catch (error) {

          console.error(error);

          setNotifications([]);

        } finally {

          setLoading(false);

        }

      };

    loadNotifications();

  }, []);

  const approvedCount =
    notifications.filter(
      (n) =>
        n.type ===
        "PASS_APPROVED"
    ).length;

  const rejectedCount =
    notifications.filter(
      (n) =>
        n.type ===
        "PASS_REJECTED"
    ).length;

  return (

    <div className="flex">

      <Sidebar
        role="REQUESTER"
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="flex-1 bg-slate-100 min-h-screen">

        <Navbar
          role="REQUESTER"
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <div className="p-6">

          {/* Header */}

          <div className="mb-6">

            <h1
              className="
                text-3xl
                font-bold
                text-slate-800
              "
            >
              Notification Center
            </h1>

            <p
              className="
                text-slate-500
                mt-1
              "
            >
              Stay updated with all gate
              pass approvals, rejections,
              and system activities.
            </p>

          </div>

          {/* Summary Cards */}

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-4
              mb-6
            "
          >

            <div
              className="
                bg-white
                border
                border-slate-200
                rounded-xl
                p-5
                shadow-sm
              "
            >
              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                Total Notifications
              </p>

              <h2
                className="
                  text-3xl
                  font-bold
                  text-slate-800
                  mt-2
                "
              >
                {notifications.length}
              </h2>
            </div>

            <div
              className="
                bg-white
                border
                border-slate-200
                rounded-xl
                p-5
                shadow-sm
              "
            >
              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                Approved
              </p>

              <h2
                className="
                  text-3xl
                  font-bold
                  text-green-600
                  mt-2
                "
              >
                {approvedCount}
              </h2>
            </div>

            <div
              className="
                bg-white
                border
                border-slate-200
                rounded-xl
                p-5
                shadow-sm
              "
            >
              <p
                className="
                  text-sm
                  text-slate-500
                "
              >
                Rejected
              </p>

              <h2
                className="
                  text-3xl
                  font-bold
                  text-red-600
                  mt-2
                "
              >
                {rejectedCount}
              </h2>
            </div>

          </div>

          {/* Notification Container */}

          <div
            className="
              bg-white
              rounded-2xl
              shadow-lg
              overflow-hidden
            "
          >

            <div
              className="
                bg-gradient-to-r
                from-blue-700
                to-blue-500
                px-6
                py-4
              "
            >

              <h2
                className="
                  text-white
                  text-xl
                  font-bold
                "
              >
                Recent Notifications
              </h2>

            </div>

            {loading ? (

              <div
                className="
                  py-16
                  text-center
                  text-slate-500
                "
              >
                Loading notifications...
              </div>

            ) : notifications.length > 0 ? (

              <div
                className="
                  p-5
                  space-y-3
                "
              >

                {notifications.map(
                  (notification) => {

                    const isApproved =
                      notification.type ===
                      "PASS_APPROVED";

                    const isRejected =
                      notification.type ===
                      "PASS_REJECTED";

                    return (

                      <div
                        key={
                          notification.notification_id
                        }
                        className={`
                          bg-white
                          border
                          rounded-xl
                          px-5
                          py-4
                          hover:shadow-md
                          transition-all
                          duration-200

                          ${
                            isApproved
                              ? "border-l-4 border-l-green-500 border-slate-200"
                              : isRejected
                              ? "border-l-4 border-l-red-500 border-slate-200"
                              : "border-l-4 border-l-blue-500 border-slate-200"
                          }
                        `}
                      >

                        <div
                          className="
                            flex
                            justify-between
                            items-start
                          "
                        >

                          <div className="flex-1">

                            <div
                              className="
                                flex
                                items-center
                                gap-3
                                flex-wrap
                              "
                            >

                              <h3
                                className="
                                  text-lg
                                  font-semibold
                                  text-slate-800
                                "
                              >
                                {notification.title}
                              </h3>

                              <span
                                className={`
                                  px-3
                                  py-1
                                  rounded-full
                                  text-xs
                                  font-medium

                                  ${
                                    isApproved
                                      ? "bg-green-100 text-green-700"
                                      : isRejected
                                      ? "bg-red-100 text-red-700"
                                      : "bg-blue-100 text-blue-700"
                                  }
                                `}
                              >
                                {
                                  isApproved
                                    ? "Approved"
                                    : isRejected
                                    ? "Rejected"
                                    : "Notification"
                                }
                              </span>

                            </div>

                            <p
                              className="
                                text-slate-600
                                mt-2
                              "
                            >
                              {notification.message}
                            </p>

                            <p
                              className="
                                text-xs
                                text-slate-400
                                mt-3
                              "
                            >
                              {new Date(
                                notification.created_at
                              ).toLocaleString()}
                            </p>

                          </div>

                          {!notification.is_read && (

                            <div
                              className="
                                w-2.5
                                h-2.5
                                rounded-full
                                bg-blue-500
                                mt-2
                                ml-3
                              "
                            />

                          )}

                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            ) : (

              <div
                className="
                  py-20
                  text-center
                "
              >

                <div
                  className="
                    w-20
                    h-20
                    rounded-full
                    bg-slate-100
                    mx-auto
                    mb-4
                  "
                />

                <h3
                  className="
                    text-xl
                    font-semibold
                    text-slate-700
                  "
                >
                  No Notifications Yet
                </h3>

                <p
                  className="
                    text-slate-500
                    mt-2
                  "
                >
                  Notifications regarding
                  approvals, rejections,
                  and gate pass activity
                  will appear here.
                </p>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>

  );

}

export default Notifications;