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
  const { currentWeek, players, festiveWeeks, gameStatus } = gameState; 

  // --- Game End Redirection Logic ---
  // --- Game End Redirection Logic ---
// --- Game End Redirection Logic ---
  useEffect(() => {
    if (gameStatus === 'FINISHED') {
      
      // 1. Find 'me' in the players list
      const myRole = localStorage.getItem("role");
      const me = players.find((p) => p.role?.toUpperCase() === myRole?.toUpperCase());

      // 2. CRITICAL FIX: Get the ID from the PLAYER object first.
      // In Room Mode: me.gameId will be the actual Game ID (e.g., "ABC..."), 
      // while gameState.gameId might be the Room ID (e.g., "QSL...").
      const correctGameId = me?.gameId || gameState.gameId;

      if (correctGameId) {
          console.log("✅ Saving Correct Game ID:", correctGameId);
          localStorage.setItem("gameId", correctGameId);
          
          console.log("Game finished. Redirecting to results page.");
          navigate('/gameresult', { replace: true }); 
      } else {
          console.error("❌ CRITICAL: Could not find Game ID in player object or game state");
      }
    }
  }, [gameStatus, navigate, players, gameState]);


  const me = players.find((p) => p.role?.toUpperCase() === role?.toUpperCase());
  // The rest of the logic remains for the dashboard display:
  const playerCustomerDemand = me?.lastOrderReceived ?? 0;
  const myOutgoingOrder = me?.currentOrder ?? 0;
  const iAmReady = me?.isReadyForNextTurn;

  // Use a formatter for cost display
  const formattedCost = (me?.weeklyCost ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

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
          cost={formattedCost} /* Use formatted cost here */
          demand={playerCustomerDemand}
          myOrder={myOutgoingOrder}
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