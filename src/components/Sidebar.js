import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "../firebase";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

function Sidebar() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");

  const auth = getAuth();

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setLoading(false);
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="sidebar">
      <div className="flex justify-center ">
        <img
          src="/Logo.png"
          alt="NeoCare Logo"
          className="bg-white p-1 rounded-full"
        />
      </div>
      <h2 className="font-bold text-3xl mb-5 text-center">
        Birth Center Portal
      </h2>
      <nav className="flex-1">
        <ul>
          <li>
            <NavLink
              to="/portal/approvals"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Pending Approvals
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/portal/reports"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Reports
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/portal/profile"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/logout"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Logout
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
