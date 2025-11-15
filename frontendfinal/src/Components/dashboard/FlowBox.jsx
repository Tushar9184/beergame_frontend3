import React from "react";

export default function FlowBox() {
  // Logic is the same, but we compare all as uppercase for safety
  const userRole = localStorage.getItem("role")?.toUpperCase();
  const roles = ["RETAILER", "WHOLESALER", "DISTRIBUTOR", "FACTORY"];

  return (
    <div className="flow-container">
      <h2 className="flow-title">Supply Chain Flow</h2>

      <div className="flow-wrapper">
        {roles.map((role, i) => (
          <div key={role} className="flow-item">
            {/* Node */}
            <div
              className={`flow-node ${
                role === userRole ? "active-role" : ""
              }`}
            >
              {/* Capitalize first letter for display */}
              <p>
                {role.charAt(0) + role.slice(1).toLowerCase()}
              </p>
            </div>

            {/* Arrow */}
            {i !== roles.length - 1 && <div className="flow-arrow"></div>}
          </div>
        ))}
      </div>

      <p className="flow-subtext">
        Orders move from left to right • Beer moves from right to left
      </p>
    </div>
  );
}