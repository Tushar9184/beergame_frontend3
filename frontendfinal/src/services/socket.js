import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;

export function connectSocket({ roomId, onStateUpdate }) {
  const socket = new SockJS("http://localhost:8080/ws");
  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 3000,
    onConnect: () => {
      console.log(" Connected to WebSocket");

      // Subscribe to room updates
      stompClient.subscribe(`/topic/game/${roomId}`, (message) => {
        const state = JSON.parse(message.body);
        console.log("📡 Update received:", state);
        onStateUpdate(state);
      });
    },
  });

  stompClient.activate();
}

export function disconnectSocket() {
  if (stompClient) stompClient.deactivate();
}

export function sendOrderWS({ roomId, role, quantity }) {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: "/app/order",
      body: JSON.stringify({ roomId, role, quantity }),
    });
    console.log(" Order sent:", { roomId, role, quantity });
  } else {
    console.warn(" WebSocket not connected yet.");
  }
}
