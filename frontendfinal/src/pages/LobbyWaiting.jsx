// src/pages/LobbyWaiting.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { connectSocket, disconnectSocket } from "../services/socket";

export default function LobbyWaiting() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [gameStatus, setGameStatus] = useState("LOBBY");
  const [starting, setStarting] = useState(false);
  const [countdown, setCountdown] = useState(3); // 3 sec countdown

  useEffect(() => {
    const onStateUpdate = (state) => {
      console.log("WS → Lobby State Update:", state);

      // Update game status
      if (state.gameStatus) setGameStatus(state.gameStatus);

      // Update player list
      if (Array.isArray(state.players)) setPlayers(state.players);

      // When all 4 players join → show "game about to start"
      if (state.players?.length === 4 && !starting) {
        setStarting(true);
        setCountdown(3);

        // Countdown timer
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev === 1) {
              clearInterval(interval);
              navigate(`/dashboard/${roomId}`);
            }
            return prev - 1;
          });
        }, 1000);
      }
    };

    // Connect WS for lobby updates
    connectSocket({ roomId, onStateUpdate });

    return () => {
      disconnectSocket();
    };
  }, [roomId, starting, navigate]);

  // If game is starting → show countdown
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

      <h2 className="waiting-title">Waiting for Players...</h2>
      <p className="waiting-text">{players.length} / 4 players connected</p>

      <div className="player-list">
        {players.map((p) => (
          <div className="player-item" key={p.id}>
            <strong>{p.userName}</strong> — {p.role}
          </div>
        ))}
      </div>

      <p className="sub">
        The game will start automatically when all players join.
      </p>
    </div>
  );
}
