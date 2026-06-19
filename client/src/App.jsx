import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/employee/Dashboard";
import CreateVisitorPass from "./pages/employee/CreateVisitorPass";
import CreateCKDPass from "./pages/employee/CreateCKDPass";
import CreateRegularPass from "./pages/employee/CreateRegularPass";
import MyRequests from "./pages/employee/MyRequests";
import EmployeeNotifications from "./pages/employee/Notifications";
import ApproverDashboard from "./pages/approver/Dashboard";
import PendingRequests from "./pages/approver/PendingRequests";
import ApproverRequestDetails from "./pages/approver/RequestDetails";
import EmployeeRequestDetails from "./pages/employee/RequestDetails";
import ApprovedRequests from "./pages/approver/ApprovedRequests";
import RejectedRequests from "./pages/approver/RejectedRequests";
import PrintPass from "./pages/common/PrintPass";
import SecurityDashboard
from "./pages/security/Dashboard";
import ManualVerification
from "./pages/security/ManualVerification";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Users
from "./pages/admin/Users";
import Reports from "./pages/admin/Reports";
import AuditLogs
from "./pages/admin/AuditLogs";
import ProtectedRoute from "./components/ProtectedRoute";
import ToastProvider from "./components/ToastProvider";
import ApproverNotifications
from "./pages/approver/Notifications";

function App() {
  const protect = (
    element,
    allowedRoles
  ) => (
    <ProtectedRoute
      allowedRoles={allowedRoles}
    >
      {element}
    </ProtectedRoute>
  );

  return (
    <ToastProvider>
    <BrowserRouter>

      <Routes>
        

        <Route path="/" element={<Login />} />

        <Route
          path="/employee/dashboard"
          element={protect(
            <Dashboard />,
            ["REQUESTER", "EMPLOYEE"]
          )}
        />

        <Route
          path="/employee/visitor-pass"
          element={protect(
            <CreateVisitorPass />,
            ["REQUESTER", "EMPLOYEE"]
          )}
        />

        <Route
          path="/employee/ckd-pass"
          element={protect(
            <CreateCKDPass />,
            ["REQUESTER", "EMPLOYEE"]
          )}
        />

        <Route
          path="/employee/regular-pass"
          element={protect(
            <CreateRegularPass />,
            ["REQUESTER", "EMPLOYEE"]
          )}
        />

        <Route
          path="/employee/requests"
          element={protect(
            <MyRequests />,
            ["REQUESTER", "EMPLOYEE"]
          )}
        />

        

        <Route
          path="/employee/notifications"
          element={protect(
            <EmployeeNotifications />,
            ["REQUESTER", "EMPLOYEE"]
          )}
        />
        <Route
          path="/approver/dashboard"
          element={protect(
            <ApproverDashboard />,
            ["APPROVER"]
          )}
        />

        <Route
          path="/approver/pending"
          element={protect(
            <PendingRequests />,
            ["APPROVER"]
          )}
        />

        <Route
  path="/approver/request-details/:passNo"
  element={protect(
    <ApproverRequestDetails />,
    ["APPROVER"]
  )}
/>

<Route
  path="/employee/request-details/:passNo"
  element={protect(
    <EmployeeRequestDetails />,
    ["REQUESTER", "EMPLOYEE"]
  )}
/>

        <Route
          path="/approver/approved"
          element={protect(
            <ApprovedRequests />,
            ["APPROVER"]
          )}
        />

        <Route
          path="/approver/rejected"
          element={protect(
            <RejectedRequests />,
            ["APPROVER"]
          )}
        />

        <Route
          path="/print-pass/:passNo"
          element={protect(
            <PrintPass />,
            [
              "REQUESTER",
              "EMPLOYEE",
              "APPROVER",
              "SECURITY",
              "ADMIN"
            ]
          )}
        />

        <Route
  path="/security/dashboard"
  element={protect(
    <SecurityDashboard />,
    ["SECURITY"]
  )}
/>



<Route
  path="/approver/visitor-pass"
  element={protect(
    <CreateVisitorPass />,
    ["APPROVER"]
  )}
/>

<Route
  path="/approver/ckd-pass"
  element={protect(
    <CreateCKDPass />,
    ["APPROVER"]
  )}
/>

<Route
  path="/approver/regular-pass"
  element={protect(
    <CreateRegularPass />,
    ["APPROVER"]
  )}
/>
<Route
  path="/approver/notifications"
  element={
    <ApproverNotifications/>
  }
/>


<Route
  path="/security/manual-verification"
  element={protect(
    <ManualVerification />,
    ["SECURITY"]
  )}
/>

<Route
  path="/admin/dashboard"
  element={protect(
    <AdminDashboard />,
    ["ADMIN"]
  )}
/>

<Route
  path="/admin/users"
  element={protect(
    <Users />,
    ["ADMIN"]
  )}
/>
<Route
  path="/admin/reports"
  element={protect(
    <Reports />,
    ["ADMIN"]
  )}
/>

<Route
  path="/admin/audit"
  element={protect(
    <AuditLogs />,
    ["ADMIN"]
  )}
/>
      </Routes>

    </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
