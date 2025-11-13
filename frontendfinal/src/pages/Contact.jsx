import React from "react";
import "../styles.css";

export default function Contact() {
  return (
    <section className="page-section">
      <div className="page-container">
        <h1 className="page-title">Contact Us</h1>
        <p className="page-subtitle">We’d love to hear from you! Reach out for feedback, support, or collaboration.</p>

        <form className="contact-form">
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea placeholder="Your Message" rows="5" required></textarea>
          <button type="submit" className="btn primary">Send Message</button>
        </form>
      </div>
    </section>
  );
}