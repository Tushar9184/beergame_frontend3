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
    Utility & Data Fetching (Simulated)
-------------------------- */

const ACTIVE_CHARTS = [];
const clearCharts = () => {
    ACTIVE_CHARTS.forEach(ch => ch.destroy());
    ACTIVE_CHARTS.length = 0; 
};

/**
 * ⚠️ IMPORTANT: Placeholder for Backend API Call
 * This simulates fetching the FULL historical data object for the room.
 * * **CHANGES MADE HERE:** The output keys now match the backend's GameTurn entity:
 * - `weekDay` instead of `weeks`
 * - `demandRecieved` instead of `customerOrders`
 * - `inventoryAtEndOfWeek` instead of `inventory`
 * - `backOrderAtEndOfWeek` instead of `backorder`
 * - `shipmentRecieved` instead of `shipmentReceived`
 * - `weeklyCost` instead of `costs`
 * - `totalCost` instead of `cumulativeCost`
 */
async function fetchGameHistory(roomId) {
    console.log(`Simulating API call to fetch full history for Room: ${roomId}`);
    await new Promise(resolve => setTimeout(resolve, 1200));

    // --- Dynamic Mock Data Generation (SIMULATING BACKEND RESPONSE) ---
    const weeks = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);
    const simulation = {};
    
    let baseOrders = weeks.map((w, i) => i < 4 ? 4 : i < 10 ? 8 : 12); 
    let lastPlacedOrders = baseOrders;

    PLAYER_ROLES.forEach((role, i) => {
        const received = role === "Retailer" ? [...baseOrders] : [4, ...lastPlacedOrders.slice(0, 24)]; 
        
        const placed = received.map(v => Math.max(0, Math.round(v * (1 + i * 0.1) + (Math.random() * 5))));
        lastPlacedOrders = placed; 

        let cumulativeCost = 0;
        let costs = [];
        let inventory = [];
        let backorder = [];

        received.forEach((orderRec, index) => {
            const currentInventory = (index === 0 ? 50 : inventory[index - 1] || 50) + (placed[index] || 0) - orderRec;
            const inv = Math.max(0, currentInventory);
            const back = Math.max(0, -currentInventory);
            
            const weeklyCost = (inv * 0.5) + (back * 1.0) + (index * 0.1);
            cumulativeCost += weeklyCost;
            
            costs.push(weeklyCost);
            inventory.push(inv);
            backorder.push(back);
        });

        simulation[role] = {
            // ✅ UPDATED KEYS to match backend GameTurn entity field names (camelCase/snake_case)
            weekDay: weeks, // Used 'weekDay'
            playerRole: role,
            demandRecieved: received, // Used 'demandRecieved'
            orderPlaced: placed,
            inventoryAtEndOfWeek: inventory, // Used 'inventoryAtEndOfWeek'
            backOrderAtEndOfWeek: backorder, // Used 'backOrderAtEndOfWeek'
            shipmentSent: placed.map(o => o), 
            shipmentRecieved: placed.map(o => o), // Used 'shipmentRecieved'
            weeklyCost: costs, // Used 'weeklyCost'
            totalCost: costs.map((_, i, arr) => arr.slice(0, i + 1).reduce((a, b) => a + b, 0)), // Used 'totalCost'
            totalCumulativeCost: cumulativeCost // Added a different name for the final single cost
        };
    });
    
    simulation["Consumer"] = { weekDay: weeks, orderPlaced: simulation["Retailer"].demandRecieved };

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
    // FIX 3: Change 'data.weeks' check to 'data.weekDay'
    if (!data || !data.weekDay) return <p style={{textAlign: 'center'}}>No detailed history data available for this player.</p>;

    // FIX 4: Update all data access keys to match the backend/new mock data structure
    const tableRows = data.weekDay.map((week, index) => ({
        week,
        ordersReceived: data.demandRecieved[index], // Changed from customerOrders
        ordersPlaced: data.orderPlaced[index],      // Changed from newOrderPlaced
        shipmentSent: data.shipmentSent[index], 
        shipmentReceived: data.shipmentRecieved[index], // Changed from shipmentReceived
        inventory: data.inventoryAtEndOfWeek[index], // Changed from inventory
        backorder: data.backOrderAtEndOfWeek[index], // Changed from backorder
        weeklyCost: data.weeklyCost[index].toFixed(2), // Changed from costs
        cumulativeCost: data.totalCost[index].toFixed(2) // Changed from cumulativeCost
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
    
    // FIX 1: Retrieve Role and Room ID dynamically from localStorage
    const storedRole = localStorage.getItem("role");
    const myRole = storedRole ? storedRole.charAt(0).toUpperCase() + storedRole.slice(1).toLowerCase() : "Retailer";
    const roomId = localStorage.getItem("roomId");
    
    // --- State and Data Retrieval ---
    const [fullGameResults, setFullGameResults] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [activeTab, setActiveTab] = useState('summary');
    const [activeChartKey, setActiveChartKey] = useState(myRole);
    const graphContainerRef = useRef(null);

    // Fetch the game history when the component mounts
    useEffect(() => {
        if (!roomId) {
            setLoading(false);
            return;
        }
        
        setLoading(true);
        
        fetchGameHistory(roomId)
            .then(data => {
                // This data object keys (e.g., 'Retailer') must match the keys used below
                setFullGameResults(data); 
            })
            .catch(error => {
                console.error("Error fetching game results:", error);
            })
            .finally(() => {
                setLoading(false);
            });
            
    }, [roomId]);
    
    // FIX 2: Correctly filter the full results based on the dynamic myRole
    const myData = fullGameResults ? fullGameResults[myRole] : null;

    // --- Chart Rendering Logic (Uses fullGameResults) ---
    
    const showPlayerCharts = (role, contentRef, data) => {
        clearCharts();
        const p = data[role];
        if (!p) return;

        const weeks = p.weekDay; // Changed from p.weeks
        contentRef.current.innerHTML = "";

        const charts = [
            ["Orders vs Week", [
                { label: "Orders Received", data: p.demandRecieved, borderColor: COLORS.Wholesaler, backgroundColor: 'rgba(37, 99, 235, 0.1)' }, // Changed from p.customerOrders
                { label: "Orders Placed", data: p.orderPlaced, borderColor: COLORS.Retailer, backgroundColor: 'rgba(5, 150, 105, 0.1)' } // Changed from p.newOrderPlaced
            ]],
            ["Inventory vs Week", [
                { label: "Inventory", data: p.inventoryAtEndOfWeek, borderColor: COLORS.Retailer, backgroundColor: 'rgba(5, 150, 105, 0.1)', fill: true } // Changed from p.inventory
            ]],
            ["Backorder vs Week", [
                { label: "Backorder", data: p.backOrderAtEndOfWeek, borderColor: COLORS.Distributor, backgroundColor: 'rgba(220, 38, 38, 0.1)', fill: true } // Changed from p.backorder
            ]],
            ["Weekly Cost", [
                { label: "Cost", data: p.weeklyCost, borderColor: COLORS.Consumer, backgroundColor: 'rgba(165, 126, 0, 0.1)' } // Changed from p.costs
            ]],
            ["Cumulative Cost", [
                { label: "Cumulative", data: p.totalCost, borderColor: COLORS.Manufacturer, backgroundColor: 'rgba(107, 114, 128, 0.1)' } // Changed from p.cumulativeCost
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
            orderPlaced: "Orders (Bullwhip Effect)", // Changed from newOrderPlaced
            totalCost: "Cumulative Cost Comparison" // Changed from cumulativeCost
        };
        
        const canvas = makeCard(titles[key], contentRef);
        const weeks = data["Retailer"].weekDay; // Changed from weeks
        const roles = key === "orderPlaced" ? ["Consumer", ...PLAYER_ROLES] : PLAYER_ROLES; // Changed from newOrderPlaced

        const datasets = roles.map(r => ({
            label: r, 
            // Access the correct array based on key
            data: data[r]?.orderPlaced || data[r]?.totalCost, 
            borderColor: COLORS[r],
            tension: 0.3,
            pointRadius: 3,
            borderWidth: 2
        }));

        buildChart(canvas, weeks, datasets, titles[key]);
    }

    // FIX 5: Update the activeChartKey logic to use the new names
    useEffect(() => {
        if (!fullGameResults) return;

        if (activeTab === 'graphs' && graphContainerRef.current) {
            if (PLAYER_ROLES.includes(activeChartKey)) {
                showPlayerCharts(activeChartKey, graphContainerRef, fullGameResults);
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
                    <p>Role: {myRole}, Room: {roomId}. Please ensure the server stored data correctly for this role.</p>
                </div>
            </div>
        );
    }

    // --- Rendering Functions ---

    const renderSummary = () => (
        <div className="summary-section fade-in">
            <h3>🎉 Game Completed (Week {TOTAL_WEEKS}) 🎉</h3>
            {/* FIX 6: Use myData.totalCumulativeCost for the final single cost */}
            <h2>Your Total Cost: <span style={{color: COLORS.Distributor, fontWeight: 'bold'}}>${myData.totalCumulativeCost.toFixed(2)}</span></h2> 

            <div className="cost-comparison-grid">
                {PLAYER_ROLES.map(role => (
                    <div key={role} className="cost-box">
                        <h4>{role} Total Cost:</h4>
                        <p style={{ color: COLORS[role], fontWeight: 'bold' }}>
                            {/* FIX 7: Use totalCumulativeCost for comparison */}
                            ${fullGameResults[role]?.totalCumulativeCost.toFixed(2) ?? 'N/A'}
                        </p>
                    </div>
                ))}
            </div>

            <h3 style={{marginTop: '40px'}}>Order History (Your Role: {myRole})</h3>
            <PlayerHistoryTable data={myData} />
        </div>
    );

    const renderGraphs = () => (
        <div className="graphs-section fade-in">
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
                {/* FIX 8: Update keys in comparison map */}
                {Object.entries({
                    orderPlaced: "Orders (Bullwhip)", // Changed from newOrderPlaced
                    totalCost: "Cumulative Cost" // Changed from cumulativeCost
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
                    : (activeChartKey === 'orderPlaced' ? 'Orders (Bullwhip Effect)' : 'Cumulative Cost Comparison') // Changed from newOrderPlaced
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