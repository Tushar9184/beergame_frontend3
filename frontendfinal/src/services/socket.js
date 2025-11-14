// src/services/socket.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;
let subscriptions = [];

/**
 * Connect WebSocket with JWT token and subscribe to room/game updates.
 * @param {roomId, onStateUpdate}
 */
export function connectSocket({ roomId, onStateUpdate }) {
  if (!roomId) {
    console.error("❌ WS Error → Missing roomId");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("❌ WS Error → Missing JWT token");
    return;
  }

  // If already connected, skip reactivation
  if (stompClient && stompClient.active) {
    console.log("WS already connected");
  }

  const BASE_URL =
    process.env.REACT_APP_API_BASE ||
    "https://the-beer-game-backend.onrender.com";

  const socket = new SockJS(`${BASE_URL}/ws`);

  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 3000,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },

    debug: (msg) => console.log("STOMP:", msg),

    onConnect: () => {
      console.log("🟢 WebSocket CONNECTED");

      // Clear previous subscriptions to avoid duplicates
      subscriptions.forEach((s) => {
        try {
          s.unsubscribe();
        } catch {}
      });
      subscriptions = [];

      const topics = [
        `/topic/game/${roomId}`,
        `/topic/room/${roomId}`,
      ];

      topics.forEach((topic) => {
        try {
          const sub = stompClient.subscribe(topic, (message) => {
            try {
              const body = JSON.parse(message.body);
              onStateUpdate(body);
            } catch (err) {
              console.error("WS JSON Error:", err);
            }
          });

          subscriptions.push(sub);
          console.log("📡 Subscribed to:", topic);
        } catch (err) {
          console.error("❌ Subscription error:", err);
        }
      });
    },

    onStompError: (frame) => {
      console.error("❌ STOMP ERROR:", frame);
    },

    onWebSocketError: (err) => {
      console.error("❌ WS ERROR:", err);
    },
  });

  stompClient.activate();
}

/** Disconnect cleanly */
export function disconnectSocket() {
  try {
    subscriptions.forEach((s) => {
      try {
        s.unsubscribe();
      } catch {}
    });
    subscriptions = [];

    if (stompClient) {
      stompClient.deactivate();
      stompClient = null;
      console.log("🔴 WS disconnected");
    }
  } catch (err) {
    console.error("❌ WS disconnect error:", err);
  }
}

/**
 * Send order to backend (STOMP):
 * → backend mapping: /app/game/{roomId}/placeOrder
 */
export function sendOrderWS({ roomId, quantity }) {
  if (!stompClient || !stompClient.connected) {
    console.warn("❌ Cannot send — WS not connected");
    return;
  }

  const destination = `/app/game/${roomId}/placeOrder`;

  try {
    stompClient.publish({
      destination,
      body: JSON.stringify({
        orderAmount: Number(quantity),
      }),
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    console.log("📤 WS → Sent Order:", quantity);
  } catch (err) {
    console.error("❌ WS Publish error:", err);
  }
}
