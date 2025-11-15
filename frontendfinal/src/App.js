import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/loginPage";
import HomePage from "./pages/Home";
import DashBoard from "./pages/DashBoard";
import Check from "./Check";
import SignUpPage from "./pages/SignUpPage";
import CreateLobby from "./pages/CreateLobby"
import Contact from "./pages/Contact"
import About from "./pages/About"
import Learn from "./pages/Learn"
import CreateRoom from "./pages/CreateRoom"
import JoinLobby from "./pages/JoinLobby"
import LobbyWaiting from "./pages/LobbyWaiting"
import HowToPlay from "./Components/dashboard/Footer.jsx";
import GameResults from "./pages/GameResults"
const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  {path:"/dashboard/:roomId", element:<DashBoard /> },
  {path:"/check", element:<Check /> },
  {path:"/sign", element:<SignUpPage /> },
  {path:"/createlobby", element:<CreateLobby/>},
  {path:"/about", element:<About/>},
  {path:"/learn", element:<Learn/>},
  {path:"/contact", element:<Contact/>},
  {path:"/createroom", element:<CreateRoom/>},
  {path:"/joinlobby",element:<JoinLobby/>},
  { path:"/lobby/:roomId", element:<LobbyWaiting />},
  { path: "/howtoplay", element: <HowToPlay /> },
  { path: "/gameresult", element: <GameResults /> }

]);


export default function App() {
  return <RouterProvider router={router} />;
}
