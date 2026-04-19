import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createLobby } from "../services/user-service"; 
import { motion } from "framer-motion";
import { Bell, Medal, User, ShieldCheck, Network, Activity } from "lucide-react";
import "./CreateLobby.css";

export default function CreateLobby() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [role, setRole] = useState("RETAILER");
  const [creating, setCreating] = useState(false);

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
    setCreating(true);

    try {
      const data = await createLobby({ role: role.toUpperCase() });

      const roomId = (data?.gameId ?? "").toString().trim();
      if (!roomId) throw new Error("Missing gameId in response");

      localStorage.setItem("role", role.toUpperCase());
      localStorage.setItem("roomId", roomId);
      localStorage.setItem("username", username);
      localStorage.setItem(`gameState_${roomId}`, JSON.stringify(data));
      localStorage.removeItem("teamName"); // Prevents Room Mode from triggering

      navigate(`/lobby/${roomId}`);

    } catch (err) {
      console.error("Lobby creation failed:", err);
      alert("Failed to create lobby ❌ — " + (err.message || ""));
      setCreating(false);
    }
  };

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (creating) {
    return (
      <div className="mission-wrapper">
        <div className="loading-overlay" style={{background: '#0b1115', position:'relative', height: '100vh'}}>
          <div className="cyber-loader"></div>
          <h2 style={{color: '#ebb542', letterSpacing: '0.1em'}}>INITIALIZING PROTOCOLS</h2>
          <p style={{color: '#00e5ff', fontSize: '0.8rem', fontFamily: 'monospace'}}>ESTABLISHING SECURE CONNECTION...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mission-wrapper">
      {/* Navbar */}
      <nav className="mission-navbar">
        <div className="mission-logo">GSV BEER GAME</div>
        <div className="mission-nav-icons">
          <Bell size={20} />
          <Medal size={20} />
          <User size={20} />
        </div>
      </nav>

      {/* Main Body */}
      <div className="mission-body">
        {/* Sidebar */}
        <aside className="mission-sidebar">
          <div className="sidebar-user">
            <div className="sidebar-username" style={{textTransform: 'uppercase'}}>
              OP // {username || "UNKNOWN"}
            </div>
            <div className="sidebar-rank">OPERATOR</div>
          </div>
          <div className="sidebar-nav" style={{position: 'relative'}}>
            
            <div className="sidebar-item active" style={{ 
              backgroundColor: 'rgba(235,181,66,0.1)', 
              borderLeft: '4px solid #ebb542', 
              color: '#ebb542',
              fontWeight: 'bold',
              letterSpacing: '2px',
              padding: '1rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <Network size={18} /> COMMAND
            </div>
            
          </div>

        </aside>

        {/* Content Area */}
        <main className="mission-content" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <motion.div 
            className="mission-header"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mission-title-group">
              <h1>MISSION BRIEFING</h1>
              <div className="mission-subtitle">ESTABLISHING SECURE PARAMETERS // NODE_CONFIG_v4.2</div>
            </div>
            <div className="mission-coords">
              LAT: 52.3676° N<br/>LONG: 4.9041° E
            </div>
          </motion.div>

          <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-2rem'}}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, type: "spring", delay: 0.2 }}
              style={{width: '100%', maxWidth: '500px'}}
            >
              <div className="panel" style={{padding: '3rem', borderTop: '3px solid #ebb542', background: 'rgba(18, 25, 33, 0.7)', backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}}>
                <div style={{display: 'flex', alignItems:'center', gap: '0.75rem', marginBottom: '2rem'}}>
                  <ShieldCheck size={28} color="#ebb542" />
                  <h2 style={{color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase'}}>
                    CREATE LOBBY
                  </h2>
                </div>

                <form onSubmit={handleCreateLobby} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                    <label className="panel-label" style={{margin: 0}}>USERNAME</label>
                    <input 
                      type="text" 
                      value={username} 
                      disabled 
                      className="identity-input"
                      style={{fontSize: '1rem', padding: '0.75rem', borderBottom: '1px solid #334155'}}
                    />
                  </div>

                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                    <label className="panel-label" style={{margin: 0}}>CHOOSE YOUR ROLE</label>
                    <select 
                      value={role} 
                      onChange={(e) => setRole(e.target.value)}
                      style={{
                        background: 'rgba(0,0,0,0.3)', 
                        border: 'none',
                        borderBottom: '1px solid #00e5ff', 
                        color: '#e2e8f0', 
                        padding: '0.75rem', 
                        fontSize: '1rem',
                        fontFamily: '"Courier New", Courier, monospace',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="RETAILER" style={{background: '#0b1115'}}>Retailer</option>
                      <option value="WHOLESALER" style={{background: '#0b1115'}}>Wholesaler</option>
                      <option value="DISTRIBUTOR" style={{background: '#0b1115'}}>Distributor</option>
                      <option value="MANUFACTURER" style={{background: '#0b1115'}}>Manufacturer</option>
                    </select>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    style={{
                      backgroundColor: '#ebb542', 
                      color: '#111', 
                      border: 'none', 
                      padding: '1rem', 
                      fontWeight: 800, 
                      marginTop: '1.5rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      boxShadow: '0 0 15px rgba(235, 181, 66, 0.2)'
                    }}
                  >
                    CREATE LOBBY
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Footer bar */}
      <div className="launch-stats-bar" style={{position: 'absolute', bottom: 0, width: '100%', zIndex: 30}}>
        <div className="stats-yellow">GSV BEER GAME // MISSION_BRIEFING // SECURE_CHANNEL</div>
        <div style={{cursor: 'pointer', textDecoration: 'underline'}} onClick={() => { localStorage.clear(); navigate('/login'); }}>LOG_OUT</div>
      </div>

    </div>
  );
}