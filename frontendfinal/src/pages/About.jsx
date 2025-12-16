import React from "react";
import { Lightbulb, Users, Gamepad2, TrendingUp, Anchor, Zap } from "lucide-react"; 
import "../styles.css"; // We will add specific about css to styles.css or a new file

export default function About() {
  return (
    <div className="about-wrapper">
      
      {/* --- HERO SECTION --- */}
      <section className="about-hero">
        <div className="hero-content fade-in-up">
          <span className="pill-label">Supply Chain Simulation</span>
          <h1>Master the <span className="text-gradient">Bullwhip Effect</span></h1>
          <p className="hero-subtitle">
            Experience the chaos of supply chain management in a risk-free environment. 
            Learn how small fluctuations in demand can cause massive disruptions.
          </p>
        </div>
        <div className="hero-visual fade-in-up delay-1">
          {/* Abstract visual representation using CSS shapes */}
          <div className="circle-blur one"></div>
          <div className="circle-blur two"></div>
        </div>
      </section>

      {/* --- THE CONCEPT SECTION (Text + Image layout) --- */}
      <section className="about-story">
        <div className="story-content slide-in-left">
          <h2>From MIT to Your Screen</h2>
          <p>
            Originally developed by the <strong>MIT Sloan School of Management</strong> in the 1960s, 
            the Beer Distribution Game was created to demonstrate a key principle of supply chain economics: 
            the Bullwhip Effect.
          </p>
          <p>
            What started as a board game played in classrooms is now a digital, multiplayer 
            experience allowing you to connect with players worldwide to simulate real-time inventory challenges.
          </p>
        </div>
        <div className="story-stat slide-in-right">
          <div className="stat-box">
            <TrendingUp size={40} className="stat-icon" />
            <h3>50+ Years</h3>
            <p>Of Educational History</p>
          </div>
          <div className="stat-box">
            <Anchor size={40} className="stat-icon" />
            <h3>4 Roles</h3>
            <p>One Complex Chain</p>
          </div>
        </div>
      </section>

      {/* --- VALUES GRID (Glass Cards) --- */}
      <section className="about-values">
        <div className="section-header">
          <h2>Why Play The Game?</h2>
          <p>It's not just a game; it's a lesson in systems thinking.</p>
        </div>

        <div className="values-grid">
          <div className="glass-card">
            <div className="icon-wrapper"><Lightbulb /></div>
            <h3>Deep Understanding</h3>
            <p>
              Move beyond theory. Feel the pressure of holding inventory cost vs. the 
              panic of backlogs.
            </p>
          </div>

          <div className="glass-card">
            <div className="icon-wrapper"><Gamepad2 /></div>
            <h3>Gamified Learning</h3>
            <p>
              Replace boring lectures with an interactive competition. Who can run the 
              most efficient supply chain?
            </p>
          </div>

          <div className="glass-card">
            <div className="icon-wrapper"><Users /></div>
            <h3>Collaborative Chaos</h3>
            <p>
              Test your communication skills. The biggest enemy in the supply chain isn't 
              demand—it's lack of coordination.
            </p>
          </div>

          <div className="glass-card">
            <div className="icon-wrapper"><Zap /></div>
            <h3>Real-Time Strategy</h3>
            <p>
              Make split-second decisions. Every order you place takes weeks to arrive. 
              Can you plan ahead?
            </p>
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="about-cta">
        <div className="cta-content">
          <h2>Ready to break the chain?</h2>
          <p>Join a room now and see if you can keep costs down while keeping customers happy.</p>
          <a href="/joinlobby" className="cta-button">Start Simulation</a>
        </div>
      </section>

    </div>
  );
}