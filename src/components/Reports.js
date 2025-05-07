import React, { useState, useRef, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function Reports() {
  const auth = getAuth();

  const [loading, setLoading] = useState(true);
  const [totalBookings, setTotalBookings] = useState(0);
  const [paidCount, setPaidCount] = useState(0);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [consultants, setConsultants] = useState([]);

  const [clinicId, setClinicId] = useState(null); // ✅ define this early

  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Monthly");
  const dropdownRef = useRef();

  const options = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"];

  // ✅ Set clinicId once auth is available
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setClinicId(user.uid);
    }
  }, [auth]);

  // ✅ Use clinicId only AFTER it's set
  useEffect(() => {
    if (!clinicId) return;

    const bookingsRef = collection(db, "bookings");
    const userBookingsQuery = query(
      bookingsRef,
      where("clinicId", "==", clinicId)
    );

    const unsub = onSnapshot(
      userBookingsQuery,
      (snapshot) => {
        let paid = 0,
          unpaid = 0,
          revenue = 0;
        const now = new Date();
        let startDate = new Date();

        switch (selectedOption) {
          case "Daily":
            startDate.setHours(0, 0, 0, 0);
            break;
          case "Weekly":
            startDate.setDate(now.getDate() - 7);
            break;
          case "Monthly":
            startDate.setMonth(now.getMonth() - 1);
            break;
          case "Quarterly":
            startDate.setMonth(now.getMonth() - 3);
            break;
          case "Yearly":
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          default:
            startDate = null;
        }

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate?.();
          if (startDate && createdAt && createdAt < startDate) return;

          if (data.paymentStatus === "paid") {
            paid += 1;
            if (typeof data.amount === "number") revenue += data.amount;
          } else if (data.paymentStatus === "unpaid") {
            unpaid += 1;
          }
        });

        setTotalBookings(paid + unpaid);
        setPaidCount(paid);
        setUnpaidCount(unpaid);
        setTotalRevenue(revenue);
        setLoading(false);
      },
      (error) => {
        console.error("FinancialOverview listener error:", error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [selectedOption, clinicId]);

  useEffect(() => {
    if (!clinicId) return;

    const consultantRef = collection(db, "consultants");
    const consultantQuery = query(
      consultantRef,
      where("clinicId", "==", clinicId)
    );

    const unsubscribe = onSnapshot(consultantQuery, (snapshot) => {
      const consultantList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConsultants(consultantList);
    });

    return () => unsubscribe();
  }, [clinicId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  const formatPHP = (cents) =>
    `₱${(cents / 100).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <p className="text-gray-500">Loading financial data…</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Reports</h2>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 bg-white border rounded-md shadow text-sm font-medium hover:bg-gray-100"
          >
            {selectedOption}
            <span className="ml-2">&#9662;</span>
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-md z-10">
              {options.map((option) => (
                <div
                  key={option}
                  onClick={() => handleSelect(option)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Bookings", value: totalBookings },
          { label: "Paid Bookings", value: paidCount },
          { label: "Unpaid Bookings", value: unpaidCount },
          { label: "Total Revenue", value: formatPHP(totalRevenue) },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white p-6  shadow-md hover:shadow-lg  rounded-2xl border-2 border-[#DA79B9] transition"
          >
            <h3 className="text-md font-semibold text-[#DA79B9]">{label}</h3>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          Affiliated Doctors
        </h3>
        {consultants.length === 0 ? (
          <p className="text-gray-500 italic">No affiliated doctors found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {consultants.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-gray-50 px-4 py-3 rounded-lg shadow-sm border hover:shadow-md transition"
              >
                <p className="text-gray-700 font-medium">
                  {doctor.name || doctor.username || "Unnamed Doctor"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
