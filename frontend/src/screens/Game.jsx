// Game.jsx
// Main game screen — canvas, chat, scoreboard, timer, word selection

import { useEffect, useState } from "react";
import Canvas from "../Components/Canvas";
import Chat from "../Components/Chat";
import { onMessage, sendMessage, offMessage } from "../socket";

export default function Game({ myName, onGameOver }) {
  const [drawerId, setDrawerId] = useState(null);
  const [drawerName, setDrawerName] = useState("");
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [timeLeft, setTimeLeft] = useState(80);
  const [players, setPlayers] = useState([]);
  const [wordOptions, setWordOptions] = useState([]); // Word choices for drawer
  const [wordChosen, setWordChosen] = useState(false);
  const [wordLength, setWordLength] = useState(0); // How many letters (for guessers)
  const [phase, setPhase] = useState("choosing"); // "choosing" or "drawing"

  const isDrawer = drawerName === myName;

  useEffect(() => {
    function handleRoundStart(msg) {
      setDrawerId(msg.drawerId);
      setDrawerName(msg.drawerName);
      setRound(msg.round);
      setTotalRounds(msg.totalRounds);
      setTimeLeft(msg.drawTime);
      setWordChosen(false);
      setPhase("choosing");

      if (msg.drawerName === myName) {
        setWordOptions(msg.wordOptions);
      } else {
        setWordOptions([]);
      }
    }

    function handleGameState(msg) {
      setPhase(msg.phase);
      setWordLength(msg.wordLength);
      setWordChosen(true);
    }

    function handlePlayerJoined(msg) {
      setPlayers(msg.players);
    }

    function handleGuessResult(msg) {
      setPlayers(msg.players);
    }

    function handleGameOver(msg) {
      onGameOver(msg);
    }

    onMessage("round_start", handleRoundStart);
    onMessage("game_state", handleGameState);
    onMessage("player_joined", handlePlayerJoined);
    onMessage("guess_result", handleGuessResult);
    onMessage("game_over", handleGameOver);

    return () => {
      offMessage("round_start", handleRoundStart);
      offMessage("game_state", handleGameState);
      offMessage("player_joined", handlePlayerJoined);
      offMessage("guess_result", handleGuessResult);
      offMessage("game_over", handleGameOver);
    };
  }, [myName]);

  // Timer countdown
  useEffect(() => {
    if (!wordChosen) return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [wordChosen, timeLeft]);

  function chooseWord(word) {
    sendMessage({ type: "word_chosen", word });
    setWordChosen(true);
    setPhase("drawing");
  }

  function getWordDisplay() {
    return "_ ".repeat(wordLength).trim();
  }

  return (
    <div style={{ padding: 20 }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          Round {round} / {totalRounds}
        </div>
        <div
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: timeLeft <= 10 ? "red" : "black",
          }}
        >
          ⏱ {timeLeft}s
        </div>
        <div>{isDrawer ? "You are drawing!" : `${drawerName} is drawing`}</div>
      </div>

      {/* Word display */}
      {wordChosen && !isDrawer && (
        <div
          style={{
            textAlign: "center",
            fontSize: 22,
            letterSpacing: 8,
            marginBottom: 12,
          }}
        >
          {getWordDisplay()}
        </div>
      )}

      {/* Word selection for drawer */}
      {isDrawer && !wordChosen && (
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <p>Choose a word to draw:</p>
          {wordOptions.map((word) => (
            <button
              key={word}
              onClick={() => chooseWord(word)}
              style={{
                margin: "0 8px",
                padding: "10px 20px",
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              {word}
            </button>
          ))}
        </div>
      )}

      {/* Main game area */}
      <div style={{ display: "flex", gap: 20 }}>
        {/* Scoreboard */}
        <div style={{ width: 150 }}>
          <h4>Players</h4>
          {players.map((p) => (
            <div key={p.id} style={{ marginBottom: 8 }}>
              <div
                style={{
                  fontWeight: p.name === drawerName ? "bold" : "normal",
                }}
              >
                {p.name === drawerName ? "🎨 " : ""}
                {p.name}
              </div>
              <div style={{ color: "gray", fontSize: 13 }}>{p.score} pts</div>
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div>
          <Canvas isDrawer={isDrawer && wordChosen} />
        </div>

        {/* Chat */}
        <div style={{ width: 220 }}>
          <Chat isDrawer={isDrawer} />
        </div>
      </div>
    </div>
  );
}
