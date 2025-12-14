import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getOtpFromBackend, registerUser } from "../services/user-service";
import "../styles.css";

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
    <div className="login-container">
      {/* Removed emojis for a more strictly professional look, added descriptive subtitle */}
      <h1 className="login-title">
        {step === 1 ? "Create Account" : "Verification"}
      </h1>
      
      {step === 1 && (
        <form className="login-form" onSubmit={handleSendOtp}>
          <div className="input-group">
            <label htmlFor="signup-username">Username</label>
            <input 
              id="signup-username"
              type="text" 
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
              placeholder="Choose a username" 
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="signup-email">Email Address</label>
            <input 
              id="signup-email"
              type="email" 
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder="name@example.com" 
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="signup-password">Password</label>
            <input 
              id="signup-password"
              type="password" 
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              placeholder="Create a strong password" 
              required
            />
          </div>

          <button className="login-btn" type="submit">Continue</button>

          <p className="signup-text">
            Already have an account? <Link className="signup-link" to="/login">Log in here</Link>
          </p>
        </form>
      )}

      {step === 2 && (
        <form className="login-form" onSubmit={handleRegister}>
           <p style={{color: 'var(--text-light)', marginBottom: '1rem'}}>
             We've sent a verification code to {email}
           </p>
          <div className="input-group">
            <label htmlFor="otp-input">Enter OTP Code</label>
            <input 
              id="otp-input"
              type="text"
              maxLength="6"
              style={{letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem'}}
              value={enteredOtp}
              onChange={(e)=>setEnteredOtp(e.target.value)}
              placeholder="• • • • • •" 
              required
            />
          </div>

          <button className="login-btn" type="submit">Complete Registration</button>
          
          {/* Option to go back if email was wrong */}
          <p className="signup-text">
            Wrong email? <span className="signup-link" style={{cursor:'pointer'}} onClick={() => setStep(1)}>Go back</span>
          </p>
        </form>
      )}
    </div>
  );
}