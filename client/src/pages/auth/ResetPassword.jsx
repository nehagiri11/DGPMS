import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../components/ToastProvider";

function ResetPassword() {
  const { token } =
    useParams();

  const navigate =
    useNavigate();

  const showToast =
    useToast();

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const handleReset = async (e) => {

    e.preventDefault();

    if (!password || !confirmPassword) {
      setError(
        "Enter and confirm your new password."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {

      setSaving(true);

      await axios.post(
        "/api/auth/reset-password",
        {
          token,
          password
        }
      );

      showToast?.(
        "Password reset successfully. Please sign in.",
        "success"
      );

      navigate("/");

    } catch (error) {

      setError(
        error.response?.data?.message ||
        "Unable to reset password."
      );

    } finally {

      setSaving(false);

    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <form
        onSubmit={handleReset}
        className="bg-white w-full max-w-lg rounded-3xl shadow-xl p-10"
      >
        <h1 className="text-3xl font-bold text-slate-800 text-center">
          Reset Password
        </h1>

        <p className="text-slate-500 text-center mt-3 mb-8">
          Create a new password for your DGPMS account.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          placeholder="New Password"
          className="w-full border rounded-lg p-3 mb-4"
        />

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
          placeholder="Confirm New Password"
          className="w-full border rounded-lg p-3 mb-4"
        />

        <button
          type="submit"
          disabled={saving}
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
          {saving
            ? "Saving..."
            : "Reset Password"}
        </button>

        {error && (
          <p className="text-red-600 text-center font-bold mt-6">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

export default ResetPassword;
