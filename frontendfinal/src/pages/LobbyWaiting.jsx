// src/pages/LobbyWaiting.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { connectSocket, disconnectSocket } from "../services/socket";

export default function LobbyWaiting() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // initialize from localStorage if create just happened
  const [players, setPlayers] = useState(() => {
    try {
      const raw = localStorage.getItem("players");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [starting, setStarting] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!roomId) {
      alert("No room ID found");
      navigate("/createlobby");
      return;
    }

    const onStateUpdate = (state) => {
      // state is expected to be GameStateDTO { gameId, currentWeek, gameStatus, players }
      console.log("WS → Lobby State Update:", state);

      const list = Array.isArray(state.players) ? state.players : [];
      setPlayers(list);

      // persist latest
      try {
        localStorage.setItem("players", JSON.stringify(list));
      } catch {}

      if (list.length === 4 && !starting) {
        setStarting(true);
        setCountdown(3);

        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev === 1) {
              clearInterval(timer);
              navigate(`/dashboard/${roomId}`);
            }
            return prev - 1;
          });
        }, 1000);
      }
    };

    connectSocket({ roomId, onStateUpdate });

    return () => {
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, navigate, starting]);

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
