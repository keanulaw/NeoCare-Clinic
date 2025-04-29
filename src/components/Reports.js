import React, { useState, useRef, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [totalBookings, setTotalBookings] = useState(0);
  const [paidCount, setPaidCount] = useState(0);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Monthly");
  const dropdownRef = useRef();

  const auth = getAuth();

  const options = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"];

  // Close dropdown on outside click
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

  useEffect(() => {
    if (!auth.currentUser) return;

    const clinicId = auth.currentUser.uid;

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
        let startDate;

        switch (selectedOption) {
          case "Daily":
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0);
            break;
          case "Weekly":
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
          case "Monthly":
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 1);
            break;
          case "Quarterly":
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 3);
            break;
          case "Yearly":
            startDate = new Date(now);
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
            if (typeof data.amount === "number") {
              revenue += data.amount;
            }
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
        alert("Failed to load financial data.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [selectedOption, auth.currentUser]);

  const formatPHP = (cents) =>
    `₱${(cents / 100).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading financial data…</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-container">
        <h2 className="text-2xl font-bold mb-4">Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Bookings
            </h3>
            <p className="mt-2 text-3xl font-bold">{totalBookings}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Paid Bookings
            </h3>
            <p className="mt-2 text-3xl font-bold">{paidCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Unpaid Bookings
            </h3>
            <p className="mt-2 text-3xl font-bold">{unpaidCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Revenue
            </h3>
            <p className="mt-2 text-3xl font-bold">{formatPHP(totalRevenue)}</p>
          </div>
        </div>
      </div>
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {selectedOption}
          <svg
            className="ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.939l3.71-3.71a.75.75 0 111.06 1.061l-4.24 4.25a.75.75 0 01-1.06 0l-4.25-4.25a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute -right-15 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              {options.map((option) => (
                <div
                  key={option}
                  onClick={() => handleSelect(option)}
                  className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
