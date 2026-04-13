import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import { Link } from "react-router-dom";
import "./LandingPage.css"; // Reuse the dark tactical styling

export default function Home() {
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
        <div className="page home-page" style={{ backgroundColor: '#080c10', minHeight: '100vh', color: '#fff' }}>
            <Navbar />
            
            {/* Start of Tactical Layout below Navbar */}
            <div className="landing-tactical-wrapper" style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div className="landing-background-overlay"></div>
                <div className="landing-hex-pattern"></div>
                
                {/* HERO SECTION */}
                <div className="landing-hero-section">
                    <div className="landing-content">
                        <div className="landing-topbar-text">TACTICAL SUPPLY CHAIN OS // V2.0.4</div>
                        
                        <h1 className="landing-main-title">
                            <span className="landing-title-line">GSV BEER</span><br/>
                            <span className="landing-title-line">GAME</span>
                        </h1>
                        
                        <p className="landing-subtitle">
                            Execute mission-critical supply chain simulations. Master the volatility of multi-tier distribution networks through tactical intelligence.
                        </p>
                        
                        <div className="landing-button-group">
                            <Link to="/dashboard/default" className="landing-btn landing-btn-primary">INITIATE PROTOCOL</Link>
                            <Link to="/about" className="landing-btn landing-btn-secondary">REGISTRY</Link>
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
                                    <span className="status-dot"></span> SECURE
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SYSTEMS INTELLIGENCE SECTION */}
                <div className="landing-section systems-intelligence">
                    <div className="section-header">
                        <h2>SYSTEMS INTELLIGENCE</h2>
                        <p className="section-subtext">MITIGATING BULLWHIP VOLATILITY THROUGH ML MODELS</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-img-wrapper">
                                <img src="/assets/feature_1.png" alt="Dynamic Systems" />
                            </div>
                            <h3>DYNAMIC SYSTEMS</h3>
                            <p>Navigate non-linear complexities defining modern supply chain ecosystems.</p>
                            <span className="feature-id">ID: 980_00_01</span>
                        </div>
                        <div className="feature-card">
                            <div className="feature-img-wrapper">
                                <img src="/assets/feature_2.png" alt="Data Strategy" />
                            </div>
                            <h3>DATA STRATEGY</h3>
                            <p>Integrate analytics transforming signal noise into actionable command strategy.</p>
                            <span className="feature-id">ID: 980_00_02</span>
                        </div>
                        <div className="feature-card">
                            <div className="feature-img-wrapper">
                                <img src="/assets/feature_3.png" alt="Predictive ML" />
                            </div>
                            <h3>PREDICTIVE ML</h3>
                            <p>Leverage predictive algorithms to forecast demand spikes and inventory flows.</p>
                            <span className="feature-id">ID: 980_00_03</span>
                        </div>
                        <div className="feature-card">
                            <div className="feature-img-wrapper">
                                <img src="/assets/feature_4.png" alt="Bullwhip Mitigation" />
                            </div>
                            <h3>BULLWHIP MITIGATION</h3>
                            <p>Suppress the volatility cascading through multi-tier distribution networks.</p>
                            <span className="feature-id">ID: 980_00_04</span>
                        </div>
                    </div>
                </div>

                {/* COMMAND DIRECTIVES SECTION */}
                <div className="landing-section command-directives">
                    <div className="section-header align-left">
                        <h2>COMMAND DIRECTIVES // <span className="highlight-text">INTEL REPORT</span></h2>
                    </div>
                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <p className="testimonial-quote">&quot;The strategic depth is unparalleled. It transformed how our leadership team views supply chain risk and bullwhip volatility.&quot;</p>
                            <div className="testimonial-author">
                                <div className="author-avatar"><span className="avatar-icon">👤</span></div>
                                <div className="author-info">
                                    <h4>ANDRÉ SCHOLL</h4>
                                    <span>OPERATIONS DIRECTOR // V_1.09</span>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <p className="testimonial-quote">&quot;Models and ML integration make this more than just a game&mdash;it&apos;s a critical training tool for logistics operatives.&quot;</p>
                            <div className="testimonial-author">
                                <div className="author-avatar"><span className="avatar-icon">🛡️</span></div>
                                <div className="author-info">
                                    <h4>LUTZ HELDMAIER</h4>
                                    <span>STRATEGIC DIRECTOR // V_1.99</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA FOOTER SECTION */}
                <div className="landing-cta-section">
                    <div className="cta-box">
                        <h2>READY TO MASTER<br/>THE <span className="highlight-text">CHAIN?</span></h2>
                        <p>Join the ranks of top logistics professionals and test your skills in the most realistic beer game simulation on the market.</p>
                        <div className="landing-button-group center-btn">
                            <Link to="/joinlobby" className="landing-btn landing-btn-primary">INITIATE SYNC</Link>
                            <Link to="/about" className="landing-btn landing-btn-secondary">REQUEST INTEL</Link>
                        </div>
                    </div>
                </div>

                <div className="landing-bot-footer">
                    <div className="bot-footer-left">GSV BEER GAME</div>
                    <div className="bot-footer-right">SYS_TIME: {time}</div>
                </div>
            </div>
        </div>
    );
}
