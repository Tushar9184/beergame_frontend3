// src/services/socket.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;
let subscriptions = [];
let connecting = false;

export function connectSocket({ roomId, onStateUpdate }) {
  if (!roomId) {
    console.error("❌ WS Error → Missing roomId");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("⚠️ WS → No JWT token in localStorage — continuing without auth header");
  }

  if (stompClient && stompClient.active) {
    console.log("WS already active");
    return;
  }
  if (connecting) {
    console.log("WS connect already in progress");
    return;
  }
  connecting = true;

  const BASE_URL = process.env.REACT_APP_API_BASE || "https://the-beer-game-backend.onrender.com";
  const sock = new SockJS(`${BASE_URL}/ws`);

  stompClient = new Client({
    webSocketFactory: () => sock,
    reconnectDelay: 3000,
    debug: (msg) => {
      // comment out or route to a logger if noisy
      console.debug("STOMP:", msg);
    },
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    onConnect: () => {
      connecting = false;
      console.log("🟢 STOMP connected");

      // cleanup previous subs
      subscriptions.forEach(s => {
        try { s.unsubscribe(); } catch (e) {}
      });
      subscriptions = [];

      const topics = [`/topic/game/${roomId}`, `/topic/room/${roomId}`];
      topics.forEach(topic => {
        try {
          const sub = stompClient.subscribe(topic, frame => {
            try {
              const body = JSON.parse(frame.body);
              onStateUpdate && onStateUpdate(body);
            } catch (err) {
              console.error("WS JSON parse error:", err);
            }
          });
          subscriptions.push(sub);
          console.log("📡 Subscribed to:", topic);
        } catch (err) {
          console.error("❌ Subscription failed:", err);
        }
      });
    },
    onStompError: frame => {
      connecting = false;
      console.error("❌ STOMP ERROR:", frame && frame.headers ? frame.headers['message'] : frame);
    },
    onWebSocketClose: evt => {
      connecting = false;
      console.warn("🔴 WebSocket closed", evt);
    },
    onWebSocketError: err => {
      connecting = false;
      console.error("❌ WebSocket error", err);
    }
  });

  stompClient.activate();
}

export function disconnectSocket() {
  try {
    subscriptions.forEach(s => {
      try { s.unsubscribe(); } catch (e) {}
    });
    subscriptions = [];

    if (stompClient) {
      stompClient.deactivate();
      stompClient = null;
      console.log("🔴 STOMP disconnected");
    }
  } catch (err) {
    console.error("❌ Disconnect error:", err);
  }
}

/**
 * Send order to backend via STOMP
 * backend mapping: /app/game/{roomId}/placeOrder
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
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    });

    console.log("📤 WS → Sent Order:", { roomId, quantity });
  } catch (err) {
    console.error("❌ WS Publish error:", err);
  }
}
