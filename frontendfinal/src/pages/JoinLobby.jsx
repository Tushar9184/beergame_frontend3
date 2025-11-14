import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { joinLobby } from "../services/user-service";
import "../styles.css";

export default function JoinLobby() {
  const [gameId, setGameId] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();

    if (!gameId || !role) {
      alert("Please enter both Game ID and Role!");
      return;
    }

    try {
      const res = await joinLobby(gameId.trim(), role);
      const returnedId = (res?.gameId ?? res?.id ?? gameId).toString().trim();

      localStorage.setItem("roomId", returnedId);
      localStorage.setItem("role", role);

      alert(`Joined Lobby ✅\nGame ID: ${returnedId}`);
      navigate(`/dashboard/${returnedId}`);
    } catch (err) {
      console.error("Error joining lobby:", err);
      alert("Failed to join lobby ❌\nCheck Game ID or login again.");
    }
  };

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
