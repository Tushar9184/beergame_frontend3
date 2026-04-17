import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomState, switchRole } from '../services/user-service';
import './room.css';

const ROLES = ['Manufacturer', 'Wholesaler', 'Distributor', 'Retailer'];
const REQUIRED_PLAYERS = 16; 

export default function RoomWaiting() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    
    const [occupiedSlots, setOccupiedSlots] = useState({}); 
    const [teamsFound, setTeamsFound] = useState([]);
    
    // Get current user (or guest)
    const [currentUser] = useState(localStorage.getItem("username") || "Guest");
    const [isSwitching, setIsSwitching] = useState(false);

    // --- Configuration ---
    // Set REACT_APP_TEST_MODE=true in your .env.local to use mock data during development.
    // In production this is always false.
    const TEST_MODE = process.env.REACT_APP_TEST_MODE === 'true';

    // --- Polling Logic ---
    useEffect(() => {
        let isMounted = true;
        const fetchRoom = async () => {
            let data;
            if (TEST_MODE) {
                // Mock Data
                data = {
                    roomStatus: "WAITING",
                    players: [
                        { username: "Alice", role: "Manufacturer", teamName: "Team 1" },
                        { username: currentUser, role: "Wholesaler", teamName: "Team 1" }, 
                        { username: "Bob", role: "Distributor", teamName: "Team 2" }
                    ]
                };
            } else {
                if (!roomId) return;
                data = await getRoomState(roomId);
            }
            
            if (isMounted && data && data.players) {
                const newSlots = {};
                const foundTeams = new Set();
                data.players.forEach(p => {
                    const key = `${p.role.toUpperCase()}_${p.teamName}`;
                    newSlots[key] = p.username;
                    foundTeams.add(p.teamName);
                });
                setOccupiedSlots(newSlots);
                setTeamsFound(Array.from(foundTeams));
                
                if (data.roomStatus === 'RUNNING' && !TEST_MODE) navigate(`/dashboard/${roomId}`);
            }
        };
        fetchRoom();
        const interval = setInterval(fetchRoom, 2000);
        return () => { isMounted = false; clearInterval(interval); };
    }, [roomId, navigate, currentUser, TEST_MODE]);

    // --- Handle Click ---
    const handleSwitchSeat = async (targetTeam, targetRole) => {
        if (isSwitching) return;
        const confirmMove = window.confirm(`Switch to ${targetRole} in ${targetTeam}?`);
        if (!confirmMove) return;

        setIsSwitching(true);
        try {
            if (TEST_MODE) {
                alert(`Simulated move to ${targetTeam}`); 
            } else {
                await switchRole(roomId, targetTeam, targetRole, currentUser);
            }
        } catch (error) {
            alert("Failed to switch.");
        } finally {
            setIsSwitching(false);
        }
    };

    // --- Display Logic ---
    const displayTeams = [...teamsFound];
    while (displayTeams.length < 4) {
        displayTeams.push(`Team ${displayTeams.length + 1}`);
    }
    displayTeams.sort(); 

    const currentCount = Object.keys(occupiedSlots).length;

    return (
        <div className="room-container">
            <header className="header-info">
                <h1 className="room-title">Room: {roomId || "TEST-ROOM"}</h1>
                <p className="room-subtitle">
                    Players Ready: <strong>{currentCount} / {REQUIRED_PLAYERS}</strong>
                </p>
                {TEST_MODE && <span style={{background:'#fef3c7', padding:'4px 8px', borderRadius:'4px', fontSize:'0.8rem', color:'#d97706'}}>⚠️ Test Mode</span>}
            </header>

            <div className="grid-container">
                {displayTeams.slice(0, 4).map((tName, index) => (
                    <div key={index} className="team-card">
                        <h3 className="team-title">{tName}</h3>
                        
                        {ROLES.map(role => {
                            const key = `${role.toUpperCase()}_${tName}`;
                            const occupant = occupiedSlots[key];
                            const isMe = occupant === currentUser;
                            const isTaken = !!occupant;

                            // Determine Class
                            let statusClass = "status-free";
                            if (isMe) statusClass = "status-me";
                            else if (isTaken) statusClass = "status-taken";

                            // Determine Click Action
                            const canClick = !isTaken && !isMe;

                            return (
                                <div 
                                    key={key} 
                                    className={`role-slot ${statusClass}`}
                                    onClick={() => canClick ? handleSwitchSeat(tName, role) : null}
                                    title={canClick ? "Click to join this seat" : ""}
                                >
                                    <div className="role-label">{role}</div>
                                    <div className="player-name">
                                        {isTaken ? occupant : "Available"}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}