import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import NotificationCenter from "../../components/NotificationCenter";
import Sidebar from "../../components/Sidebar";

function EmployeeNotificationCenterPage() {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const token =
          localStorage.getItem("token");

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

  return (
    <div className="flex">
      <Sidebar
        role="REQUESTER"
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="min-h-screen flex-1 bg-slate-100">
        <Navbar
          role="REQUESTER"
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <main className="p-4 sm:p-6">
          <NotificationCenter
            notifications={notifications}
            loading={loading}
            roleLabel="Employee updates"
            title="Notification Center"
            description="Track approval decisions, rejected requests, and gate pass activity in one clean timeline."
            emptyTitle="No notifications yet"
            emptyMessage="Approvals, rejections, and pass updates will appear here as soon as they are available."
          />
        </main>
      </div>
    </div>
  );
}

export default EmployeeNotificationCenterPage;
