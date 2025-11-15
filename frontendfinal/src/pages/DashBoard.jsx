import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/dashboard/Header.jsx";
import Data from "../Components/dashboard/Data.jsx";
import FlowBox from "../Components/dashboard/FlowBox.jsx";
import Card from "../Components/dashboard/Card.jsx";
import HowToPlay from "../Components/dashboard/Footer.jsx";
import { connectSocket, disconnectSocket } from "../services/socket";

export default function Dashboard() {
  const navigate = useNavigate();
  const roomId = localStorage.getItem("roomId");
  const role = localStorage.getItem("role");

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
      festiveWeeks: [],
      gameStatus: 'LOBBY', // Initialize gameStatus
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
  // 🚩 FIX: Destructure 'gameStatus' here to make it available for the useEffect below
  const { currentWeek, players, festiveWeeks, gameStatus } = gameState; 

  // --- Game End Redirection Logic ---
  useEffect(() => {
    if (gameStatus === 'FINISHED') {
      console.log("Game finished. Redirecting to results page.");
      // The replace: true option prevents the user from navigating back to the dashboard
      navigate('/gameresult', { replace: true }); 
    }
  }, [gameStatus, navigate]); // Depend on gameStatus and navigate

  const me = players.find((p) => p.role?.toUpperCase() === role?.toUpperCase());
  // The rest of the logic remains for the dashboard display:
  const playerCustomerDemand = me?.lastOrderReceived ?? 0;
  const myOutgoingOrder = me?.currentOrder ?? 0;
  const iAmReady = me?.isReadyForNextTurn;

  // Prevent rendering dashboard content if the game is already finished
  if (gameStatus === 'FINISHED') {
      return (
          <div className="dashboard-container">
              <Header />
              <div className="waiting-box">
                  <div className="loader"></div>
                  <h2>Game Finished. Loading Results...</h2>
              </div>
          </div>
      );
  }

  return (
    <div className="dashboard-container">
      <Header />

      <div className="fade-in fade-in-delay-1">
        <Data
          week={currentWeek}
          cost={me?.totalCost?.toFixed(2) ?? "0.00"}
          demand={playerCustomerDemand}
          myOrder={myOutgoingOrder}
          festiveWeeks={festiveWeeks || []}
        />
      </div>
      
      {/* ... (rest of the dashboard return block) ... */}
      <div className="fade-in fade-in-delay-2">
        <FlowBox />
      </div>

      <div className="fade-in fade-in-delay-3">
        {iAmReady ? (
          <div className="waiting-box">
            <div className="loader"></div>
            <h2>Waiting for other players...</h2>
            {/* Live Player Status List */}
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
    </div>
  );
}