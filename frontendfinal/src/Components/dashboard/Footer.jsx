import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { connectSocket, disconnectSocket, sendOrderWS } from "../../services/socket";

export default function HowToPlay() {
  const navigate = useNavigate();

  const roomId = localStorage.getItem("roomId");
  const myRole = localStorage.getItem("role")?.toUpperCase();

  const [waiting, setWaiting] = useState(false);
  const [gameState, setGameState] = useState(null);

  // ✅ FIX: State for the user's order input
  const [orderAmount, setOrderAmount] = useState(4); 
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Main connection effect
  useEffect(() => {
    if (!roomId) {
      navigate("/joinlobby");
      return;
    }

    const onStateUpdate = (state) => {
      console.log("WS → HowToPlay Update", state);
      setGameState(state);
    };

    connectSocket({ roomId, onStateUpdate });

    return () => disconnectSocket();
  }, [roomId, navigate]);

  // Effect to react to game state changes
  useEffect(() => {
    if (!gameState) return;

    // ✅ FIX: Check for IN_PROGRESS, not RUNNING
    if (gameState.gameStatus === "IN_PROGRESS") {
      
      // Navigate away if we're past week 1
      if (gameState.currentWeek > 1) {
        navigate(`/dashboard/${roomId}`);
        return;
      }
      
      // Update our order amount with the backend's suggestion
      if (!orderPlaced) {
        const me = gameState.players?.find((p) => p.role === myRole);
        setOrderAmount(me?.currentOrder ?? 4);
      }
    }
  }, [gameState, myRole, orderPlaced, navigate, roomId]);

  // --- Handlers ---

  const handleStartGame = () => {
    setWaiting(true);
    // Note: You need a way to tell the backend to start
    // This button currently does nothing
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault(); // This is a form, so prevent reload
    if (!gameState) return;

    const qty = Number(orderAmount); // Get quantity from our state

    sendOrderWS({ roomId, quantity: qty });
    setOrderPlaced(true);
  };

  /* ------------------------------------------------------------
     UI Logic
     ------------------------------------------------------------ */

  const gameStatus = gameState?.gameStatus;
  const me = gameState?.players?.find((p) => p.role === myRole);
  const iAmReady = me?.isReadyForNextTurn; // Backend sets this to true after order

  // ✅ FIX: Check for IN_PROGRESS, not RUNNING
  if (gameStatus === "IN_PROGRESS") {
    
    // If order is placed, show waiting screen
    if (iAmReady || orderPlaced) {
      return (
        <div className="waiting-box">
          <div className="loader"></div>
          <h2>Waiting for other players…</h2>
        </div>
      );
    }

    // Show the Week 1 Order Form
    return (
      <div className="how-container">
        <h2 className="how-title">Week 1 — Place Your First Order</h2>
        
        {/* ✅ FIX: Added a form and input field */}
        <form className="place-order-form" onSubmit={handlePlaceOrder}>
          <div className="input-group">
            <label>Your Order:</label>
            <input 
              type="number"
              min="0"
              value={orderAmount}
              onChange={(e) => setOrderAmount(e.target.value)}
              className="order-input"
              autoFocus
            />
          </div>
          <button className="place-order-btn" type="submit">
            ✔ Place Order
          </button>
        </form>
        
        <ul className="how-list">
          <li><span>🎯</span> Goal: Minimize your total supply chain cost</li>
          <li><span>📦</span> Inventory costs $0.50 per unit per week</li>
          <li><span>⚠️</span> Backlog costs $1.00 per unit per week</li>
          <li><span>🚚</span> Orders & shipments take 2 weeks to arrive</li>
        </ul>
      </div>
    );
  }

  // Waiting screen after clicking Start Game
  if (waiting) {
    return (
      <div className="waiting-box">
        <div className="loader"></div>
        <p className="waiting-text">
          ⏳ Waiting for game to start...
          <br />
          <span className="sub">Game will begin soon.</span>
        </p>
      </div>
    );
  }

  // Default: Pre-game Lobby Screen
  return (
    <div className="how-container">
      {/* Host Start Button */}
      {myRole === "RETAILER" ? (
        <button className="start-btn" onClick={handleStartGame}>
          ▶ Start Game
        </button>
      ) : (
        <p className="waiting-text">
          Waiting for host to start the game…
        </p>
      )}

      <h2 className="how-title">How to Play</h2>

      <ul className="how-list">
        <li><span>🎯</span> Goal: Minimize your total supply chain cost</li>
        <li><span>📦</span> Inventory costs $0.50 per unit per week</li>
        <li><span>⚠️</span> Backlog costs $1.00 per unit per week</li>
        <li><span>🚚</span> Orders & shipments take 2 weeks to arrive</li>
        <li><span>🌊</span> Small demand changes cause big upstream swings</li>
      </ul>
    </div>
  );
}