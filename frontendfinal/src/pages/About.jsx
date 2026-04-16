import React from "react";
import { Link } from "react-router-dom";
import { Lightbulb, Users, Gamepad2, TrendingUp, Anchor, Zap } from "lucide-react";
import "./About.css";

const VALUES = [
  {
    icon: <Lightbulb className="value-card-icon" />,
    id: "MOD_001",
    title: "Deep Understanding",
    desc: "Move beyond theory. Feel the real pressure of holding inventory cost vs. the panic of mounting backlogs.",
  },
  {
    icon: <Gamepad2 className="value-card-icon" />,
    id: "MOD_002",
    title: "Gamified Learning",
    desc: "Replace static lectures with an interactive competition. Who can run the most efficient supply chain?",
  },
  {
    icon: <Users className="value-card-icon" />,
    id: "MOD_003",
    title: "Collaborative Chaos",
    desc: "Test your coordination under pressure. The biggest supply-chain enemy isn't demand — it's silence.",
  },
  {
    icon: <Zap className="value-card-icon" />,
    id: "MOD_004",
    title: "Real-Time Strategy",
    desc: "Make split-second decisions. Every order you place takes weeks to arrive. Can you plan ahead?",
  },
];

export default function About() {
  return (
    <div className="about-tactical-wrapper">
      {/* Background overlays matching Landing Page */}
      <div className="about-grid-overlay" />
      <div className="about-radial-overlay" />

      <div className="about-page-content">

        {/* ── HERO ─────────────────────────────── */}
        <section className="about-hero-section">
          <div className="about-eyebrow fade-in-up">
            TACTICAL BRIEFING // MODULE_ALPHA
          </div>

          <h1 className="about-hero-title fade-in-up delay-1">
            <span className="white-line">MASTER THE</span><br />
            <span className="gold-line">BULLWHIP EFFECT</span>
          </h1>

          <p className="about-hero-subtitle fade-in-up delay-2">
            Experience the chaos of supply chain management in a risk-free simulation environment.
            Discover how minor demand fluctuations cascade into massive upstream disruptions — and learn to stop them.
          </p>
        </section>

        {/* ── STORY ────────────────────────────── */}
        <section className="about-story-section">
          <div className="fade-in-up">
            <div className="about-section-label">// INTELLIGENCE FILE</div>
            <h2>From MIT to Your Screen</h2>
            <p>
              Originally developed by the <strong>MIT Sloan School of Management</strong> in the 1960s,
              the Beer Distribution Game was engineered to expose a core principle of supply chain economics —
              the <strong>Bullwhip Effect</strong>.
            </p>
            <p>
              What started as a classroom board game is now a real-time, multiplayer digital simulation.
              Connect with players worldwide, take on a role in the supply chain, and manage your inventory
              against live demand signals.
            </p>
          </div>

          <div className="about-stats-panel fade-in-up delay-1">
            <div className="about-stat-box">
              <div className="stat-icon-wrap">
                <TrendingUp size={36} />
              </div>
              <div>
                <h3>50+ Years</h3>
                <p>of educational history</p>
              </div>
            </div>

            <div className="about-stat-box">
              <div className="stat-icon-wrap">
                <Anchor size={36} />
              </div>
              <div>
                <h3>4 Roles</h3>
                <p>one complex chain</p>
              </div>
            </div>

            <div className="about-stat-box">
              <div className="stat-icon-wrap">
                <Users size={36} />
              </div>
              <div>
                <h3>Real-Time</h3>
                <p>multiplayer simulation</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── VALUES GRID ──────────────────────── */}
        <section className="about-values-section">
          <div className="about-values-header">
            <h2>SIMULATION MODULES</h2>
            <p>WHY PLAY THE GAME? // SYSTEMS INTELLIGENCE</p>
          </div>

          <div className="about-values-grid">
            {VALUES.map((v, i) => (
              <div
                key={v.id}
                className={`about-value-card fade-in-up delay-${i + 1}`}
              >
                {v.icon}
                <div className="value-card-id">{v.id}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────── */}
        <section className="about-cta-section">
          <div className="about-cta-box">
            <h2>
              READY TO BREAK<br />
              THE <span>CHAIN?</span>
            </h2>
            <p>
              Join a room now and see if you can keep costs down while keeping customers satisfied.
              The simulation waits for no one.
            </p>
            <div className="about-btn-group">
              <Link to="/joinlobby" className="about-btn about-btn-primary">
                INITIATE SYNC
              </Link>
              <Link to="/login" className="about-btn about-btn-secondary">
                ACCESS REGISTRY
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}