import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/dashboard/Header.jsx";
import Data from "../Components/dashboard/Data.jsx";
import FlowBox from "../Components/dashboard/FlowBox.jsx";
import Card from "../Components/dashboard/Card.jsx";
import HowToPlay from "../Components/dashboard/Footer.jsx";
import { connectSocket, disconnectSocket } from "../services/socket";
import { getRoomState, getGameState } from "../services/user-service";
import "./DashBoard.css";

function TurnTimer({ currentWeek, isReady }) {
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    setTimeLeft(60);
  }, [currentWeek]);

  useEffect(() => {
    if (timeLeft <= 0 || isReady) return;
    const timerObj = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timerObj);
  }, [timeLeft, isReady]);

  return (
    <div style={{
      textAlign: 'center', margin: '10px auto', padding: '10px',
      border: '1px solid #ebb542', borderRadius: '5px',
      background: 'rgba(0,0,0,0.5)', maxWidth: '400px'
    }}>
      <h3 style={{ margin: 0, color: timeLeft > 10 ? '#00e5ff' : '#ff4444' }}>
        {isReady ? "Order Placed. Waiting for next turn..." : `Turn Time Left: ${timeLeft}s`}
      </h3>
      {timeLeft === 0 && !isReady && (
        <p style={{ color: '#ff4444', margin: '5px 0 0 0', fontSize: '0.9rem' }}>
          AFK Timeout! Bot is taking your turn...
        </p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const roomId   = localStorage.getItem("roomId");
  const role     = localStorage.getItem("role");
  const isRoomMode = !!localStorage.getItem("teamName");

  const [gameState, setGameState] = useState({
    currentWeek: 1, players: [], festiveWeeks: [], gameStatus: 'LOBBY'
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    if (!roomId) { navigate("/createlobby"); return; }

    document.body.style.backgroundColor = "#070b11";
    let roomSocketCleanup = () => {};

    /**
     * Wire up the Game WebSocket AND immediately do an HTTP GET to seed
     * the initial state. This solves the race condition where the backend's
     * afterCommit() broadcast fires 1500ms before the player's browser has
     * navigated to this page and subscribed to the WebSocket topic.
     */
    const setupGameSocket = (gameId) => {
      // In Room Mode socketId = the individual game's ID
      // In Single Mode socketId = roomId (they are the same thing)
      const socketId = (isRoomMode && gameId) ? gameId : roomId;

      console.log("Dashboard → connecting Game socket:", socketId);

      // ── 1. HTTP seed: fetch current state immediately so we never miss it ──
      getGameState(socketId).then((data) => {
        if (data) {
          console.log("📋 HTTP seed game state received:", data);
          setGameState(data);
          localStorage.setItem(`gameState_${socketId}`, JSON.stringify(data));
        }
      });

      // ── 2. WebSocket: receive all future state pushes ──────────────────────
      connectSocket({
        roomId: socketId,
        onStateUpdate: (newState) => {
          console.log("📥 WS game state received:", newState);
          setGameState(newState);
          localStorage.setItem(`gameState_${socketId}`, JSON.stringify(newState));
        },
      });

      // ── 3. Room result socket (Room Mode only) ─────────────────────────────
      if (isRoomMode) {
        import("../services/socket").then(({ connectRoomSocket, disconnectRoomSocket }) => {
          connectRoomSocket({
            roomId,
            onStateUpdate: () => {},
            onRoomResult: (result) => {
              console.log("🏆 Room result received. Redirecting...", result);
              localStorage.setItem("roomResult", JSON.stringify(result));
              navigate("/roomresult", { replace: true });
            }
          });
          roomSocketCleanup = disconnectRoomSocket;
        });
      }
    };

    if (isRoomMode) {
      const savedGameId = localStorage.getItem("gameId");
      if (savedGameId) {
        // Fast path: gameId already saved by RoomWaiting
        setupGameSocket(savedGameId);
      } else {
        // Slow path: page refresh — re-fetch gameId from RoomStateDTO API
        console.log("Room Mode: gameId missing — fetching from /api/room API...");
        const username = localStorage.getItem("username");
        getRoomState(roomId).then((roomData) => {
          if (roomData?.teams) {
            for (const t of roomData.teams) {
              const members = t.members || t.players || [];
              const me = members.find(p => p.username === username || p.userName === username);
              if (me?.gameId) {
                console.log("✅ gameId retrieved from API:", me.gameId);
                localStorage.setItem("gameId", me.gameId);
                setupGameSocket(me.gameId);
                return;
              }
            }
          }
          console.warn("⚠️ gameId not found in RoomStateDTO — game may not have started yet");
          setupGameSocket(null); // fallback: connect with roomId
        }).catch(() => setupGameSocket(null));
      }
    } else {
      setupGameSocket(null);
    }

    return () => {
      disconnectSocket();
      roomSocketCleanup();
      document.body.style.backgroundColor = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, navigate]);

  // ── Safe destructure ──────────────────────────────────────────────────────
  const players     = gameState.players || [];
  const { currentWeek, festiveWeeks, gameStatus } = gameState;

  // ── Single-player game over redirect ─────────────────────────────────────
  useEffect(() => {
    if (gameStatus === 'FINISHED' && !isRoomMode) {
      const myRole = localStorage.getItem("role");
      const me = players.find(p => p.role?.toUpperCase() === myRole?.toUpperCase());
      const correctGameId = me?.gameId || gameState.gameId;
      if (correctGameId) {
        localStorage.setItem("gameId", correctGameId);
        navigate('/gameresult', { replace: true });
      } else {
        console.error("❌ CRITICAL: gameId not found in player state");
      }
    }
  }, [gameStatus, navigate, players, gameState, isRoomMode]);

  // ── My player object ──────────────────────────────────────────────────────
  const me = players.find(p => p.role?.toUpperCase() === role?.toUpperCase());
  const playerCustomerDemand = me?.lastOrderReceived ?? 0;
  const myOutgoingOrder      = me?.currentOrder ?? 0;
  // Java records serialize boolean 'isReadyForNextTurn' as 'readyForNextTurn'
  const iAmReady = me?.readyForNextTurn ?? me?.isReadyForNextTurn ?? false;
  const formattedCost = (me?.weeklyCost ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  });

  // ── Room Mode: one team finished, waiting for others ──────────────────────
  if (gameStatus === 'FINISHED' && isRoomMode) {
    return (
      <div className="dashboard-container">
        <Header />
        <div className="waiting-box">
          <div className="loader"></div>
          <h2>🎉 Your team finished! Waiting for other teams...</h2>
          <p style={{ color: '#94a3b8' }}>Leaderboard will appear when all teams complete.</p>
        </div>
      </div>
    );
  }

  // ── Single Mode: finished loading results ─────────────────────────────────
  if (gameStatus === 'FINISHED' && !isRoomMode) {
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
          cost={formattedCost}
          demand={playerCustomerDemand}
          myOrder={myOutgoingOrder}
          festiveWeeks={festiveWeeks || []}
        />
      </div>

      <div className="fade-in fade-in-delay-1">
        <TurnTimer currentWeek={currentWeek} isReady={iAmReady} />
      </div>

      <div className="fade-in fade-in-delay-2">
        <FlowBox />
      </div>

      <div className="fade-in fade-in-delay-3">
        {iAmReady ? (
          <div className="waiting-box">
            <div className="loader"></div>
            <h2>Waiting for other players...</h2>
            <ul className="player-status-list">
              {players.map((player) => (
                <li
                  key={String(player.id ?? player.role ?? player.userName)}
                  className={(player.readyForNextTurn ?? player.isReadyForNextTurn) ? "ready" : ""}
                >
                  <span>{(player.readyForNextTurn ?? player.isReadyForNextTurn) ? "✅" : "⏳"}</span>
                  {player.userName}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <Card role={role} roomId={roomId} gameState={gameState} />
        )}
      </div>

      <HowToPlay embedded={true} />
    </div>
  );
}