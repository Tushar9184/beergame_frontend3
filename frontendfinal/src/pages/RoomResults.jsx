import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RoomResults.css";

export default function RoomResults() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    // We expect the Dashboard to have saved the roomResult to localStorage
    const stored = localStorage.getItem("roomResult");
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse roomResult", e);
      }
    } else {
      // If no result is found, they probably refreshed too early or don't belong here
      navigate("/");
    }

    // Set background color globally for the tactical theme
    document.body.style.backgroundColor = "#080c10";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, [navigate]);

  if (!result) {
    return (
      <div className="room-result-container" style={{ justifyContent: "center" }}>
        <div className="loader"></div>
        <h2 style={{ marginTop: "20px" }}>Loading Leaderboard...</h2>
      </div>
    );
  }

  // Helper to get color class for a role
  const getRoleClass = (role) => {
    const r = role?.toLowerCase() || "";
    if (r.includes("retailer")) return "role-retailer";
    if (r.includes("wholesaler")) return "role-wholesaler";
    if (r.includes("distributor")) return "role-distributor";
    if (r.includes("manufacturer")) return "role-manufacturer";
    return "";
  };

  const handleViewHistory = (gameId, gameRole) => {
    // To view the graphical history, we overwrite the core gameId and role variables
    // so GameResults.jsx automatically loads this specific game's graphical chart!
    localStorage.setItem("gameId", gameId);
    localStorage.setItem("role", gameRole);
    navigate("/gameresult");
  };

  return (
    <div className="room-result-container">
      <div className="room-result-content">
        
        <div className="room-result-header">
          <p className="subtitle">Lobby Completed</p>
          <h1>ROOM LEADERBOARD</h1>
          <p className="subtitle">ID: {result.roomId}</p>
        </div>

        {/* Winner Banner */}
        {result.winnerTeamName && (
          <div className="winner-banner">
            <h2>🏆 Winner: {result.winnerTeamName} 🏆</h2>
            <p>
              Total Cost: <strong>${(result.winnerTotalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </p>
          </div>
        )}

        {/* Leaderboard List */}
        <div className="leaderboard-list">
          {(result.leaderboard || []).map((team) => (
            <div key={team.teamName} className="team-card">
              <div className="team-card-header">
                <div className="team-info">
                  <div className="team-rank">#{team.rank}</div>
                  {team.teamName}
                </div>
                <div className="team-cost">
                  ${(team.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              
              <div className="players-table-wrapper">
                <table className="players-table">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Lobby Role</th>
                      <th>Game Role</th>
                      <th>Total Cost</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(team.players || []).map((p, idx) => (
                      <tr key={idx}>
                        <td>{p.username}</td>
                        <td>
                          <span className={`role-badge ${getRoleClass(p.lobbyRole)}`}>
                            {p.lobbyRole}
                          </span>
                        </td>
                        <td>
                          <span className={`role-badge ${getRoleClass(p.gameRole)}`}>
                            {p.gameRole}
                          </span>
                        </td>
                        <td>
                          ${(p.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td>
                          <button 
                            className="history-btn"
                            onClick={() => handleViewHistory(p.gameId, p.gameRole)}
                          >
                            Chart Data
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="action-buttons">
          <button 
            className="btn-primary" 
            onClick={() => navigate("/createroom")}
          >
            NEW LEAGUE
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => navigate("/")}
          >
            RETURN HOME
          </button>
        </div>

      </div>
    </div>
  );
}
