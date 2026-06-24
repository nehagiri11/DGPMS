import {
  useEffect,
  useRef,
  useState
} from "react";
import {
  useLocation,
  useNavigate
} from "react-router-dom";
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

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-100";

const primaryButtonClass =
  "w-full rounded-xl bg-blue-900 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60";

const secondaryButtonClass =
  "w-full rounded-xl border border-slate-200 bg-white py-3.5 font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100";

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
  const location = useLocation();
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

const requestedRedirectPath =
  new URLSearchParams(
    location.search
  ).get("redirect") ||
  location.state?.from ||
  "";

const getSafeRedirectPath = () => {

  if (
    !requestedRedirectPath ||
    !requestedRedirectPath.startsWith("/") ||
    requestedRedirectPath.startsWith("//")
  ) {
    return "";
  }

  return requestedRedirectPath;

};

const safeRedirectPath =
  getSafeRedirectPath();

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

  if (safeRedirectPath) {
    navigate(
      safeRedirectPath,
      {
        replace: true
      }
    );
    return;
  }

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
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[0.95fr_1.05fr]">

  {/* LEFT PANEL */}

  <div className="hidden lg:flex bg-blue-950 text-white px-14 py-12 flex-col justify-between">

    <div>

      <div className="flex items-center gap-4 mb-16">

        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-900 text-2xl font-bold shadow-sm">
          LMC
        </div>

        <div>

          <h1 className="text-3xl font-bold tracking-tight">
            LAXMI MOTOR
          </h1>

          <p className="text-blue-100">
            Corporation Pvt. Ltd.
          </p>

        </div>

      </div>

      <h2 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight">
        Digital Gate Pass
        <br />
        Management System
      </h2>

      <p className="text-blue-100 mt-8 max-w-xl text-lg leading-8">
        Securely manage visitor entry,
        logistics movement, approvals,
        and gate security operations.
      </p>

    </div>

    <div className="grid grid-cols-3 gap-3 text-sm text-blue-100">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        Visitors
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        Approvals
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        Security
      </div>
    </div>

  </div>

  {/* RIGHT PANEL */}

  <div className="flex min-h-screen w-full items-center justify-center px-5 py-8 sm:px-8">

    <div className="w-full max-w-[520px] rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-300/40 sm:p-8">

        {/* Header */}

        <div className="text-center">

         <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
           Welcome Back
          </h1>

        <p className="text-slate-500 mt-2">
          Sign in to continue to DGPMS
        </p>

        {safeRedirectPath && (
          <p className="mx-auto mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
            Sign in with your registered email to verify your account and open this pass.
          </p>
        )}

      
        </div>

        {/* Tabs */}

        <div className="grid grid-cols-2 mt-7 rounded-xl bg-slate-100 p-1">

          <button
            onClick={() =>
              setActiveTab("signin")
            }
            className={`rounded-lg py-3 font-semibold transition-all ${
              activeTab === "signin"
                ? "bg-white text-blue-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Sign In
          </button>

          <button
            onClick={() =>
              setActiveTab("signup")
            }
            className={`rounded-lg py-3 font-semibold transition-all ${
              activeTab === "signup"
                ? "bg-white text-blue-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Sign Up
          </button>

        </div>

        {/* Sign In */}

        {activeTab === "signin" && (

          <form
            onSubmit={handleLogin}
            className="mt-6 space-y-4"
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
              className={inputClass}
            />

            <div className="relative">

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
                className={`${inputClass} pr-12`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>

            <div className="text-right">

              <button
  type="button"
  onClick={() => {
    setError("");
    setActiveTab("forgot");
  }}
  className="text-sm font-semibold text-blue-700 hover:text-blue-900"
>
  Forgot Password?
</button>

            </div>

            <button
              type="submit"
              className={primaryButtonClass}
            >
              Sign In
            </button>

            <div className="flex items-center gap-3 py-1 text-center text-sm font-medium text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              OR
              <span className="h-px flex-1 bg-slate-200" />
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
                className={`${secondaryButtonClass} flex items-center justify-center gap-3`}
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
            className="mt-6 space-y-4"
          >
            <p className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-slate-600">
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
              className={inputClass}
            />

            <button
              type="submit"
              disabled={forgotSending}
              className={primaryButtonClass}
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
              className="w-full rounded-xl py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 hover:text-blue-900"
            >
              Back to Sign In
            </button>
          </form>

        )}

        {/* Sign Up */}

        {activeTab === "signup" && (

          <form
            onSubmit={handleSignup}
            className="mt-6 space-y-4"
          >

            <input
              placeholder="Full Name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              className={inputClass}
            />

            <input
              placeholder="Employee ID"
              value={employeeId}
              onChange={(e) =>
                setEmployeeId(
                  e.target.value
                )
              }
              className={inputClass}
            />

            <input
              placeholder="Department"
              value={department}
              onChange={(e) =>
                setDepartment(
                  e.target.value
                )
              }
              className={inputClass}
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
              className={inputClass}
            />

            <div className="relative">

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
                className={`${inputClass} pr-12`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
              Manual signup requires an
              {" "}
              <span className="font-semibold">
                @laxmimotocorp.com
              </span>
              {" "}
              email. Google signup can use any Google account, but admin approval is required before login.
            </div>

            <button
              type="submit"
              className={primaryButtonClass}
            >
              Create Account
            </button>

            <div className="flex items-center gap-3 py-1 text-center text-sm font-medium text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              OR
              <span className="h-px flex-1 bg-slate-200" />
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
                className={`${secondaryButtonClass} flex items-center justify-center gap-3`}
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

          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center">

            <p className="text-sm font-semibold text-red-700">
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

