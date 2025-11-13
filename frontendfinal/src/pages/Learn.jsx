import React from "react";
import "../styles.css";

export default function Learn() {
  const lessons = [
    {
      title: "Understanding the Beer Game",
      desc: "Learn the classic supply chain simulation that demonstrates the Bullwhip Effect and coordination challenges.",
    },
    {
      title: "Roles & Responsibilities",
      desc: "Explore how Retailer, Wholesaler, Distributor, and Manufacturer work together to balance demand and supply.",
    },
    {
      title: "Strategy & Optimization",
      desc: "Discover best practices to minimize costs and improve forecasting in dynamic supply chains.",
    },
  ];

  return (
    <section className="page-section">
      <div className="page-container">
        <h1 className="page-title">Learn the Beer Game</h1>
        <p className="page-subtitle">
          Master supply chain concepts through interactive lessons and simple explanations.
        </p>

        <div className="learn-grid">
          {lessons.map((l, i) => (
            <div className="learn-card" key={i}>
              <h3>{l.title}</h3>
              <p>{l.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}