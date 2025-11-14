import { myAxios } from "./Helper";

/* ============================================================
   AUTH SERVICES
   ============================================================ */

// ✅ LOGIN
export const loginUser = async (userData) => {
  const res = await myAxios.post("/auth/login", userData);
  const { token, username, email } = res.data;

  localStorage.setItem("token", token);
  localStorage.setItem("username", username);
  localStorage.setItem("email", email);

  return res.data;
};

// ✅ Step 1: Request OTP
export const getOtpFromBackend = async (userData) => {
  const res = await myAxios.post("/auth/register", userData);
  return res.data;
};

// ✅ Step 2: Verify OTP → Final register
export const registerUser = async (userData) => {
  const res = await myAxios.post("/auth/verify", userData);
  const data = res.data;

  localStorage.setItem("token", data.token);
  localStorage.setItem("username", data.username);
  localStorage.setItem("email", data.email);

  return data;
};


/* ============================================================
   GAME LOBBY SERVICES
   ============================================================ */

// ✅ CREATE LOBBY (Single Game)
export const createLobby = async () => {
  try {
    const res = await myAxios.post("/api/game/create");

    const { gameId } = res.data;
    localStorage.setItem("roomId", gameId);

    return res.data;
  } catch (err) {
    console.error("❌ Error creating lobby:", err);
    throw err;
  }
};

// ✅ CREATE ROOM (Team Mode — 4 games)
export const createRoom = async () => {
  const res = await myAxios.post("/api/room/create", {});
  return res.data;
};

// ✅ JOIN LOBBY
export const joinLobby = async (gameId, role) => {
  try {
    const res = await myAxios.post(`/api/game/${gameId}/join`, { role });

    const returnedGameId = res.data.gameId;
    localStorage.setItem("roomId", returnedGameId);
    localStorage.setItem("role", role);

    return res.data;
  } catch (err) {
    console.error("❌ Error joining lobby:", err);
    throw err;
  }
};
