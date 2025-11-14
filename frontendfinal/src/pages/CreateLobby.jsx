// src/pages/CreateLobby.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createLobby } from "../services/user-service";

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

    try {
      setCreating(true);

      const res = await createLobby(role);
      const roomId = (res?.gameId ?? res?.id ?? "").toString().trim();

      if (!roomId) {
        throw new Error("Missing game ID from server.");
      }

      // Store locally
      localStorage.setItem("role", role);
      localStorage.setItem("roomId", roomId);

      // Redirect to waiting screen
      navigate(`/lobby/${roomId}`);

    } catch (err) {
      console.error("Lobby creation failed:", err);
      alert("Failed to create lobby ❌");
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
