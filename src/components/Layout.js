import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content bg-gradient-to-b from-white to-[#F2C2DE]">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
