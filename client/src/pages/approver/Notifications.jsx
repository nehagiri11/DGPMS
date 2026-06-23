import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import NotificationCenterPage from "./NotificationCenterPage";

function Notifications() {
  return <NotificationCenterPage />;

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

  const getNotificationStyle =
    (type) => {

      switch (type) {

        case "PASS_APPROVED":
          return {
            border:
              "border-l-4 border-green-500",
            badge:
              "bg-green-100 text-green-700",
            label:
              "Approved"
          };

        case "PASS_REJECTED":
          return {
            border:
              "border-l-4 border-red-500",
            badge:
              "bg-red-100 text-red-700",
            label:
              "Rejected"
          };

        case "PASS_CREATED":
          return {
            border:
              "border-l-4 border-blue-500",
            badge:
              "bg-blue-100 text-blue-700",
            label:
              "Pending Review"
          };

        default:
          return {
            border:
              "border-l-4 border-slate-400",
            badge:
              "bg-slate-100 text-slate-700",
            label:
              "Notification"
          };

      }

    };

  return (

    <div className="flex">

      <Sidebar
        role="APPROVER"
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="flex-1 bg-slate-100 min-h-screen">

        <Navbar
          role="APPROVER"
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <div className="p-6">

          {/* Header */}

          <div className="mb-6">

            <div className="flex items-center gap-3">

              <h1
                className="
                  text-3xl
                  font-bold
                  text-slate-800
                "
              >
                Notifications
              </h1>

              <span
                className="
                  bg-blue-600
                  text-white
                  px-3
                  py-1
                  rounded-full
                  text-sm
                  font-semibold
                "
              >
                {notifications.length}
              </span>

            </div>

            <p
              className="
                text-slate-500
                mt-2
              "
            >
              Review gate pass requests
              and approval activities.
            </p>

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
                p-5
              "
            >

              <h2
                className="
                  text-white
                  text-xl
                  font-bold
                "
              >
                Notification Center
              </h2>

            </div>

            {loading ? (

              <div
                className="
                  p-10
                  text-center
                  text-slate-500
                "
              >
                Loading...
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

                    const style =
                      getNotificationStyle(
                        notification.type
                      );

                    return (

                      <div
                        key={
                          notification.notification_id
                        }
                        className={`
                          bg-white
                          border
                          border-slate-200
                          rounded-xl
                          px-5
                          py-4
                          hover:shadow-md
                          transition-all
                          duration-200
                          ${style.border}
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
                                {notification.type ===
                                "PASS_CREATED"
                                  ? "New Approval Request"
                                  : notification.title}
                              </h3>

                              <span
                                className={`
                                  px-3
                                  py-1
                                  rounded-full
                                  text-xs
                                  font-medium
                                  ${style.badge}
                                `}
                              >
                                {style.label}
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
                  p-12
                  text-center
                "
              >

                <div
                  className="
                    w-16
                    h-16
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
                  You're all caught up
                </h3>

                <p
                  className="
                    text-slate-500
                    mt-2
                  "
                >
                  No notifications available.
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
