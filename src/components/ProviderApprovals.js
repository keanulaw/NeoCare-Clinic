import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

function ProviderApprovals() {
  const [providers, setProviders] = useState([]);

  // Fetch pending provider applications from Firestore
  const fetchProviders = async () => {
    try {
      const q = query(collection(db, "applications"), where("status", "==", "pending"));
      const querySnapshot = await getDocs(q);
      const result = [];
      querySnapshot.forEach((docSnap) => {
        result.push({ id: docSnap.id, ...docSnap.data() });
      });
      setProviders(result);
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  // Update provider application status
  const handleApproval = async (id, status) => {
    try {
      const providerRef = doc(db, "applications", id);
      await updateDoc(providerRef, { status });
      alert(`Provider application has been ${status}.`);
      fetchProviders();
    } catch (error) {
      console.error("Error updating provider:", error);
    }
  };

  return (
    <div className="approvals-container">
      <h2>Provider Approvals</h2>
      {providers.length === 0 ? (
        <p>There are no pending provider applications at this time.</p>
      ) : (
        <div className="application-cards">
          {providers.map(provider => (
            <div key={provider.id} className="application-card">
              <p><strong>Name:</strong> {provider.name}</p>
              <p><strong>Specialization:</strong> {provider.specialization}</p>
              <p><strong>Email:</strong> {provider.email}</p>
              <div className="button-group">
                <button className="accept" onClick={() => handleApproval(provider.id, 'accepted')}>Approve</button>
                <button className="reject" onClick={() => handleApproval(provider.id, 'rejected')}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProviderApprovals;
