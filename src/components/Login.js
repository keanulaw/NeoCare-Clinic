import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/portal/*"); // Redirect to main portal (Overview) on successful login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="h-screen relative flex justify-center items-center overflow-hidden">
      <div className="auth-container">
        <div className="flex justify-center">
          <img src="/Logo.png" alt="NeoCare Logo" />
        </div>
        <h2 className="text-2xl font-bold">Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account?{" "}
          <Link to="/register" className="text-[#d47fa6] underline">
            Register here.
          </Link>
        </p>
      </div>
      <img
        src="/center.jpg"
        alt="Background"
        className="absolute top-0 left-0 -z-10 opacity-70"
      />
    </div>
  );
}

export default Login;
