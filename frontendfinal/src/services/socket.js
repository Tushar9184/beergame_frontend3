// src/services/socket.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;
let activeRoomId = null;
let currentSubscription = null;

export function connectSocket({ roomId, onStateUpdate }) {
  if (!roomId) return console.error("WS: Missing roomId");

  const token = localStorage.getItem("token");
  if (!token) return console.error("WS: Missing JWT");

  const BASE_URL =
    process.env.REACT_APP_API_BASE ||
    "https://the-beer-game-backend.onrender.com";

  // reconnect logic
  if (stompClient && stompClient.active && activeRoomId === roomId) {
    console.log("WS already active for same room");
    return;
  }

  // clean old
  if (stompClient) {
    try { stompClient.deactivate(); } catch {}
    stompClient = null;
    currentSubscription = null;
  }

  activeRoomId = roomId;

  stompClient = new Client({
    webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 1000,
    debug: () => {},

    onConnect: () => {
      console.log("🟢 WS connected:", roomId);

      // ❗ Correct unsubscribing
      if (currentSubscription) {
        try { currentSubscription.unsubscribe(); } catch {}
        currentSubscription = null;
      }

      // ❗ Correct subscription
      currentSubscription = stompClient.subscribe(
        `/topic/game/${roomId}`,
        (msg) => {
          try {
            const data = JSON.parse(msg.body);
            onStateUpdate(data);
          } catch (e) {
            console.error("WS parse error", e);
          }
        }
      );

      console.log("📡 Subscribed → /topic/game/" + roomId);
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
    if (stompClient) stompClient.deactivate();
  } catch {}
  stompClient = null;
  activeRoomId = null;
}

export function sendOrderWS({ roomId, quantity }) {
  if (!stompClient || !stompClient.connected) {
    return console.warn("WS not connected");
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
