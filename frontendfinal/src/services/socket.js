// src/services/socket.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;
let activeRoomId = null;
let currentSubscription = null;

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

  // Prevent reconnecting to the same room
  if (stompClient && stompClient.connected && activeRoomId === roomId) {
    console.log("WS already active for:", roomId);
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

      // Ensure no previous subscription
      if (currentSubscription) {
        try {
          currentSubscription.unsubscribe();
        } catch {}
        currentSubscription = null;
      }

      // Subscribe to updated topic
      currentSubscription = stompClient.subscribe(
        `/topic/game/${roomId}`,
        (msg) => {
          try {
            const body = JSON.parse(msg.body);
            console.log("📥 WS MESSAGE:", body);
            onStateUpdate(body);
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
}

export function sendOrderWS({ roomId, quantity }) {
  if (!stompClient || !stompClient.connected) {
    console.warn("WS not connected — can't send order");
    return;
  }

  stompClient.publish({
    destination: `/app/game/${roomId}/placeOrder`,
    body: JSON.stringify({ orderAmount: Number(quantity) }),
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  console.log("📤 Sent order:", quantity);
}
