// src/components/HomeScreen.js
import React from 'react';
import { Link } from 'react-router-dom';

function HomeScreen() {
  return (
    <div className="home-container container">
      <h2>Welcome to the Clinic Portal</h2>
      <p>Manage health professional applications efficiently with our modern system.</p>
      <Link className="button" to="/dashboard">Go to Dashboard</Link>
    </div>
  );
}

export default HomeScreen;
