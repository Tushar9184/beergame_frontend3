import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getOtpFromBackend, registerUser } from "../services/user-service";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle2 } from "lucide-react";
import "./Auth.css";

export default function SignUpPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [backendOtp, setBackendOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await getOtpFromBackend({ username, email, password });
      const otpFromBackend = String(res.token);
      setBackendOtp(otpFromBackend);
      alert("✅ OTP sent to your email!");
      setStep(2);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "❌ Unable to send OTP";
      alert(errorMessage);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (enteredOtp !== backendOtp) return alert("❌ Wrong OTP");

    try {
      const res = await registerUser({ username, email, password });
      localStorage.setItem("token", res.token);
      localStorage.setItem("username", res.username);
      localStorage.setItem("email", res.email);
      alert("✅ Account created successfuly!");
      navigate("/");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "❌ Registration failed";
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
              <h2 className="auth-card-title">
                {step === 1 ? "OPERATOR_ENROLLMENT" : "VERIFICATION_REQUIRED"}
              </h2>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form 
                  key="step1"
                  className="auth-form" 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSendOtp}
                >
                  <div className="auth-input-group">
                    <label className="auth-label" htmlFor="signup-username">IDENTIFICATION_NAME</label>
                    <input 
                      className="auth-input"
                      id="signup-username"
                      type="text" 
                      value={username}
                      onChange={(e)=>setUsername(e.target.value)}
                      placeholder="COMMANDER NAME" 
                      required
                    />
                  </div>

                  <div className="auth-input-group">
                    <label className="auth-label" htmlFor="signup-email">COMMS_CHANNEL_EMAIL</label>
                    <input 
                      className="auth-input"
                      id="signup-email"
                      type="email" 
                      value={email}
                      onChange={(e)=>setEmail(e.target.value)}
                      placeholder="SECURE_ADDRESS@SYSTEM.COM" 
                      required
                    />
                  </div>

                  <div className="auth-input-group">
                    <label className="auth-label" htmlFor="signup-password">PASS_KEY</label>
                    <input 
                      className="auth-input"
                      id="signup-password"
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
                    CONTINUE
                  </motion.button>

                  <div className="auth-links">
                    ALREADY AN OPERATOR? <Link className="auth-link" to="/login">INITIATE_LOGIN</Link>
                  </div>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form 
                  key="step2"
                  className="auth-form" 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleRegister}
                >
                   <p style={{color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem', fontFamily: 'monospace'}}>
                     TRANSMITTING VERIFICATION KEY TO: {email}
                   </p>
                   
                  <div className="auth-input-group">
                    <label className="auth-label" htmlFor="otp-input">AUTHORIZATION_CODE</label>
                    <input 
                      className="auth-input"
                      id="otp-input"
                      type="text"
                      maxLength="6"
                      style={{letterSpacing: '8px', fontFamily: 'monospace', fontSize: '1.2rem'}}
                      value={enteredOtp}
                      onChange={(e)=>setEnteredOtp(e.target.value)}
                      placeholder="• • • • • •" 
                      required
                    />
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="auth-submit-btn" 
                    type="submit"
                  >
                    CREATE ACCOUNT
                  </motion.button>
                  
                  <div className="auth-links">
                    INCORRECT COMMS CHANNEL? <span className="auth-link" style={{cursor:'pointer'}} onClick={() => setStep(1)}>ABORT & RETRY</span>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <div className="auth-footer">
        <div className="footer-left">
          LAT: 52.3676° N // LON: 4.9041° E // SYS_READY
        </div>
        <div className="footer-center footer-yellow">
          SYSTEM TIME: WEEK 42 // BULLWHIP RATIO: 1.42 // ORDERS: +12% // QUEUE: ACTIVE
        </div>
        <div className="footer-right">
          SYSTEM_STATUS &nbsp;&nbsp; ENCRYPTION_KEY &nbsp;&nbsp; LOG_OUT
        </div>
      </div>
    </div>
  );
}