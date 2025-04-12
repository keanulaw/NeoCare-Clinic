// src/components/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

function DashboardScreen() {
  const [applications, setApplications] = useState([]);

  // Fetch pending applications from Firestore
  const fetchApplications = async () => {
    try {
      const q = query(collection(db, "applications"), where("status", "==", "pending"));
      const querySnapshot = await getDocs(q);
      const apps = [];
      querySnapshot.forEach((docSnap) => {
        apps.push({ id: docSnap.id, ...docSnap.data() });
      });
      setApplications(apps);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Update application status (accept or reject)
  const handleAction = async (id, newStatus) => {
    try {
      const appRef = doc(db, "applications", id);
      await updateDoc(appRef, { status: newStatus });
      alert(`Application has been ${newStatus}.`);
      fetchApplications();  // Refresh the list after updating
    } catch (error) {
      console.error("Error updating application:", error);
    }
  };

  return (
    <div className="dashboard-container container">
      <h2>Clinic Portal Dashboard</h2>
      <Link className="back-link" to="/">Back to Home</Link>
      {applications.length === 0 ? (
        <p>No pending applications.</p>
      ) : (
        <div className="application-cards">
          {applications.map(app => (
            <div key={app.id} className="application-card">
              <p><strong>Name:</strong> {app.name}</p>
              <p><strong>Specialization:</strong> {app.specialization}</p>
              <p><strong>Email:</strong> {app.email}</p>
              <div className="button-group">
                <button
                  className="accept"
                  onClick={() => handleAction(app.id, 'accepted')}
                >
                  Accept
                </button>
                <button
                  className="reject"
                  onClick={() => handleAction(app.id, 'rejected')}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DashboardScreen;
