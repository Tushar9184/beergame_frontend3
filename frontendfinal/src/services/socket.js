import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;

export function connectSocket({ roomId, onStateUpdate }) {
  const token = localStorage.getItem("token");
  const socket = new SockJS("https://the-beer-game-backend.onrender.com/ws");

  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 3000,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    onConnect: () => {
      console.log("🟢 WebSocket connected");

      stompClient.subscribe(`/topic/game/${roomId}`, (message) => {
        const state = JSON.parse(message.body);
        console.log("📡 State update:", state);
        onStateUpdate(state);
      });
    },
    onStompError: (frame) => {
      console.error("❌ STOMP error:", frame.headers["message"]);
    },
  });

  stompClient.activate();
}

export function disconnectSocket() {
  if (stompClient) stompClient.deactivate();
}

export function sendOrderWS({ roomId, quantity }) {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: `/app/game/${roomId}/placeOrder`,
      body: JSON.stringify({ orderAmount: quantity }),
    });

    console.log("📨 Order sent:", { roomId, quantity });
  } else {
    console.warn("⛔ WS not connected");
  }
}
