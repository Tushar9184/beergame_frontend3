import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { switchRole } from '../services/user-service';
import { connectRoomSocket, disconnectRoomSocket } from '../services/socket';
import './room.css';

const ROLES = ['RETAILER', 'WHOLESALER', 'DISTRIBUTOR', 'MANUFACTURER'];
const REQUIRED_PLAYERS = 16;

/**
 * Parse ANY backend response shape into a uniform
 * { slots: { "ROLE_TEAMNAME": "username" }, teams: Set<string> } object.
 * Handles:
 *   - RoomStateDTO  → newState.players  (flat list with teamName / role / userName)
 *   - GameRoom JSON → newState.teams    (nested list of team objects with .players)
 */
function parseRoomState(newState) {
    const slots = {};
    const teams = new Set();

    if (!newState) return { slots, teams };

    // ── Scenario A: flat players list (RoomStateDTO) ─────────────────────────
    if (newState.players && newState.players.length > 0) {
        newState.players.forEach(p => {
            const role = (p.role || p.roleType || p.assignedRole || '').toUpperCase();
            const team = (p.teamName || p.initialTeamName || p.team || '').toUpperCase().trim();
            if (!role || !team) return;
            const key = `${role}_${team}`;
            slots[key] = p.userName || p.username || '?';
            teams.add(team);
        });
    }

    // ── Scenario B: nested teams list (GameRoom entity) ───────────────────────
    if (newState.teams && newState.teams.length > 0) {
        newState.teams.forEach(t => {
            const team = (t.teamName || t.name || '').toUpperCase().trim();
            if (!team) return;
            teams.add(team);
            (t.players || []).forEach(p => {
                const role = (p.role || p.roleType || '').toUpperCase();
                if (!role) return;
                const key = `${role}_${team}`;
                slots[key] = p.userName || p.username || '?';
            });
        });
    }

    return { slots, teams };
}

export default function RoomWaiting() {
    const { roomId }      = useParams();
    const navigate        = useNavigate();
    const location        = useLocation();
    const currentUser     = localStorage.getItem('username') || 'Guest';
    const myTeamName      = localStorage.getItem('teamName') || '';
    const myRole          = localStorage.getItem('role') || '';

    // Seed state: always show current user from localStorage immediately,
    // then overlay with any richer data from navigate state
    const seedState = () => {
        const slots = {};
        const teams = new Set();

        // 1. Always pre-fill the current user's own seat from localStorage
        if (myTeamName && myRole) {
            const key = `${myRole.toUpperCase()}_${myTeamName.toUpperCase()}`;
            slots[key] = currentUser;
            teams.add(myTeamName.toUpperCase());
        }

        // 2. If navigate() passed richer initialRoomData, overlay it on top
        const initialData = location.state?.initialRoomData;
        if (initialData) {
            const { slots: dtoSlots, teams: dtoTeams } = parseRoomState(initialData);
            Object.assign(slots, dtoSlots);
            dtoTeams.forEach(t => teams.add(t));
        }

        return { slots, teams };
    };

    const seed = seedState();
    const [occupiedSlots, setOccupiedSlots] = useState(seed.slots);
    const [teamsFound,    setTeamsFound]    = useState(Array.from(seed.teams).sort());
    const [isSwitching,   setIsSwitching]   = useState(false);

    // Activity Log
    const [activityLog, setActivityLog] = useState([
        { id: 0, time: new Date().toLocaleTimeString('en-US', { hour12: false }), message: 'SYSTEM: Communication established. Connecting to Sector 009.' }
    ]);
    const logCounter = useRef(1);

    const addLog = useCallback((message) => {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        setActivityLog(prev => [{ id: logCounter.current++, time, message }, ...prev].slice(0, 50));
    }, []);

    // ── Apply a parsed room-state update to React state ───────────────────────
    const applyState = useCallback((newState) => {
        const { slots: newSlots, teams: newTeamSet } = parseRoomState(newState);

        // Don't wipe existing UI if WS sends empty payload
        if (Object.keys(newSlots).length === 0 && newTeamSet.size === 0) return;

        setOccupiedSlots(prev => {
            Object.keys(newSlots).forEach(key => {
                if (newSlots[key] !== prev[key] && newSlots[key] !== currentUser) {
                    addLog(`${newSlots[key]} → ${key.replace('_', ' / ')}`);
                }
            });
            // MERGE new data on top of existing — prevents flickering
            return { ...prev, ...newSlots };
        });

        setTeamsFound(prev => {
            const merged = new Set([...prev, ...Array.from(newTeamSet)]);
            return Array.from(merged).sort();
        });

        // Navigate when game starts
        if (newState?.roomStatus === 'RUNNING' || newState?.status === 'RUNNING') {
            addLog('SYSTEM: Launch sequence initiated. Redirecting...');
            setTimeout(() => navigate(`/dashboard/${roomId}`), 1500);
        }
    }, [addLog, currentUser, navigate, roomId]);

    // ── WebSocket only (GET /api/room/{id} does not exist on backend) ─────────
    useEffect(() => {
        let isMounted = true;
        if (!roomId) return;

        connectRoomSocket({
            roomId,
            onStateUpdate: (state) => { if (isMounted) applyState(state); },
        });

        return () => {
            isMounted = false;
            disconnectRoomSocket();
        };
    }, [roomId, applyState]);

    // ── Switch seat handler ───────────────────────────────────────────────────
    const handleSwitchSeat = async (targetTeam, targetRole) => {
        if (isSwitching) return;
        if (!window.confirm(`Switch to ${targetRole} in team "${targetTeam}"?`)) return;

        setIsSwitching(true);
        addLog(`OPERATOR_${currentUser}: Requesting transfer → ${targetTeam} / ${targetRole}...`);

        // Optimistic update: immediately move our marker on the grid
        setOccupiedSlots(prev => {
            const updated = { ...prev };
            // Remove old slot
            Object.keys(updated).forEach(k => { if (updated[k] === currentUser) delete updated[k]; });
            // Add new slot
            updated[`${targetRole}_${targetTeam}`] = currentUser;
            return updated;
        });
        localStorage.setItem('teamName', targetTeam);
        localStorage.setItem('role', targetRole);

        try {
            await switchRole(roomId, targetTeam, targetRole);
            addLog(`SYSTEM: Transfer confirmed → ${targetTeam} / ${targetRole}`);
        } catch (err) {
            addLog('SYSTEM: Transfer failed. Reverting...');
            alert('Failed to switch seat. Role may be taken.');
            // Revert optimistic update on failure
            setOccupiedSlots(prev => {
                const reverted = { ...prev };
                delete reverted[`${targetRole}_${targetTeam}`];
                return reverted;
            });
        } finally {
            setIsSwitching(false);
        }
    };

    // ── Compute display teams ─────────────────────────────────────────────────
    // Show only REAL teams from the backend. Add placeholder rows up to 4
    // ONLY to keep the grid looking like a full 4×4 matrix.
    const realTeams   = [...teamsFound].sort();
    const placeholders = 4 - realTeams.length;
    const displayTeams = [
        ...realTeams,
        ...Array.from({ length: placeholders > 0 ? placeholders : 0 }, (_, i) => `SLOT_${i + 1}`)
    ];

    const currentCount = Object.keys(occupiedSlots).length;
    const isFull       = currentCount >= REQUIRED_PLAYERS;

    return (
        <div className="tactical-wrapper">

            {/* ── SIDEBAR ─────────────────────────────────────── */}
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
                    <button className="launch-btn" onClick={() => navigate('/')}>LAUNCH_MISSION</button>
                    <div className="menu-item">TERMINAL</div>
                    <div className="menu-item">LOGOUT</div>
                </div>
            </aside>

            {/* ── MAIN ────────────────────────────────────────── */}
            <main className="tactical-main">
                <div className="tactical-topbar">
                    <div className="topbar-item" style={{ color: '#ebb542' }}>LOBBY</div>
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

                    {/* LEFT: 4×4 GRID */}
                    <div className="grid-wrapper">
                        <div className="tactical-grid">
                            {displayTeams.map((tName) => {
                                const isPlaceholder = tName.startsWith('SLOT_');
                                return ROLES.map(role => {
                                    const key      = `${role}_${tName}`;
                                    const occupant = isPlaceholder ? null : occupiedSlots[key];
                                    const isMe     = occupant === currentUser;
                                    const isTaken  = !!occupant;
                                    const canClick = !isPlaceholder && !isTaken;

                                    let statusClass = isPlaceholder ? 'status-empty' : 'status-free';
                                    if (isMe)    statusClass = 'status-me';
                                    else if (isTaken) statusClass = 'status-taken';

                                    return (
                                        <div
                                            key={key}
                                            className={`tactical-card ${statusClass}`}
                                            onClick={() => canClick && handleSwitchSeat(tName, role)}
                                            title={isPlaceholder ? 'Waiting for team…' : `${tName} / ${role}`}
                                        >
                                            {/* Team row label */}
                                            <div className="card-label">
                                                {isPlaceholder ? '— / ' : `${tName} / `}
                                                <span style={{ color: '#ebb542' }}>{role}</span>
                                            </div>

                                            {isTaken ? (
                                                <>
                                                    <div className="card-player">{occupant}</div>
                                                    <div className="card-status">{isMe ? '✅ ACTIVE_NODE' : '🔒 LOCKED'}</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="add-icon">{isPlaceholder ? '…' : '+'}</div>
                                                    <div className="card-status" style={{ color: isPlaceholder ? '#446' : '#ebb542', fontSize: '0.75rem' }}>
                                                        {isPlaceholder ? 'AWAITING TEAM' : 'SELECT ROLE'}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                });
                            })}
                        </div>
                    </div>

                    {/* RIGHT PANELS */}
                    <div className="tactical-right-panel">
                        <div className="enrollment-panel">
                            <div className="panel-header">LIVE ENROLLMENT</div>
                            <h2>{currentCount}/{REQUIRED_PLAYERS} SLOTS</h2>
                            <div className="enrollment-bar">
                                {[...Array(16)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="enrollment-fill"
                                        style={{ flex: 1, opacity: i < currentCount ? 1 : 0.1 }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="activity-panel">
                            <div className="panel-header">ACTIVITY LOG_</div>
                            <div className="log-list">
                                {activityLog.map(log => (
                                    <div key={log.id} className="log-item">
                                        <span className="log-time">[{log.time}]</span> {log.message}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM OVERLAY */}
                <div className="tactical-overlay-bottom">
                    <div style={{ color: '#ebb542', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, background: '#ebb542', borderRadius: '50%', marginRight: 8, animation: 'pulse 2s infinite' }} />
                        COMMUNICATION_UPLINK_ESTABLISHED
                    </div>
                    <div className="waiting-marquee">
                        ⊺ {isFull ? 'ALL SYSTEMS GO — INITIATING LAUNCH SEQUENCE…' : 'WAITING FOR FULL SQUADRON…'} ⊻
                    </div>
                    <div className="latency-stats">
                        LATENCY: <strong>live</strong> | POLL: <strong>4s</strong>
                    </div>
                </div>
            </main>
        </div>
    );
}