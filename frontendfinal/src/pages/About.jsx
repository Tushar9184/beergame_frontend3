import React from "react";
import "../styles.css";
import { Lightbulb, Users, Gamepad2 } from "lucide-react"; // ✅ icons

export default function About() {
  return (
    <section className="about-page">
      {/* Hero Section */}
      <div className="about-hero">
        <h1>About the <span className="highlight">Beer Game</span></h1>
        <p>
          Discover the power of teamwork and strategy in managing supply chains.
          The Beer Game transforms learning into an engaging, hands-on experience.
        </p>
      </div>

      {/* Glass Cards Section */}
      <div className="about-sections">
        <div className="about-card">
          <Lightbulb className="about-icon" />
          <h2>Our Mission</h2>
          <p>
            To make supply chain learning accessible and exciting. We combine
            simulation, interactivity, and collaboration to help learners truly
            understand how decisions ripple across the supply chain.
          </p>
        </div>

        <div className="about-card">
          <Gamepad2 className="about-icon" />
          <h2>Why We Built It</h2>
          <p>
            The Beer Game brings theory to life by simulating real-world challenges.
            It helps teams visualize demand variability, overstocking, and
            communication gaps — all in a fun, game-like environment.
          </p>
        </div>

        <div className="about-card">
          <Users className="about-icon" />
          <h2>Who Can Play</h2>
          <p>
            Perfect for students, educators, and professionals who want to explore
            supply chain principles, teamwork, and strategic thinking — no prior
            experience required!
          </p>
        </div>
      </div>
    </section>
  );
}