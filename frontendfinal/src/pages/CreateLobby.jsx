import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createLobby, joinLobby } from "../services/user-service";

export default function CreateLobby() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("RETAILER");

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
      // 1️⃣ Create game
      const res = await createLobby();
      const roomId = res.gameId.trim();

      // 2️⃣ Join game with chosen role
      await joinLobby(roomId, role);

      // 3️⃣ Save local values
      localStorage.setItem("role", role);
      localStorage.setItem("roomId", roomId);

      alert(`Lobby created 🎉\nGame ID: ${roomId}`);
      navigate(`/dashboard/${roomId}`);
    } catch (err) {
      console.error("Lobby creation failed:", err);
      alert("Failed to create lobby ❌");
    }
  };

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
