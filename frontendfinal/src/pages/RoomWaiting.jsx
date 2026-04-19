import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { switchRole, getRoomState } from '../services/user-service';
import { connectRoomSocket, disconnectRoomSocket } from '../services/socket';
import './room.css';

const ROLES = ['RETAILER', 'WHOLESALER', 'DISTRIBUTOR', 'MANUFACTURER'];
const DEFAULT_TEAMS = ['ALPHA', 'BETA', 'GAMMA', 'DELTA'];
const REQUIRED_PLAYERS = 16; 

export default function RoomWaiting() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    
    const [occupiedSlots, setOccupiedSlots] = useState({}); 
    const [teamsFound, setTeamsFound] = useState([]);
    const [currentUser] = useState(localStorage.getItem("username") || "Guest");
    const [isSwitching, setIsSwitching] = useState(false);

    // Activity Log
    const [activityLog, setActivityLog] = useState([]);
    const logCounter = useRef(0);

    const addLog = (message) => {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        setActivityLog(prev => [{ id: logCounter.current++, time, message }, ...prev].slice(0, 50));
    };

    // --- WebSockets Logic ---
    useEffect(() => {
        let isMounted = true;

        if (activityLog.length === 0) {
            addLog(`SYSTEM: Communication established. Connecting to Sector 009.`);
        }

        const onStateUpdate = (newState) => {
            if (!isMounted) return;

            if (newState && (newState.players || newState.teams)) {
                console.log("WS PAYLOAD RECEIVED:", newState);
                
                const newSlots = {};
                const foundTeams = new Set();

                // Build state depending on the JSON structure from backend
                // Scenario A: Flat players list (from RoomStateDTO)
                if (newState.players) {
                    newState.players.forEach(p => {
                        const r = (p.role || p.roleType || p.assignedRole || "UNKNOWN").toUpperCase();
                        // DTO might use teamName or initialTeamName
                        const t = (p.teamName || p.initialTeamName || p.team || "TEAM").toUpperCase();
                        const key = `${r}_${t}`;
                        
                        // CRITICAL: Backend uses userName, not username
                        newSlots[key] = p.userName || p.username || "Unknown";
                        foundTeams.add(t);
                    });
                } 
                // Scenario B: Nested teams list (GameRoom Entity structure fallback)
                else if (newState.teams) {
                    newState.teams.forEach(team => {
                        const t = (team.teamName || team.name || "TEAM").toUpperCase();
                        foundTeams.add(t);
                        if (team.players) {
                            team.players.forEach(p => {
                                const r = (p.roleType || p.role || "UNKNOWN").toUpperCase();
                                const key = `${r}_${t}`;
                                newSlots[key] = p.userName || p.username || "Unknown";
                            });
                        }
                    });
                }

                // Detect new players for activity log
                setOccupiedSlots(prev => {
                    Object.keys(newSlots).forEach(key => {
                        if (newSlots[key] !== prev[key] && newSlots[key] !== currentUser) {
                            addLog(`${newSlots[key]} joined ${key.replace('_', ' / ')}`);
                        }
                    });
                    return newSlots;
                });

                setTeamsFound(Array.from(foundTeams));
                
                if (newState.roomStatus === 'RUNNING') {
                    addLog(`SYSTEM: Launch sequence initiated.`);
                    setTimeout(() => navigate(`/dashboard/${roomId}`), 1500);
                }
            }
        };

        if (roomId) {
            connectRoomSocket({ roomId, onStateUpdate });
            
            // Fetch initial state immediately so we don't wait for the next WS broadcast
            getRoomState(roomId)
                .then(initialState => {
                    if (initialState) {
                        onStateUpdate(initialState);
                    }
                })
                .catch(err => console.error("Failed to fetch initial room state", err));
        }

        return () => { 
            isMounted = false; 
            disconnectRoomSocket();
        };
    }, [roomId, navigate, currentUser]);

    // --- Handle Click ---
    const handleSwitchSeat = async (targetTeam, targetRole) => {
        if (isSwitching) return;
        const confirmMove = window.confirm(`Switch to ${targetRole} in ${targetTeam}?`);
        if (!confirmMove) return;

        setIsSwitching(true);
        addLog(`OPERATOR_${currentUser}: Requesting transfer to ${targetTeam}_${targetRole}...`);
        try {
            await switchRole(roomId, targetTeam, targetRole, currentUser);
        } catch (error) {
            addLog(`SYSTEM: Role transfer failed or access denied.`);
            alert("Failed to switch.");
        } finally {
            setIsSwitching(false);
        }
    };

    // --- Display Logic ---
    const displayTeams = [...teamsFound];
    for (let i = 0; displayTeams.length < 4; i++) {
        const fallback = DEFAULT_TEAMS[i];
        if (!displayTeams.includes(fallback)) displayTeams.push(fallback);
    }
    displayTeams.sort();

    const currentCount = Object.keys(occupiedSlots).length;
    const isFull = currentCount >= REQUIRED_PLAYERS;

    return (
        <div className="tactical-wrapper">
            
            {/* SIDEBAR */}
            <aside className="tactical-sidebar">
                <div className="sidebar-brand">
                    <h2 className="brand-title">LOGISTICS_COMMAND_V1.0</h2>
                </div>
                
                <div className="sidebar-sector">
                    <h3 className="sector-name">SECTOR_04</h3>
                    <div className="sector-status">STATUS: OPERATIONAL</div>
                </div>

                <div className="sidebar-menu">
                    <div className="menu-item active">DASHBOARD</div>
                    <div className="menu-item">DEPLOYMENT</div>
                    <div className="menu-item">TELEMETRY</div>
                    <div className="menu-item">STOCKS</div>
                    <div className="menu-item">ARCHIVE</div>
                </div>

                <div className="sidebar-bottom">
                    <button className="launch-btn" onClick={() => navigate('/')}>
                        LAUNCH_MISSION
                    </button>
                    <div className="menu-item">TERMINAL</div>
                    <div className="menu-item">LOGOUT</div>
                </div>
            </aside>

            {/* MAIN AREA */}
            <main className="tactical-main">
                <div className="tactical-topbar">
                    <div className="topbar-item" style={{color: '#ebb542'}}>LOBBY</div>
                    <div className="topbar-item">INTEL</div>
                    <div className="topbar-item">SUPPLY_CHAIN</div>
                    <div className="topbar-item">COMMS</div>
                </div>

                <div className="tactical-header-container">
                    <div className="tactical-title-box">
                        <h1>16-PLAYER TACTICAL LOBBY</h1>
                        <div className="tactical-subtitle">SECTOR: EUROPE_WEST_BETA | CLUSTER: 009</div>
                    </div>
                    <div className="tactical-room-code">
                        <h2>GSV-99-ALPHA</h2>
                        <p>ROOM IDENTITY PROTOCOL: {roomId}</p>
                    </div>
                </div>

                <div className="tactical-content-split">
                    
                    {/* LEFT: 4x4 GRID */}
                    <div className="grid-wrapper">
                        <div className="tactical-grid">
                            {displayTeams.slice(0, 4).map((tName) => {
                                return ROLES.map(role => {
                                    const key = `${role}_${tName}`;
                                    const occupant = occupiedSlots[key];
                                    const isMe = occupant === currentUser;
                                    const isTaken = !!occupant;

                                    let statusClass = "status-free";
                                    if (isMe) statusClass = "status-me";
                                    else if (isTaken) statusClass = "status-taken";

                                    const canClick = !isTaken && !isMe;

                                    return (
                                        <div 
                                            key={key} 
                                            className={`tactical-card ${statusClass}`}
                                            onClick={() => canClick ? handleSwitchSeat(tName, role) : null}
                                        >
                                            <div className="card-label">{tName} / {role}</div>
                                            
                                            {isTaken ? (
                                                <>
                                                    <div className="card-player">{occupant}</div>
                                                    <div className="card-status">{isMe ? "ACTIVE_NODE" : "LOCKED"}</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="add-icon">+</div>
                                                    <div className="card-status" style={{color:'#ebb542', fontSize: '0.8rem'}}>SELECT ROLE</div>
                                                </>
                                            )}
                                        </div>
                                    );
                                });
                            })}
                        </div>
                    </div>

                    {/* RIGHT: TRACKING PANELS */}
                    <div className="tactical-right-panel">
                        <div className="enrollment-panel">
                            <div className="panel-header">LIVE ENROLLMENT</div>
                            <h2>{currentCount}/{REQUIRED_PLAYERS} SLOTS</h2>
                            <div className="enrollment-bar">
                                {[...Array(16)].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className="enrollment-fill" 
                                        style={{flex: 1, opacity: i < currentCount ? 1 : 0.1}}
                                    ></div>
                                ))}
                            </div>
                        </div>

                        <div className="activity-panel">
                            <div className="panel-header">ACTIVITY LOG_</div>
                            <div className="log-list">
                                {activityLog.map(log => (
                                    <div key={log.id} className="log-item">
                                        <span className="log-time">[{log.time}]</span>
                                        {log.message}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* BOTTOM MARQUEE OVERLAY */}
                <div className="tactical-overlay-bottom">
                    <div style={{color: '#ebb542', fontSize: '0.8rem', fontWeight: 'bold'}}>
                        <span style={{display:'inline-block', width: '8px', height: '8px', background: '#ebb542', borderRadius: '50%', marginRight: '8px', animation: 'pulse 2s infinite'}}></span>
                        COMMUNICATION_UPLINK_ESTABLISHED
                    </div>
                    <div className="waiting-marquee">
                        &#x22BA; {isFull ? 'ALL SYSTEMS GO. INITIATING LAUNCH SEQUENCE...' : 'WAITING FOR FULL SQUADRON...'} &#x22BB;
                    </div>
                    <div className="latency-stats">
                        LATENCY: <strong>24MS</strong> | JITTER: <strong>1MS</strong>
                    </div>
                </div>

            </main>
        </div>
    );
}