// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ProviderApprovals from "./components/ProviderApprovals";
import Reports from "./components/Reports";
import "./App.css";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* protected */}
        <Route path="/portal/*" element={<Layout />}>
          {/* redirect index → approvals */}
          <Route index element={<Navigate to="approvals" replace />} />

          {/* provider approvals */}
          <Route path="approvals" element={<ProviderApprovals />} />
          <Route path="reports" element={<Reports />} />
          <Route path="logout" element={<Login />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
