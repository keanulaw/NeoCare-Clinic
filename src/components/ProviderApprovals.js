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
  const [rates, setRates] = useState({}); // track hourly rates by provider ID
  const [loading, setLoading] = useState(false);

  /* ───────── load pending applications ───────── */
  const fetchProviders = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "consultants"),
        where("approvalStatus", "==", "pending")
      );
      const qs = await getDocs(q);
      const data = [];
      qs.forEach((snap) => data.push({ id: snap.id, ...snap.data() }));
      setProviders(data);

      // initialise rate map (preserves any typing if user refreshes list)
      const map = {};
      data.forEach((p) => (map[p.id] = rates[p.id] ?? ""));
      setRates(map);
    } catch (err) {
      console.error("Error fetching providers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ───────── approve / reject ───────── */
  const handleApproval = async (id, status) => {
    // require hourly‑rate when accepting
    if (status === "accepted") {
      const raw = rates[id]?.toString().trim();
      const num = Number(raw);

      if (!raw || Number.isNaN(num) || num <= 0) {
        alert("Please enter a valid hourly rate greater than 0.");
        return;
      }

      await writeUpdate(id, status, num);
    } else {
      await writeUpdate(id, status);
    }
  };

  const writeUpdate = async (id, status, hourlyRate = null) => {
    try {
      const ref = doc(db, "consultants", id);
      const payload =
        hourlyRate != null
          ? { approvalStatus: status, hourlyRate }
          : { approvalStatus: status };

      await updateDoc(ref, payload);
      alert(`Provider application has been ${status}.`);
      fetchProviders(); // refresh list
    } catch (err) {
      console.error("Error updating provider:", err);
      alert(
        "There was an error updating the provider status. Please try again."
      );
    }
  };

  /* ───────── UI ───────── */
  return (
    <div className="approvals-container">
      <h2 className="font-bold text-3xl mb-5">Provider Approvals</h2>

      {loading ? (
        <p>Loading pending applications…</p>
      ) : providers.length === 0 ? (
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

              {/* hourly‑rate input */}
              <div className="mt-2">
                <label className="block mb-1 font-medium">
                  Hourly Rate (₱)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="rate-input px-2 py-1 border rounded w-32"
                  placeholder="e.g. 750"
                  value={rates[provider.id] ?? ""}
                  onChange={(e) =>
                    setRates({ ...rates, [provider.id]: e.target.value })
                  }
                />
              </div>

              <div className="button-group mt-3">
                <button
                  className="accept bg-green-400"
                  onClick={() => handleApproval(provider.id, "accepted")}
                >
                  Accept
                </button>
                <button
                  className="reject ml-2 bg-red-400"
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
