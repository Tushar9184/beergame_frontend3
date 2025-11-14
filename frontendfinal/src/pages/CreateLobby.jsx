import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createLobby } from "../services/user-service";

export default function CreateLobby() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("Retailer");

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
      // Send the username and role to the service
      const res = await createLobby({ username, role });

      const roomId = res.gameId; // backend returns gameId
      localStorage.setItem("role", role);

      alert(`Lobby created ✅\nGame ID: ${roomId}`);
      navigate(`/dashboard/${roomId}`);
    } catch (err) {
      console.error("Error creating lobby:", err);
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
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option>RETAILER</option>
            <option>MANUFACTURER</option>
            <option>DISTRIBUTOR</option>
            <option>WHOLESALER</option>
          </select>
        </div>

        <button className="login-btn" type="submit">
          Create Lobby
        </button>
      </form>
    </div>
  );
}