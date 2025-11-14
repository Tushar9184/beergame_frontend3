import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;

export function connectSocket({ roomId, onStateUpdate }) {
  console.log("Connecting WS to room:", roomId);

  const socket = new SockJS("https://the-beer-game-backend.onrender.com/ws");
  const token = localStorage.getItem("token"); // 💥 REQUIRED

  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 3000,

    // 💥 THIS IS THE IMPORTANT PART
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },

    debug: (str) => console.log("STOMP:", str),

    onConnect: () => {
      console.log("🟢 WebSocket CONNECTED");

      const topic = `/topic/game/${roomId}`;
      console.log("Subscribing to:", topic);

      stompClient.subscribe(topic, (message) => {
        console.log("WS MESSAGE:", message.body);
        onStateUpdate(JSON.parse(message.body));
      });
    },

    onStompError: (frame) => {
      console.error("STOMP ERROR:", frame);
    },

    onWebSocketError: (e) => {
      console.error("WS ERROR:", e);
    },
  });

  stompClient.activate();
}

export function disconnectSocket() {
  if (stompClient) {
    console.log("Disconnecting WS...");
    stompClient.deactivate();
  }
}

export function sendOrderWS({ roomId, role, quantity }) {
  console.log("Sending STOMP order:", roomId, role, quantity);

  if (stompClient?.connected) {
    stompClient.publish({
      destination: `/app/game/${roomId}/placeOrder`,
      body: JSON.stringify({ orderAmount: quantity }),
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // optional but safe
      },
    });
  } else {
    console.warn("❌ Cannot send order — WS not connected");
  }
}
