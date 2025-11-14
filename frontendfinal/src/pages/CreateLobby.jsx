// src/pages/CreateLobby.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateLobby() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [role, setRole] = useState("RETAILER");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      alert("Please login first");
      navigate("/login");
      return;
    }
    setUsername(storedUsername);
  }, [navigate]);

  const handleCreateLobby = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const token = localStorage.getItem("token") || "";

      const res = await fetch(
        `${process.env.REACT_APP_API_BASE || "https://the-beer-game-backend.onrender.com"}/api/game/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ role }),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Create lobby failed: ${res.status} ${txt}`);
      }

      const data = await res.json();
      const roomId = (data?.gameId ?? "").toString().trim();
      if (!roomId) throw new Error("Missing gameId in response");

      // persist session info
      localStorage.setItem("role", role);
      localStorage.setItem("roomId", roomId);
      localStorage.setItem("username", username);

      // persist players list returned by backend (creator included)
      if (Array.isArray(data.players)) {
        localStorage.setItem("players", JSON.stringify(data.players));
      } else {
        localStorage.removeItem("players");
      }

      navigate(`/lobby/${roomId}`);
    } catch (err) {
      console.error("Lobby creation failed:", err);
      alert("Failed to create lobby ❌ — " + (err.message || ""));
      setCreating(false);
    }
  };

  if (creating) {
    return (
      <div className="waiting-box">
        <div className="loader"></div>
        <h2>Creating Lobby...</h2>
        <p className="sub">Setting up your game room</p>
      </div>
    );
  }

  return (
    <div className="login-container">
      <h1>Create Lobby 🎮</h1>

      <form className="login-form" onSubmit={handleCreateLobby}>
        <div className="input-group">
          <label>Username</label>
          <input type="text" value={username} disabled />
        </div>

        <div className="input-group">
          <label>Choose Your Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="RETAILER">Retailer</option>
            <option value="WHOLESALER">Wholesaler</option>
            <option value="DISTRIBUTOR">Distributor</option>
            <option value="MANUFACTURER">Manufacturer</option>
          </select>
        </div>

        <button className="login-btn" type="submit">
          Create Lobby
        </button>
      </form>
    </div>
  );
}
