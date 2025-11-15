import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./components/dashboard/Header.jsx";
import Data from "./components/dashboard/Data.jsx";
import FlowBox from "./components/dashboard/FlowBox.jsx";
import Card from "./components/dashboard/Card.jsx";
import HowToPlay from "./components/dashboard/Footer.jsx";
import { connectSocket, disconnectSocket } from "../services/socket";

// We removed the inline 'waitingBoxStyle'
// It is now in your CSS file as ".waiting-box"

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
    return {
      currentWeek: 1,
      players: [],
      festiveWeeks: [], // ✅ Default festive weeks
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
        setGameState(newState);
        localStorage.setItem(`gameState_${roomId}`, JSON.stringify(newState));
      },
    });

    return () => disconnectSocket();
  }, [roomId, navigate]);

  // --- Extract data ---
  // ✅ Get festiveWeeks from state
  const { currentWeek, players, festiveWeeks } = gameState;

  const me = players.find((p) => p.role?.toUpperCase() === role?.toUpperCase());
  const retailer = players.find((p) => p.role?.toUpperCase() === "RETAILER");

  const customerDemand = retailer?.lastOrderReceived ?? 0;
  const myOrderReceived = me?.lastOrderReceived ?? 0;
  const iAmReady = me?.isReadyForNextTurn;

  return (
    <div className="dashboard-container">
      <Header />

      <div className="fade-in fade-in-delay-1">
        <Data
          week={currentWeek}
          cost={me?.totalCost?.toFixed(2) ?? "0.00"}
          demand={customerDemand}
          myOrder={myOrderReceived}
          // ✅ Pass festiveWeeks down as a prop
          festiveWeeks={festiveWeeks || []}
        />
      </div>

      <div className="fade-in fade-in-delay-2">
        <FlowBox />
      </div>

      <div className="fade-in fade-in-delay-3">
        {iAmReady ? (
          <div className="waiting-box">
            <div className="loader"></div>
            <h2>Waiting for other players...</h2>
            {/* ✅ Live Player Status List */}
            <ul className="player-status-list">
              {(players || []).map((player) => (
                <li
                  key={player.id}
                  className={player.isReadyForNextTurn ? "ready" : ""}
                >
                  <span>{player.isReadyForNextTurn ? "✅" : "⏳"}</span>
                  {player.userName}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <Card role={role} roomId={roomId} gameState={gameState} />
        )}
      </div>
        <HowToPlay/>
      {/* <Footer /> */}
    </div>
  );
}