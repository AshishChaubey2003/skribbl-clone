// Lobby.jsx
// Waiting room — shows players list, host can start game

import { useEffect, useState } from "react";
import { onMessage, sendMessage, offMessage } from "../socket";

export default function Lobby({ roomId, myName, isHost, onGameStart }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    function handlePlayerJoined(msg) {
      setPlayers(msg.players);
    }

    function handlePlayerLeft(msg) {
      setPlayers(msg.players);
    }

    function handleGameStarted(msg) {
      onGameStart(msg);
    }

    onMessage("player_joined", handlePlayerJoined);
    onMessage("player_left", handlePlayerLeft);
    onMessage("round_start", handleGameStarted);

    return () => {
      offMessage("player_joined", handlePlayerJoined);
      offMessage("player_left", handlePlayerLeft);
      offMessage("round_start", handleGameStarted);
    };
  }, []);

  function startGame() {
    sendMessage({ type: "start_game" });
  }

  return (
    <div style={{ padding: 40, maxWidth: 500, margin: "0 auto" }}>
      <h2>Lobby</h2>
      <p>
        Room Code: <strong>{roomId}</strong>
      </p>
      <p>Share this code with friends!</p>

      <h3>Players ({players.length})</h3>
      <ul>
        {players.map((p) => (
          <li key={p.id}>
            {p.name} {p.name === myName ? "(You)" : ""}
          </li>
        ))}
      </ul>

      {isHost && players.length >= 2 && (
        <button
          onClick={startGame}
          style={{ padding: "12px 24px", fontSize: 16, cursor: "pointer" }}
        >
          Start Game
        </button>
      )}

      {isHost && players.length < 2 && (
        <p style={{ color: "gray" }}>Waiting for more players...</p>
      )}

      {!isHost && <p style={{ color: "gray" }}>Waiting for host to start...</p>}
    </div>
  );
}
