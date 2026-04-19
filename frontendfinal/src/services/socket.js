// src/services/socket.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// ── Game Socket (for GameStateDTO) ─────────────────────────────────────────
let stompClient = null;
let activeRoomId = null;
let currentSubscription = null;

// ── Room Socket (for RoomStateDTO + RoomResultDTO) — completely separate ───
let roomStompClient = null;
let activeRoomSocketId = null;
let roomSubscriptions = [];

// ✅ FIX 1: Create a variable to hold the CURRENT callback function.
// This lets us change the callback without reconnecting.
let currentOnStateUpdate = (state) => {
  console.warn("WS: onStateUpdate callback is not set.", state);
};

export function connectSocket({ roomId, onStateUpdate }) {
  if (!roomId) {
    console.error("WS: Missing roomId");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("WS: Missing JWT");
    return;
  }

  const BASE_URL =
    process.env.REACT_APP_API_BASE ||
    "https://the-beer-game-backend.onrender.com";

  // ✅ FIX 2: Update the callback function *every time* connectSocket is called.
  currentOnStateUpdate = onStateUpdate;

  // Now, if we're already connected, we just return.
  // The callback is updated, and that's all we needed.
  if (stompClient && stompClient.connected && activeRoomId === roomId) {
    console.log("WS already active, callback updated for:", roomId);
    return;
  }

  // Clean old connections safely
  try {
    if (currentSubscription) {
      currentSubscription.unsubscribe();
      currentSubscription = null;
    }
    if (stompClient) {
      stompClient.deactivate();
    }
  } catch (err) {
    console.warn("WS cleanup error:", err);
  }

  stompClient = null;
  activeRoomId = roomId;

  stompClient = new Client({
    webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 1000,
    debug: () => {},

    onConnect: () => {
      console.log("🟢 WS Connected to room:", roomId);

      if (currentSubscription) {
        try {
          currentSubscription.unsubscribe();
        } catch {}
        currentSubscription = null;
      }

      currentSubscription = stompClient.subscribe(
        `/topic/game/${roomId}`,
        (msg) => {
          try {
            const body = JSON.parse(msg.body);
            console.log("📥 WS MESSAGE:", body);
            
            // ✅ FIX 3: Use the *variable* callback.
            // This will always call the *latest* function (from Dashboard).
            currentOnStateUpdate(body);

          } catch (err) {
            console.error("WS parse error:", err);
          }
        }
      );

      console.log("📡 Subscribed →", `/topic/game/${roomId}`);
    },

    onStompError: (frame) => {
      console.error("WS STOMP ERROR:", frame.headers["message"]);
      console.error("Details:", frame.body);
    },

    onWebSocketClose: () => {
      console.warn("🔴 WS closed");
    },
  });

  stompClient.activate();
}

export function disconnectSocket() {
  try {
    if (currentSubscription) {
      currentSubscription.unsubscribe();
      currentSubscription = null;
    }
    if (stompClient) {
      stompClient.deactivate();
    }
  } catch (e) {
    console.warn("WS disconnect error:", e);
  }

  stompClient = null;
  activeRoomId = null;
  currentOnStateUpdate = (state) => { // Reset callback on disconnect
     console.warn("WS: onStateUpdate callback is not set.", state);
  };
}

let roomOnStateUpdate = (state) => { console.warn("WS (Room): onStateUpdate not set", state); };
let roomOnRoomResult  = (result) => { console.log("WS (Room): unhandled room result", result); };

export function connectRoomSocket({ roomId, onStateUpdate, onRoomResult }) {
  if (!roomId) {
    console.error("WS (Room): Missing roomId");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("WS (Room): Missing JWT");
    return;
  }

  const BASE_URL =
    process.env.REACT_APP_API_BASE ||
    "https://the-beer-game-backend.onrender.com";

  // Update callbacks every call — separate from game socket
  if (onStateUpdate) roomOnStateUpdate = onStateUpdate;
  if (onRoomResult)  roomOnRoomResult  = onRoomResult;

  // Already connected to this room — just update callbacks, no reconnect needed
  if (roomStompClient && roomStompClient.connected && activeRoomSocketId === roomId) {
    console.log("WS (Room) already active, callbacks updated for:", roomId);
    return;
  }

  // Clean up old room socket
  try {
    roomSubscriptions.forEach((s) => { try { s.unsubscribe(); } catch {} });
    roomSubscriptions = [];
    if (roomStompClient) roomStompClient.deactivate();
  } catch (err) {
    console.warn("WS (Room) cleanup error:", err);
  }

  roomStompClient = null;
  activeRoomSocketId = roomId;

  roomStompClient = new Client({
    webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 1000,
    debug: () => {},

    onConnect: () => {
      console.log("🟢 WS (Room) Connected:", roomId);

      // Clear any stale subs from previous connection attempt
      roomSubscriptions.forEach((s) => { try { s.unsubscribe(); } catch {} });
      roomSubscriptions = [];

      const subState = roomStompClient.subscribe(
        `/topic/room/${roomId}`,
        (msg) => {
          try {
            const body = JSON.parse(msg.body);
            console.log("📥 WS ROOM STATE:", body);
            roomOnStateUpdate(body);
          } catch (err) {
            console.error("WS (Room) parse error:", err);
          }
        }
      );

      const subResult = roomStompClient.subscribe(
        `/topic/room/${roomId}/result`,
        (msg) => {
          try {
            const body = JSON.parse(msg.body);
            console.log("📥 WS ROOM RESULT:", body);
            roomOnRoomResult(body);
          } catch (err) {
            console.error("WS (Room) result parse error:", err);
          }
        }
      );

      roomSubscriptions = [subState, subResult];
      console.log("📡 Subscribed →", `/topic/room/${roomId}`);
      console.log("📡 Subscribed →", `/topic/room/${roomId}/result`);
    },

    onStompError: (frame) => {
      console.error("WS (Room) STOMP ERROR:", frame.headers["message"]);
    },

    onWebSocketClose: () => {
      console.warn("🔴 WS (Room) closed");
    },
  });

  roomStompClient.activate();
}

export function disconnectRoomSocket() {
  try {
    roomSubscriptions.forEach((s) => { try { s.unsubscribe(); } catch {} });
    roomSubscriptions = [];
    if (roomStompClient) roomStompClient.deactivate();
  } catch (e) {
    console.warn("WS (Room) disconnect error:", e);
  }
  roomStompClient = null;
  activeRoomSocketId = null;
  roomOnStateUpdate = (state) => { console.warn("WS (Room): onStateUpdate not set", state); };
  roomOnRoomResult  = (result) => { console.log("WS (Room): unhandled room result", result); };
}

/** Returns the first connected STOMP client or null. */
function getConnectedClient() {
  if (stompClient && stompClient.connected) return stompClient;
  if (roomStompClient && roomStompClient.connected) return roomStompClient;
  return null;
}

/**
 * Publishes an order to the given destination.
 * Retries up to 5 times with 500ms delay if no client is connected yet.
 * This fixes the race condition where the HTTP game-state seed loads instantly
 * but the WebSocket handshake is still in progress.
 */
function publishWithRetry(destination, body, attempt = 0) {
  const client = getConnectedClient();
  if (client) {
    client.publish({
      destination,
      body: JSON.stringify(body),
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    console.log("📤 Published to", destination, body);
    return;
  }

  if (attempt >= 5) {
    console.error("❌ WS: Could not send after 5 retries —", destination);
    return;
  }

  console.warn(`⏳ WS not connected yet, retrying (${attempt + 1}/5)...`);
  setTimeout(() => publishWithRetry(destination, body, attempt + 1), 500);
}

export function sendOrderWS({ roomId, quantity }) {
  publishWithRetry(`/app/game/${roomId}/placeOrder`, { orderAmount: Number(quantity) });
}

export function sendRoomOrderWS({ roomId, quantity }) {
  publishWithRetry(`/app/room/${roomId}/placeOrder`, { orderAmount: Number(quantity) });
}