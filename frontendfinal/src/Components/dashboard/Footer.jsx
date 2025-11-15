import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { connectSocket, disconnectSocket, sendOrderWS } from "../../services/socket";

export default function HowToPlay() {
  const navigate = useNavigate();

  const roomId = localStorage.getItem("roomId");
  const myRole = localStorage.getItem("role")?.toUpperCase();

  // ✅ --- FIX 1: Initialize state from localStorage ---
  // This reads the "IN_PROGRESS" state saved by LobbyWaiting.jsx
  const [gameState, setGameState] = useState(() => {
    const cachedState = localStorage.getItem(`gameState_${roomId}`);
    if (cachedState) {
      try {
        return JSON.parse(cachedState);
      } catch (e) {
        console.error("Failed to parse cached state", e);
      }
    }
    // Default if nothing is cached (shouldn't happen)
    return { players: [], gameStatus: "LOBBY" };
  });

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
      // Also, keep localStorage in sync
      localStorage.setItem(`gameState_${roomId}`, JSON.stringify(state));
    };

    // This will re-use the existing connection from LobbyWaiting
    connectSocket({ roomId, onStateUpdate });

    // We only disconnect when this page is left
    return () => disconnectSocket();
  }, [roomId, navigate]);

  // Effect to react to game state changes
  useEffect(() => {
    if (!gameState) return;

    // ✅ FIX 2: Check for IN_PROGRESS
    if (gameState.gameStatus === "IN_PROGRESS") {
      
      // Navigate away if we're past week 1
      if (gameState.currentWeek > 1) {
        navigate(`/dashboard/${roomId}`);
        return;
      }
      
      // Update our order amount with the backend's suggestion
      if (!orderPlaced) {
        const me = gameState.players?.find((p) => p.role === myRole);
        // Use ?? 4 to set a default if currentOrder is 0 or null
        setOrderAmount(me?.currentOrder ?? 4);
      }
    }
  }, [gameState, myRole, orderPlaced, navigate, roomId]);

  // --- Handlers ---
  
  // This button is not needed, game starts automatically
  // const handleStartGame = () => { ... };

  const handlePlaceOrder = (e) => {
    e.preventDefault(); 
    if (!gameState) return;

    const qty = Number(orderAmount); 
    sendOrderWS({ roomId, quantity: qty });
    setOrderPlaced(true);
  };

  /* ------------------------------------------------------------
     UI Logic
     ------------------------------------------------------------ */

  const gameStatus = gameState?.gameStatus;
  const me = gameState?.players?.find((p) => p.role === myRole);
  const iAmReady = me?.isReadyForNextTurn; 

  // ✅ FIX 3: Check for IN_PROGRESS
  if (gameStatus === "IN_PROGRESS") {
    
    // If order is placed, show waiting screen
    if (iAmReady || orderPlaced) {
      return (
        <div className="waiting-box">
          <div className="loader"></div>
          <h2>Waiting for other players to submit Week 1 order…</h2>
        </div>
      );
    }

    // Show the Week 1 Order Form
    return (
      <div className="how-container">
        <h2 className="how-title">Week 1 — Place Your First Order</h2>
        
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

  // Default: Pre-game "How To" Screen (if status is still LOBBY)
  // This screen will only show for a split second
  return (
    <div className="waiting-box">
       <div className="loader"></div>
       <p className="waiting-text">
         ⏳ Game is starting...
       </p>
     </div>
  );
}