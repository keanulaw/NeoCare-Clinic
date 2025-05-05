import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function ProviderApprovals() {
  const [providers, setProviders] = useState([]);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const clinicId = auth.currentUser?.uid;
      const q = query(
        collection(db, "consultants"),
        where("approvalStatus", "==", "pending"),
        where("clinicId", "==", clinicId)
      );
      const qs = await getDocs(q);
      const data = qs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setProviders(data);

      const rateMap = {};
      data.forEach((p) => {
        rateMap[p.id] = rates[p.id] ?? "";
      });
      setRates(rateMap);
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

  const handleApproval = async (id, status) => {
    if (status === "accepted") {
      const input = rates[id]?.toString().trim();
      const hourlyRate = Number(input);

      if (!input || isNaN(hourlyRate) || hourlyRate <= 0) {
        alert("Please enter a valid hourly rate greater than 0.");
        return;
      }

      await updateStatus(id, status, hourlyRate);
    } else {
      await updateStatus(id, status);
    }
  };

  const updateStatus = async (id, status, hourlyRate = null) => {
    try {
      const ref = doc(db, "consultants", id);
      const payload =
        hourlyRate != null
          ? { approvalStatus: status, hourlyRate }
          : { approvalStatus: status };

      await updateDoc(ref, payload);
      alert(`Provider has been ${status}.`);
      fetchProviders();
    } catch (err) {
      console.error("Update error:", err);
      alert("Error updating provider status. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Provider Approvals</h2>

      {loading ? (
        <p className="text-gray-500">Loading pending applications…</p>
      ) : providers.length === 0 ? (
        <p className="text-gray-500">
          There are no pending provider applications.
        </p>
      ) : (
        <div className="grid gap-6">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition"
            >
              <p className="text-lg">
                <strong>Name:</strong> {provider.name}
              </p>
              <p>
                <strong>Specialty:</strong> {provider.specialization}
              </p>
              <p>
                <strong>Email:</strong> {provider.email}
              </p>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">
                  Hourly Rate (₱)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="px-3 py-2 border rounded-md w-40"
                  placeholder="e.g. 750"
                  value={rates[provider.id] ?? ""}
                  onChange={(e) =>
                    setRates({ ...rates, [provider.id]: e.target.value })
                  }
                />
              </div>

              <div className="mt-4 flex space-x-3">
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-semibold"
                  onClick={() => handleApproval(provider.id, "accepted")}
                >
                  Accept
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold"
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
