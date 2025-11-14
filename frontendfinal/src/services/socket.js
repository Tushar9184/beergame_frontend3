// src/services/socket.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;
let activeRoomId = null;
let currentSubscription = null;
let connecting = false;

/**
 * Connect and subscribe to /topic/game/{roomId}.
 * onStateUpdate receives parsed JSON body from server.
 */
export function connectSocket({ roomId, onStateUpdate }) {
  if (!roomId) {
    console.error("WS: missing roomId");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("WS: missing JWT token");
    return;
  }

  // if already connected to same room, noop
  if (stompClient && stompClient.active && activeRoomId === roomId) {
    console.log("WS: already connected to room", roomId);
    return;
  }

  // if switching room, disconnect first
  if (stompClient && stompClient.active && activeRoomId !== roomId) {
    try {
      stompClient.deactivate();
    } catch (e) {
      /* ignore */
    }
    stompClient = null;
    currentSubscription = null;
    activeRoomId = null;
  }

  if (connecting) {
    // prevent concurrent connect attempts
    console.log("WS: connect already in progress");
    return;
  }
  connecting = true;

  const BASE_URL =
    process.env.REACT_APP_API_BASE ||
    "https://the-beer-game-backend.onrender.com";

  const socketFactory = () => new SockJS(`${BASE_URL}/ws`);

  stompClient = new Client({
    webSocketFactory: socketFactory,
    reconnectDelay: 1000,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    debug: (msg) => {
      // keep debug quiet, but you can uncomment for heavy debugging
      // console.debug("STOMP:", msg);
    },

    onConnect: (frame) => {
      connecting = false;
      activeRoomId = roomId;
      console.log("WS: connected for room", roomId);

      // unsubscribe old subscription if any (safe)
      try {
        if (currentSubscription) {
          currentSubscription.unsubscribe();
          currentSubscription = null;
        }
      } catch (e) {
        // ignore
      }

      // subscribe to the correct topic
      try {
        currentSubscription = stompClient.subscribe(
          `/topic/game/${roomId}`,
          (message) => {
            try {
              const body = JSON.parse(message.body);
              onStateUpdate && onStateUpdate(body);
            } catch (err) {
              console.error("WS: failed to parse message body", err);
            }
          }
        );
        console.log("WS: subscribed ->", `/topic/game/${roomId}`);
      } catch (err) {
        console.error("WS: subscription error", err);
      }
    },

    onStompError: (frame) => {
      console.error("WS: STOMP error", frame);
    },

    onWebSocketError: (err) => {
      console.error("WS: websocket error", err);
    },

    onDisconnect: () => {
      console.log("WS: disconnected");
    },
  });

  stompClient.activate();
}

/**
 * Clean disconnect.
 */
export function disconnectSocket() {
  try {
    if (currentSubscription) {
      try {
        currentSubscription.unsubscribe();
      } catch (e) {}
      currentSubscription = null;
    }
    if (stompClient) {
      stompClient.deactivate();
      stompClient = null;
    }
  } catch (err) {
    console.error("WS: error during disconnect", err);
  } finally {
    activeRoomId = null;
    connecting = false;
  }
}

/**
 * Publish order to server.
 * Backend mapping expected: /app/game/{roomId}/placeOrder
 */
export function sendOrderWS({ roomId, quantity }) {
  if (!stompClient || !stompClient.connected) {
    console.warn("WS: not connected — cannot send order");
    return;
  }
  try {
    stompClient.publish({
      destination: `/app/game/${roomId}/placeOrder`,
      body: JSON.stringify({ orderAmount: Number(quantity) }),
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log("WS: sent order", quantity, "for", roomId);
  } catch (err) {
    console.error("WS: publish error", err);
  }
}
