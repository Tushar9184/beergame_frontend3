import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
    const [time, setTime] = useState("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            setTime(`${hours}:${minutes}:${seconds}`);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="landing-tactical-wrapper">
            <div className="landing-background-overlay"></div>
            <div className="landing-hex-pattern"></div>
            
            <div className="landing-content">
                <div className="landing-topbar-text">TACTICAL SUPPLY CHAIN OS // V2.0.4</div>
                
                <h1 className="landing-main-title">
                    <span className="landing-title-line">GSV BEER</span><br/>
                    <span className="landing-title-line">GAME</span>
                </h1>
                
                <p className="landing-subtitle">
                    Simulate. Panic. Learn. Dominate the Supply Chain.
                </p>
                
                <div className="landing-button-group">
                    <Link to="/sign" className="landing-btn landing-btn-primary">SIGN UP</Link>
                    <Link to="/login" className="landing-btn landing-btn-secondary">LOGIN</Link>
                </div>
                
                <div className="landing-metrics-grid">
                    <div className="landing-metric">
                        <div className="metric-label">LATENCY</div>
                        <div className="metric-value">14ms</div>
                    </div>
                    <div className="landing-metric">
                        <div className="metric-label">ENCRYPTION</div>
                        <div className="metric-value">AES-256</div>
                    </div>
                    <div className="landing-metric">
                        <div className="metric-label">STATUS</div>
                        <div className="metric-value status-online">
                            <span className="status-dot"></span> ONLINE
                        </div>
                    </div>
                </div>
            </div>

            <div className="landing-bot-footer">
                <div className="bot-footer-left">LIVE_FEED</div>
                <div className="bot-footer-right">SYS_TIME: {time}</div>
            </div>
        </div>
    );
}
