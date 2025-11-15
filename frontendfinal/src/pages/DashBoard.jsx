import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/dashboard/Header.jsx";
import Data from "../Components/dashboard/Data.jsx";
import FlowBox from "../Components/dashboard/FlowBox.jsx";
import Card from "../Components/dashboard/Card.jsx";
import Footer from "../Components/dashboard/Footer.jsx";
import { connectSocket, disconnectSocket } from "../services/socket";

export default function Dashboard() {
  const navigate = useNavigate();
  const roomId = localStorage.getItem("roomId");
  const role = localStorage.getItem("role"); // Your role, e.g., "RETAILER"

  // ✅ FIX 1: Initialize state from localStorage
  // This loads the state saved by the previous pages (Lobby, HowToPlay)
  const [gameState, setGameState] = useState(() => {
    const cachedState = localStorage.getItem(`gameState_${roomId}`);
    if (cachedState) {
      try {
        // Parse the state from the cache
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
        
        // ✅ FIX 2: Update state AND localStorage on every message
        setGameState(newState);
        localStorage.setItem(`gameState_${roomId}`, JSON.stringify(newState));
      },
    });

    return () => disconnectSocket();
  }, [roomId, navigate]);


  // --- Extract data for the <Data /> component ---
  // This logic runs every time gameState changes
  
  const { currentWeek, players } = gameState;

  // Find your own player object to get your total cost
  const me = players.find(p => p.role === role?.toUpperCase());
  
  // Find the Retailer. Their "lastOrderReceived" is the "Customer Demand"
  const retailer = players.find(p => p.role === "RETAILER");
  
  // Get the customer demand from the Retailer's data
  // (This assumes you added 'lastOrderReceived' to your PlayerStateDTO)
  const customerDemand = retailer?.lastOrderReceived ?? 0; 

  return (
    <div>
      <Header />
      
      {/* ✅ FIX 3: Pass down the correct, derived props */}
      <Data 
        week={currentWeek} 
        cost={me?.totalCost?.toFixed(2) ?? "0.00"} // Your total cost
        demand={customerDemand}                   // The customer demand
      />
      
      <FlowBox />
      <Card role={role} roomId={roomId} gameState={gameState} />
      <Footer />
    </div>
  );
}