// src/pages/HowToPlay.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { connectSocket, disconnectSocket, sendOrderWS } from "../../services/socket";

export default function HowToPlay() {
  const navigate = useNavigate();

  const roomId = localStorage.getItem("roomId");
  const myRole = localStorage.getItem("role")?.toUpperCase();

  const [waiting, setWaiting] = useState(false);
  const [gameStatus, setGameStatus] = useState("LOBBY");
  const [gameState, setGameState] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    if (!roomId) {
      navigate("/joinlobby");
      return;
    }

    const onStateUpdate = (state) => {
      console.log("WS → HowToPlay Update", state);

      setGameState(state);

      if (state.gameStatus) {
        setGameStatus(state.gameStatus);

        // Move to dashboard when week > 1 or game already running after order
        if (state.gameStatus === "RUNNING" && state.currentWeek > 1) {
          navigate(`/dashboard/${roomId}`);
        }
      }
    };

    connectSocket({ roomId, onStateUpdate });

    return () => disconnectSocket();
  }, [roomId, navigate]);

  const handleStartGame = () => {
    setWaiting(true);
    // Backend automatically switches to RUNNING when ready
  };

  const handlePlaceOrder = () => {
    if (!gameState) return;

    const me = gameState.players?.find(
      (p) => p.role === myRole
    );
    const qty = me?.currentOrder ?? 4;

    sendOrderWS({ roomId, quantity: qty });
    setOrderPlaced(true);
  };

  /* ------------------------------------------------------------
     UI Logic
     ------------------------------------------------------------ */

  // If game moved forward → dashboard
  if (gameStatus === "RUNNING" && gameState?.currentWeek > 1) {
    navigate(`/dashboard/${roomId}`);
  }

  // If RUNNING → show place order flow
  if (gameStatus === "RUNNING") {
    const me = gameState?.players?.find(p => p.role === myRole);
    const iAmReady = me?.isReadyForNextTurn;

    if (iAmReady || orderPlaced) {
      return (
        <div className="waiting-box">
          <div className="loader"></div>
          <h2>Waiting for other players…</h2>
        </div>
      );
    }

    return (
      <div className="how-container">
        <h2 className="how-title">Week 1 — Place Your First Order</h2>

        <p>Your current suggested order: {me?.currentOrder ?? 4} units</p>

        <button className="place-order-btn" onClick={handlePlaceOrder}>
          ✔ Place Order
        </button>

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

  // Pre-game Lobby Screen
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
