// src/services/user-service.js
import { myAxios } from "./Helper";


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
export const createLobby = async (lobbyData) => { // 1. Accept the object
  try {
    // 2. Get the 'role' property from the object
    const normalizedRole = String(lobbyData.role).toUpperCase(); 

    const res = await myAxios.post("/api/game/create", {
      role: normalizedRole, // 3. Send the correct string
    });

    const gameId = res?.data?.gameId || res?.data?.id;

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
 * Creates a game room.
 * Backend now returns RoomStateDTO: { roomId, roomStatus, currentWeek, players[] }
 */
export const createGameRoom = async () => {
  try {
    const res = await myAxios.post("/api/room/create");
    return res.data; // RoomStateDTO
  } catch (err) {
    console.error("❌ Error creating room:", err);
    throw err;
  }
};

// 2. PLAYER: Join a 16-player Room (Requires Team Name)
// Backend now returns RoomStateDTO: { roomId, roomStatus, currentWeek, players[] }
export const joinGameRoom = async (roomId, teamName, role, username) => {
  try {
    const res = await myAxios.post(`/api/room/${roomId}/join`, {
      username,
      teamName,
      role: role.toUpperCase()
    });
    // res.data is RoomStateDTO — roomId field (not id)
    const returnedRoomId = res?.data?.roomId ?? roomId;
    localStorage.setItem("roomId", returnedRoomId);
    return res.data; // Full RoomStateDTO for seeding lobby grid
  } catch (err) {
    console.error("❌ Error joining room:", err);
    throw err;
  }
};

// 3. POLL: Get the status of the Room (Who is in the 16 slots?)
export const getRoomState = async (roomId) => {
  try {
    const res = await myAxios.get(`/api/room/${roomId}`);
    return res.data; 
  } catch (err) {
    return null; 
  }
};
export const switchRole = async (roomId, newTeamName, newRole) => {
  try {
    // JoinRoomRequestDTO only expects: { teamName, role }
    // username comes from JWT token via @AuthenticationPrincipal
    const res = await myAxios.post(`/api/room/${roomId}/join`, {
      teamName: newTeamName,
      role: newRole.toUpperCase()
    });
    localStorage.setItem('teamName', newTeamName);
    localStorage.setItem('role', newRole.toUpperCase());
    return res.data;
  } catch (err) {
    console.error('❌ Error switching role:', err);
    throw err;
  }
};