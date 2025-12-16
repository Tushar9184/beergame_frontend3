import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinGameRoom } from '../services/user-service';
import './room.css';

const ROLES = ['Manufacturer', 'Wholesaler', 'Distributor', 'Retailer'];

const JoinRoom = () => {
    const navigate = useNavigate();
    
    // Form State
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');
    const [teamName, setTeamName] = useState('');
    const [selectedRole, setSelectedRole] = useState(ROLES[0]);
    const [isLoading, setIsLoading] = useState(false);

    const handleJoin = async () => {
        if (!roomId || !username || !teamName) return alert("All fields are required");

        setIsLoading(true);
        try {
            // 1. API Call
            await joinGameRoom(roomId, teamName, selectedRole, username);

            // 2. Local Storage
            localStorage.setItem("username", username);
            localStorage.setItem("teamName", teamName);
            localStorage.setItem("role", selectedRole);

            // 3. Navigate
            navigate(`/room/${roomId}`);

        } catch (error) {
            console.error(error);
            alert("Failed to join. Role might be taken or Room ID invalid.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="room-container">
            <div className="form-box">
                <h1 className="room-title">Join Room 🔗</h1>
                <p className="room-subtitle">Find your seat in the supply chain</p>
                
                <label className="label-text">Room ID</label>
                <input className="room-input" value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="e.g. GAME-1" />

                <label className="label-text">Username</label>
                <input className="room-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your Name" />

                <label className="label-text">Team Name</label>
                <input className="room-input" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g. Team Alpha" />

                <label className="label-text">Role</label>
                <select className="room-select" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                <button className="room-btn" onClick={handleJoin} disabled={isLoading}>
                    {isLoading ? "Joining..." : "Enter Room"}
                </button>
            </div>
        </div>
    );
};

export default JoinRoom;