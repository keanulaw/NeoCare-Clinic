import React from "react";

function Overview() {
  return (
    <div className="overview-container">
      <h2 className="font-bold text-3xl mb-5">Overview</h2>
      <p>
        Welcome to your clinic's comprehensive dashboard. Here you can quickly
        review key performance indicators and recent activity.
      </p>
      {/* Additional summary data can be added here */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Net Profit */}
        <div class="bg-white rounded-2xl shadow p-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-700">Net Profit</h2>
            <div class="text-green-500 text-xl font-bold">₱120,000</div>
          </div>
          <p class="text-sm text-gray-500 mt-2">After all expenses</p>
        </div>
        {/* Gross Profit */}
        <div class="bg-white rounded-2xl shadow p-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-700">Gross Profit</h2>
            <div class="text-blue-500 text-xl font-bold">₱200,000</div>
          </div>
          <p class="text-sm text-gray-500 mt-2">Before expenses</p>
        </div>
      </div>
    </div>
  );
}

export default Overview;
