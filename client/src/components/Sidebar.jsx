import {
  Link,
  useNavigate,
} from "react-router-dom";

function Sidebar({
  role,
  mobileOpen,
  setMobileOpen
}) {
 
  const employeeMenu = [
    {
      title: "Dashboard",
      path: "/employee/dashboard",
    },
    {
      title: "Create Visitor Pass",
      path: "/employee/visitor-pass",
    },
    {
      title: "Create CKD Pass",
      path: "/employee/ckd-pass",
    },
    {
      title: "Create Regular Pass",
      path: "/employee/regular-pass",
    },
    {
      title: "My Requests",
      path: "/employee/requests",
    },
    {
      title: "Notifications",
      path: "/employee/notifications",
    },
    ,
  ];

  const approverMenu = [
  {
    title: "Dashboard",
    path: "/approver/dashboard",
  },

  {
    title: "Create Visitor Pass",
    path: "/approver/visitor-pass",
  },

  {
    title: "Create CKD Pass",
    path: "/approver/ckd-pass",
  },

  {
    title: "Create Regular Pass",
    path: "/approver/regular-pass",
  },

  {
    title: "Pending Requests",
    path: "/approver/pending",
  },

  {
    title: "Approved Requests",
    path: "/approver/approved",
  },

  {
    title: "Rejected Requests",
    path: "/approver/rejected",
  },
  {
  title: "Notifications",
  path: "/approver/notifications",
},


];

  const securityMenu = [
    {
      title: "Dashboard",
      path: "/security/dashboard",
    },
    

    {
  title: "Manual Verification",
  path: "/security/manual-verification",
},

  ];

  const adminMenu = [
    {
      title: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      title: "Users",
      path: "/admin/users",
    },
  
    {
      title: "Reports",
      path: "/admin/reports",
    },
    {
      title: "Audit Logs",
      path: "/admin/audit",
    },
    

    
  ];
  const navigate = useNavigate();
  const user =
  JSON.parse(
    localStorage.getItem("loggedInUser")
  ) ||
  JSON.parse(
    localStorage.getItem("user")
  );

const getProfilePath = () => {

  if (role === "APPROVER")
    return "/approver/profile";

  if (role === "SECURITY")
    return "/security/profile";

  if (role === "ADMIN")
    return "/admin/profile";

  return "/employee/profile";

};

const handleLogout = () => {

  setMobileOpen(false);

  localStorage.removeItem(
    "loggedInUser"
  );

  navigate("/");
};

  let menuItems;

  switch (role) {
    case "APPROVER":
      menuItems = approverMenu;
      break;

    case "SECURITY":
      menuItems = securityMenu;
      break;

    case "ADMIN":
      menuItems = adminMenu;
      break;

    default:
      menuItems = employeeMenu;
  }
  

  return (
  <>

    <div
      className={`
        bg-slate-900
        text-white
        w-64
        min-h-screen
        flex
        flex-col
        fixed
        md:static
        top-0
        left-0
        z-40
        transform
        transition-transform duration-300 ease-in-out
        ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }
        md:translate-x-0
      `}
    >

      <div className="p-5 pl-14 border-b border-slate-700">

        <h2 className="text-xl font-bold">
          {role === "REQUESTER"
            ? "Requester"
            : role === "EMPLOYEE"
            ? "Requester"
            : role} Portal
        </h2>

      </div>

      <ul className="p-4 space-y-2">

        {menuItems.map((item) => (

         <Link
  key={item.title}
  to={item.path}
  onClick={() => setMobileOpen(false)}
>

            <li className="hover:bg-slate-700 p-3 rounded cursor-pointer">

              {item.title}

            </li>

          </Link>

        ))}

      </ul>
      <div className="mt-auto border-t border-slate-700">

  <Link
    to={getProfilePath()}
    onClick={() =>
      setMobileOpen(false)
    }
    className="
      block
      p-4
      hover:bg-slate-800
      transition
      border-b
      border-slate-700
    "
  >

    <div className="flex items-center gap-3">

      <div
        className="
          h-12
          w-12
          rounded-full
          bg-blue-600
          flex
          items-center
          justify-center
          text-white
          font-bold
          text-lg
          shrink-0
        "
      >
        {
          user?.full_name
            ?.charAt(0)
            ?.toUpperCase() || "U"
        }
      </div>

      <div className="overflow-hidden">

        <p className="font-semibold truncate">
          {user?.full_name || "User"}
        </p>

        <p className="text-xs text-slate-300 truncate">
          {role}
        </p>

      </div>

    </div>

  </Link>

  <div className="p-4">

    <button
      onClick={handleLogout}
      className="
        w-full
        bg-red-600
        hover:bg-red-700
        text-white
        py-3
        rounded-lg
        font-semibold
        transition
      "
    >
      Logout
    </button>

  </div>

</div>
    </div>
    </>
  );
}

export default Sidebar;
