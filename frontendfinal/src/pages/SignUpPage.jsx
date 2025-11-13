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
      alert("❌ Unable to send OTP");
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

      alert("✅ Account created");
      navigate("/");
    } catch (err) {
      alert("❌ Registration failed");
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">
        {step === 1 ? "Create Account 🚀" : "Verify OTP 🔐"}
      </h1>

      {/* STEP 1: SIGNUP FORM */}
      {step === 1 && (
        <form className="login-form" onSubmit={handleSendOtp}>
          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
              placeholder="Enter username" 
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder="Enter email" 
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              placeholder="Enter password" 
              required
            />
          </div>

          <button className="login-btn" type="submit">Send OTP</button>

          <p className="signup-text">
            Already have an account? <Link className="signup-link" to="/login">Login</Link>
          </p>
        </form>
      )}

      {/* STEP 2: OTP FORM */}
      {step === 2 && (
        <form className="login-form" onSubmit={handleRegister}>
          <div className="input-group">
            <label>Enter OTP</label>
            <input 
              type="text" 
              value={enteredOtp}
              onChange={(e)=>setEnteredOtp(e.target.value)}
              placeholder="Enter OTP" 
              required
            />
          </div>

          <button className="login-btn" type="submit">Verify & Register</button>
        </form>
      )}
    </div>
  );
}
