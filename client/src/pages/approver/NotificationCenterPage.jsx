import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import NotificationCenter from "../../components/NotificationCenter";
import Sidebar from "../../components/Sidebar";

function ApproverNotificationCenterPage() {
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
        role="APPROVER"
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="min-h-screen flex-1 bg-slate-100">
        <Navbar
          role="APPROVER"
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <main className="p-4 sm:p-6">
          <NotificationCenter
            notifications={notifications}
            loading={loading}
            roleLabel="Approver inbox"
            title="Notification Center"
            description="Review new gate pass requests and stay on top of approval activity without scanning a long raw list."
            emptyTitle="You're all caught up"
            emptyMessage="New approval requests and decision updates will show up here."
          />
        </main>
      </div>
    </div>
  );
}

export default ApproverNotificationCenterPage;
