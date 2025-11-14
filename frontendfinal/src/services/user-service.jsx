import { myAxios } from "./Helper";

/* ============================================================
   AUTH
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
  const data = res.data;
  localStorage.setItem("token", data.token);
  localStorage.setItem("username", data.username);
  localStorage.setItem("email", data.email);
  return data;
};

/* ============================================================
   GAME LOBBY
   ============================================================ */

/**
 * Create a single-game lobby and join as creator with chosen role.
 * role should be one of: "RETAILER","WHOLESALER","DISTRIBUTOR","MANUFACTURER"
 */
export const createLobby = async (role = "RETAILER") => {
  try {
    const normalizedRole = role.toUpperCase();

    const res = await myAxios.post("/api/game/create", { role: normalizedRole });

    const gameId = res.data?.gameId || res.data?.id;

    localStorage.setItem("roomId", gameId);
    localStorage.setItem("role", normalizedRole);

    return res.data;
  } catch (err) {
    console.error("❌ Error creating lobby:", err);
    throw err;
  }
};

export const createRoom = async () => {
  const res = await myAxios.post("/api/room/create", {});
  return res.data;
};

/**
 * Join a lobby
 * - gameId: string
 * - role: string (case-insensitive)
 */
export const joinLobby = async (gameId, role) => {
  try {
    const normalizedRole = String(role).toUpperCase();
    const res = await myAxios.post(`/api/game/${gameId}/join`, { role: normalizedRole });

    // keep gameId stable in localStorage (prefer returned id if present)
    const returnedGameId = (res?.data?.gameId ?? res?.data?.id ?? gameId).toString();
    localStorage.setItem("roomId", returnedGameId);
    localStorage.setItem("role", normalizedRole);

    return res.data;
  } catch (err) {
    console.error("❌ Error joining lobby:", err);
    throw err;
  }
};
