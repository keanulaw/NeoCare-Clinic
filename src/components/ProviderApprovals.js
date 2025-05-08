import React, { useState, useEffect } from "react";
import { getApp } from "firebase/app";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ProviderApprovals() {
  const [clinicUser, setClinicUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [providers, setProviders] = useState([]);
  const [rates, setRates] = useState({});
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);

  // 1️⃣ Wait for Firebase Auth to initialize
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setClinicUser(user);
      setLoadingAuth(false);
    });
    return unsub;
  }, []);

  // 2️⃣ When we know who's signed in, fetch providers
  useEffect(() => {
    if (loadingAuth || !clinicUser) return;
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingAuth, clinicUser]);

  async function fetchProviders() {
    setLoadingData(true);
    setError(null);

    try {
      console.log("🔧 Firebase config:", getApp().options);

      const clinicId = clinicUser.uid;
      console.log("👤 Clinic UID:", clinicId);

      // ——— Step A: load this clinic's user doc
      const clinicRef = doc(db, "users", clinicId);
      const clinicSnap = await getDoc(clinicRef);
      const clinicName = clinicSnap.data().birthCenterName;
      if (!clinicName) {
        throw new Error(
          "Your clinic profile is missing the field `birthCenterName`."
        );
      }
      console.log("�� Clinic birthCenterName:", clinicName);

      // ——— Step B: query doctors whose birthCenterName matches and are still pending
      const q = query(
        collection(db, "consultants"),
        where("birthCenterName", "==", clinicName),
        where("approvalStatus", "==", "pending")
      );
      const qs = await getDocs(q);
      console.log("🔍 Matching consultants:", qs.size);
      qs.docs.forEach((s) => console.log(" •", s.id, s.data()));

      // ——— Step C: map into state + init rates
      const data = qs.docs.map((s) => ({ id: s.id, ...s.data() }));
      setProviders(data);

      const map = {};
      data.forEach((p) => {
        map[p.id] = rates[p.id] ?? "";
      });
      setRates(map);
    } catch (e) {
      console.error("Error fetching providers:", e);
      setError(e.message);
      setProviders([]);
    } finally {
      setLoadingData(false);
    }
  }

  // ——— Approve / Reject handlers
  async function handleApproval(id, status) {
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
  }

  async function writeUpdate(id, status, hourlyRate = null) {
    try {
      const ref = doc(db, "consultants", id);
      const payload =
        hourlyRate != null
          ? { approvalStatus: status, hourlyRate }
          : { approvalStatus: status };
      await updateDoc(ref, payload);
      alert(`Provider application has been ${status}.`);
      fetchProviders();
    } catch (e) {
      console.error("Error updating provider:", e);
      alert("Error updating provider. Please try again.");
    }
  }

  // ——— Render
  if (loadingAuth) {
    return <p>Checking authentication…</p>;
  }
  if (!clinicUser) {
    return <p>Please log in as a clinic user to view approvals.</p>;
  }
  if (loadingData) {
    return <p>Loading pending applications…</p>;
  }
  if (error) {
    return <p style={{ color: "red" }}>Error: {error}</p>;
  }
  if (providers.length === 0) {
    return <p>No pending provider applications matching your address.</p>;
  }

  return (
    <div className="approvals-container">
      <h2 className="font-bold text-3xl mb-5">Provider Approvals</h2>
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

            {/* hourly-rate input */}
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

            {/* Approve / Reject */}
            <div className="button-group mt-3">
              <button
                className="accept"
                onClick={() => handleApproval(provider.id, "accepted")}
              >
                Accept
              </button>
              <button
                className="reject ml-2"
                onClick={() => handleApproval(provider.id, "rejected")}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
