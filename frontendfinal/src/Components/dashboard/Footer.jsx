import React from "react";

export default function Footer() {
  // This component is simplified to serve as a static footer displaying game rules.
  // The logic for connecting, game state, and order placement is now removed
  // as it is handled by the main Dashboard and Card components.

  return (
    // Reusing the 'how-container' class for consistent styling with the CSS provided previously
    <div className="how-container">
      <h2 className="how-title">The Rules of the Beer Distribution Game</h2>

      <ul className="how-list">
        <li><span>🎯</span> **Goal:** Minimize your total supply chain cost</li>
        <li><span>📦</span> **Inventory Cost:** Costs **$0.50** per unit per week</li>
        <li><span>⚠️</span> **Backlog Cost:** Costs **$1.00** per unit per week (Penalty for unfulfilled demand)</li>
        <li><span>🚚</span> **Lead Time:** Orders & shipments take **2 weeks** to arrive (i.e., you receive Week $W-2$'s order)</li>
        <li><span>🤝</span> **Information:** You only see the incoming order from your immediate downstream customer.</li>
      </ul>

      {/* Adding a short note about the order submission */}
      <p className="flow-subtext" style={{ marginTop: '2rem' }}>
        *Submit your weekly order using the card above.*
      </p>
    </div>
  );
}