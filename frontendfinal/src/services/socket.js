import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;
let subscriptions = [];

/**
 * Connect websocket with Authorization header from localStorage.
 * onStateUpdate receives parsed message body.
 */
export function connectSocket({ roomId, onStateUpdate }) {
  if (!roomId) {
    console.error("❌ WS Error → Missing roomId");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("❌ WS Error → No token found. User not logged in.");
    return;
  }

  // if already connected, unsubscribe and reconnect
  if (stompClient && stompClient.active) {
    console.log("WS: already active - reusing connection");
  }

  const sock = new SockJS(`${process.env.REACT_APP_API_BASE || "https://the-beer-game-backend.onrender.com"}/ws`);
  stompClient = new Client({
    webSocketFactory: () => sock,
    reconnectDelay: 3000,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    debug: (msg) => console.log("STOMP:", msg),
    onConnect: (frame) => {
      console.log("🟢 WS CONNECTED", frame.headers);
      // subscribe to both game and room topics (backend may publish to either)
      try {
        const gameTopic = `/topic/game/${roomId}`;
        const roomTopic = `/topic/room/${roomId}`;
        // clear previous subscriptions
        subscriptions.forEach((s) => {
          try { s.unsubscribe(); } catch (e) { /* ignore */ }
        });
        subscriptions = [];

        const sub1 = stompClient.subscribe(gameTopic, (message) => {
          try {
            const body = JSON.parse(message.body);
            onStateUpdate(body);
          } catch (e) {
            console.error("WS JSON parse error (game):", e);
          }
        });
        subscriptions.push(sub1);

        const sub2 = stompClient.subscribe(roomTopic, (message) => {
          try {
            const body = JSON.parse(message.body);
            onStateUpdate(body);
          } catch (e) {
            console.error("WS JSON parse error (room):", e);
          }
        });
        subscriptions.push(sub2);

        console.log("Subscribed to:", gameTopic, roomTopic);
      } catch (e) {
        console.error("Subscription error:", e);
      }
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

/** Disconnect and clear subscriptions */
export function disconnectSocket() {
  try {
    subscriptions.forEach((s) => { try { s.unsubscribe(); } catch (e) {} });
    subscriptions = [];
    if (stompClient) {
      stompClient.deactivate();
      stompClient = null;
    }
    console.log("WS disconnected");
  } catch (e) {
    console.error("Error while disconnecting WS:", e);
  }
}

/**
 * Send order via STOMP to backend MessageMapping:
 * backend expects destination: /app/game/{gameId}/placeOrder
 * payload: { orderAmount: <number> }
 */
export function sendOrderWS({ roomId, role, quantity }) {
  if (!stompClient || !stompClient.connected) {
    console.warn("❌ Cannot send order — WS not connected");
    return;
  }

  const dest = `/app/game/${roomId}/placeOrder`;
  const body = JSON.stringify({ orderAmount: Number(quantity) });

  try {
    stompClient.publish({
      destination: dest,
      body,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log("WS publish:", dest, body);
  } catch (e) {
    console.error("Failed to publish WS message:", e);
  }
}
