import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [resetMessage, setResetMessage] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setResetMessage(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/portal/approvals");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setResetMessage(null);
    if (!email) {
      setError("Please enter your email to reset your password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#F2C2DE] to-white px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md relative z-10">
        <div className="flex flex-col items-center">
          <img src="/Logo.png" alt="NeoCare Logo" className="w-20 h-20 mb-2" />
          <h2 className="text-3xl font-bold text-[#DA79B9] mb-1">NeoCare</h2>
          <p className="text-gray-600 mb-6 text-center">
            Login to your clinic portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA79B9]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA79B9]"
            />
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-[#DA79B9] underline hover:text-[#c760a3] cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {resetMessage && (
            <p className="text-green-600 text-sm">{resetMessage}</p>
          )}

          <button
            type="submit"
            className="w-full bg-[#DA79B9] hover:bg-[#c760a3] text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#DA79B9] underline font-medium">
            Register here
          </Link>
        </p>
      </div>

      {/* Background image (optional, faded) */}
      <img
        src="/center.jpg"
        alt="Background"
        className="absolute top-0 left-0 w-full h-full object-cover opacity-20 z-0"
      />
    </div>
  );
}

export default Login;
