import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import FeedbackMessage from "../../components/FeedbackMessage";
import { useToast } from "../../components/ToastProvider";

function Profile() {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const showToast =
    useToast();

  const loggedInUser =
    JSON.parse(
      localStorage.getItem("loggedInUser")
    ) ||
    JSON.parse(
      localStorage.getItem("user")
    );

  const role =
    loggedInUser?.role;

  const [profile, setProfile] =
    useState(null);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [feedback, setFeedback] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {

    const loadProfile = async () => {

      try {

        const token =
          localStorage.getItem("token");

        const response =
          await axios.get(
            "/api/auth/profile",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        setProfile(
          response.data.user
        );

      } catch {

        setFeedback({
          type: "error",
          message: "Unable to load profile."
        });

      } finally {

        setLoading(false);

      }

    };

    loadProfile();

  }, []);

  const changePassword = async () => {

    setFeedback(null);

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {

      setFeedback({
        type: "error",
        message: "Please fill all password fields."
      });
      return;

    }

    if (
      newPassword !== confirmPassword
    ) {

      setFeedback({
        type: "error",
        message: "New password and confirm password do not match."
      });
      return;

    }

    try {

      setSaving(true);

      const token =
        localStorage.getItem("token");

      await axios.put(
        "/api/auth/change-password",
        {
          currentPassword,
          newPassword
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      showToast?.(
        "Password changed successfully",
        "success"
      );

    } catch (error) {

      setFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          "Unable to change password."
      });

    } finally {

      setSaving(false);

    }

  };

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

          <FeedbackMessage
            type={feedback?.type}
            message={feedback?.message}
          />

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-5">
                User Information
              </h2>

              {loading ? (
                <p>Loading profile...</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-500">
                      Full Name
                    </p>
                    <p className="font-semibold">
                      {profile?.full_name || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">
                      Email
                    </p>
                    <p className="font-semibold">
                      {profile?.email || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">
                      Role
                    </p>
                    <p className="font-semibold">
                      {profile?.role_name || role || "-"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-5">
                Change Password
              </h2>

              <div className="space-y-4">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(
                      e.target.value
                    )
                  }
                  placeholder="Current Password"
                  className="w-full border rounded-lg p-3"
                />

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  placeholder="New Password"
                  className="w-full border rounded-lg p-3"
                />

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm New Password"
                  className="w-full border rounded-lg p-3"
                />

                <button
                  type="button"
                  onClick={changePassword}
                  disabled={saving}
                  className="
                    bg-blue-700
                    text-white
                    px-6
                    py-3
                    rounded-lg
                    hover:bg-blue-800
                    disabled:opacity-60
                  "
                >
                  {saving
                    ? "Updating..."
                    : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
