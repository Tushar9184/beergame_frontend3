import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from "../services/user-service";
import "../styles.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser({ username, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      navigate('/');
    } catch (err) {
      console.log(err);
      const errorMessage = err.response?.data?.message || "Invalid username or password";
      alert(errorMessage);
    }
  };

  return (
    // The body styles in CSS will center this container
    <div className="login-container">
      <h1 className="login-title">Welcome Back</h1>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="login-username">Username</label>
          <input 
            id="login-username"
            type="text"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            placeholder="e.g., john_doe"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="login-password">Password</label>
          <input 
            id="login-password"
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button className="login-btn" type="submit">Login</button>

        <p className="signup-text">
          Don't have an account? <Link className="signup-link" to="/sign">Sign up now</Link>
        </p>
      </form>
    </div>
  );
}