import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/dashboard/Header.jsx";
import Data from "../Components/dashboard/Data.jsx";
import FlowBox from "../Components/dashboard/FlowBox.jsx";
import Card from "../Components/dashboard/Card.jsx";
import Footer from "../Components/dashboard/Footer.jsx";
import { connectSocket, disconnectSocket } from "../services/socket";

// Style for the "waiting" box
// You can move this to your main CSS file if you prefer
const waitingBoxStyle = {
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "2rem",
  textAlign: "center",
  margin: "2rem auto",
  maxWidth: "600px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const roomId = localStorage.getItem("roomId");
  const role = localStorage.getItem("role"); // Your role, e.g., "RETAILER"

  const [gameState, setGameState] = useState(() => {
    const cachedState = localStorage.getItem(`gameState_${roomId}`);
    if (cachedState) {
      try {
        return JSON.parse(cachedState);
      } catch (e) {
        console.error("Failed to parse cached state", e);
      }
    }
    // Default state if nothing is in the cache
    return {
      currentWeek: 1,
      players: [],
    };
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("❌ No token, redirecting to login...");
      navigate("/login");
      return;
    }

    if (!roomId) {
      alert("Room not found. Please create or join a lobby first!");
      navigate("/createlobby");
      return;
    }

    console.log("Dashboard connecting socket:", roomId);
    connectSocket({
      roomId,
      onStateUpdate: (newState) => {
        console.log("Dashboard received state:", newState);
        // Update state AND localStorage on every message
        setGameState(newState);
        localStorage.setItem(`gameState_${roomId}`, JSON.stringify(newState));
      },
    });

    return () => disconnectSocket();
  }, [roomId, navigate]);

  // --- Extract data ---
  const { currentWeek, players } = gameState;

  // Find your own player object
  const me = players.find((p) => p.role === role?.toUpperCase());

  // Find the Retailer to get Customer Demand
  const retailer = players.find((p) => p.role === "RETAILER");

  // Get the customer demand from the Retailer's data
  const customerDemand = retailer?.lastOrderReceived ?? 0;

  // Get the order *you* just received
  const myOrderReceived = me?.lastOrderReceived ?? 0;

  // Get your "ready" status
  const iAmReady = me?.isReadyForNextTurn;

  return (
    <div>
      <Header />

      <Data
        week={currentWeek}
        cost={me?.totalCost?.toFixed(2) ?? "0.00"} // Your total cost
        demand={customerDemand} // The customer demand
        myOrder={myOrderReceived} // The order you just received
      />

      <FlowBox />

      {/* --- This is the new logic --- */}
      {/* If you are ready, show the "Waiting..." box.
          If you are NOT ready, show the <Card> to place an order.
      */}
      {iAmReady ? (
        <div style={waitingBoxStyle}>
          {/* You can add your <div className="loader"></div> here too */}
          <h2>Waiting for other players to submit their orders...</h2>
          <p>The game will advance to the next week automatically.</p>
        </div>
      ) : (
        <Card role={role} roomId={roomId} gameState={gameState} />
      )}

      <Footer />
    </div>
  );
}