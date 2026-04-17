import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  Github,
  Linkedin,
  Twitter,
} from "lucide-react";
import Navbar from "../Components/Navbar";
import "./Contact.css";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert("Please fill in all fields before sending.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    // Fake API delay (replace with real EmailJS / Formspree call when ready)
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <div className="contact-tactical-wrapper">
      {/* Background overlays — same as Landing / About */}
      <div className="contact-grid-overlay" />
      <div className="contact-radial-overlay" />
      <Navbar />

      <div className="contact-page-content">

        {/* ── HERO ─────────────────────────────── */}
        <section className="contact-hero-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div className="contact-eyebrow">
              SUPPORT CENTER // COMMS_CHANNEL
            </div>
            <Link to="/" className="home-back-btn">← HOME</Link>
          </div>
          <h1 className="contact-hero-title">
            <span className="gold-text">ESTABLISH</span><br />
            CONTACT
          </h1>
          <p className="contact-hero-subtitle">
            Have questions about the simulation? Found a bug? Or just want to talk
            supply chain strategy? Open a transmission and we'll respond within 24 hours.
          </p>
        </section>

        {/* ── MAIN GRID: Info + Form ─────────── */}
        <div className="contact-grid">

          {/* LEFT COLUMN — Info */}
          <div className="contact-info-panel c-fade-up">
            <div>
              <div className="contact-section-label">// OPERATOR_CHANNELS</div>
              <h2>Contact<br />Information</h2>
              <p className="sub-text">
                Reach out through any channel below. Our team monitors all transmissions.
              </p>
            </div>

            <div className="contact-info-cards">
              <div className="contact-info-card">
                <div className="contact-info-icon"><Mail size={20} /></div>
                <div>
                  <h4>Email Channel</h4>
                  <p>support@beergame.com</p>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-icon"><Phone size={20} /></div>
                <div>
                  <h4>Voice Channel</h4>
                  <p>+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-icon"><MapPin size={20} /></div>
                <div>
                  <h4>Field Office</h4>
                  <p>123 Supply Chain Blvd,<br />Logistics City, LC 90210</p>
                </div>
              </div>
            </div>

            <div className="contact-social-block">
              <h4>// External Networks</h4>
              <div className="contact-social-icons">
                <a
                  href="https://github.com/Tushar9184"
                  target="_blank"
                  rel="noreferrer"
                  className="contact-social-btn"
                  aria-label="GitHub"
                >
                  <Github size={20} />
                </a>
                <a
                  href="https://linkedin.com/in/gsv-beer-game"
                  target="_blank"
                  rel="noreferrer"
                  className="contact-social-btn"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href="https://twitter.com/gsvbeergame"
                  target="_blank"
                  rel="noreferrer"
                  className="contact-social-btn"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — Form */}
          <div className="contact-form-panel c-fade-up c-delay-1">
            <h2>Transmit Message</h2>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-field">
                <label>Operator Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="contact-field">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="contact-field">
                <label>Message</label>
                <textarea
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your query..."
                  required
                />
              </div>

              <button
                type="submit"
                className={`contact-submit-btn ${submitted ? "sent" : ""}`}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "TRANSMITTING..."
                  : submitted
                  ? "✔ MESSAGE RECEIVED"
                  : <><Send size={16} /> TRANSMIT MESSAGE</>
                }
              </button>
            </form>
          </div>
        </div>

        {/* ── FAQ SECTION ────────────────────── */}
        <section className="contact-faq-section">
          <div className="contact-faq-header">
            <h2>Frequent Queries</h2>
            <p>// MISSION_INTEL — Quick answers about the Beer Distribution Game</p>
          </div>

          <div className="contact-faq-grid">
            <div className="contact-faq-card">
              <h3>Is this game free to play?</h3>
              <p>Yes. You can create lobbies and join rooms completely free. No credit card required.</p>
            </div>
            <div className="contact-faq-card">
              <h3>How many players do I need?</h3>
              <p>Ideally 4 players per supply chain (Retailer, Wholesaler, Distributor, Manufacturer), but smaller teams are supported.</p>
            </div>
            <div className="contact-faq-card">
              <h3>Can I customize game settings?</h3>
              <p>Hosts can adjust lead times, backlog costs, and inventory holding costs in the lobby settings panel.</p>
            </div>
            <div className="contact-faq-card">
              <h3>Do I need an account?</h3>
              <p>Yes. Registration is required to track your stats, save game history, and access the full simulation suite.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}