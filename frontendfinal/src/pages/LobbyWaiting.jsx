import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { connectSocket, disconnectSocket } from "../services/socket";

export default function LobbyWaiting() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("username") || "You";
  const storedRole = localStorage.getItem("role") || "RETAILER";

  // Add a temporary placeholder so UI shows "1 / 4" immediately for the creator
  const [players, setPlayers] = useState([
    { id: "ME", userName: storedUser, role: storedRole },
  ]);

  const [gameStatus, setGameStatus] = useState("LOBBY");
  const [starting, setStarting] = useState(false);
  const [countdown, setCountdown] = useState(3); // 3 sec countdown

  useEffect(() => {
    if (!roomId) {
      alert("No room ID");
      navigate("/createlobby");
      return;
    }

    const onStateUpdate = (state) => {
      console.log("WS → Lobby State Update:", state);

      // Game status
      if (state.gameStatus) setGameStatus(state.gameStatus);

      // Merge players:
      // - If backend includes the creator, replace placeholder.
      // - Otherwise keep the placeholder at the top + backend list.
      if (Array.isArray(state.players)) {
        setPlayers((prev) => {
          const placeholder = prev.find((p) => p.id === "ME");
          const backendPlayers = state.players || [];

          // If backendPlayers already contains username of placeholder, just use backendPlayers
          if (
            placeholder &&
            backendPlayers.some(
              (bp) =>
                (bp.userName ?? "").toString() === (placeholder.userName ?? "")
            )
          ) {
            return backendPlayers;
          }

          // else show placeholder first and then backend players (dedup by id if needed)
          const filteredBackend = backendPlayers.filter(
            (bp) => bp.id !== "ME"
          );
          // remove duplicates by userName (rare) and merge
          const names = new Set();
          const merged = [];
          if (placeholder) {
            merged.push(placeholder);
            names.add((placeholder.userName ?? "").toString());
          }
          for (const p of filteredBackend) {
            const uname = (p.userName ?? "").toString();
            if (!names.has(uname)) {
              merged.push(p);
              names.add(uname);
            }
          }
          return merged;
        });
      }

      // When all 4 players join → show "game about to start"
      const currentCount = (state.players ?? players).length;
      if ((state.players?.length ?? players.length) === 4 && !starting) {
        setStarting(true);
        setCountdown(3);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, navigate, starting]);

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
      <h3 className="room-id">Room ID: {roomId}</h3>

      <h2 className="waiting-title">Waiting for Players...</h2>
      <p className="waiting-text">{players.length} / 4 players connected</p>

      <div className="player-list">
        {players.map((p, idx) => (
          <div className="player-item" key={p.id ?? idx}>
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
