import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/dashboard/Header.jsx";
import Data from "../Components/dashboard/Data.jsx";
import FlowBox from "../Components/dashboard/FlowBox.jsx";
import Card from "../Components/dashboard/Card.jsx";
import Footer from "../Components/dashboard/Footer.jsx";
import { connectSocket, disconnectSocket } from "../services/socket.js";

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
  });

  // ✅ Connect socket on mount
  useEffect(() => {
    if (!roomId) {
      alert("Room not found. Please create or join a lobby first!");
      navigate("/create-lobby");
      return;
    }

    connectSocket({
      roomId,
      onStateUpdate: (state) => setGameState(state),
    });
    console.log("Dashboard mounted, roomId =", roomId);

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
