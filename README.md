# 🎨 Skribbl Clone

A real-time multiplayer drawing and guessing game built as an intern assignment.
Players take turns drawing a word while others try to guess it in real time.

## 🌐 Live Demo

**Frontend:** https://skribbl-clone-theta.vercel.app  
**Backend:** https://skribbl-clone-qxao.onrender.com

> ⚠️ The backend is hosted on Render free tier.
> It may take 30-50 seconds to wake up on first request.

---

## 🎮 How to Play

1. Open the live URL
2. Enter your name
3. Click **Create Room** to host a game
4. Share the room code with friends
5. Friends enter the code and click **Join Room**
6. Host clicks **Start Game** (minimum 2 players)
7. Drawer picks a word and draws it on the canvas
8. Others type guesses in the chat
9. Correct guess = points!
10. Most points at the end wins 🏆

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Python + FastAPI |
| Real-time | WebSockets |
| Canvas | HTML5 Canvas API |
| Deployment | Vercel + Render |

---

## 🚀 Run Locally

### Prerequisites
- Node.js installed
- Python 3.x installed

### 1. Clone the repo
```bash
git clone https://github.com/AshishChaubey2003/skribbl-clone.git
cd skribbl-clone
```

### 2. Run Backend
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`

### 3. Run Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 4. Update URLs for local development
In `frontend/src/socket.js` change:
wss://skribbl-clone-qxao.onrender.com → ws://localhost:8000
In `frontend/src/App.jsx` change:
https://skribbl-clone-qxao.onrender.com → http://localhost:8000

---

## 📁 Project Structure
skribbl-clone/
│
├── backend/
│   ├── main.py          # FastAPI server + WebSocket handlers
│   ├── game_logic.py    # Room, player, scoring, round logic
│   ├── words.py         # Word list
│   └── requirements.txt
│
└── frontend/
└── src/
├── App.jsx              # Screen controller
├── socket.js            # WebSocket connection
├── screens/
│   ├── Home.jsx         # Create/Join room
│   ├── Lobby.jsx        # Waiting room
│   ├── Game.jsx         # Main game screen
│   └── EndGame.jsx      # Winner screen
└── Components/
├── Canvas.jsx       # Drawing board + tools
└── Chat.jsx         # Chat + guessing

---

## ✨ Features

- Create or join rooms with a 6-digit room code
- Real-time drawing sync using WebSockets
- Color picker, brush sizes, eraser, undo, clear
- Turn-based rounds — everyone gets to draw
- Chat and guessing system
- Points for correct guesses
- Leaderboard and winner screen at game end
- Configurable rounds and draw time

---

## 👨‍💻 Author

**Ashish Chaubey**  
GitHub: [@AshishChaubey2003](https://github.com/AshishChaubey2003)
