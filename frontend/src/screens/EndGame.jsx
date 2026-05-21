// EndGame.jsx
// Game over screen — shows winner and leaderboard

export default function EndGame({ winner, leaderboard, onPlayAgain }) {
  return (
    <div
      style={{
        padding: 40,
        maxWidth: 400,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <h1>🏆 Game Over!</h1>
      <h2>{winner} wins!</h2>

      <h3>Leaderboard</h3>
      {leaderboard.map((player, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 0",
            borderBottom: "1px solid #eee",
          }}
        >
          <span>
            #{index + 1} {player.name}
          </span>
          <span>{player.score} pts</span>
        </div>
      ))}

      <button
        onClick={onPlayAgain}
        style={{
          marginTop: 24,
          padding: "12px 24px",
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        Play Again
      </button>
    </div>
  );
}
