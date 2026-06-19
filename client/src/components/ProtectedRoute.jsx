import { Navigate } from "react-router-dom";

const dashboardByRole = {
  ADMIN: "/admin/dashboard",
  APPROVER: "/approver/dashboard",
  SECURITY: "/security/dashboard",
  REQUESTER: "/employee/dashboard",
  EMPLOYEE: "/employee/dashboard",
};

function readStoredUser() {

  try {

    return (
      JSON.parse(
        localStorage.getItem("loggedInUser")
      ) ||
      JSON.parse(
        localStorage.getItem("user")
      )
    );

  } catch (error) {

    return null;

  }

}

function ProtectedRoute({
  children,
  allowedRoles = []
}) {

  const token =
    localStorage.getItem("token");

  const user =
    readStoredUser();

  if (!token || !user) {

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }

  const role =
    user.role ||
    user.role_name;

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(role)
  ) {

    return (
      <Navigate
        to={
          dashboardByRole[role] ||
          "/"
        }
        replace
      />
    );

  }

  return children;

}

export default ProtectedRoute;
