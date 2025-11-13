import { myAxios } from "./Helper";

// ✅ LOGIN
export const loginUser = async (userData) => {
  const res = await myAxios.post("/auth/login", userData);
  const { token, username, email } = res.data;

  localStorage.setItem("token", token);
  localStorage.setItem("username", username);
  localStorage.setItem("email", email);

  return res.data;
};

// ✅ Step 1: Get OTP from backend
export const getOtpFromBackend = async (userData) => {
  const res = await myAxios.post("/auth/register", userData);
  return res.data;
};

// ✅ Step 2: After OTP matches, register user
export const registerUser = async (userData) => {
  const res = await myAxios.post("/auth/verify", userData);
  const data = res.data;

  localStorage.setItem("token", data.token);
  localStorage.setItem("username", data.username);
  localStorage.setItem("email", data.email);

  return data;
};

// ✅ CREATE LOBBY
export const createLobby = async (lobbyData) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No token found — please login first.");
  }

  try {
    const res = await myAxios.post(
      "/api/game/create",
      lobbyData, // Send the data as the body
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { gameId } = res.data;
    localStorage.setItem("roomId", gameId);
    return res.data;
  } catch (err) {
    console.error("Error creating lobby:", err.response || err);
    throw err;
  }
};

// ✅ CREATE ROOM (Updated to async/await for consistency)
export const createRoom = async () => {
  // 1. Call the endpoint with an empty body, as your backend expects no data.
  // 2. No JWT is sent, as your backend endpoint isn't secured.
  const res = await myAxios.post("/api/room/create", {});
  
  // 3. Return the raw response data (the GameRoom object)
  return res.data;
};
export const joinLobby = async (gameId, role) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No token found — please login first.");
  }

  try {
    const res = await myAxios.post(
      `/api/game/${gameId}/join`,
      { role }, // ✅ matches JoinGameRequestDTO
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { gameId: returnedGameId } = res.data;
    localStorage.setItem("roomId", returnedGameId);
    localStorage.setItem("role", role);

    return res.data;
  } catch (err) {
    console.error("Error joining lobby:", err.response || err);
    throw err;
  }
};