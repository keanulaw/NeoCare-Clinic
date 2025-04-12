// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './components/Overview';
import Login from './components/Login';
import Register from './components/Register';
import ProviderApprovals from './components/ProviderApprovals';
import FinancialOverview from './components/FinancialOverview';
import Reports from './components/Reports';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route will display the Login screen */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes: after login the user can be navigated to /portal */}
        <Route path="/portal/*" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="approvals" element={<ProviderApprovals />} />
          <Route path="financial" element={<FinancialOverview />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* If no routes match, redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
