// src/components/Card.jsx
import React, { useEffect, useState } from "react";
import { sendOrderWS } from "../../services/socket"; // adjust import path if needed

export default function Card({ role, roomId, gameState = {} }) {
  const roleKey = (role ?? "").toUpperCase();

  // Find my player entry from gameState
  const me = gameState.players?.find((p) => p.role === roleKey) || {};

  const [orderQty, setOrderQty] = useState(me.currentOrder ?? 4);

  useEffect(() => {
    if (typeof me.currentOrder === "number") {
      setOrderQty(me.currentOrder);
    }
  }, [me.currentOrder]);

  const changeOrder = (type) => {
    setOrderQty((prev) => {
      const newQty = Math.max(0, type === "inc" ? prev + 1 : prev - 1);
      // send order via STOMP
      sendOrderWS({ roomId, quantity: newQty });
      return newQty;
    });
  };

  return (
    <div className="card-container">
      <div className="card-item">
        <div className="card-top">
          <h3>{roleKey}</h3>
        </div>

        <div className="card-stats">
          <div>
            <p>Inventory</p>
            <h2>{me.inventory ?? 0} units</h2>
          </div>

          <div>
            <p>Backorder</p>
            <h2>{me.backOrder ?? 0} units</h2>
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
