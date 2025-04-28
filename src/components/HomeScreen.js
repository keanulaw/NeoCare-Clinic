// src/components/HomeScreen.js
import React from "react";
import Sidebar from "./Sidebar";

function HomeScreen() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content"></div>
      <div className="main-content flex items-center justify-center flex-col">
        <h2 className="text-5xl text-[#d47fa6] font-bold">
          Welcome to the Clinic Portal
        </h2>
        <p className="mt-5 text-xl">
          Here you can quickly review key performance indicators and recent
          activity.
        </p>
      </div>
    </div>
  );
}

export default HomeScreen;
