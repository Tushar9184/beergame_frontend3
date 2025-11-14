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
    players: [],
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
        // Normalize incoming state keys to what the frontend expects
        console.log("Dashboard received state:", state);

        setGameState((prev) => {
          const normalized = {
            week: state.currentWeek ?? state.week ?? prev.week,
            demand: state.demand ?? prev.demand,
            totalCost:
              state.totalCost ??
              state.total_cost ??
              state.gameTotalCost ??
              prev.totalCost,
            players: state.players ?? prev.players,
            inventory: state.inventory ?? prev.inventory,
            backlog: state.backlog ?? prev.backlog,
            orderBook: state.orderBook ?? state.orders ?? prev.orderBook,
            costs: state.costs ?? prev.costs,
          };
          return { ...prev, ...normalized };
        });
      },
    });

    return () => disconnectSocket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, navigate]);

  return (
    <div>
      <Header />
      <Data week={gameState.week} cost={gameState.totalCost} demand={gameState.demand} />
      <FlowBox />
      <Card role={role} roomId={roomId} gameState={gameState} />
      <Footer />
    </div>
  );
}
