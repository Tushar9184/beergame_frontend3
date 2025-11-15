// src/components/Card.jsx
import React, { useEffect, useState } from "react";
import { sendOrderWS } from "../../services/socket";

export default function Card({ role, roomId, gameState = {} }) {
  const roleKey = (role ?? "").toUpperCase();

  // Find my player entry from gameState
  const me =
    (gameState.players || []).find(
      (p) => (p.role ?? "").toUpperCase() === roleKey
    ) || {};

  const [orderQty, setOrderQty] = useState(me.currentOrder ?? 4);

  // This effect ensures the order amount resets when a new week starts
  useEffect(() => {
    if (typeof me.currentOrder === "number") {
      setOrderQty(me.currentOrder);
    }
  }, [me.currentOrder]);

  const changeOrder = (type) => {
    setOrderQty((prev) => {
      const newQty = Math.max(0, type === "inc" ? prev + 1 : prev - 1);
      if (!roomId) {
        console.warn("No roomId found - cannot send order");
      } else {
        // This sends the order on every click
        sendOrderWS({ roomId, quantity: newQty });
      }
      return newQty;
    });
  };

  return (
    <div className="card-container">
      <div className="card-item">
        <div className="card-top">
          <h3>{roleKey}</h3>
          {/* Added Username */}
          <p style={{ opacity: 0.7 }}>{me.userName ?? "Player"}</p>
        </div>

        <div className="card-stats">
          <div>
            <p>Inventory</p>
            <h2>{me.inventory ?? 0} units</h2>
          </div>

          <div>
            {/* Renamed to 'Backlog' to match DTO */}
            <p>Backlog</p>
            <h2>{me.backlog ?? 0} units</h2>
          </div>

          {/* Added Incoming Shipment */}
          <div>
            <p>Incoming Shipment</p>
            <h2>{me.incomingShipment ?? 0} units</h2>
          </div>
        </div>

        <div className="card-order">
          <button onClick={() => changeOrder("dec")}>-</button>
          <span>{orderQty}</span>
          <button onClick={() => changeOrder("inc")}>+</button>
        </div>

        <p className="card-cost">Cost: ${(me.totalCost ?? 0).toFixed(2)}</p>
      </div>
    </div>
  );
}