import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { connectSocket, disconnectSocket } from "../services/socket";

export default function LobbyWaiting() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // --- 💡 FIX 1: Initialize state from localStorage ---
  // This loads the state you saved in CreateLobby/JoinLobby
  const [gameState, setGameState] = useState(() => {
    const cachedState = localStorage.getItem(`gameState_${roomId}`);
    if (cachedState) {
      try {
        return JSON.parse(cachedState);
      } catch (e) {
        console.error("Failed to parse cached state", e);
      }
    }
    // Default if nothing is cached
    return { players: [], gameStatus: "LOBBY" };
  });

  // Destructure for easy access in UI
  const { players, gameStatus } = gameState;

  const [starting, setStarting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const countdownStarted = useRef(false);

  // --- 💡 FIX 2: Main connect/disconnect effect (runs once) ---
  useEffect(() => {
    if (!roomId) {
      alert("No room ID found");
      navigate("/createlobby");
      return;
    }

    // This function will be called by the socket service
    const onStateUpdate = (newState) => {
      console.log("📥 WS → Lobby State Update:", newState);
      setGameState(newState);
    };

    console.log("🟢 Connecting WS from LobbyWaiting:", roomId);
    connectSocket({ roomId, onStateUpdate });

    return () => {
      console.log("🔴 Disconnecting WS from LobbyWaiting");
      disconnectSocket();
      countdownStarted.current = false;
    };
  }, [roomId, navigate]); // This effect only runs if roomId changes

  // --- 💡 FIX 3: Check-for-start effect (runs on every state update) ---
  useEffect(() => {
    // This logic runs on initial load AND on every WS update
    if (
      players.length === 4 &&
      gameStatus === "IN_PROGRESS" &&
      !countdownStarted.current
    ) {
      countdownStarted.current = true;
      setStarting(true);
      setCountdown(3);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            console.log("🚀 Navigating to dashboard");
            // We DON'T disconnect the socket, the dashboard needs it
            navigate(`/dashboard/${roomId}`);
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [players, gameStatus, roomId, navigate]); // Re-run if state changes

  // ... (rest of your component is fine)
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
      <p className="sub">
        The game will start automatically when all players join.
      </p>
    </div>
  );
}