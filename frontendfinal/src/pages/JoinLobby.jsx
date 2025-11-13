import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { joinLobby } from "../services/user-service"; // ✅ import new function
import "../styles.css";

export default function JoinLobby() {
  const [gameId, setGameId] = useState(""); // 👈 changed from teamName
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();

    if (!gameId || !role) {
      alert("Please enter both Game ID and Role!");
      return;
    }

    try {
      const res = await joinLobby(gameId, role);
      alert(`Joined Lobby ✅\nGame ID: ${res.gameId}`);

      // navigate to the dashboard
      navigate(`/dashboard/${res.gameId}`);
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
            <option value="Retailer">Retailer</option>
            <option value="Wholesaler">Wholesaler</option>
            <option value="Distributor">Distributor</option>
            <option value="Factory">Factory</option>
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
