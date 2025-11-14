import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";



export default function HowToPlay() {
  const navigate = useNavigate();
  const [waiting, setWaiting] = useState(false);

 

  const handleStartGame = () => {
    const roomId = localStorage.getItem("roomId");

    if (!roomId) {
      alert("Room not found. Please join the game again.");
      return;
    }

    // 🔥 Switch UI into waiting mode
    setWaiting(true);
  };

  return (
    <div className="how-container">

      {waiting ? (
        <div className="waiting-box">
          <div className="loader"></div>
          <p className="waiting-text">
            ⏳ Waiting for all players to join...
            <br />
            <span className="sub">Game will start automatically.</span>
          </p>
        </div>
      ) : (
        <button className="start-btn" onClick={handleStartGame}>
          ▶ Start Game
        </button>
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
