import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  TrendingUp,
  Truck,
  Users,
  AlertTriangle,
  CheckCircle,
  Package,
  Clock,
} from "lucide-react";
import Navbar from "../Components/Navbar";
import "./Learn.css";
import learnimage from "./learn.png";

export default function Learn() {
  return (
    <div className="learn-tactical-wrapper">
      {/* Background overlays — same pattern as LandingPage and About */}
      <div className="learn-grid-overlay" />
      <div className="learn-radial-overlay" />
      <Navbar />

      <div className="learn-page-content">

        {/* ── HERO ─────────────────────────────── */}
        <section className="learn-hero-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div className="learn-eyebrow">
              KNOWLEDGE HUB // INTELLIGENCE_ARCHIVE
            </div>
            <Link to="/" className="home-back-btn">← HOME</Link>
          </div>
          <h1 className="learn-hero-title">
            MASTER THE<br />
            <span className="gold-text">SUPPLY CHAIN</span>
          </h1>
          <p className="learn-hero-subtitle">
            Move from novice to supply chain expert. Understand the hidden dynamics
            that turn small demand signals into massive upstream chaos.
          </p>
        </section>

        {/* ── BULLWHIP EFFECT ───────────────────── */}
        <section className="learn-concept-section">
          <div className="learn-concept-text l-fade-up">
            <div className="learn-section-label">// THREAT_ANALYSIS</div>
            <h2>
              The Enemy:<br />
              <span className="red-text">The Bullwhip Effect</span>
            </h2>
            <p>
              The core lesson of the Beer Game — small fluctuations in consumer
              demand at the retail level cause progressively larger fluctuations
              upstream: at the wholesale, distributor, and manufacturer levels.
            </p>
            <div className="learn-concept-points">
              <div className="learn-concept-point">
                <AlertTriangle size={16} className="learn-concept-point-icon" />
                <span>Small consumer changes cause panic upstream.</span>
              </div>
              <div className="learn-concept-point">
                <AlertTriangle size={16} className="learn-concept-point-icon" />
                <span>Lack of communication amplifies the error.</span>
              </div>
              <div className="learn-concept-point">
                <AlertTriangle size={16} className="learn-concept-point-icon" />
                <span>Lead time delays create false inventory perceptions.</span>
              </div>
            </div>
          </div>

          <div className="learn-concept-visual l-fade-up l-delay-1">
            <img
              src={learnimage}
              alt="Bullwhip Effect graph showing amplifying demand waves upstream"
              className="learn-concept-image"
            />
            <div className="learn-visual-caption">
              // Visualization of Demand Amplification
            </div>
          </div>
        </section>

        {/* ── THE 4 ROLES ───────────────────────── */}
        <section className="learn-roles-section">
          <div className="learn-section-label">// AGENT_PROFILES</div>
          <div style={{ borderLeft: '3px solid #ebb542', paddingLeft: '1.5rem', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', color: '#f8fafc', margin: '0 0 0.4rem 0' }}>
              Know Your Role
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', fontFamily: '"Courier New", monospace', letterSpacing: '0.06em', margin: 0 }}>
              Every link in the chain faces unique pressures. Which one will you master?
            </p>
          </div>

          <div className="learn-roles-grid">
            {/* RETAILER */}
            <div className="learn-role-card l-fade-up">
              <div className="learn-role-icon"><Users size={28} /></div>
              <h3>The Retailer</h3>
              <p>
                You are the only node who sees actual customer demand. Everyone else relies on the signals your orders create.
              </p>
              <ul className="learn-role-stats">
                <li><strong>Upstream:</strong> Wholesaler</li>
                <li><strong>Downstream:</strong> Consumer</li>
                <li><strong>Challenge:</strong> Immediate backlog cost.</li>
              </ul>
            </div>

            {/* WHOLESALER */}
            <div className="learn-role-card l-fade-up l-delay-1">
              <div className="learn-role-icon"><Package size={28} /></div>
              <h3>The Wholesaler</h3>
              <p>
                You buffer the retailer from the distributor. You must anticipate retailer panic before it reaches you.
              </p>
              <ul className="learn-role-stats">
                <li><strong>Upstream:</strong> Distributor</li>
                <li><strong>Downstream:</strong> Retailer</li>
                <li><strong>Challenge:</strong> Inventory bloating.</li>
              </ul>
            </div>

            {/* DISTRIBUTOR */}
            <div className="learn-role-card l-fade-up l-delay-1">
              <div className="learn-role-icon"><Truck size={28} /></div>
              <h3>The Distributor</h3>
              <p>
                The regional hub. You deal with large bulk orders and the longest visible lead times in the chain.
              </p>
              <ul className="learn-role-stats">
                <li><strong>Upstream:</strong> Manufacturer</li>
                <li><strong>Downstream:</strong> Wholesaler</li>
                <li><strong>Challenge:</strong> Massive cost variance.</li>
              </ul>
            </div>

            {/* MANUFACTURER */}
            <div className="learn-role-card l-fade-up l-delay-2">
              <div className="learn-role-icon"><TrendingUp size={28} /></div>
              <h3>The Manufacturer</h3>
              <p>
                You produce the goods. Unlimited supply potential — but it takes time to brew. Production lag is your enemy.
              </p>
              <ul className="learn-role-stats">
                <li><strong>Upstream:</strong> Raw Materials</li>
                <li><strong>Downstream:</strong> Distributor</li>
                <li><strong>Challenge:</strong> Production lag time.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── WEEKLY MECHANICS ──────────────────── */}
        <section className="learn-mechanics-section">
          <div className="learn-section-label">// MISSION_PROTOCOL</div>
          <div style={{ borderLeft: '3px solid #ebb542', paddingLeft: '1.5rem', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', color: '#f8fafc', margin: '0 0 0.4rem 0' }}>
              How The Game Works
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', fontFamily: '"Courier New", monospace', letterSpacing: '0.06em', margin: 0 }}>
              The simulation runs in weekly cycles. A single mistake can haunt you for weeks.
            </p>
          </div>

          <div className="learn-timeline">
            <div className="learn-timeline-item">
              <div className="learn-timeline-icon"><Package size={22} /></div>
              <div className="learn-timeline-content">
                <h3>Step 1 — Receive Inventory</h3>
                <p>Shipments arrive from your upstream supplier after a 2-week pipeline delay. You cannot rush this.</p>
              </div>
            </div>

            <div className="learn-timeline-item">
              <div className="learn-timeline-icon"><Users size={22} /></div>
              <div className="learn-timeline-content">
                <h3>Step 2 — Receive Orders</h3>
                <p>Your downstream customer sends you an order. You must fill it immediately from your on-hand stock.</p>
              </div>
            </div>

            <div className="learn-timeline-item">
              <div className="learn-timeline-icon"><CheckCircle size={22} /></div>
              <div className="learn-timeline-content">
                <h3>Step 3 — Ship Goods</h3>
                <p>Send stock to the customer. If you have zero stock, you create a Backlog — a doubled-cost penalty that accumulates.</p>
              </div>
            </div>

            <div className="learn-timeline-item">
              <div className="learn-timeline-icon"><Clock size={22} /></div>
              <div className="learn-timeline-content">
                <h3>Step 4 — Place Your Order</h3>
                <p>Decide how much to order from your upstream supplier. This is your ONLY strategic decision each week. Choose wisely.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── STRATEGY TIPS ─────────────────────── */}
        <section className="learn-strategy-section">
          <div className="learn-strategy-box">
            <div className="learn-section-label" style={{ marginBottom: '1.5rem' }}>// TACTICAL_DOCTRINE</div>
            <h2>Winning Strategies</h2>
            <div className="learn-strategy-grid">
              <div className="learn-strat-item">
                <strong>Don't Panic</strong>
                Just because you receive a huge order doesn't mean demand has permanently doubled. Resist the urge to over-order.
              </div>
              <div className="learn-strat-item">
                <strong>Watch the Pipeline</strong>
                Orders you placed 2 weeks ago are still incoming. Factor this into your current order decision before adding more.
              </div>
              <div className="learn-strat-item">
                <strong>Communicate</strong>
                If chat is enabled, tell your supplier what you actually need. Silence is the primary driver of the bullwhip effect.
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}