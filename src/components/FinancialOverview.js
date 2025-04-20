import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function FinancialOverview() {
  const [loading, setLoading]       = useState(true);
  const [totalBookings, setTotalBookings] = useState(0);
  const [paidCount, setPaidCount]   = useState(0);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'bookings'),
      snapshot => {
        let paid = 0, unpaid = 0, revenue = 0;
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.paymentStatus === 'paid') {
            paid += 1;
            if (typeof data.amount === 'number') {
              revenue += data.amount;
            }
          } else if (data.paymentStatus === 'unpaid') {
            unpaid += 1;
          }
        });
        setTotalBookings(snapshot.size);
        setPaidCount(paid);
        setUnpaidCount(unpaid);
        setTotalRevenue(revenue);
        setLoading(false);
      },
      error => {
        console.error('FinancialOverview listener error:', error);
        alert('Failed to load financial data.');
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const formatPHP = cents =>
    `₱${(cents / 100).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading financial data…</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="text-2xl font-bold mb-4">Financial Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Bookings</h3>
          <p className="mt-2 text-3xl font-bold">{totalBookings}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Paid Bookings</h3>
          <p className="mt-2 text-3xl font-bold">{paidCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Unpaid Bookings</h3>
          <p className="mt-2 text-3xl font-bold">{unpaidCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
          <p className="mt-2 text-3xl font-bold">{formatPHP(totalRevenue)}</p>
        </div>
      </div>
    </div>
  );
}
