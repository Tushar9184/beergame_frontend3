import React from "react";
import { 
  BookOpen, 
  TrendingUp, 
  Truck, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Package,
  Clock 
} from "lucide-react"; 
import "../styles.css";
import learnimage from "./learn.png";

export default function Learn() {
  return (
    <div className="learn-wrapper">
      
      {/* --- HERO SECTION --- */}
      <section className="learn-hero">
        <div className="learn-hero-content fade-in-up">
          <div className="icon-badge"><BookOpen size={20} /> Knowledge Hub</div>
          <h1>The Academy of <span className="text-gradient">Supply Chain</span></h1>
          <p>
            Master the art of inventory management. Move from a novice to a 
            supply chain expert by understanding the hidden dynamics of the Beer Game.
          </p>
        </div>
      </section>

      {/* --- CORE CONCEPT: BULLWHIP EFFECT --- */}
      <section className="concept-section">
        <div className="concept-text slide-in-left">
          <h2>The Enemy: <span className="highlight-red">The Bullwhip Effect</span></h2>
          <p>
            The core lesson of the Beer Game is a phenomenon where small fluctuations in 
            consumer demand at the retail level cause progressively larger fluctuations 
            in demand at the wholesale, distributor, and manufacturer levels.
          </p>
          <div className="concept-points">
            <div className="point">
              <AlertTriangle className="point-icon red" />
              <span>Small consumer changes cause panic upstream.</span>
            </div>
            <div className="point">
              <AlertTriangle className="point-icon red" />
              <span>Lack of communication amplifies the error.</span>
            </div>
            <div className="point">
              <AlertTriangle className="point-icon red" />
              <span>Lead times (delays) create false perceptions.</span>
            </div>
          </div>
        </div>
        <div className="concept-visual slide-in-right">
              <img src={learnimage} alt="Image of Bullwhip Effect graph showing amplifying waves upstream" className="concept-image" />
             <div className="visual-caption">Visualization of Demand Amplification</div>
        </div>
      </section>

      {/* --- THE 4 ROLES --- */}
      <section className="roles-section">
        <div className="section-header">
          <h2>Know Your Role</h2>
          <p>Every link in the chain faces unique pressures. Which one will you master?</p>
        </div>
        
        [Image of Beer Game linear supply chain diagram with 4 stages]

        <div className="roles-grid">
          {/* RETAILER */}
          <div className="role-card">
            <div className="role-icon-bg"><Users size={32} /></div>
            <h3>The Retailer</h3>
            <p className="role-desc">
              You are the only one who sees actual customer demand. Everyone else relies on your orders.
            </p>
            <ul className="role-stats">
              <li><strong>Upstream:</strong> Wholesaler</li>
              <li><strong>Downstream:</strong> Consumer</li>
              <li><strong>Challenge:</strong> Immediate backlog cost.</li>
            </ul>
          </div>

          {/* WHOLESALER */}
          <div className="role-card">
            <div className="role-icon-bg"><Package size={32} /></div>
            <h3>The Wholesaler</h3>
            <p className="role-desc">
              You buffer the retailer from the distributor. You must anticipate retailer panic.
            </p>
            <ul className="role-stats">
              <li><strong>Upstream:</strong> Distributor</li>
              <li><strong>Downstream:</strong> Retailer</li>
              <li><strong>Challenge:</strong> Inventory bloating.</li>
            </ul>
          </div>

          {/* DISTRIBUTOR */}
          <div className="role-card">
            <div className="role-icon-bg"><Truck size={32} /></div>
            <h3>The Distributor</h3>
            <p className="role-desc">
              The regional hub. You deal with massive bulk orders and long lead times.
            </p>
            <ul className="role-stats">
              <li><strong>Upstream:</strong> Manufacturer</li>
              <li><strong>Downstream:</strong> Wholesaler</li>
              <li><strong>Challenge:</strong> Massive cost variance.</li>
            </ul>
          </div>

          {/* MANUFACTURER */}
          <div className="role-card">
            <div className="role-icon-bg"><TrendingUp size={32} /></div>
            <h3>The Manufacturer</h3>
            <p className="role-desc">
              You produce the goods. You have no limit on supply, but it takes time to brew.
            </p>
            <ul className="role-stats">
              <li><strong>Upstream:</strong> Raw Materials</li>
              <li><strong>Downstream:</strong> Distributor</li>
              <li><strong>Challenge:</strong> Production lag time.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- GAMEPLAY MECHANICS (Timeline) --- */}
      <section className="mechanics-section">
        <div className="section-header">
          <h2>How The Game Works</h2>
          <p>The simulation runs in weekly cycles. A single mistake can haunt you for weeks.</p>
        </div>

        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-icon"><Package /></div>
            <div className="timeline-content">
              <h3>1. Receive Inventory</h3>
              <p>Shipments arrive from your upstream supplier after a 2-week delay.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-icon"><Users /></div>
            <div className="timeline-content">
              <h3>2. Receive Orders</h3>
              <p>Your downstream customer sends you an order. You must fill it immediately.</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-icon"><CheckCircle /></div>
            <div className="timeline-content">
              <h3>3. Ship Goods</h3>
              <p>Send stock to the customer. If you have 0 stock, you create a "Backlog" (Penalty).</p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-icon"><Clock /></div>
            <div className="timeline-content">
              <h3>4. Place Order</h3>
              <p>Decide how much to order from your supplier. This is your ONLY strategic move.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- STRATEGY TIPS --- */}
      <section className="strategy-cta">
        <div className="strategy-box">
          <h2>Winning Strategies</h2>
          <div className="strategy-grid">
            <div className="strat-item">
              <strong>Don't Panic:</strong> Just because you receive a huge order doesn't mean demand has permanently doubled.
            </div>
            <div className="strat-item">
              <strong>Watch the Pipeline:</strong> Remember that orders you placed 2 weeks ago are still on their way.
            </div>
            <div className="strat-item">
              <strong>Communicate:</strong> If chatting is enabled, tell your supplier what you actually need.
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}