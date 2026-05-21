// App.jsx
// Controls which screen is shown: Home → Lobby → Game → EndGame

import { useState } from "react";
import Home from "./screens/Home";
import Lobby from "./screens/Lobby";
import Game from "./screens/Game";
import EndGame from "./screens/EndGame";
import { connectSocket } from "./socket";

const SCREENS = {
  HOME: "home",
  LOBBY: "lobby",
  GAME: "game",
  END: "end",
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.HOME);
  const [myName, setMyName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  async function handleCreateRoom(name, settings) {
    const res = await fetch("http://localhost:8000/create-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostName: name, settings }),
    });
    const data = await res.json();

    setMyName(name);
    setRoomId(data.roomId);
    setIsHost(true);

    connectSocket(data.roomId, name);
    setScreen(SCREENS.LOBBY);
  }

  
  async function handleJoinRoom(name, code) {
   
    const res = await fetch(`http://localhost:8000/check-room/${code}`);
    const data = await res.json();

    if (!data.exists) {
      alert("Room not found! Check the room code.");
      return;
    }

    setMyName(name);
    setRoomId(code);
    setIsHost(false);
    connectSocket(code, name);
    setScreen(SCREENS.LOBBY);
  }
  function handleGameStart(msg) {
    setScreen(SCREENS.GAME);
  }

  function handleGameOver(msg) {
    setGameResult(msg);
    setScreen(SCREENS.END);
  }

  function handlePlayAgain() {
    setScreen(SCREENS.HOME);
    setMyName("");
    setRoomId("");
    setIsHost(false);
    setGameResult(null);
  }

  return (
    <div>
      {screen === SCREENS.HOME && (
        <Home onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
      )}

      {screen === SCREENS.LOBBY && (
        <Lobby
          roomId={roomId}
          myName={myName}
          isHost={isHost}
          onGameStart={handleGameStart}
        />
      )}

      {screen === SCREENS.GAME && (
        <Game myName={myName} onGameOver={handleGameOver} />
      )}

      {screen === SCREENS.END && gameResult && (
        <EndGame
          winner={gameResult.winner}
          leaderboard={gameResult.leaderboard}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}
