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
  const role = localStorage.getItem("role");

  const [gameState, setGameState] = useState({
    week: 0,
    demand: 0,
    totalCost: 0,
    inventory: {},
    backlog: {},
    orderBook: {},
    costs: {},
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
      onStateUpdate: (state) => {
        console.log("Dashboard received state:", state);
        setGameState((prev) => ({ ...prev, ...state }));
      },
    });

    return () => disconnectSocket();
  }, [roomId, navigate]);

  return (
    <div>
      <Header />
      <Data
        week={gameState.week}
        cost={gameState.totalCost}
        demand={gameState.demand}
      />
      <FlowBox />
      <Card role={role} roomId={roomId} gameState={gameState} />
      <Footer />
    </div>
  );
}
