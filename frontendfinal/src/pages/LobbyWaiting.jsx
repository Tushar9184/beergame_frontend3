// src/pages/LobbyWaiting.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { connectSocket, disconnectSocket } from "../services/socket";

export default function LobbyWaiting() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [starting, setStarting] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // prevents multiple countdown triggers
  const countdownStarted = useRef(false);

  useEffect(() => {
    if (!roomId) {
      alert("No room ID found");
      navigate("/createlobby");
      return;
    }

    const onStateUpdate = (state) => {
      console.log("📥 WS → Lobby State Update:", state);

      const list = Array.isArray(state.players) ? state.players : [];
      setPlayers(list);

      // ⭐ Safe start trigger
      if (list.length === 4 && !countdownStarted.current) {
        countdownStarted.current = true;
        setStarting(true);
        setCountdown(3);

        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev === 1) {
              clearInterval(timer);
              console.log("🚀 Navigating to dashboard");
              navigate(`/dashboard/${roomId}`);
            }
            return prev - 1;
          });
        }, 1000);
      }
    };

    console.log("🟢 Connecting WS from LobbyWaiting:", roomId);
    connectSocket({ roomId, onStateUpdate });

    return () => {
      console.log("🔴 Disconnecting WS from LobbyWaiting");
      disconnectSocket();
      countdownStarted.current = false;
    };

    // ONLY depend on roomId
  }, [roomId, navigate]);

  // ⭐ Starting countdown UI
  if (starting) {
    return (
      <div className="waiting-box">
        <div className="loader"></div>
        <h2 className="waiting-title">Game about to start…</h2>
        <p className="countdown">Starting in {countdown}...</p>
      </div>
    );
  }

  return (
    <div className="waiting-box">
      <div className="loader"></div>

      <h3 className="room-id">Room ID: {roomId}</h3>

      <h2 className="waiting-title">Waiting for Players...</h2>
      <p className="waiting-text">{players.length} / 4 players connected</p>

      <div className="player-list">
        {players.length === 0 ? (
          <div className="player-item">No players yet</div>
        ) : (
          players.map((p) => (
            <div className="player-item" key={p.id}>
              <strong>{p.userName}</strong> — {p.role}
            </div>
          ))
        )}
      </div>

      <p className="sub">The game will start automatically when all players join.</p>
    </div>
  );
}
