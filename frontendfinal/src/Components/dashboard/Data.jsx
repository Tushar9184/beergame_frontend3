import React from "react";

// Updated to accept 'myOrder' as a prop
export default function Data({ week, cost, demand, myOrder }) {
  return (
    <div className="data-container">
      {/* Current Week */}
      <div className="data-box">
        <div>
          <img src="" alt="week-icon" />
        </div>
        <div>
          <p>Current Week</p>
          <h2>{week}</h2>
        </div>
      </div>

      {/* Total Cost */}
      <div className="data-box">
        <div>
          <img src="" alt="cost-icon" />
        </div>
        <div>
          <p>Total Cost</p>
          <h2>${cost}</h2>
        </div>
      </div>

      {/* Your Incoming Order (New) */}
      <div className="data-box">
        <div>
          <img src="" alt="demand-icon" />
        </div>
        <div>
          <p>Your Incoming Order</p>
          <h2>{myOrder} units</h2>
        </div>
      </div>

      {/* Customer Demand */}
      <div className="data-box">
        <div>
          <img src="" alt="demand-icon" />
        </div>
        <div>
          <p>Customer Demand</p>
          <h2>{demand} units</h2>
        </div>
      </div>
    </div>
  );
}