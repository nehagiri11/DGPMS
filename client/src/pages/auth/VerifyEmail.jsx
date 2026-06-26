import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function VerifyEmail() {

  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {

    const verify = async () => {

      try {

        const res = await axios.get(
          `/api/auth/verify-email/${token}`
        );

        setSuccess(true);
        setMessage(res.data.message);

      } catch (err) {

        setSuccess(false);
        setMessage(
          err.response?.data?.message ||
          "Verification failed."
        );

      } finally {

        setLoading(false);

      }

    };

    verify();

  }, [token]);

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl font-semibold">
          Verifying your email...
        </h2>
      </div>
    );

  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center">

        {success ? (

          <>
            <div className="text-6xl mb-4">✅</div>

            <h1 className="text-2xl font-bold text-green-700">
              Email Verified
            </h1>

            <p className="mt-4 text-slate-600">
              {message}
            </p>

            <Link
              to="/"
              className="mt-6 inline-block bg-blue-900 text-white px-6 py-3 rounded-lg"
            >
              Go to Login
            </Link>

          </>

        ) : (

          <>
            <div className="text-6xl mb-4">❌</div>

            <h1 className="text-2xl font-bold text-red-600">
              Verification Failed
            </h1>

            <p className="mt-4 text-slate-600">
              {message}
            </p>

            <Link
              to="/"
              className="mt-6 inline-block bg-blue-900 text-white px-6 py-3 rounded-lg"
            >
              Back to Login
            </Link>

          </>

        )}

      </div>

    </div>

  );

}

export default VerifyEmail;
