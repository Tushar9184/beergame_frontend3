import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { joinLobby } from "../services/user-service";
import { disconnectSocket } from "../services/socket";

export default function JoinLobby() {
  const [gameId, setGameId] = useState("");
  const [role, setRole] = useState("");
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();

    if (!gameId.trim() || !role) {
      alert("Please enter both Game ID and Role!");
      return;
    }

    try {
      setJoining(true);
      const uppercaseRole = role.toUpperCase();
      const trimmedRoomId = gameId.trim();

      // Join the lobby and get the full game state back
      const data = await joinLobby(trimmedRoomId, uppercaseRole);

      const returnedId = (data?.gameId ?? "").toString().trim();
      if (!returnedId) throw new Error("Invalid response from backend");

      // --- 💡 FIX 1: Store session info ---
      const username = localStorage.getItem("username") || "You";
      localStorage.setItem("roomId", returnedId);
      localStorage.setItem("role", uppercaseRole);
      localStorage.setItem("username", username);

      // --- 💡 FIX 2: Store the FULL game state ---
      // This state includes all players who have joined so far
      localStorage.setItem(`gameState_${returnedId}`, JSON.stringify(data));

      // Clean old WS and navigate
      disconnectSocket();
      navigate(`/lobby/${returnedId}`);

    } catch (err) {
      console.error("❌ Error joining lobby:", err);
      alert("Failed to join lobby. Please check Game ID or login again.");
      setJoining(false);
    }
  };
  
  // ... (rest of your component is fine)
  if (joining) {
    return (
      <div className="waiting-box">
        <div className="loader"></div>
        <h2>Joining Lobby...</h2>
        <p className="sub">Connecting to host & reserving your role</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">🍺 Join a Beer Game Lobby</h1>

      <form className="page-form" onSubmit={handleJoin}>
        <div className="input-group">
          <label>Game ID</label>
          <input
            type="text"
            placeholder="Enter Game ID provided by the host"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="input-group">
          <label>Select Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">-- Choose your role --</option>
            <option value="RETAILER">Retailer</option>
            <option value="MANUFACTURER">Manufacturer</option>
            <option value="WHOLESALER">Wholesaler</option>
            <option value="DISTRIBUTOR">Distributor</option>
          </select>
        </div>

        <button type="submit" className="page-btn">Join Lobby</button>

        <p className="page-text">
          Don’t have a lobby?{" "}
          <Link className="page-link" to="/createlobby">
            Create one here
          </Link>
        </p>
      </form>
    </div>
  );
}