import React, { useEffect, useState } from "react";
import { sendOrderWS } from "../../services/socket";

export default function Card({ role, roomId, gameState = {} }) {
  const roleKey = (role ?? "").toUpperCase();

  const me =
    (gameState.players || []).find(
      (p) => (p.role ?? "").toUpperCase() === roleKey
    ) || {};

  const [orderQty, setOrderQty] = useState(me.currentOrder ?? 4);

  // This effect still ensures the order amount resets when a new week starts
  useEffect(() => {
    if (typeof me.currentOrder === "number") {
      setOrderQty(me.currentOrder);
    }
  }, [me.currentOrder]);

  // --- LOGIC UPDATES ---
  // This now *only* updates the local number
  const changeOrder = (type) => {
    setOrderQty((prev) => {
      return Math.max(0, type === "inc" ? prev + 1 : prev - 1);
    });
  };

  // This handles typing in the new input box
  const handleInputChange = (e) => {
    const newQty = Math.max(0, Number(e.target.value));
    setOrderQty(newQty);
  };

  // This is the new function to finally send the order
  const handlePlaceOrder = (e) => {
    e.preventDefault(); // Stop the form from refreshing the page
    if (!roomId) {
      console.warn("No roomId found - cannot send order");
      return;
    }
    // Send the final quantity
    sendOrderWS({ roomId, quantity: orderQty });
    // The Dashboard component will handle showing the "Waiting..."
    // screen when the new state arrives.
  };

  return (
    <div className="card-container">
      <div className="card-item">
        <div className="card-top">
          <h3>{roleKey}</h3>
          <p>{me.userName ?? "Player"}</p>
        </div>

        {/* --- STATS UPDATED WITH ICONS --- */}
        <div className="card-stats">
          <div>
            <p>📦 Inventory</p>
            <h2>{me.inventory ?? 0} units</h2>
          </div>
          <div>
            <p>⚠️ Backlog</p>
            <h2>{me.backlog ?? 0} units</h2>
          </div>
          <div>
            <p>🚚 Incoming</p>
            <h2>{me.incomingShipment ?? 0} units</h2>
          </div>
        </div>

        {/* --- COST MOVED HERE --- */}
        <div className="card-total-cost">
          <p>Your Total Cost</p>
          <h2>${(me.totalCost ?? 0).toFixed(2)}</h2>
        </div>

        {/* --- NEW ORDER FORM --- */}
        <form className="card-order-form" onSubmit={handlePlaceOrder}>
          <label>Place Your Order</label>

          <div className="order-input-controls">
            <button type="button" onClick={() => changeOrder("dec")}>
              -
            </button>
            <input
              type="number"
              min="0"
              value={orderQty}
              onChange={handleInputChange}
            />
            <button typeG="button" onClick={() => changeOrder("inc")}>
              +
            </button>
          </div>

          <button type="submit" className="submit-order-btn">
            ✔ Submit Order for Week {gameState.currentWeek}
          </button>
        </form>
      </div>
    </div>
  );
}