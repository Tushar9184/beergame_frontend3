// src/services/user-service.js
import { myAxios } from "./Helper";

/* ============================================================
   AUTH SECTION
   ============================================================ */

export const loginUser = async (userData) => {
  const res = await myAxios.post("/auth/login", userData);

  const { token, username, email } = res.data;

  localStorage.setItem("token", token);
  localStorage.setItem("username", username);
  localStorage.setItem("email", email);

  return res.data;
};

export const getOtpFromBackend = async (userData) => {
  const res = await myAxios.post("/auth/register", userData);
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await myAxios.post("/auth/verify", userData);

  const { token, username, email } = res.data;
  localStorage.setItem("token", token);
  localStorage.setItem("username", username);
  localStorage.setItem("email", email);

  return res.data;
};

/* ============================================================
   GAME LOBBY — CREATE & JOIN
   ============================================================ */

/**
 * Create a game lobby.
 * The backend automatically assigns player as creator.
 */
export const createLobby = async (role = "RETAILER") => {
  try {
    const normalizedRole = String(role).toUpperCase();

    // Backend expects JSON: { role: "RETAILER" }
    const res = await myAxios.post("/api/game/create", {
      role: normalizedRole,
    });

    const gameId = res?.data?.gameId || res?.data?.id;

    // Save creator details
    localStorage.setItem("roomId", gameId);
    localStorage.setItem("role", normalizedRole);

    return res.data;
  } catch (err) {
    console.error("❌ Error creating lobby:", err);
    throw err;
  }
};

/**
 * Join an existing lobby.
 */
export const joinLobby = async (gameId, role) => {
  try {
    const normalizedRole = role.toUpperCase();

    const res = await myAxios.post(`/api/game/${gameId}/join`, {
      role: normalizedRole,
    });

    // Prefer returned ID from backend
    const returnedGameId = (res?.data?.gameId ?? res?.data?.id ?? gameId).toString();

    localStorage.setItem("roomId", returnedGameId);
    localStorage.setItem("role", normalizedRole);

    return res.data;
  } catch (err) {
    console.error("❌ Error joining lobby:", err);
    throw err;
  }
};

/**
 * Creates a game room (not used heavily in your final flow).
 */
export const createRoom = async () => {
  const res = await myAxios.post("/api/room/create", {});
  return res.data;
};
