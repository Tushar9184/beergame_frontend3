import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGameRoom, joinGameRoom } from '../services/user-service'; // Import BOTH
import './room.css';

const ROLES = ['Manufacturer', 'Wholesaler', 'Distributor', 'Retailer'];

const CreateRoom = () => {
    const navigate = useNavigate();
    
    // Host Details
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    
    // Team Details (Host's Seat)
    const [teamName, setTeamName] = useState('');
    const [selectedRole, setSelectedRole] = useState(ROLES[0]);
    
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!username || !email || !teamName) return alert("Please fill in all fields");
        
        setIsLoading(true);
        try {
            // STEP 1: Create the Room (Get ID)
            const roomData = await createGameRoom(username, email);
            const newRoomId = roomData.roomId; // Ensure backend returns 'roomId'
            
            // STEP 2: Immediately Join that Room
            // This places the host in the specific seat they chose
            await joinGameRoom(newRoomId, teamName, selectedRole, username);

            // STEP 3: Save Session Info
            localStorage.setItem("username", username);
            localStorage.setItem("isHost", "true");
            localStorage.setItem("teamName", teamName);
            localStorage.setItem("role", selectedRole);

            // STEP 4: Navigate
            navigate(`/room/${newRoomId}`);
            
        } catch (error) {
            console.error(error);
            alert("Error creating room. Check console.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="room-container">
            <div className="form-box">
                <h1 className="room-title">Create Room 🏭</h1>
                <p className="room-subtitle">Host a 16-player simulation</p>
                
                {/* --- Host Info --- */}
                <label className="label-text">Username</label>
                <input 
                    className="room-input"
                    type="text" 
                    placeholder="Host Name" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                />

                <label className="label-text">Email</label>
                <input 
                    className="room-input"
                    type="email" 
                    placeholder="host@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                />

                <hr style={{margin: '20px 0', border: '0', borderTop: '1px solid #eee'}} />

                {/* --- Team Info (New Part) --- */}
                <label className="label-text">Your Team Name</label>
                <input 
                    className="room-input"
                    type="text" 
                    placeholder="e.g. Team Alpha" 
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