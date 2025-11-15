import React, { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto'; // Assuming Chart.js is installed
import { PlayerHistoryTable } from './PlayerHistoryTable'; 

/* --------------------------
    Configuration (Match 25-week game)
-------------------------- */
const TOTAL_WEEKS = 25; 
// Using Manufacturer (assuming Producer is Manufacturer in the game logic)
const PLAYER_ROLES = ["Retailer", "Wholesaler", "Distributor", "Manufacturer"]; 
const FESTIVE_WEEKS_CONFIG = [7, 18];
const COLORS = {
  Consumer: "#F0C000",
  Retailer: "#00B050",
  Wholesaler: "#00B0F0",
  Distributor: "#FF0000",
  Manufacturer: "#E0E0E0" // Using this color for Manufacturer
};

/* --------------------------
    Utility
-------------------------- */
const range = (s, e) => Array.from({ length: e - s + 1 }, (_, i) => s + i);

/* --------------------------
    Generate Mock Data (Based on your provided logic for 25 weeks)
    NOTE: We are relying on these mocked arrays to represent the history. 
    In the real app, this history data must be fetched from the backend.
-------------------------- */
function generateMockData() {
  const weeks = range(1, 25);
  const data = {};

  let base = Array(25).fill(20);
  for (let i = 4; i <= 11; i++) base[i] = 40;
  FESTIVE_WEEKS_CONFIG.forEach(w => base[w - 1] = base[w - 2] * 2);

  let last = null;

  PLAYER_ROLES.forEach((role, i) => {
    let received;
    if (role === "Retailer") received = [...base];
    else received = last ? [20, ...last.slice(0, 24)] : Array(25).fill(20); 

    const panic = 1 + i * 0.25;
    let placed = received.map(v => Math.max(0, Math.round(v * panic + (Math.random() * 10 - 5))));
    last = [...placed]; 

    let inventory = received.map((v, idx) => Math.max(0, Math.round(100 - v * 0.5 + (Math.random() * 30 - 15) - i * 15)));
    let back = received.map((v, idx) => {
      let b = Math.max(0, v - inventory[idx] * 0.8 + (Math.random() * 10));
      return Math.round(b);
    });

    let cost = inventory.map((inv, idx) => inv * 0.75 + back[idx] * 1.5);
    let cumulative = cost.reduce((a, v) => { a.push((a.at(-1) || 0) + v); return a; }, []);

    data[role] = {
      weeks,
      playerRole: role, 
      customerOrders: received, // Orders Received (from downstream player)
      newOrderPlaced: placed,    // Orders Placed (to upstream supplier)
      inventory,
      backorder: back,
      // Mocked Shipments since DTO doesn't expose them directly
      shipmentSent: placed.map(() => Math.round(Math.random() * 50)),
      shipmentReceived: placed.map(() => Math.round(Math.random() * 50)),
      costs: cost,
      cumulativeCost: cumulative,
      totalCost: cumulative.at(-1) 
    };
  });

  data["Consumer"] = { weeks, newOrderPlaced: [...base] };
  return data;
}

const MOCK_DATA = generateMockData();

/* --------------------------
    Chart Logic (Adapted to React Hooks/Refs)
-------------------------- */
const ACTIVE_CHARTS = [];
const clearCharts = () => {
  ACTIVE_CHARTS.forEach(ch => ch.destroy());
  ACTIVE_CHARTS.length = 0; 
};

function makeCard(title, containerRef) {
  const card = document.createElement("div");
  card.className = "card result-chart-card";

  const label = document.createElement("h3");
  label.textContent = title;
  card.appendChild(label);

  const canvas = document.createElement("canvas");
  card.appendChild(canvas);
  containerRef.current.appendChild(card);
  return canvas;
}

function buildChart(canvas, labels, datasets, title) {
  const chart = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: { labels, datasets },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#333" } }, 
        title: { display: true, text: title, color: "#333" }
      },
      scales: {
        x: { ticks: { color: "#666" } },
        y: { ticks: { color: "#666" }}
      }
    }
  });
  ACTIVE_CHARTS.push(chart);
}

function showPlayerCharts(role, contentRef) {
  clearCharts();
  const p = MOCK_DATA[role];
  const weeks = p.weeks;
  contentRef.current.innerHTML = "";

  const charts = [
    ["Orders vs Week", [
      { label: "Orders Received", data: p.customerOrders, borderColor: COLORS.Wholesaler },
      { label: "Orders Placed", data: p.newOrderPlaced, borderColor: COLORS.Retailer }
    ]],
    ["Inventory vs Week", [
      { label: "Inventory", data: p.inventory, borderColor: COLORS.Retailer }
    ]],
    ["Backorder vs Week", [
      { label: "Backorder", data: p.backorder, borderColor: COLORS.Distributor }
    ]],
    ["Weekly Cost", [
      { label: "Cost", data: p.costs, borderColor: COLORS.Consumer }
    ]],
    ["Cumulative Cost", [
      { label: "Cumulative", data: p.cumulativeCost, borderColor: COLORS.Manufacturer }
    ]]
  ];

  charts.forEach(([title, ds]) => {
    const canvas = makeCard(title, contentRef);
    buildChart(canvas, weeks, ds.map(d => ({
      ...d,
      tension: 0,
      pointRadius: 2
    })), title);
  });
}

function showCompareCharts(key, contentRef) {
  clearCharts();
  contentRef.current.innerHTML = "";

  const titles = {
    newOrderPlaced: "Orders (Bullwhip Effect)",
    inventory: "Inventory Comparison",
    backorder: "Backorder Comparison",
    costs: "Weekly Cost Comparison",
    cumulativeCost: "Cumulative Cost Comparison"
  };

  const canvas = makeCard(titles[key], contentRef);
  const weeks = MOCK_DATA["Retailer"].weeks;
  const roles = key === "newOrderPlaced" ? ["Consumer", ...PLAYER_ROLES] : PLAYER_ROLES;

  const datasets = roles.map(r => ({
    // Label Producer as per original graph code's labels, but use Manufacturer's data
    label: r === "Manufacturer" ? "Producer" : r, 
    data: MOCK_DATA[r][key],
    borderColor: COLORS[r],
    tension: 0,
    pointRadius: 2
  }));

  buildChart(canvas, weeks, datasets, titles[key]);
}


// --- Main React Component ---

export default function GameResults({ /* actualGameData, myRole */ }) {
  // --- MOCK SETUP (Replace with actual data fetch) ---
  const myRole = "Wholesaler"; 
  const myData = MOCK_DATA[myRole];
  // --- END MOCK SETUP ---
  
  const [activeTab, setActiveTab] = useState('summary');
  const [activeChartKey, setActiveChartKey] = useState(myRole);
  const graphContainerRef = useRef(null);

  // Effect to handle chart rendering 
  useEffect(() => {
    if (activeTab === 'graphs' && graphContainerRef.current) {
      if (PLAYER_ROLES.includes(activeChartKey)) {
        showPlayerCharts(activeChartKey, graphContainerRef);
      } else {
        showCompareCharts(activeChartKey, graphContainerRef);
      }
    }
    return () => clearCharts();
  }, [activeTab, activeChartKey]); 

  // --- Rendering Functions ---

  const renderSummary = () => (
    <div className="summary-section">
      <h3>🎉 Game Completed (Week {TOTAL_WEEKS}) 🎉</h3>
      <h2>Your Total Cost: <span style={{color: COLORS[myRole], fontWeight: 'bold'}}>${myData.totalCost.toFixed(2)}</span></h2>

      <div className="cost-comparison-grid">
        {PLAYER_ROLES.map(role => (
          <div key={role} className="cost-box">
            <h4>{role} Total Cost:</h4>
            <p style={{ color: COLORS[role], fontWeight: 'bold' }}>${MOCK_DATA[role].totalCost.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <h3 style={{marginTop: '40px'}}>Order History (Your Role: {myRole})</h3>
      <PlayerHistoryTable data={myData} />
    </div>
  );

  const renderGraphs = () => (
    <div className="graphs-section">
      <div className="chart-menu">
        <h4>Individual Player Reports:</h4>
        {PLAYER_ROLES.map(role => (
          <button 
            key={role} 
            onClick={() => setActiveChartKey(role)} 
            className={activeChartKey === role ? 'active-chart-btn' : ''}
            style={{borderColor: COLORS[role], color: COLORS[role]}}
          >
            {role}
          </button>
        ))}
        
        <h4>Comparison Views:</h4>
        {Object.entries({
          newOrderPlaced: "Orders (Bullwhip)",
          cumulativeCost: "Cumulative Cost"
        }).map(([key, label]) => (
          <button 
            key={key} 
            onClick={() => setActiveChartKey(key)} 
            className={activeChartKey === key ? 'active-chart-btn' : ''}
            style={{borderColor: COLORS.Consumer, color: COLORS.Consumer}}
          >
            {label}
          </button>
        ))}
      </div>
      <h2 style={{marginTop: '20px', textAlign: 'center'}}>{
        PLAYER_ROLES.includes(activeChartKey) 
          ? `${activeChartKey} Report` 
          : (activeChartKey === 'newOrderPlaced' ? 'Orders (Bullwhip Effect)' : 'Cumulative Cost Comparison')
      }</h2>
      <div ref={graphContainerRef} className="chart-grid-container">
        {/* Charts are rendered here */}
      </div>
    </div>
  );

  return (
    <div className="results-container">
      <h1 className="results-header">Beer Game Results & Analysis</h1>
      
      <div className="results-tabs">
        <button className={activeTab === 'summary' ? 'active-tab' : ''} onClick={() => setActiveTab('summary')}>Summary & History</button>
        <button className={activeTab === 'graphs' ? 'active-tab' : ''} onClick={() => setActiveTab('graphs')}>Graphical Analysis</button>
      </div>

      <hr />

      <div className="results-content">
        {activeTab === 'summary' && renderSummary()}
        {activeTab === 'graphs' && renderGraphs()}
      </div>
    </div>
  );
}