import React, { useEffect, useState } from "react";
import { sendOrderWS, sendRoomOrderWS } from "../../services/socket";
import "./Card.css";

export default function Card({ role, roomId, gameState = {} }) {
  const roleKey = (role ?? "").toUpperCase();

  // Java record boolean 'isReadyForNextTurn' serializes as 'readyForNextTurn' in JSON
  // Java record field 'backlog' serializes as 'backlog' (not backOrder)
  const me =
    (gameState.players || []).find(
      (p) => (p.role ?? "").toUpperCase() === roleKey
    ) || {};
  const isReady = me.readyForNextTurn ?? me.isReadyForNextTurn ?? me.readyForOrder ?? false;

  const [orderQty, setOrderQty] = useState(me.currentOrder ?? 4);

  useEffect(() => {
    if (typeof me.currentOrder === "number") {
      setOrderQty(me.currentOrder);
    }
  }, [me.currentOrder]);

  const changeOrder = (type) => {
    setOrderQty((prev) => {
      return Math.max(0, type === "inc" ? prev + 1 : prev - 1);
    });
  };

  const handleInputChange = (e) => {
    const newQty = Math.max(0, Number(e.target.value));
    setOrderQty(newQty);
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!roomId) {
      console.warn("No roomId found - cannot send order");
      return;
    }
    const isRoomMode = !!localStorage.getItem("teamName");
    if (isRoomMode) {
      sendRoomOrderWS({ roomId, quantity: orderQty });
    } else {
      sendOrderWS({ roomId, quantity: orderQty });
    }
  };

  // Format cost for display
  const formattedCost = (me.totalCost ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // If the player object hasn't loaded yet, show a clear message
  // instead of silently showing all zeros (which looks like a bug)
  if (!me || !me.role) {
    return (
      <div className="card-container">
        <div className="card-item">
          <div className="waiting-box" style={{ minHeight: 'auto', padding: '2rem' }}>
            <div className="loader"></div>
            <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Waiting for game state...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-container">
      <div className="card-item">
        {/* --- CARD HEADER --- */}
        <div className="card-top">
          <h3>{roleKey}</h3>
          <p>{me.userName ?? "Player"}</p>
        </div>

        
        <div className="card-stats-grid">
          {/* 1. INVENTORY */}
          <div className="stat-box">
              <p>📦 Inventory</p>
              <h2>{me.inventory ?? 0} units</h2>
          </div>
          {/* 2. BACKLOG */}
          <div className="stat-box">
              <p>⚠️ Backlog</p>
              <h2>{me.backlog ?? me.backOrder ?? 0} units</h2>
          </div>
          {/* 3. INCOMING SHIPMENT */}
          <div className="stat-box">
              <p>🚚 Incoming</p>
              <h2>{me.incomingShipment ?? 0} units</h2>
          </div>
          {/* 4. TOTAL COST */}
          <div className="stat-box">
              <p>💰 Total Cost</p>
              <h2>${formattedCost}</h2>
          </div>
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
            <button type="button" onClick={() => changeOrder("inc")}>
              +
            </button>
          </div>

          <button 
            type="submit" 
            className="submit-order-btn" 
            disabled={isReady || gameState.gameStatus === 'FINISHED'}
          >
            {gameState.gameStatus === 'FINISHED' 
              ? "🎉 Game Finished! Waiting for other teams..."
              : isReady
              ? "✅ Order Submitted — Waiting for others..."
              : `✔ Submit Order for Week ${gameState.currentWeek}`
            }
          </button>
        </form>
      </div>
    </div>
  );
}