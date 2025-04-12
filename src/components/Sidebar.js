import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Clinic Portal</h2>
      <nav>
        <ul>
          <li>
            <NavLink end to="/" className={({ isActive }) => isActive ? 'active' : ''}>
              Overview
            </NavLink>
          </li>
          <li>
            <NavLink to="/approvals" className={({ isActive }) => isActive ? 'active' : ''}>
              Provider Approvals
            </NavLink>
          </li>
          <li>
            <NavLink to="/financial" className={({ isActive }) => isActive ? 'active' : ''}>
              Financial Overview
            </NavLink>
          </li>
          <li>
            <NavLink to="/reports" className={({ isActive }) => isActive ? 'active' : ''}>
              Reports
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
