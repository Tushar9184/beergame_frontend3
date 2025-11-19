import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { connectSocket, disconnectSocket, sendOrderWS } from "../../services/socket";

export default function HowToPlay() {
    const navigate = useNavigate();

    const roomId = localStorage.getItem("roomId");
    const myRole = localStorage.getItem("role")?.toUpperCase();

    // Initialize state from localStorage
    const [gameState, setGameState] = useState(() => {
        const cachedState = localStorage.getItem(`gameState_${roomId}`);
        if (cachedState) {
            try {
                return JSON.parse(cachedState);
            } catch (e) {
                console.error("Failed to parse cached state", e);
            }
        }
        return { players: [], gameStatus: "LOBBY", currentWeek: 0 };
    });

    const [orderAmount, setOrderAmount] = useState(4); 
    const [orderPlaced, setOrderPlaced] = useState(false);

    // Main connection effect
    useEffect(() => {
        if (!roomId) {
            navigate("/joinlobby");
            return;
        }

        const onStateUpdate = (state) => {
            console.log("WS → HowToPlay Update", state);
            setGameState(state);
            localStorage.setItem(`gameState_${roomId}`, JSON.stringify(state));
        };

        // Re-use existing connection
        connectSocket({ roomId, onStateUpdate });

        return () => disconnectSocket();
    }, [roomId, navigate]);

    // Effect to react to game state changes
    useEffect(() => {
        if (!gameState) return;

        if (gameState.gameStatus === "IN_PROGRESS") {
            
            // ✅ CRITICAL FIX: Navigate to dashboard starting from Week 2
            if (gameState.currentWeek > 1) {
                navigate(`/dashboard/${roomId}`);
                return;
            }
            
            // Update order amount suggestion for Week 1
            if (!orderPlaced) {
                const me = gameState.players?.find((p) => p.role === myRole);
                setOrderAmount(me?.currentOrder ?? 4);
            }
        }
    }, [gameState, myRole, orderPlaced, navigate, roomId]);

    // --- Handlers ---
    const handlePlaceOrder = (e) => {
        e.preventDefault(); 
        if (!gameState) return;

        const qty = Number(orderAmount); 
        sendOrderWS({ roomId, quantity: qty });
        // Set orderPlaced to true to show waiting screen for Week 1
        setOrderPlaced(true); 
    };

    /* ------------------------------------------------------------
        UI Logic
    ------------------------------------------------------------ */

    const gameStatus = gameState?.gameStatus;
    const currentWeek = gameState?.currentWeek;
    const me = gameState?.players?.find((p) => p.role === myRole);
    const iAmReady = me?.isReadyForNextTurn; 

    // 1. Initial Loading/Lobby State
    if (gameStatus !== "IN_PROGRESS" || currentWeek < 1) {
        return (
            <div className="waiting-box">
                <div className="loader"></div>
                <p className="waiting-text">
                    ⏳ Game is starting...
                </p>
            </div>
        );
    }
    
    // 2. Week 1 Order Submission
    if (currentWeek === 1) {
        // Show waiting screen after order is submitted
        if (iAmReady || orderPlaced) {
            return (
                <div className="waiting-box">
                    <div className="loader"></div>
                    <h2>
                        Waiting for other players to submit Week 1 order…
                    </h2>
                </div>
            );
        }

        // Show the Week 1 Order Form
        return (
            <div className="how-container">
                <h2 className="how-title">Week 1 — Place Your First Order</h2>
                
                <form className="place-order-form" onSubmit={handlePlaceOrder}>
                    <div className="input-group">
                        <label>Your Order:</label>
                        <input 
                            type="number"
                            min="0"
                            value={orderAmount}
                            onChange={(e) => setOrderAmount(e.target.value)}
                            className="order-input"
                            autoFocus
                        />
                    </div>
                    <button className="place-order-btn" type="submit">
                        ✔ Place Order
                    </button>
                </form>
                
                <ul className="how-list">
                    <li><span>🎯</span> Goal: Minimize your total supply chain cost</li>
                    <li><span>📦</span> Inventory costs $0.75 per unit per week</li>
                    <li><span>⚠️</span> Backlog costs $1.50 per unit per week</li>
                    <li><span>🚚</span> Orders & shipments take 2 weeks to arrive</li>
                </ul>
            </div>
        );
    }

    // 3. Week 2+ (Acts as Static Footer)
    // The dashboard component will take over the main order form logic (Card.jsx)
    // and this component will now serve as a static footer for all remaining weeks.
    return (
        <div className="how-container">
            <h2 className="how-title">The Rules of the Beer Distribution Game</h2>

            <ul className="how-list">
                <li><span>🎯</span> Goal: Minimize your total supply chain cost</li>
                <li><span>📦</span> Inventory Cost: Costs $0.75 per unit per week</li>
                <li><span>⚠️</span> Backlog Cost: Costs $1.50 per unit per week (Penalty for unfulfilled demand)</li>
                <li><span>🚚</span> Lead Time: Orders & shipments take 2 weeks to arrive</li>
                <li><span>🤝</span> Information: You only see the incoming order from your immediate downstream customer.</li>
            </ul>

            <p className="flow-subtext" style={{ marginTop: '2rem' }}>
                Submit your weekly order using the card above.
            </p>
        </div>
    );
}