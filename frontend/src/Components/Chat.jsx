// Chat.jsx
// Chat box + guessing — guessers type here to guess the word

import { useEffect, useRef, useState } from "react";
import { onMessage, sendMessage, offMessage } from "../socket";

export default function Chat({ isDrawer }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    function handleChatMessage(msg) {
      setMessages((prev) => [
        ...prev,
        { type: "chat", name: msg.playerName, text: msg.text },
      ]);
    }

    function handleGuessResult(msg) {
      if (msg.correct) {
        setMessages((prev) => [
          ...prev,
          {
            type: "correct",
            name: msg.playerName,
            text: "guessed the word! 🎉",
          },
        ]);
      }
    }

    onMessage("chat_message", handleChatMessage);
    onMessage("guess_result", handleGuessResult);

    return () => {
      offMessage("chat_message", handleChatMessage);
      offMessage("guess_result", handleGuessResult);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendChat() {
    if (!input.trim()) return;

    if (isDrawer) {
      sendMessage({ type: "chat", text: input });
    } else {
      sendMessage({ type: "guess", text: input });
    }

    setInput("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") sendChat();
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: 400,
        border: "1px solid #ccc",
        borderRadius: 8,
      }}
    >
      <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: 6,
              color: msg.type === "correct" ? "green" : "#000",
            }}
          >
            <strong>{msg.name}:</strong> {msg.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", borderTop: "1px solid #ccc" }}>
        <input
          placeholder={isDrawer ? "Chat..." : "Type your guess..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            padding: 10,
            border: "none",
            outline: "none",
            fontSize: 14,
          }}
        />
        <button
          onClick={sendChat}
          style={{ padding: "10px 16px", cursor: "pointer" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
