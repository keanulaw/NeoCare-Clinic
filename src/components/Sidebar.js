import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function Sidebar() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
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
      <h2 className="font-bold text-3xl mb-5 text-center">Birth Center Portal</h2>
      <nav>
        <ul>
          <li>
            <NavLink
              to="/portal/approvals"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Provider Approvals
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/portal/financial"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Financial Overview
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
              onClick={logout}
              className="text-white text-lg cursor-pointer"
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
