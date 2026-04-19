import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGameRoom, joinGameRoom } from '../services/user-service'; // Import BOTH
import './room.css';

const ROLES = ['Manufacturer', 'Wholesaler', 'Distributor', 'Retailer'];

const CreateRoom = () => {
    const navigate = useNavigate();
    
    // Pre-fill from localStorage — user is already authenticated, no need to retype
    const username = localStorage.getItem("username") || '';
    const email = localStorage.getItem("email") || '';
    
    // Team Details (Host's Seat)
    const [teamName, setTeamName] = useState('');
    const [selectedRole, setSelectedRole] = useState(ROLES[0]);
    
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!username || !email || !teamName) return alert("Please fill in all fields");
        
        setIsLoading(true);
        try {
            // STEP 1: Create the Room — backend returns RoomStateDTO { roomId, roomStatus, ... }
            const roomData = await createGameRoom();
            const newRoomId = roomData.roomId || roomData.id; // roomId is the DTO field
            
            // STEP 2: Immediately Join that Room
            // This places the host in the specific seat they chose
            const joinedRoomData = await joinGameRoom(newRoomId, teamName, selectedRole, username);

            // STEP 3: Save Session Info
            localStorage.setItem("username", username);
            localStorage.setItem("isHost", "true");
            localStorage.setItem("teamName", teamName);
            localStorage.setItem("role", selectedRole);

            // STEP 4: Navigate with initial backend state!
            navigate(`/room/${newRoomId}`, { state: { initialRoomData: joinedRoomData } });
            
        } catch (error) {
            console.error(error);
            const msg = error?.response?.data?.message || "Unable to create room. Please try again.";
            alert(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="room-container">
            <div className="form-box">
                <h1 className="room-title">Create Room 🏭</h1>
                <p className="room-subtitle">Host a 16-player simulation</p>
                
                {/* --- Auto-fetched Username/Email --- */}

                {/* --- Team Info (New Part) --- */}
                <label className="label-text">Your Team Name</label>
                <input 
                    className="room-input"
                    type="text" 
                    placeholder="e.g. ALPHA" 
                    value={teamName} 
                    onChange={(e) => setTeamName(e.target.value)} 
                />

                <label className="label-text">Your Role</label>
                <select 
                    className="room-select" 
                    value={selectedRole} 
                    onChange={(e) => setSelectedRole(e.target.value)}
                >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                <button 
                    className="room-btn"
                    onClick={handleCreate} 
                    disabled={isLoading}
                >
                    {isLoading ? "Creating..." : "Generate & Join"}
                </button>
            </div>
        </div>
    );
};

export default CreateRoom;