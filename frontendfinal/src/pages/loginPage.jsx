import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from "../services/user-service";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import "./Auth.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if already logged in — no need to show login form to authenticated users
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate('/', { replace: true });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser({ username, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Invalid username or password";
      alert(errorMessage);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-bg-overlay"></div>
      
      <div className="auth-content">
        <motion.div 
          className="auth-hero"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="hero-subtitle">DEPLOYMENT SELECTION</div>
          <h1 className="hero-title-main">CHOOSE<br />YOUR<br />SECTOR.</h1>
          <h2 className="hero-title-ghost">DISTRIBUTOR.<br />MANUFACTURER.</h2>
          
          <div className="hero-quote">
            THE BULLWHIP EFFECT IS REAL. EVERY DECISION IN THE CHAIN IMPACTS GLOBAL STABILITY. RECRUITMENT IS OPEN.
          </div>
        </motion.div>

        <motion.div 
          className="auth-form-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <div className="auth-card">
            <div className="auth-card-header">
              <Shield size={24} className="auth-card-icon" />
              <h2 className="auth-card-title">OPERATOR_IDENTIFICATION</h2>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-input-group">
                <label className="auth-label" htmlFor="login-username">IDENTIFICATION_NAME</label>
                <input 
                  className="auth-input"
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e)=>setUsername(e.target.value)}
                  placeholder="COMMANDER NAME"
                  required
                />
              </div>

              <div className="auth-input-group">
                <label className="auth-label" htmlFor="login-password">PASS_KEY</label>
                <input 
                  className="auth-input"
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="auth-submit-btn" 
                type="submit"
              >
                INITIATE_LOGIN
              </motion.button>

              <div className="auth-links">
                NEW RECRUIT? <Link className="auth-link" to="/sign">OPERATOR_ENROLLMENT</Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      <div className="auth-footer">
        <div className="footer-left">
          LAT: 52.3676° N // LON: 4.9041° E // SYS_READY
        </div>
        <div className="footer-center footer-yellow">
          GSV BEER GAME // OPERATOR_LOGIN // SECURE_CHANNEL
        </div>
        <div className="footer-right">
          SYSTEM_READY
        </div>
      </div>
    </div>
  );
}