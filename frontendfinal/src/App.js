import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/loginPage";
import HomePage from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import DashBoard from "./pages/DashBoard";
import SignUpPage from "./pages/SignUpPage";
import CreateLobby from "./pages/CreateLobby"
import Contact from "./pages/Contact"
import About from "./pages/About"
import Learn from "./pages/Learn"

import JoinLobby from "./pages/JoinLobby"
import LobbyWaiting from "./pages/LobbyWaiting"
import HowToPlay from "./Components/dashboard/Footer.jsx";
import GameResults from "./pages/GameResults"
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import RoomWaiting from "./pages/RoomWaiting";
const RootElement = () => {
  const token = localStorage.getItem("token");
  return token ? <HomePage /> : <LandingPage />;
};

const router = createBrowserRouter([
  { path: "/", element: <RootElement /> },
  { path: "/login", element: <LoginPage /> },
  {path:"/dashboard/:roomId", element:<DashBoard /> },
  {path:"/sign", element:<SignUpPage /> },
  {path:"/createlobby", element:<CreateLobby/>},
  {path:"/about", element:<About/>},
  {path:"/learn", element:<Learn/>},
  {path:"/contact", element:<Contact/>},
  {path:"/joinlobby",element:<JoinLobby/>},
  { path:"/lobby/:roomId", element:<LobbyWaiting />},
  { path: "/howtoplay", element: <HowToPlay /> },
  { path: "/gameresult", element: <GameResults /> },
  { path: "/createroom", element: <CreateRoom /> },
  { path: "/joinroom", element: <JoinRoom /> },
  { path: "/room/:roomId", element: <RoomWaiting /> }

]);


export default function App() {
  return <RouterProvider router={router} />;
}
