import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

function ProviderApprovals() {
  const [providers, setProviders] = useState([]);

  // Fetch pending consultant registrations
  const fetchProviders = async () => {
    try {
      // Query the "consultants" collection for documents with approvalStatus "pending"
      const q = query(
        collection(db, "consultants"),
        where("approvalStatus", "==", "pending")
      );
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

  // On component mount, load pending applications
  useEffect(() => {
    fetchProviders();
  }, []);

  // Handles updating the approval status (accept or reject)
  const handleApproval = async (id, status) => {
    try {
      // Reference to the specific document in the "consultants" collection
      const providerRef = doc(db, "consultants", id);
      // Update the approvalStatus field
      await updateDoc(providerRef, { approvalStatus: status });
      alert(`Provider application has been ${status}.`);
      // Refresh the list to reflect the update
      fetchProviders();
    } catch (error) {
      console.error("Error updating provider:", error);
      alert(
        "There was an error updating the provider status. Please try again."
      );
    }
  };

  return (
    <div className="approvals-container">
      <h2 className="font-bold text-3xl mb-5">Provider Approvals</h2>
      {providers.length === 0 ? (
        <p>There are no pending provider applications at this time.</p>
      ) : (
        <div className="application-cards">
          {providers.map((provider) => (
            <div key={provider.id} className="application-card">
              <p>
                <strong>Name:</strong> {provider.name}
              </p>
              <p>
                <strong>Specialty:</strong> {provider.specialty}
              </p>
              <p>
                <strong>Email:</strong> {provider.email}
              </p>
              <div className="button-group">
                <button
                  className="accept"
                  onClick={() => handleApproval(provider.id, "accepted")}
                >
                  Accept
                </button>
                <button
                  className="reject"
                  onClick={() => handleApproval(provider.id, "rejected")}
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

export default ProviderApprovals;
