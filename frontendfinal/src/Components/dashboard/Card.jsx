// src/components/Card.jsx
import React, { useState, useEffect } from "react";
// inside Components/dashboard/
import { sendOrderWS } from "../../services/socket";


/**
 * Player Card — Shows inventory, backlog, cost, and order buttons.
 *
 * Props:
 *  - role (string): "RETAILER", "WHOLESALER", "MANUFACTURER", "DISTRIBUTOR"
 *  - roomId (string)
 *  - gameState (object)
 */
export default function Card({ role, roomId, gameState = {} }) {
  const roleKey = role.toUpperCase();

  // Default starting order
  const [orderQty, setOrderQty] = useState(4);

  // Sync with gameState.currentOrder (backend value)
  useEffect(() => {
    if (!gameState?.players) return;

    const me = gameState.players.find((p) => p.role === roleKey);
    if (me && typeof me.currentOrder === "number") {
      setOrderQty(me.currentOrder);
    }
  }, [gameState, roleKey]);

  const changeOrder = (type) => {
    setOrderQty((prev) => {
      const newQty = Math.max(0, type === "inc" ? prev + 1 : prev - 1);
      sendOrderWS({ roomId, quantity: newQty });
      return newQty;
    });
  };

  // Extract my player data from gameState
  const player = (gameState.players || []).find((p) => p.role === roleKey) || {};

  const inventory = player.inventory ?? 0;
  const backlog = player.backlog ?? 0;
  const cost = Number(player.totalCost ?? player.weeklyCost ?? 0);

  return (
    <div className="card-container">
      <div className="card-item">
        <div className="card-top">
          <img src="" alt="" className="card-icon" />
          <h3>{roleKey.charAt(0) + roleKey.slice(1).toLowerCase()}</h3>
        </div>

        <div className="card-stats">
          <div>
            <p>Inventory</p>
            <h2>{inventory} units</h2>
          </div>
          <div>
            <p className="backorder-label">Backorder</p>
            <h2 className="backorder-value">{backlog} units</h2>
          </div>
        </div>

        <div className="card-order">
          <button onClick={() => changeOrder("dec")}>-</button>
          <span>{orderQty}</span>
          <button onClick={() => changeOrder("inc")}>+</button>
        </div>

        <p className="card-cost">
          Cost: ${cost.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
