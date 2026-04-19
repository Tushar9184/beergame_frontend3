// src/services/socket.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;
let activeRoomId = null;
let currentSubscription = null;

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

export function connectRoomSocket({ roomId, onStateUpdate }) {
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

  currentOnStateUpdate = onStateUpdate;

  if (stompClient && stompClient.connected && activeRoomId === roomId) {
    console.log("WS (Room) already active, callback updated for:", roomId);
    return;
  }

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
      console.log("🟢 WS Connected to Room:", roomId);

      if (currentSubscription) {
        try {
          currentSubscription.unsubscribe();
        } catch {}
        currentSubscription = null;
      }

      currentSubscription = stompClient.subscribe(
        `/topic/room/${roomId}`,
        (msg) => {
          try {
            const body = JSON.parse(msg.body);
            console.log("📥 WS ROOM MESSAGE:", body);
            currentOnStateUpdate(body);
          } catch (err) {
            console.error("WS parse error:", err);
          }
        }
      );

      console.log("📡 Subscribed →", `/topic/room/${roomId}`);
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

export function disconnectRoomSocket() {
  disconnectSocket(); // It essentially does the same cleanup
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