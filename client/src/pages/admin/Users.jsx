import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import FeedbackMessage from "../../components/FeedbackMessage";
import PaginationControls from "../../components/PaginationControls";

function Users() {
  const [mobileOpen, setMobileOpen] =
  useState(false);

  const [refresh, setRefresh] =
    useState(false);

  const [users, setUsers] =
    useState([]);

  const [isSaving, setIsSaving] =
    useState(false);

  const [feedback, setFeedback] =
    useState(null);

  const [search, setSearch] =
    useState("");
  const [page, setPage] =
    useState(1);
  const pageSize = 10;

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [role, setRole] =
    useState("REQUESTER");

  const [editingUser,
    setEditingUser] =
    useState(null);

  const mapUser = (user) => ({
    id: user.user_id || user.id,
    employeeCode:
      user.employee_code ||
      user.employeeCode ||
      "",
    name:
      user.full_name ||
      user.name ||
      "",
    email: user.email,
    role:
      user.role_name ||
      user.role,
    approved:
      Boolean(user.approved),
  });

  const loadUsers = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const response =
        await axios.get(
          "/api/users",
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      setUsers(
        response.data.users.map(
          mapUser
        )
      );

    } catch (error) {

      setUsers([]);
      setFeedback({
        type: "error",
        message:
          "Unable to load users from backend."
      });

    }

  };

  useEffect(() => {

    loadUsers();

  }, [refresh]);

  const filteredUsers =
    users.filter((user) =>

      (user.name || "")
        .toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||

      user.email
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )

    );

  const paginatedUsers =
    filteredUsers.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleAddUser =
    async () => {

      if (
        !email ||
        !password
      ) {

        setFeedback({
          type: "error",
          message:
            "Please fill all required fields"
        });

        return;

      }

      setFeedback(null);
      setIsSaving(true);

      try {

        const token =
          localStorage.getItem("token");

        await axios.post(
          "/api/users",
          {
            full_name:
              name,
            email,
            password,
            role,
            approved: true
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

        setFeedback({
          type: "success",
          message: "User added successfully"
        });

      } catch (error) {

        setFeedback({
          type: "error",
          message:
            error.response?.data?.message ||
            "Unable to add user from backend."
        });
        setIsSaving(false);
        return;

      }

      setName("");
      setEmail("");
      setPassword("");
      setRole(
        "REQUESTER"
      );

      setRefresh(
        !refresh
      );

      setIsSaving(false);

    };

  return (

    <div className="flex">

      <Sidebar role="ADMIN"
      mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen} />

      <div className="flex-1 min-w-0 bg-slate-100 min-h-screen">

        <Navbar role="ADMIN" 
        mobileOpen={mobileOpen}
  setMobileOpen={setMobileOpen}/>

        <div className="p-6">

          <h1 className="text-3xl font-bold mb-8">
            User Management
          </h1>

          <FeedbackMessage
            type={feedback?.type}
            message={feedback?.message}
          />

          {/* STATS */}

          <div className="grid md:grid-cols-4 gap-6 mb-8">

            <div className="bg-white rounded-2xl shadow-lg p-6">

              <h3 className="text-slate-500">
                Total Users
              </h3>

              <p className="text-4xl font-bold text-blue-600">
                {users.length}
              </p>

            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">

              <h3 className="text-slate-500">
                Requesters
              </h3>

              <p className="text-4xl font-bold text-green-600">
                {
                  users.filter(
                    (u) =>
                      u.role ===
                      "REQUESTER"
                  ).length
                }
              </p>

            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">

              <h3 className="text-slate-500">
                Approvers
              </h3>

              <p className="text-4xl font-bold text-indigo-600">
                {
                  users.filter(
                    (u) =>
                      u.role ===
                      "APPROVER"
                  ).length
                }
              </p>

            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">

              <h3 className="text-slate-500">
                Security
              </h3>

              <p className="text-4xl font-bold text-orange-600">
                {
                  users.filter(
                    (u) =>
                      u.role ===
                      "SECURITY"
                  ).length
                }
              </p>

            </div>

          </div>

          {/* ADD USER */}

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">

            <h2 className="text-2xl font-bold mb-5">
              Add New User
            </h2>

            <div className="grid md:grid-cols-4 gap-4">

              <input
                placeholder="Name"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                className="border rounded-lg p-3"
              />

              <input
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                className="border rounded-lg p-3"
              />

              <input
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                className="border rounded-lg p-3"
              />

              <select
                value={role}
                onChange={(e) =>
                  setRole(
                    e.target.value
                  )
                }
                className="border rounded-lg p-3"
              >

                <option>
                  REQUESTER
                </option>

                <option>
                  APPROVER
                </option>

                <option>
                  SECURITY
                </option>

                <option>
                  ADMIN
                </option>

              </select>

            </div>

            <button
              onClick={
                handleAddUser
              }
              disabled={isSaving}
              className="
                mt-5
                bg-blue-600
                hover:bg-blue-700
                text-white
                px-6
                py-3
                rounded-lg
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >
              {isSaving
                ? "Saving..."
                : "Add User"}
            </button>

          </div>

          {/* SEARCH */}

          <input
            placeholder="Search Users..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="
              w-full
              border
              rounded-xl
              p-4
              mb-6
            "
          />

          {/* TABLE */}

          <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">

            <table className="w-full min-w-[700px]">

              <thead>

                <tr className="bg-slate-100">

                  <th className="p-4 text-left">
                    Name
                  </th>

                  <th className="p-4 text-left">
                    Email
                  </th>

                  <th className="p-4 text-left">
                    Role
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>

                  <th className="p-4 text-left">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {paginatedUsers.map(
                  (user) => (

                    <tr
                      key={user.email}
                      className="border-b"
                    >

                      <td className="p-4">
                        {user.name || "N/A"}
                      </td>

                      <td className="p-4">
                        {user.email}
                      </td>

                      <td className="p-4">
                        {user.role}
                      </td>

                      <td className="p-4">

                        <button
                          onClick={async () => {
                            setFeedback(null);

                            try {

                              const token =
                                localStorage.getItem("token");

                              await axios.put(
                                `/api/users/${user.id}`,
                                {
                                  full_name:
                                    user.name,
                                  email:
                                    user.email,
                                  role:
                                    user.role,
                                  approved:
                                    !user.approved
                                },
                                {
                                  headers: {
                                    Authorization:
                                      `Bearer ${token}`
                                  }
                                }
                              );

                              setFeedback({
                                type: "success",
                                message:
                                  "User status updated"
                              });

                            } catch (error) {

                              setFeedback({
                                type: "error",
                                message:
                                  error.response?.data?.message ||
                                  "Unable to update user status from backend."
                              });
                              return;

                            }

                            setRefresh(
                              !refresh
                            );

                          }}
                          className={`px-4 py-2 rounded text-white ${
                            user.approved
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                        >

                          {user.approved
                            ? "Active"
                            : "Inactive"}

                        </button>

                      </td>

                      <td className="p-4 flex gap-2">

                        <button
                          onClick={() =>
                            setEditingUser(
                              user
                            )
                          }
                          className="
                            bg-yellow-500
                            text-white
                            px-3
                            py-1
                            rounded
                          "
                        >
                          Edit
                        </button>

                        <button
                          onClick={async () => {

                            if (
                              window.confirm(
                                "Delete User?"
                              )
                            ) {
                              setFeedback(null);

                              try {

                                const token =
                                  localStorage.getItem("token");

                                await axios.delete(
                                  `/api/users/${user.id}`,
                                  {
                                    headers: {
                                      Authorization:
                                        `Bearer ${token}`
                                    }
                                  }
                                );

                                setFeedback({
                                  type: "success",
                                  message:
                                    "User deleted"
                                });

                              } catch (error) {

                                setFeedback({
                                  type: "error",
                                  message:
                                    error.response?.data?.message ||
                                    "Unable to delete user from backend."
                                });
                                return;

                              }

                              setRefresh(
                                !refresh
                              );

                            }

                          }}
                          className="
                            bg-red-600
                            text-white
                            px-3
                            py-1
                            rounded
                          "
                        >
                          Delete
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

            <PaginationControls
              page={page}
              pageSize={pageSize}
              totalItems={filteredUsers.length}
              onPageChange={setPage}
            />

          </div>

          {/* EDIT MODAL */}

          {editingUser && (

            <div className="
              fixed
              inset-0
              bg-black/40
              flex
              justify-center
              items-center
            ">

              <div className="
                bg-white
                p-8
                rounded-2xl
                w-[500px]
              ">

                <h2 className="text-2xl font-bold mb-5">
                  Edit User
                </h2>

                <input
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      name:
                        e.target.value,
                    })
                  }
                  className="
                    border
                    p-3
                    w-full
                    mb-4
                  "
                />

                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      role:
                        e.target.value,
                    })
                  }
                  className="
                    border
                    p-3
                    w-full
                    mb-4
                  "
                >

                  <option>
                    REQUESTER
                  </option>

                  <option>
                    APPROVER
                  </option>

                  <option>
                    SECURITY
                  </option>

                  <option>
                    ADMIN
                  </option>

                </select>

                <div className="flex gap-4">

                  <button
                    onClick={async () => {
                      setFeedback(null);
                      setIsSaving(true);

                      try {

                        const token =
                          localStorage.getItem("token");

                        await axios.put(
                          `/api/users/${editingUser.id}`,
                          {
                            full_name:
                              editingUser.name,
                            email:
                              editingUser.email,
                            role:
                              editingUser.role,
                            approved:
                              editingUser.approved
                          },
                          {
                            headers: {
                              Authorization:
                                `Bearer ${token}`
                            }
                          }
                        );

                        setFeedback({
                          type: "success",
                          message:
                            "User updated successfully"
                        });

                      } catch (error) {

                        setFeedback({
                          type: "error",
                          message:
                            error.response?.data?.message ||
                            "Unable to update user from backend."
                        });
                        setIsSaving(false);
                        return;

                      }

                      setEditingUser(
                        null
                      );

                      setRefresh(
                        !refresh
                      );

                      setIsSaving(false);

                    }}
                    disabled={isSaving}
                    className="
                      bg-green-600
                      text-white
                      px-5
                      py-2
                      rounded
                      disabled:opacity-60
                      disabled:cursor-not-allowed
                    "
                  >
                    {isSaving
                      ? "Saving..."
                      : "Save"}
                  </button>

                  <button
                    onClick={() =>
                      setEditingUser(
                        null
                      )
                    }
                    className="
                      bg-gray-500
                      text-white
                      px-5
                      py-2
                      rounded
                    "
                  >
                    Cancel
                  </button>

                </div>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>

  );

}

export default Users;

