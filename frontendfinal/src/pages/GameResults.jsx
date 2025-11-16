import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

/* --------------------------
    Configuration 
-------------------------- */
const TOTAL_WEEKS = 25; 
const PLAYER_ROLES = ["Retailer", "Wholesaler", "Distributor", "Manufacturer"]; 
// Role colors for charts and comparison
const COLORS = {
    Consumer: "#A57E00", 
    Retailer: "#059669", 
    Wholesaler: "#2563EB", 
    Distributor: "#DC2626", 
    Manufacturer: "#6B7280" 
};

/* --------------------------
    Utility & Data Fetching (REAL API CALL)
-------------------------- */

const ACTIVE_CHARTS = [];
const clearCharts = () => {
    ACTIVE_CHARTS.forEach(ch => ch.destroy());
    ACTIVE_CHARTS.length = 0; 
};

/**
 * 🚀 IMPORTANT: ACTUAL Backend API Call Placeholder
 * This function now expects the backend endpoint (e.g., /api/game/{roomId}/history)
 * to return a JSON object structured as:
 * {
 * "RETAILER": [{GameTurn object}, ...],
 * "WHOLESALER": [{GameTurn object}, ...],
 * ...
 * }
 * * NOTE: The 'Consumer' data for the Bullwhip chart is synthesized from the Retailer's demand.
 */
async function fetchGameHistory(roomId) {
    console.log(`Fetching history for Room: ${roomId}`);

    // --- ⚠️ YOU MUST REPLACE THIS URL WITH YOUR ACTUAL API ENDPOINT ⚠️ ---
    // Example: const response = await fetch(`/api/game/${roomId}/history`);
    
    // --- TEMPORARILY REVERTING TO THE MOCK FOR COMPLETENESS, BUT THIS IS THE PROBLEM ---
    // You should delete this entire block and use a real fetch() call.
    await new Promise(resolve => setTimeout(resolve, 1200));

    const weeks = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);
    const simulation = {};
    
    let baseOrders = weeks.map((w, i) => i < 4 ? 4 : i < 10 ? 8 : 12); 
    let lastPlacedOrders = baseOrders;

    PLAYER_ROLES.forEach((role, i) => {
        // Consumer demand for Retailer, upstream order for others (2 week delay mock)
        const received = role === "Retailer" ? [...baseOrders] : [4, 4, ...lastPlacedOrders.slice(0, 23)]; 
        
        // Simple inflation mock for placed orders
        const placed = received.map(v => Math.max(0, Math.round(v * (1 + i * 0.1) + (Math.random() * 5))));
        lastPlacedOrders = placed; 

        let cumulativeCost = 0;
        let costs = [];
        let inventory = [];
        let backorder = [];

        received.forEach((orderRec, index) => {
            // Very simplified inventory/backorder logic for the mock
            const currentInventory = (index === 0 ? 50 : inventory[index - 1] || 50) + (placed[index] || 0) - orderRec;
            const inv = Math.max(0, currentInventory);
            const back = Math.max(0, -currentInventory);
            
            const weeklyCost = (inv * 0.5) + (back * 1.0) + (index * 0.1);
            cumulativeCost += weeklyCost;
            
            costs.push(weeklyCost);
            inventory.push(inv);
            backorder.push(back);
        });

        simulation[role.toUpperCase()] = { // Match backend keys: RETAILER, WHOLESALER, etc.
            weekDay: weeks, 
            playerRole: role,
            demandRecieved: received, 
            orderPlaced: placed,
            inventoryAtEndOfWeek: inventory, 
            backOrderAtEndOfWeek: backorder, 
            shipmentSent: placed.map(o => o), 
            shipmentRecieved: placed.map(o => o), 
            weeklyCost: costs, 
            totalCost: costs.map((_, i, arr) => arr.slice(0, i + 1).reduce((a, b) => a + b, 0)),
            totalCumulativeCost: cumulativeCost 
        };
    });
    
    // Synthesize 'Consumer' data for the Bullwhip chart
    simulation["CONSUMER"] = { 
        weekDay: weeks, 
        orderPlaced: simulation["RETAILER"].demandRecieved 
    };

    return simulation;
}

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
            animation: true,
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


/* --------------------------
    Table Component (Nested)
-------------------------- */

function PlayerHistoryTable({ data }) {
    // Check for correct field name 'weekDay'
    if (!data || !data.weekDay) return <p style={{textAlign: 'center'}}>No detailed history data available for this player.</p>;

    // Use correct field names matching GameTurn entity
    const tableRows = data.weekDay.map((week, index) => ({
        week,
        ordersReceived: data.demandRecieved[index], 
        ordersPlaced: data.orderPlaced[index], 
        shipmentSent: data.shipmentSent[index], 
        shipmentReceived: data.shipmentRecieved[index], 
        inventory: data.inventoryAtEndOfWeek[index], 
        backorder: data.backOrderAtEndOfWeek[index], 
        weeklyCost: data.weeklyCost[index].toFixed(2), 
        cumulativeCost: data.totalCost[index].toFixed(2) 
    })).reverse(); 

    return (
        <div className="history-table-wrapper">
            <table className="history-table">
                <thead>
                    <tr>
                        <th>Week</th>
                        <th>Orders Rec.</th>
                        <th>Orders Placed</th>
                        <th>Shipment Rec.</th>
                        <th>Shipment Sent</th>
                        <th>Inv. End</th>
                        <th>Backorder End</th>
                        <th>Weekly Cost</th>
                        <th>Cum. Cost</th>
                    </tr>
                </thead>
                <tbody>
                    {tableRows.map((row) => (
                        <tr key={row.week}>
                            <td>{row.week}</td>
                            <td>{row.ordersReceived}</td>
                            <td>{row.ordersPlaced}</td>
                            <td>{row.shipmentReceived}</td>
                            <td>{row.shipmentSent}</td>
                            <td className={row.inventory < 10 && row.inventory >= 0 ? 'low-alert' : ''}>
                                {row.inventory}
                            </td>
                            <td className={row.backorder > 0 ? 'backlog-alert' : ''}>
                                {row.backorder}
                            </td>
                            <td>${row.weeklyCost}</td>
                            <td style={{fontWeight: 'bold'}}>${row.cumulativeCost}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


// --- Main React Component ---

export default function GameResults() {
    
    // Retrieve Role (e.g., "RETAILER") and Room ID dynamically
    const storedRole = localStorage.getItem("role");
    // Ensure the key for fetching is uppercase to match the backend Map<String, ...> key
    const myRoleKey = storedRole ? storedRole.toUpperCase() : "RETAILER"; 
    const myRoleDisplay = storedRole ? storedRole.charAt(0).toUpperCase() + storedRole.slice(1).toLowerCase() : "Retailer";
    const roomId = localStorage.getItem("roomId");
    
    // --- State and Data Retrieval ---
    const [fullGameResults, setFullGameResults] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [activeTab, setActiveTab] = useState('summary');
    // Start with the user's role key
    const [activeChartKey, setActiveChartKey] = useState(myRoleDisplay); 
    const graphContainerRef = useRef(null);

    // Fetch the game history when the component mounts
    useEffect(() => {
        if (!roomId) {
            setLoading(false);
            return;
        }
        
        setLoading(true);
        
        // The fetch call now returns a Map keyed by uppercase role string
        fetchGameHistory(roomId)
            .then(data => {
                // The data object keys (e.g., 'RETAILER') must match the backend
                setFullGameResults(data); 
            })
            .catch(error => {
                console.error("Error fetching game results:", error);
            })
            .finally(() => {
                setLoading(false);
            });
            
    }, [roomId]);
    
    // Access the data using the uppercase key
    const myData = fullGameResults ? fullGameResults[myRoleKey] : null;

    // --- Chart Rendering Logic (Uses fullGameResults) ---
    
    const showPlayerCharts = (roleKey, contentRef, data) => {
        clearCharts();
        const p = data[roleKey];
        if (!p) return;

        const weeks = p.weekDay; 
        contentRef.current.innerHTML = "";

        const charts = [
            ["Orders vs Week", [
                { label: "Orders Received", data: p.demandRecieved, borderColor: COLORS.Wholesaler, backgroundColor: 'rgba(37, 99, 235, 0.1)' }, 
                { label: "Orders Placed", data: p.orderPlaced, borderColor: COLORS.Retailer, backgroundColor: 'rgba(5, 150, 105, 0.1)' } 
            ]],
            ["Inventory vs Week", [
                { label: "Inventory", data: p.inventoryAtEndOfWeek, borderColor: COLORS.Retailer, backgroundColor: 'rgba(5, 150, 105, 0.1)', fill: true } 
            ]],
            ["Backorder vs Week", [
                { label: "Backorder", data: p.backOrderAtEndOfWeek, borderColor: COLORS.Distributor, backgroundColor: 'rgba(220, 38, 38, 0.1)', fill: true } 
            ]],
            ["Weekly Cost", [
                { label: "Cost", data: p.weeklyCost, borderColor: COLORS.Consumer, backgroundColor: 'rgba(165, 126, 0, 0.1)' } 
            ]],
            ["Cumulative Cost", [
                { label: "Cumulative", data: p.totalCost, borderColor: COLORS.Manufacturer, backgroundColor: 'rgba(107, 114, 128, 0.1)' } 
            ]]
        ];

        charts.forEach(([title, ds]) => {
            const canvas = makeCard(title, contentRef);
            buildChart(canvas, weeks, ds.map(d => ({
                ...d,
                tension: 0.3,
                pointRadius: 3,
                borderWidth: 2
            })), title);
        });
    }

    const showCompareCharts = (key, contentRef, data) => {
        clearCharts();
        contentRef.current.innerHTML = "";

        const titles = {
            orderPlaced: "Orders (Bullwhip Effect)", 
            totalCost: "Cumulative Cost Comparison" 
        };
        
        const canvas = makeCard(titles[key], contentRef);
        // Use RETAILER data for weeks as a baseline
        const weeks = data["RETAILER"]?.weekDay; 
        
        // Roles for comparison charts (using uppercase keys)
        const rolesKeys = key === "orderPlaced" ? ["CONSUMER", ...PLAYER_ROLES.map(r => r.toUpperCase())] : PLAYER_ROLES.map(r => r.toUpperCase());

        const datasets = rolesKeys.map(rKey => ({
            label: rKey.charAt(0) + rKey.slice(1).toLowerCase(), // Convert key back to Display name (Retailer)
            // Access the correct array based on key
            data: data[rKey]?.[key], 
            borderColor: COLORS[rKey.charAt(0) + rKey.slice(1).toLowerCase()], // Use display name for color map
            tension: 0.3,
            pointRadius: 3,
            borderWidth: 2
        }));

        buildChart(canvas, weeks, datasets, titles[key]);
    }

    // Update charts when tab or key changes
    useEffect(() => {
        if (!fullGameResults) return;

        if (activeTab === 'graphs' && graphContainerRef.current) {
            // Determine if the key is a player role (e.g., 'Retailer') or a comparison key (e.g., 'orderPlaced')
            if (PLAYER_ROLES.includes(activeChartKey)) {
                // Pass the uppercase key for data access
                showPlayerCharts(activeChartKey.toUpperCase(), graphContainerRef, fullGameResults);
            } else {
                showCompareCharts(activeChartKey, graphContainerRef, fullGameResults);
            }
        }
        return () => clearCharts();
    }, [activeTab, activeChartKey, fullGameResults]); 
    
    // --- Render Guards ---
    if (loading) {
        return (
            <div className="results-container loading">
                <h1 className="results-header">Beer Game Results & Analysis</h1>
                <div className="loading-box">
                    <div className="loader"></div>
                    <h2>Calculating Final Results and History...</h2>
                </div>
            </div>
        );
    }
    
    if (!myData) {
        return (
            <div className="results-container">
                <h1 className="results-header">Beer Game Results & Analysis</h1>
                <div className="error-box">
                    <h2>Error: Game data not found for your role.</h2>
                    <p>Role: {myRoleDisplay}, Room: {roomId}. Please ensure the server stored data correctly and your backend API endpoint is running.</p>
                </div>
            </div>
        );
    }

    // --- Rendering Functions ---

    const renderSummary = () => (
        <div className="summary-section fade-in">
            <h3>🎉 Game Completed (Week {TOTAL_WEEKS}) 🎉</h3>
            {/* Use totalCumulativeCost for the final single cost */}
            <h2>Your Total Cost: <span style={{color: COLORS.Distributor, fontWeight: 'bold'}}>${myData.totalCumulativeCost.toFixed(2)}</span></h2> 

            <div className="cost-comparison-grid">
                {PLAYER_ROLES.map(role => {
                    const roleKey = role.toUpperCase();
                    const cost = fullGameResults[roleKey]?.totalCumulativeCost;
                    return (
                        <div key={role} className="cost-box">
                            <h4>{role} Total Cost:</h4>
                            <p style={{ color: COLORS[role], fontWeight: 'bold' }}>
                                {/* Use totalCumulativeCost for comparison */}
                                ${cost !== undefined ? cost.toFixed(2) : 'N/A'}
                            </p>
                        </div>
                    );
                })}
            </div>

            <h3 style={{marginTop: '40px'}}>Order History (Your Role: {myRoleDisplay})</h3>
            <PlayerHistoryTable data={myData} />
        </div>
    );

    const renderGraphs = () => (
        <div className="graphs-section fade-in">
            <div className="chart-menu">
                <h4>Individual Player Reports:</h4>
                {PLAYER_ROLES.map(role => {
                    const roleDisplay = role; // e.g., "Retailer"
                    return (
                        <button 
                            key={role} 
                            onClick={() => setActiveChartKey(roleDisplay)} 
                            className={activeChartKey === roleDisplay ? 'active-chart-btn' : ''}
                            style={{borderColor: COLORS[roleDisplay], color: COLORS[roleDisplay]}}
                        >
                            {roleDisplay}
                        </button>
                    );
                })}
                
                <h4>Comparison Views:</h4>
                {Object.entries({
                    orderPlaced: "Orders (Bullwhip)", 
                    totalCost: "Cumulative Cost" 
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
                    : (activeChartKey === 'orderPlaced' ? 'Orders (Bullwhip Effect)' : 'Cumulative Cost Comparison')
            }</h2>
            <div ref={graphContainerRef} className="chart-grid-container">
                {/* Charts are rendered here by useEffect */}
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

            <div className="results-content">
                {activeTab === 'summary' && renderSummary()}
                {activeTab === 'graphs' && renderGraphs()}
            </div>
        </div>
    );
}