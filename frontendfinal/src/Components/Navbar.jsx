import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles.css"; // Ensure your CSS is imported

export default function Navbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  
  // 1. State for Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 2. State for Dropdown (Play button)
  const [isPlayOpen, setIsPlayOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    setIsMobileMenuOpen(false); // Close menu on logout
  };

  // Toggle function
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="navbar">
      <div className="nav-inner">
        <div className="brand">
          <img src="/assets/BeerGameLogo.png" alt="Logo" className="logo" />
          <span>Beer Game</span>
        </div>

        {/* 3. Hamburger Icon (Visible only on mobile via CSS) */}
        <div className="hamburger" onClick={toggleMobileMenu}>
            <span></span>
            <span></span>
            <span></span>
        </div>

        {/* 4. Add the 'active' class if state is true */}
        <nav className={`nav-links ${isMobileMenuOpen ? "active" : ""}`}>
          
          {/* Dropdown for Play */}
          <div 
            className="dropdown-container" 
            onMouseEnter={() => setIsPlayOpen(true)} 
            onMouseLeave={() => setIsPlayOpen(false)}
            onClick={() => setIsPlayOpen(!isPlayOpen)} // Click support for mobile
          >
            <button className="nav-link-btn">
              Play ▾
            </button>
            
            {isPlayOpen && (
              <div className="dropdown-menu">
                <Link to="/createlobby" className="dropdown-item" onClick={toggleMobileMenu}>Create Lobby (4p)</Link>
                <Link to="/joinlobby" className="dropdown-item" onClick={toggleMobileMenu}>Join Lobby (4p)</Link>
                <div className="dropdown-divider"></div>
                <Link to="/createroom" className="dropdown-item" onClick={toggleMobileMenu}>Create Room (16p)</Link>
                <Link to="/joinroom" className="dropdown-item" onClick={toggleMobileMenu}>Join Room (16p)</Link>
              </div>
            )}
          </div>

          <Link to="/about" onClick={toggleMobileMenu}>About</Link>
          <Link to="/learn" onClick={toggleMobileMenu}>Learn</Link>
          <Link to="/contact" onClick={toggleMobileMenu}>Contact</Link>

          <div className="actions">
            {username ? (
              <>
                <span style={{ fontWeight: "bold" }}>Hi, {username}</span>
                <button className="btn secondary" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn secondary" onClick={toggleMobileMenu}>Login</Link>
                <Link to="/sign" className="btn primary" onClick={toggleMobileMenu}>Sign Up</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}