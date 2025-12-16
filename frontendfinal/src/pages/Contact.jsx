import React, { useState } from "react";
import { 
  Mail, 
  MapPin, 
  Phone, 
  Send, 
  MessageSquare, 
  Github, 
  Linkedin, 
  Twitter,
  HelpCircle
} from "lucide-react"; 
import "../styles.css";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Simulate Sending Data
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Fake API delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      
      // Reset success message after 3 seconds
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <div className="contact-wrapper">
      
      {/* --- HERO SECTION --- */}
      <section className="contact-hero">
        <div className="hero-badge"><MessageSquare size={16} /> Support Center</div>
        <h1>Get in <span className="text-gradient">Touch</span></h1>
        <p>
          Have questions about the simulation? Found a bug? Or just want to talk supply chain strategy? 
          We are here to help.
        </p>
      </section>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="contact-container">
        
        {/* LEFT COLUMN: Contact Info */}
        <div className="contact-info fade-in-up">
          <h2>Contact Information</h2>
          <p className="info-sub">
            Fill out the form and our team will get back to you within 24 hours.
          </p>

          <div className="info-cards">
            <div className="info-card">
              <div className="icon-circle"><Mail size={24} /></div>
              <div>
                <h3>Email Us</h3>
                <p>support@beergame.com</p>
              </div>
            </div>

            <div className="info-card">
              <div className="icon-circle"><Phone size={24} /></div>
              <div>
                <h3>Call Us</h3>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="info-card">
              <div className="icon-circle"><MapPin size={24} /></div>
              <div>
                <h3>Visit Us</h3>
                <p>123 Supply Chain Blvd,<br />Logistics City, LC 90210</p>
              </div>
            </div>
          </div>

          <div className="social-links">
            <h3>Follow Us</h3>
            <div className="social-icons">
              {/* FIXED: Replaced '#' with valid URLs and added rel/target */}
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer" 
                className="social-btn"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer" 
                className="social-btn"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer" 
                className="social-btn"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: The Form */}
        <div className="contact-form-wrapper fade-in-up delay-1">
          <form className="modern-form" onSubmit={handleSubmit}>
            <h2>Send a Message</h2>
            
            <div className="input-group">
              <label>Your Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="John Doe" 
                required 
              />
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="john@example.com" 
                required 
              />
            </div>

            <div className="input-group">
              <label>Message</label>
              <textarea 
                name="message" 
                rows="5" 
                value={formData.message} 
                onChange={handleChange} 
                placeholder="How can we help you?" 
                required 
              ></textarea>
            </div>

            <button type="submit" className={`submit-btn ${isSubmitting ? "loading" : ""} ${submitted ? "success" : ""}`} disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : submitted ? "Message Sent!" : (
                <>Send Message <Send size={18} /></>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* --- FAQ SECTION --- */}
      <section className="faq-section">
        <div className="faq-header">
          <HelpCircle size={40} className="faq-icon" />
          <h2>Frequently Asked Questions</h2>
          <p>Quick answers to common questions about the Beer Game.</p>
        </div>

        <div className="faq-grid">
          <div className="faq-item">
            <h3>Is this game free to play?</h3>
            <p>Yes! You can create rooms and join lobbies completely for free.</p>
          </div>
          <div className="faq-item">
            <h3>How many players do I need?</h3>
            <p>Ideally 4 players per supply chain (Retailer, Wholesaler, Distributor, Manufacturer), but you can play with fewer using AI fills.</p>
          </div>
          <div className="faq-item">
            <h3>Can I customize the settings?</h3>
            <p>Hosts can adjust lead times, backlog costs, and inventory holding costs in the lobby settings.</p>
          </div>
          <div className="faq-item">
            <h3>Do I need an account?</h3>
            <p>Yes, you need to sign up to track your stats and save your game history.</p>
          </div>
        </div>
      </section>

    </div>
  );
}