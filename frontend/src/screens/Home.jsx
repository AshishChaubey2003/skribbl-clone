// Home.jsx
// First screen — enter name, create or join room

import { useState } from "react";

export default function Home({ onCreateRoom, onJoinRoom }) {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [rounds, setRounds] = useState(3);
  const [drawTime, setDrawTime] = useState(80);

  function handleCreate() {
    if (!name) return alert("Enter your name");
    onCreateRoom(name, { rounds, drawTime });
  }

  function handleJoin() {
    if (!name) return alert("Enter your name");
    if (!roomCode) return alert("Enter room code");
    onJoinRoom(name, roomCode.toUpperCase());
  }

  return (
    <div style={{ padding: 40, maxWidth: 500, margin: "0 auto" }}>
      <h1>🎨 Skribbl Clone</h1>

      <input
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          display: "block",
          width: "100%",
          padding: 10,
          marginBottom: 20,
          fontSize: 16,
        }}
      />

      <div
        style={{
          border: "1px solid #ccc",
          padding: 20,
          marginBottom: 20,
          borderRadius: 8,
        }}
      >
        <h3>Create Room</h3>
        <label>Rounds: </label>
        <select
          value={rounds}
          onChange={(e) => setRounds(Number(e.target.value))}
          style={{ marginBottom: 10 }}
        >
          {[2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <br />
        <label>Draw Time (seconds): </label>
        <select
          value={drawTime}
          onChange={(e) => setDrawTime(Number(e.target.value))}
          style={{ marginBottom: 10 }}
        >
          {[40, 60, 80, 100, 120].map((t) => (
            <option key={t} value={t}>
              {t}s
            </option>
          ))}
        </select>
        <br />
        <button
          onClick={handleCreate}
          style={{ padding: "10px 20px", cursor: "pointer" }}
        >
          Create Room
        </button>
      </div>

      <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 8 }}>
        <h3>Join Room</h3>
        <input
          placeholder="Room Code (e.g. ABC123)"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            padding: 10,
            marginBottom: 10,
            fontSize: 16,
          }}
        />
        <button
          onClick={handleJoin}
          style={{ padding: "10px 20px", cursor: "pointer" }}
        >
          Join Room
        </button>
      </div>
    </div>
  );
}
