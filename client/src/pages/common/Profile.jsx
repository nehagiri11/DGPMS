import { useEffect, useMemo, useState } from "react";
import axios from "axios";
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
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiLock,
  FiMail,
  FiShield,
  FiUser,
  FiXCircle
} from "react-icons/fi";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import TableShell from "../../components/TableShell";
import { useToast } from "../../components/ToastProvider";
import { mapApiPass } from "../../utils/passMapper";

const cardClass =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
};

function Profile() {
  const showToast =
    useToast();

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

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [savingPassword, setSavingPassword] =
    useState(false);

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

        const [profileRes, passRes] =
          await Promise.all([
            axios.get(
              "/api/auth/profile",
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

        setProfile(
          profileRes.data.user
        );

        setPasses(
          (passRes.data.passes || []).map(
            mapApiPass
          )
        );
      } catch (error) {
        console.error(error);
        setProfile(null);
        setPasses([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const metrics =
    useMemo(() => {
      const approved =
        passes.filter(
          (pass) => pass.status === "Approved"
        ).length;

      const pending =
        passes.filter(
          (pass) => pass.status === "Pending"
        ).length;

      const rejected =
        passes.filter(
          (pass) => pass.status === "Rejected"
        ).length;

      const expired =
        passes.filter(
          (pass) => pass.status === "Expired"
        ).length;

      return {
        total: passes.length,
        approved,
        pending,
        rejected,
        expired,
        visitor:
          passes.filter(
            (pass) => pass.type === "Visitor"
          ).length,
        regular:
          passes.filter(
            (pass) => pass.type === "Regular"
          ).length,
        ckd:
          passes.filter(
            (pass) => pass.type === "CKD"
          ).length
      };
    }, [passes]);

  const statusData = [
    {
      name: "Approved",
      value: metrics.approved
    },
    {
      name: "Pending",
      value: metrics.pending
    },
    {
      name: "Rejected",
      value: metrics.rejected
    },
    {
      name: "Expired",
      value: metrics.expired
    }
  ];

  const typeData = [
    {
      name: "Visitor",
      count: metrics.visitor
    },
    {
      name: "Regular",
      count: metrics.regular
    },
    {
      name: "CKD",
      count: metrics.ckd
    }
  ];

  const recentPasses =
    passes.slice(0, 6);

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (!currentPassword || !newPassword) {
      showToast?.(
        "Enter current and new password.",
        "error"
      );
      return;
    }

    try {
      setSavingPassword(true);

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
      showToast?.(
        "Password changed successfully.",
        "success"
      );
    } catch (error) {
      showToast?.(
        error.response?.data?.message ||
        "Unable to change password.",
        "error"
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar
        role={role}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="min-h-screen flex-1 bg-slate-100">
        <Navbar
          role={role}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <main className="p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              My Profile
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Review account information, pass activity, and security settings.
            </p>
          </div>

          {loading ? (
            <LoadingState message="Loading profile..." />
          ) : (
            <div className="space-y-6">
              <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
                <div className="overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-sm">
                  <div className="bg-blue-900 p-6 text-white">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                      <FiUser size={42} />
                    </div>

                    <h2 className="mt-5 text-2xl font-bold">
                      {profile?.full_name || "User"}
                    </h2>

                    <p className="mt-1 text-sm text-blue-100">
                      {profile?.role_name || role}
                    </p>
                  </div>

                  <div className="space-y-4 p-6">
                    <div className="flex gap-3">
                      <FiShield className="mt-1 text-blue-700" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Employee Code
                        </p>
                        <p className="font-semibold text-slate-900">
                          {profile?.employee_code || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <FiMail className="mt-1 text-blue-700" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Email
                        </p>
                        <p className="break-all font-semibold text-slate-900">
                          {profile?.email || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <FiCalendar className="mt-1 text-blue-700" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Joined
                        </p>
                        <p className="font-semibold text-slate-900">
                          {formatDate(profile?.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      label: "Total Passes",
                      value: metrics.total,
                      color: "text-blue-700",
                      icon: FiShield
                    },
                    {
                      label: "Pending",
                      value: metrics.pending,
                      color: "text-amber-600",
                      icon: FiClock
                    },
                    {
                      label: "Approved",
                      value: metrics.approved,
                      color: "text-emerald-700",
                      icon: FiCheckCircle
                    },
                    {
                      label: "Rejected",
                      value: metrics.rejected,
                      color: "text-rose-700",
                      icon: FiXCircle
                    }
                  ].map((item) => {
                    const Icon =
                      item.icon;

                    return (
                      <div
                        key={item.label}
                        className={cardClass}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-500">
                            {item.label}
                          </p>
                          <Icon className={item.color} />
                        </div>
                        <p className={`mt-4 text-4xl font-bold ${item.color}`}>
                          {item.value}
                        </p>
                      </div>
                    );
                  })}

                  <div className={`${cardClass} sm:col-span-2 xl:col-span-4`}>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-sm text-slate-500">
                          Visitor Passes
                        </p>
                        <p className="text-3xl font-bold text-blue-700">
                          {metrics.visitor}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">
                          Regular Passes
                        </p>
                        <p className="text-3xl font-bold text-emerald-700">
                          {metrics.regular}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">
                          CKD Passes
                        </p>
                        <p className="text-3xl font-bold text-violet-700">
                          {metrics.ckd}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <div className={cardClass}>
                  <h2 className="text-lg font-bold text-slate-900">
                    Pass Type Activity
                  </h2>
                  <div className="mt-4 h-72">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <BarChart data={typeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar
                          dataKey="count"
                          fill="#2563eb"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={cardClass}>
                  <h2 className="text-lg font-bold text-slate-900">
                    Pass Status Analytics
                  </h2>
                  <div className="mt-4 h-72">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={3}
                        >
                          <Cell fill="#22c55e" />
                          <Cell fill="#f59e0b" />
                          <Cell fill="#ef4444" />
                          <Cell fill="#64748b" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
                <div className={cardClass}>
                  <h2 className="text-lg font-bold text-slate-900">
                    Recent Passes
                  </h2>

                  <div className="mt-4">
                    {recentPasses.length > 0 ? (
                      <TableShell>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-100 text-left">
                              <th className="p-3">
                                Pass No
                              </th>
                              <th className="p-3">
                                Type
                              </th>
                              <th className="p-3">
                                Status
                              </th>
                              <th className="p-3">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentPasses.map((pass) => (
                              <tr
                                key={pass.passNo}
                                className="border-b last:border-0"
                              >
                                <td className="p-3 font-semibold text-slate-900">
                                  {pass.passNo}
                                </td>
                                <td className="p-3">
                                  {pass.type}
                                </td>
                                <td className="p-3">
                                  {pass.status}
                                </td>
                                <td className="p-3">
                                  {pass.date || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </TableShell>
                    ) : (
                      <EmptyState
                        title="No Passes Yet"
                        message="Recent gate passes will appear here."
                      />
                    )}
                  </div>
                </div>

                <div className={cardClass}>
                  <h2 className="text-lg font-bold text-slate-900">
                    Work Calendar
                  </h2>
                  <div className="mt-4 flex justify-center profile-calendar">
                    <Calendar
                      value={calendarDate}
                      onChange={setCalendarDate}
                    />
                  </div>
                </div>
              </section>

              <section className={cardClass}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <FiLock />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Change Password
                    </h2>
                    <p className="text-sm text-slate-500">
                      Keep your account secure with a fresh password.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleChangePassword}
                  className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]"
                >
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(event.target.value)
                    }
                    placeholder="Current password"
                    className={inputClass}
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                    placeholder="New password"
                    className={inputClass}
                  />
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="rounded-xl bg-blue-900 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"
                  >
                    {savingPassword
                      ? "Saving..."
                      : "Update"}
                  </button>
                </form>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Profile;
