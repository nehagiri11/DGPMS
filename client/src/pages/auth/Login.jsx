import {
  useEffect,
  useRef,
  useState
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../components/ToastProvider";

import {
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import { FcGoogle } from "react-icons/fc";

const ALLOWED_EMAIL_DOMAIN =
  "@laxmimotocorp.com";

const isAllowedCompanyEmail = (value) =>
  value.endsWith(ALLOWED_EMAIL_DOMAIN);

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const loadGoogleIdentityScript = () =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existingScript =
      document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        resolve,
        { once: true }
      );
      existingScript.addEventListener(
        "error",
        reject,
        { once: true }
      );
      return;
    }

    const script =
      document.createElement("script");

    script.src =
      "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;

    document.body.appendChild(script);
  });

function Login() {
  
  const navigate = useNavigate();
  const showToast =
    useToast();
  const [activeTab, setActiveTab] =
    useState("signin");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [forgotSending, setForgotSending] =
    useState(false);

  const [googleReady, setGoogleReady] =
    useState(false);

  const [googleBusy, setGoogleBusy] =
    useState(false);

  const googleSignInButtonRef =
    useRef(null);

  const googleSignUpButtonRef =
    useRef(null);

  const googleModeRef =
    useRef(activeTab);

  const [name, setName] =
    useState("");

  const [employeeId, setEmployeeId] =
    useState("");

  const [department, setDepartment] =
    useState("");

const handleAuthenticatedUser = (user, token) => {

  localStorage.setItem(
    "token",
    token
  );

  localStorage.setItem(
    "user",
    JSON.stringify(user)
  );

  localStorage.setItem(
    "loggedInUser",
    JSON.stringify(user)
  );

  setError("");

  if (
    user.role === "REQUESTER"
  ) {

    navigate(
      "/employee/dashboard"
    );

  }

  else if (
    user.role === "APPROVER"
  ) {

    navigate(
      "/approver/dashboard"
    );

  }

  else if (
    user.role === "SECURITY"
  ) {

    navigate(
      "/security/dashboard"
    );

  }

  else if (
    user.role === "ADMIN"
  ) {

    navigate(
      "/admin/dashboard"
    );

  }

};

const handleGoogleCredential = async (response) => {

  if (!response?.credential) {
    setError(
      "Google sign-in did not return a credential."
    );
    return;
  }

  try {

    setGoogleBusy(true);

    const result =
      await axios.post(
        "/api/auth/google",
        {
          credential: response.credential,
          mode:
            googleModeRef.current === "signup"
              ? "signup"
              : "signin"
        }
      );

    if (result.data?.token && result.data?.user) {
      handleAuthenticatedUser(
        result.data.user,
        result.data.token
      );
      return;
    }

    setError("");
    setActiveTab("signin");
    showToast?.(
      result.data?.message ||
      "Account created and waiting for admin approval.",
      "success"
    );

  } catch (error) {

    setError(
      error.response?.data?.message ||
      "Google sign-in failed."
    );

  } finally {

    setGoogleBusy(false);

  }

};

useEffect(() => {
  googleModeRef.current = activeTab;
}, [activeTab]);

useEffect(() => {

  if (!GOOGLE_CLIENT_ID) {
    return;
  }

  let cancelled = false;

  loadGoogleIdentityScript()
    .then(() => {
      if (cancelled) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential
      });

      setGoogleReady(true);
    })
    .catch(() => {
      if (!cancelled) {
        setGoogleReady(false);
      }
    });

  return () => {
    cancelled = true;
  };

}, []);

useEffect(() => {

  if (!googleReady) {
    return;
  }

  const buttonRef =
    activeTab === "signup"
      ? googleSignUpButtonRef
      : googleSignInButtonRef;

  if (!buttonRef.current) {
    return;
  }

  buttonRef.current.innerHTML = "";

  window.google.accounts.id.renderButton(
    buttonRef.current,
    {
      theme: "outline",
      size: "large",
      width: buttonRef.current.offsetWidth || 400,
      text:
        activeTab === "signup"
          ? "signup_with"
          : "signin_with"
    }
  );

}, [activeTab, googleReady]);

const handleLogin = async (e) => {

  e.preventDefault();

  const normalizedEmail =
    email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    setError(
      "Email and password are required."
    );
    return;
  }

  if (
    !isAllowedCompanyEmail(
      normalizedEmail
    )
  ) {
    setError(
      "Only company email addresses are allowed."
    );
    return;
  }

  try {

    const response =
      await axios.post(

        "/api/auth/login",

        {
          email: normalizedEmail,
          password
        }

      );

    const {
      token,
      user
    } = response.data;

    handleAuthenticatedUser(
      user,
      token
    );

  } catch (error) {

    setError(

      error.response?.data?.message ||

      "Login Failed"

    );

  }

};

  const handleSignup = async (e) => {
    e.preventDefault();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (
      !name.trim() ||
      !employeeId.trim() ||
      !normalizedEmail ||
      !password
    ) {
      setError(
        "Full name, employee ID, email and password are required."
      );
      return;
    }

    if (
      !isAllowedCompanyEmail(
        normalizedEmail
      )
    ) {
      setError(
        "Only company email addresses are allowed."
      );
      return;
    }

    try {

      await axios.post(
        "/api/auth/register",
        {
          full_name: name.trim(),
          employee_code: employeeId.trim(),
          email: normalizedEmail,
          password
        }
      );

      setError("");
      setActiveTab("signin");
      showToast?.(
        "Account created successfully.\nWaiting for Admin approval.",
        "success"
      );

    } catch (error) {

      if (error.response?.data?.message) {
        setError(
          error.response.data.message
        );
        return;
      }

      if (error.request) {
        setError(
          "Cannot connect to backend. Start the backend server and try again."
        );
        return;
      }

      setError(
        "Signup failed"
      );

    }
  };

  const handleForgotPassword = async (e) => {

    e.preventDefault();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Enter your company email to reset your password."
      );
      return;
    }

    try {

      setForgotSending(true);

      await axios.post(
        "/api/auth/forgot-password",
        {
          email: normalizedEmail
        }
      );

      setError("");
      showToast?.(
        "If this email exists, a reset link has been sent.",
        "success"
      );
      setActiveTab("signin");

    } catch (error) {

      setError(
        error.response?.data?.message ||
        "Unable to send reset link."
      );

    } finally {

      setForgotSending(false);

    }

  };

  return (
    <div className="min-h-screen flex">

  {/* LEFT PANEL */}

  <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white p-16 flex-col justify-between">

    <div>

      <div className="flex items-center gap-4 mb-12">

        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-blue-900 text-3xl font-bold">
          LMC
        </div>

        <div>

          <h1 className="text-3xl font-bold">
            LAXMI MOTOR
          </h1>

          <p className="text-blue-100">
            Corporation Pvt. Ltd.
          </p>

        </div>

      </div>

      <h2 className="text-5xl font-bold leading-tight">
        Digital Gate Pass
        <br />
        Management System
      </h2>

      <p className="text-blue-100 mt-8 text-lg">
        Securely manage visitor entry,
        logistics movement, approvals,
        and gate security operations.
      </p>

    </div>


  </div>

  {/* RIGHT PANEL */}

  <div className="w-full lg:w-1/2 flex justify-center items-center bg-slate-100 p-8">

    <div className="bg-white w-full max-w-xl rounded-3xl shadow-xl p-10">

        {/* Header */}

        <div className="text-center">

         <h1 className="text-4xl font-bold text-slate-800">
           Welcome Back
          </h1>

        <p className="text-gray-500 mt-3">
          Sign in to continue to DGPMS
        </p>

      
        </div>

        {/* Tabs */}

        <div className="grid grid-cols-2 mt-8 bg-gray-100 rounded-lg p-1">

          <button
            onClick={() =>
              setActiveTab("signin")
            }
            className={`py-3 rounded-lg font-semibold transition-all ${
              activeTab === "signin"
                ? "bg-white shadow text-blue-700"
                : "text-gray-500"
            }`}
          >
            Sign In
          </button>

          <button
            onClick={() =>
              setActiveTab("signup")
            }
            className={`py-3 rounded-lg font-semibold transition-all ${
              activeTab === "signup"
                ? "bg-white shadow text-blue-700"
                : "text-gray-500"
            }`}
          >
            Sign Up
          </button>

        </div>

        {/* Sign In */}

        {activeTab === "signin" && (

          <form
            onSubmit={handleLogin}
            className="mt-6"
          >

            <input
              type="email"
              placeholder="Company Email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              className="w-full border rounded-lg p-3 mb-4"
            />

            <div className="relative mb-3">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                className="w-full border rounded-lg p-3"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-3 top-3 text-gray-500"
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>

            <div className="text-right mb-4">

              <button
  type="button"
  onClick={() => {
    setError("");
    setActiveTab("forgot");
  }}
  className="text-blue-600 font-medium hover:text-blue-800"
>
  Forgot Password?
</button>

            </div>

            <button
              type="submit"
              className="w-full bg-blue-900 text-white py-4 rounded-xl hover:bg-blue-800 transition font-semibold"
            >
              Sign In
            </button>

            <div className="my-5 text-center text-gray-400">
              OR
            </div>

            {GOOGLE_CLIENT_ID ? (
              <div
                ref={googleSignInButtonRef}
                className={`w-full flex justify-center ${
                  googleBusy
                    ? "opacity-60 pointer-events-none"
                    : ""
                }`}
              />
            ) : (
              <button
                type="button"
                className="w-full border py-4 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-3 font-medium transition"
                onClick={() =>
                  showToast?.(
                    "Set VITE_GOOGLE_CLIENT_ID to enable Google sign-in.",
                    "info"
                  )
                }
              >
                <FcGoogle size={24} />
                Continue with Google
              </button>
            )}

          </form>

        )}

        {activeTab === "forgot" && (

          <form
            onSubmit={handleForgotPassword}
            className="mt-6"
          >
            <p className="text-slate-600 mb-4">
              Enter your company email and we will send a password reset link.
            </p>

            <input
              type="email"
              placeholder="Company Email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              className="w-full border rounded-lg p-3 mb-4"
            />

            <button
              type="submit"
              disabled={forgotSending}
              className="
                w-full
                bg-blue-900
                text-white
                py-4
                rounded-xl
                hover:bg-blue-800
                transition
                font-semibold
                disabled:opacity-60
              "
            >
              {forgotSending
                ? "Sending..."
                : "Send Reset Link"}
            </button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setActiveTab("signin");
              }}
              className="w-full mt-4 text-blue-600 font-medium hover:text-blue-800"
            >
              Back to Sign In
            </button>
          </form>

        )}

        {/* Sign Up */}

        {activeTab === "signup" && (

          <form
            onSubmit={handleSignup}
            className="mt-6"
          >

            <input
              placeholder="Full Name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              className="w-full border rounded-lg p-3 mb-4"
            />

            <input
              placeholder="Employee ID"
              value={employeeId}
              onChange={(e) =>
                setEmployeeId(
                  e.target.value
                )
              }
              className="w-full border rounded-lg p-3 mb-4"
            />

            <input
              placeholder="Department"
              value={department}
              onChange={(e) =>
                setDepartment(
                  e.target.value
                )
              }
              className="w-full border rounded-lg p-3 mb-4"
            />

            <input
              type="email"
              placeholder="Company Email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              className="w-full border rounded-lg p-3 mb-4"
            />

            <div className="relative mb-4">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                className="w-full border rounded-lg p-3"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-3 top-3 text-gray-500"
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>

            <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg mb-4">
              Only users with a
              @laxmimotocorp.com
              company email can register.
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
            >
              Create Account
            </button>

            <div className="my-5 text-center text-gray-400">
              OR
            </div>

            {GOOGLE_CLIENT_ID ? (
              <div
                ref={googleSignUpButtonRef}
                className={`w-full flex justify-center ${
                  googleBusy
                    ? "opacity-60 pointer-events-none"
                    : ""
                }`}
              />
            ) : (
              <button
                type="button"
                className="w-full border py-4 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-3 font-medium transition"
                onClick={() =>
                  showToast?.(
                    "Set VITE_GOOGLE_CLIENT_ID to enable Google sign-up.",
                    "info"
                  )
                }
              >
                <FcGoogle size={24} />
                Sign up with Google
              </button>
            )}

          </form>

        )}

        {/* Error Message */}

        {error && (

          <div className="mt-8 text-center">

            <p className="text-red-600 text-xl font-bold">
              {error}
            </p>

          </div>

        )}

      </div>

    </div>
          </div>

    


  );
}

export default Login;

