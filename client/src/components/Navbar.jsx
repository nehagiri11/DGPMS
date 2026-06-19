import { useNavigate } from "react-router-dom";
import {
  useEffect,
  useState
} from "react";
import axios from "axios";

function Navbar({
  role = "EMPLOYEE",
  mobileOpen,
  setMobileOpen
}) {

  const navigate = useNavigate();
  const loggedInUser = JSON.parse(
  localStorage.getItem("loggedInUser")

  
);
  const [unreadCount,
    setUnreadCount] =
    useState(0);

  useEffect(() => {

    const loadUnreadCount =
      async () => {

        try {

          const token =
            localStorage.getItem(
              "token"
            );

          if (!token) {
            return;
          }

          const response =
            await axios.get(
              "/api/notifications/unread-count",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`
                }
              }
            );

          setUnreadCount(
            response.data.count || 0
          );

        } catch (error) {

          setUnreadCount(0);

        }

      };

    loadUnreadCount();

  }, []);

  const openNotifications = () => {

    if (role === "APPROVER") {
      navigate(
        "/approver/notifications"
      );
      return;
    }

    if (role === "ADMIN") {
      navigate(
        "/admin/audit"
      );
      return;
    }

    navigate(
      "/employee/notifications"
    );

  };

 
  return (

    <div
  className="
    sticky
    top-0
    z-30
    bg-white
    shadow
    px-4
    py-4
    flex
    justify-between
    items-center
  "
>

      {/* Left Side */}

      <div className="flex items-center gap-3">
        <button
  onClick={() =>
    setMobileOpen(!mobileOpen)
  }
  className="
    md:hidden
    bg-slate-900
    text-white
    px-3
    py-2
    rounded-lg
    shadow
  "
>
  ☰
</button>

        <h1 className="text-lg md:text-2xl font-bold text-blue-700">
          DGPMS
        </h1>

        <p className="hidden md:block text-sm text-gray-500">
          Digital Gate Pass Management System
        </p>

      </div>

      {/* Right Side */}

      <div className="flex items-center gap-4">

        {role !== "SECURITY" && role !== "ADMIN" && (

          <button
            type="button"
            onClick={openNotifications}
            className="
              relative
              h-10
              w-10
              rounded-full
              bg-slate-100
              hover:bg-slate-200
              flex
              items-center
              justify-center
              transition
            "
            title="Notifications"
          >
            <span className="text-xl">
              &#128276;
            </span>

            {unreadCount > 0 && (

              <span
                className="
                  absolute
                  -top-1
                  -right-1
                  min-w-5
                  h-5
                  px-1
                  rounded-full
                  bg-red-600
                  text-white
                  text-xs
                  font-bold
                  flex
                  items-center
                  justify-center
                "
              >
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>

            )}
          </button>

        )}

        <div className="text-right">

          <p className="text-xs text-slate-500">
            Welcome
          </p>

          <p className="text-sm text-gray-500">
            {loggedInUser?.name || role}
          </p>

        </div>

        

      </div>

    </div>

  );
}

export default Navbar;
