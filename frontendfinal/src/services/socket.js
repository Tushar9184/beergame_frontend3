// Minimal WebSocket wrapper for the game.
// Adjust URL to your backend WS endpoint.
let socket = null;
let reconnectTimer = null;

export function connectSocket({ roomId, onStateUpdate }) {
  const token = localStorage.getItem("token") || "";
  const WS_URL = (process.env.REACT_APP_WS_URL || "ws://localhost:8080/ws") + `?roomId=${roomId}`;

  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log("Socket already open");
    return;
  }

  try {
    socket = new WebSocket(WS_URL, ["protocolOne"]);
  } catch (err) {
    console.error("WS connect error:", err);
    return;
  }

  socket.onopen = () => {
    console.log("WS connected", WS_URL);
    // Optionally send auth message if your backend expects it
    if (token) {
      socket.send(JSON.stringify({ type: "AUTH", token }));
    }
    // Ask server for initial state
    socket.send(JSON.stringify({ type: "JOIN_ROOM", roomId }));
  };

  socket.onmessage = (ev) => {
    try {
      const payload = JSON.parse(ev.data);
      // Standardize event shapes:
      if (payload.type === "GAME_STATE" || payload.type === "STATE_UPDATE") {
        onStateUpdate && onStateUpdate(payload.data ?? payload);
      } else if (payload.type === "PLAYERS_UPDATE") {
        onStateUpdate && onStateUpdate({ players: payload.data });
      } else {
        // fallback: give the full payload
        onStateUpdate && onStateUpdate(payload);
      }
    } catch (err) {
      console.error("WS parse error", err);
    }
  };

  socket.onclose = (ev) => {
    console.warn("WS closed:", ev.reason);
    socket = null;
    // try to reconnect after short delay
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connectSocket({ roomId, onStateUpdate });
      }, 2500);
    }
  };

  socket.onerror = (err) => {
    console.error("WS error:", err);
  };
}

export function disconnectSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

export function sendOrderWS({ roomId, quantity }) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn("WS not open - cannot send order");
    return;
  }
  const msg = {
    type: "PLACE_ORDER",
    roomId,
    payload: { quantity },
  };
  socket.send(JSON.stringify(msg));
}
