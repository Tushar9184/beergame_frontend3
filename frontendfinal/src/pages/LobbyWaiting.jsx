import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { connectSocket, disconnectSocket } from "../services/socket";
import { addBot } from "../services/game-service";

export default function LobbyWaiting() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // Initialize state from localStorage
  const [gameState, setGameState] = useState(() => {
    const cachedState = localStorage.getItem(`gameState_${roomId}`);
    if (cachedState) {
      try {
        return JSON.parse(cachedState);
      } catch (e) {
        console.error("Failed to parse cached state", e);
      }
    }
    return { players: [], gameStatus: "LOBBY" };
  });

  const { players, gameStatus } = gameState;
  const [starting, setStarting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const countdownStarted = useRef(false);

  // Bot Logic State
  const [botType, setBotType] = useState("MEDIUM");
  const [fillingBots, setFillingBots] = useState(false);

  const handleFillBots = async () => {
    setFillingBots(true);
    try {
      const ROLES = ["MANUFACTURER", "DISTRIBUTOR", "WHOLESALER", "RETAILER"];
      const currentRoles = players.map(p => p.role?.toUpperCase());
      const missingRoles = ROLES.filter(r => !currentRoles.includes(r));

      for (const role of missingRoles) {
        await addBot(roomId, role, botType);
      }
    } catch (err) {
      console.error("Failed to fill bots:", err);
      alert("Failed to add bots");
    } finally {
      setFillingBots(false);
    }
  };

  const isCreator = players.length > 0 && players[0].userName === localStorage.getItem("username");

  // Main connect/disconnect effect
  useEffect(() => {
    if (!roomId) {
      navigate("/createlobby");
      return;
    }

    // --- 💡 FIX 1: Save state on *every* update ---
    const onStateUpdate = (newState) => {
      console.log("📥 WS → Lobby State Update:", newState);
      // Save the new state to our component
      setGameState(newState);
      // ALSO save it to localStorage so the next page can read it
      localStorage.setItem(`gameState_${roomId}`, JSON.stringify(newState));
    };

    console.log("🟢 Connecting WS from LobbyWaiting:", roomId);
    connectSocket({ roomId, onStateUpdate });

    // --- 💡 FIX 2: Only disconnect if we are NOT starting the game ---
    return () => {
      // If countdownStarted is true, it means we're navigating
      // to the game, so we *keep the socket alive*.
      if (!countdownStarted.current) {
        console.log("🔴 Disconnecting WS from LobbyWaiting (navigated away)");
        disconnectSocket();
      }
      countdownStarted.current = false;
    };
  }, [roomId, navigate]);

  // Check-for-start effect
  useEffect(() => {
    if (
      players.length >= 1 &&
      gameStatus === "IN_PROGRESS" && // This status comes from your backend
      !countdownStarted.current
    ) {
      countdownStarted.current = true;
      setStarting(true);
      setCountdown(3);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            // Navigate directly to the dashboard — no fragile 2-hop via /howtoplay
            navigate(`/dashboard/${roomId}`);
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [players, gameStatus, roomId, navigate]); // Re-run if state changes

  
  if (starting) {
    return (
      <div style={{ backgroundColor: '#0b1115', minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 0, left: 0 }}>
        <div className="waiting-box" style={{ minHeight: 'auto', background: '#151e26', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', borderTop: '3px solid #ebb542', boxShadow: '0 25px 50px rgba(0,0,0,0.6)', width: '100%', maxWidth: '520px', padding: '4rem 2rem' }}>
          <div className="loader"></div>
          <h2 className="waiting-title">Game about to start…</h2>
          <p className="countdown">Starting in {countdown}...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0b1115', minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 0, left: 0 }}>
      <div className="waiting-box" style={{ minHeight: 'auto', background: '#151e26', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', borderTop: '3px solid #ebb542', boxShadow: '0 25px 50px rgba(0,0,0,0.6)', width: '100%', maxWidth: '520px', padding: '4rem 2rem' }}>
        <div className="loader"></div>
      <h3 className="room-id">Room ID: {roomId}</h3>
      <h2 className="waiting-title">Waiting for Players...</h2>
      <p className="waiting-text">Connected: {players.length} {players.length === 1 ? 'player' : 'players'}</p>

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

      {isCreator && players.length < 4 && (
        <div className="bot-fill-container" style={{marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center'}}>
           <select 
              value={botType} 
              onChange={(e) => setBotType(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.3)', 
                border: '1px solid #00e5ff', 
                color: '#e2e8f0', 
                padding: '0.5rem', 
                fontSize: '1rem',
                outline: 'none',
              }}
           >
             <option value="EASY" style={{background: '#0b1115'}}>Easy Bot</option>
             <option value="MEDIUM" style={{background: '#0b1115'}}>Medium Bot</option>
           </select>
           <button 
             onClick={handleFillBots} 
             disabled={fillingBots}
             style={{
               backgroundColor: '#ebb542', 
               color: '#111', 
               border: 'none', 
               padding: '0.5rem 1rem', 
               fontWeight: 'bold', 
               cursor: fillingBots ? 'not-allowed' : 'pointer'
             }}
           >
             {fillingBots ? "Adding..." : "Play Solo (Fill with Bots)"}
           </button>
        </div>
      )}
      </div>
    </div>
  );
}