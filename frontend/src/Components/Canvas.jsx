// Canvas.jsx
// Drawing board — only drawer can draw, others watch in real time

import { useEffect, useRef, useState } from "react";
import { sendMessage, onMessage, offMessage } from "../socket";

export default function Canvas({ isDrawer }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);
  const strokes = useRef([]); // Stores all strokes for undo

  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState("pen"); // "pen" or "eraser"

  const COLORS = [
    "#000000",
    "#ffffff",
    "#ef4444",
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
  ];

  useEffect(() => {
    function handleDrawData(msg) {
      drawStroke(msg.draw);
    }

    function handleCanvasClear() {
      clearCanvas();
    }

    function handleDrawUndo() {
      undoStroke();
    }

    onMessage("draw_data", handleDrawData);
    onMessage("canvas_clear", handleCanvasClear);
    onMessage("draw_undo", handleDrawUndo);

    return () => {
      offMessage("draw_data", handleDrawData);
      offMessage("canvas_clear", handleCanvasClear);
      offMessage("draw_undo", handleDrawUndo);
    };
  }, []);

  function getPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function drawStroke(draw) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.moveTo(draw.x1, draw.y1);
    ctx.lineTo(draw.x2, draw.y2);
    ctx.strokeStyle = draw.color;
    ctx.lineWidth = draw.size;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  function onMouseDown(e) {
    if (!isDrawer) return;
    isDrawing.current = true;
    lastPos.current = getPos(e);
    strokes.current.push([]); // New stroke started
  }

  function onMouseMove(e) {
    if (!isDrawer || !isDrawing.current) return;

    const currentPos = getPos(e);
    const drawColor = tool === "eraser" ? "#ffffff" : color;

    const stroke = {
      x1: lastPos.current.x,
      y1: lastPos.current.y,
      x2: currentPos.x,
      y2: currentPos.y,
      color: drawColor,
      size: brushSize,
    };

    drawStroke(stroke);
    strokes.current[strokes.current.length - 1].push(stroke);

    sendMessage({ type: "draw", draw: stroke });

    lastPos.current = currentPos;
  }

  function onMouseUp() {
    isDrawing.current = false;
    lastPos.current = null;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.current = [];
  }

  function undoStroke() {
    strokes.current.pop();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Redraw all remaining strokes
    strokes.current.forEach((stroke) => {
      stroke.forEach((s) => drawStroke(s));
    });
  }

  function handleClear() {
    clearCanvas();
    sendMessage({ type: "canvas_clear" });
  }

  function handleUndo() {
    undoStroke();
    sendMessage({ type: "draw_undo" });
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        style={{
          border: "2px solid #333",
          background: "#fff",
          cursor: isDrawer ? "crosshair" : "default",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      />

      {isDrawer && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {COLORS.map((c) => (
            <div
              key={c}
              onClick={() => {
                setColor(c);
                setTool("pen");
              }}
              style={{
                width: 28,
                height: 28,
                background: c,
                border:
                  color === c && tool === "pen"
                    ? "3px solid #000"
                    : "1px solid #ccc",
                cursor: "pointer",
                borderRadius: 4,
              }}
            />
          ))}

          <button
            onClick={() => setTool("eraser")}
            style={{
              padding: "4px 10px",
              background: tool === "eraser" ? "#ddd" : "#fff",
              cursor: "pointer",
            }}
          >
            Eraser
          </button>

          <select
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
          >
            <option value={2}>Thin</option>
            <option value={4}>Medium</option>
            <option value={8}>Thick</option>
            <option value={16}>Very Thick</option>
          </select>

          <button
            onClick={handleUndo}
            style={{ padding: "4px 10px", cursor: "pointer" }}
          >
            Undo
          </button>
          <button
            onClick={handleClear}
            style={{ padding: "4px 10px", cursor: "pointer", color: "red" }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
