import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";

// -------------------------- CONFIG --------------------------
const TOTAL_WEEKS = 25;
const PLAYER_ROLES = ["Retailer", "Wholesaler", "Distributor", "Manufacturer"];

const COLORS = {
  Consumer: "#A57E00",
  Retailer: "#059669",
  Wholesaler: "#2563EB",
  Distributor: "#DC2626",
  Manufacturer: "#6B7280",
};

const ACTIVE_CHARTS = [];
const clearCharts = () => {
  ACTIVE_CHARTS.forEach((ch) => ch.destroy());
  ACTIVE_CHARTS.length = 0;
};

// -------------------------- FETCH GAME HISTORY --------------------------
async function fetchGameHistory(gameId) {
  console.log(`Fetching ACTUAL history for Game: ${gameId}`);

  if (!gameId) return {};

  const BASE_URL =
    process.env.REACT_APP_API_BASE ||
    "https://the-beer-game-backend.onrender.com";

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${BASE_URL}/api/game/${gameId}/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`HTTP error ${response.status}`);

    const historyMap = await response.json();
    const processedData = {};
    let retailerDemand = [];

    for (const roleKey of Object.keys(historyMap)) {
      const turns = historyMap[roleKey];
      turns.sort((a, b) => a.weekDay - b.weekDay);

      const dataArrays = {
        weekDay: turns.map((t) => t.weekDay),
        playerRole: roleKey.charAt(0) + roleKey.slice(1).toLowerCase(),
        demandRecieved: turns.map((t) => t.demandRecieved),
        orderPlaced: turns.map((t) => t.orderPlaced),
        inventoryAtEndOfWeek: turns.map((t) => t.inventoryAtEndOfWeek),
        backOrderAtEndOfWeek: turns.map((t) => t.backOrderAtEndOfWeek),
        shipmentSent: turns.map((t) => t.shipmentSent),
        shipmentRecieved: turns.map((t) => t.shipmentRecieved),
        weeklyCost: turns.map((t) => t.weeklyCost),
        totalCost: turns.map((t) => t.totalCost),
        totalCumulativeCost:
          turns.length > 0 ? turns[turns.length - 1].totalCost : 0,
      };

      processedData[roleKey] = dataArrays;

      if (roleKey === "RETAILER") retailerDemand = dataArrays.demandRecieved;
    }

    if (processedData["RETAILER"]) {
      processedData["CONSUMER"] = {
        weekDay: processedData["RETAILER"].weekDay,
        orderPlaced: retailerDemand,
      };
    }

    return processedData;
  } catch (err) {
    console.error("Error fetching history:", err);
    return {};
  }
}

// -------------------------- MAIN COMPONENT --------------------------
export default function GameResults() {
  const storedRole = localStorage.getItem("role");

  // 🔥 FIXED — USE GAME ID, NOT ROOM ID
  const gameId = localStorage.getItem("gameId");

  const myRoleKey = storedRole ? storedRole.toUpperCase() : "RETAILER";
  const myRoleDisplay =
    storedRole.charAt(0).toUpperCase() + storedRole.slice(1).toLowerCase();

  const [fullGameResults, setFullGameResults] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("summary");
  const [activeChartKey, setActiveChartKey] = useState(myRoleDisplay);

  const graphContainerRef = useRef(null);

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchGameHistory(gameId)
      .then((data) => setFullGameResults(data))
      .finally(() => setLoading(false));
  }, [gameId]);

  const myData = fullGameResults ? fullGameResults[myRoleKey] : null;

  // -------------------------- CHARTS --------------------------
  const makeCard = (title, containerRef) => {
    const card = document.createElement("div");
    card.className = "card result-chart-card";

    const label = document.createElement("h3");
    label.textContent = title;
    card.appendChild(label);

    const canvas = document.createElement("canvas");
    card.appendChild(canvas);

    containerRef.current.appendChild(card);
    return canvas;
  };

  const buildChart = (canvas, labels, datasets, title) => {
    const chart = new Chart(canvas.getContext("2d"), {
      type: "line",
      data: { labels, datasets },
      options: {
        animation: true,
        responsive: true,
        maintainAspectRatio: false,
      },
    });
    ACTIVE_CHARTS.push(chart);
  };

  useEffect(() => {
    if (!fullGameResults) return;

    if (activeTab === "graphs" && graphContainerRef.current) {
      clearCharts();

      if (PLAYER_ROLES.includes(activeChartKey)) {
        const roleKey = activeChartKey.toUpperCase();
        const p = fullGameResults[roleKey];
        if (!p) return;

        const charts = [
          ["Orders vs Week", [
            { label: "Orders Received", data: p.demandRecieved },
            { label: "Orders Placed", data: p.orderPlaced }
          ]],
        ];

        charts.forEach(([title, ds]) => {
          const canvas = makeCard(title, graphContainerRef);
          buildChart(canvas, p.weekDay, ds, title);
        });

      } else {
        const weeks = fullGameResults["RETAILER"]?.weekDay;
        const dataset = PLAYER_ROLES.map((role) => {
          const key = role.toUpperCase();
          return {
            label: role,
            data: fullGameResults[key]?.[activeChartKey],
          };
        });

        const canvas = makeCard("Comparison Chart", graphContainerRef);
        buildChart(canvas, weeks, dataset, "Comparison");
      }
    }

    return () => clearCharts();
  }, [activeTab, activeChartKey, fullGameResults]);

  if (loading)
    return <h1>Loading results...</h1>;

  if (!myData)
    return (
      <div className="results-container">
        <h1>Beer Game Results & Analysis</h1>
        <div className="error-box">
          <h2>Error: Game data not found for your role.</h2>
          <p>
            Role: {myRoleDisplay}, Game: {gameId}.<br />
            Please ensure the backend returned history correctly.
          </p>
        </div>
      </div>
    );

  return (
    <div className="results-container">
      <h1 className="results-header">Beer Game Results & Analysis</h1>

      <div className="results-tabs">
        <button
          className={activeTab === "summary" ? "active-tab" : ""}
          onClick={() => setActiveTab("summary")}
        >
          Summary & History
        </button>

        <button
          className={activeTab === "graphs" ? "active-tab" : ""}
          onClick={() => setActiveTab("graphs")}
        >
          Graphical Analysis
        </button>
      </div>

      {activeTab === "summary" && (
        <div className="summary-section">
          <h3>🎉 Game Completed (Week {TOTAL_WEEKS}) 🎉</h3>

          <h2>
            Your Total Cost:{" "}
            <span style={{ color: COLORS.Distributor }}>
              ${myData.totalCumulativeCost.toFixed(2)}
            </span>
          </h2>

          <table className="history-table">
            <thead>
              <tr>
                <th>Week</th>
                <th>Orders Rec.</th>
                <th>Orders Placed</th>
                <th>Shipment Rec.</th>
                <th>Shipment Sent</th>
                <th>Inv.</th>
                <th>Backorder</th>
                <th>Weekly Cost</th>
                <th>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {myData.weekDay.map((w, i) => (
                <tr key={i}>
                  <td>{w}</td>
                  <td>{myData.demandRecieved[i]}</td>
                  <td>{myData.orderPlaced[i]}</td>
                  <td>{myData.shipmentRecieved[i]}</td>
                  <td>{myData.shipmentSent[i]}</td>
                  <td>{myData.inventoryAtEndOfWeek[i]}</td>
                  <td>{myData.backOrderAtEndOfWeek[i]}</td>
                  <td>{myData.weeklyCost[i].toFixed(2)}</td>
                  <td>{myData.totalCost[i].toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "graphs" && (
        <div className="graphs-section">
          <div className="chart-menu">
            {PLAYER_ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setActiveChartKey(r)}
                className={activeChartKey === r ? "active-chart-btn" : ""}
              >
                {r}
              </button>
            ))}

            <button onClick={() => setActiveChartKey("orderPlaced")}>
              Orders (Bullwhip)
            </button>

            <button onClick={() => setActiveChartKey("totalCost")}>
              Total Cost
            </button>
          </div>

          <div ref={graphContainerRef} className="chart-grid-container"></div>
        </div>
      )}
    </div>
  );
}
