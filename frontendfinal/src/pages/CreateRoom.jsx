import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// 1. ✅ FIX: Use { createRoom } for a named export
import { createRoom } from "../services/user-service";

export default function CreateRoom() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Retailer");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedEmail = localStorage.getItem("email");

    if (!storedUsername || !storedEmail) {
      alert("Please sign up / login first");
      navigate("/login");
      return;
    }

    setUsername(storedUsername);
    setEmail(storedEmail);
  }, [navigate]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    try {
      // 2. ✅ FIX: Call with no arguments, as per your backend
      const res = await createRoom(); 
      
      // 3. ✅ FIX: Get the 'id' from the GameRoom response
      const roomId = res.id; 

      // 4. ✅ FIX: Save the role here, since the service can't
      localStorage.setItem("role", role);

      alert(`Room created ✅ ID: ${roomId}`);
      navigate(`/dashboard/${roomId}`);
    } catch (err) {
      console.error(err);
      // If you get a 403, it means your /api/room/create endpoint *is*
      // secured, and you must update user-service.jsx to send a token.
      alert("Room creation failed");
    }
  };

  return (
    <div className="login-container">
      <h1>Create Game Room 🎲</h1>

      <form className="login-form" onSubmit={handleCreateRoom}>
        
        <div className="input-group">
          <label>Username</label>
          <input type="text" value={username} disabled />
        </div>

        <div className="input-group">
          <label>Email</label>
          {/* ✅ FIX: Add the 'disabled' prop here */}
          <input type="email" value={email} disabled />
        </div>

        <div className="input-group">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Retailer</option>
            <option>Wholesaler</option>
            <option>Distributor</option>
            <option>Factory</option>
          </select>
        </div>

        <button className="login-btn" type="submit">
          Create Room
        </button>
      </form>
    </div>
  );
}