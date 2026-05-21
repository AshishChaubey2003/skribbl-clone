from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from game_logic import create_room, add_player, remove_player, get_room, broadcast
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"status": "server running"}

@app.get("/check-room/{room_id}")
def check_room(room_id: str):
    room = get_room(room_id)
    return {"exists": room is not None}

@app.post("/create-room")
def create_new_room(data: dict):
    room_id = create_room(data["hostName"], data["settings"])
    return {"roomId": room_id}


@app.websocket("/ws/{room_id}/{player_name}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, player_name: str):
    await websocket.accept()
    player_id = str(id(websocket))

    room = get_room(room_id)
    if not room:
        await websocket.send_text(json.dumps({"type": "error", "message": "Room not found"}))
        await websocket.close()
        return

    add_player(room_id, player_id, player_name, websocket)

    await broadcast(room_id, {
        "type": "player_joined",
        "playerName": player_name,
        "players": [{"id": p["id"], "name": p["name"], "score": p["score"]} for p in room["players"]]
    })

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type = message.get("type")

            if msg_type == "draw":
                await broadcast(room_id, {"type": "draw_data", "draw": message["draw"]})

            elif msg_type == "canvas_clear":
                await broadcast(room_id, {"type": "canvas_clear"})

            elif msg_type == "draw_undo":
                await broadcast(room_id, {"type": "draw_undo"})

            elif msg_type == "chat":
                await broadcast(room_id, {"type": "chat_message", "playerName": player_name, "text": message["text"]})

            elif msg_type == "guess":
                from game_logic import check_guess, add_score
                correct = check_guess(room_id, message["text"])
                if correct:
                    add_score(room_id, player_id, 100)
                    await broadcast(room_id, {
                        "type": "guess_result",
                        "correct": True,
                        "playerName": player_name,
                        "players": [{"id": p["id"], "name": p["name"], "score": p["score"]} for p in room["players"]]
                    })
                else:
                    await broadcast(room_id, {"type": "chat_message", "playerName": player_name, "text": message["text"]})

            elif msg_type == "word_chosen":
                room["current_word"] = message["word"]
                await broadcast(room_id, {
                    "type": "game_state",
                    "phase": "drawing",
                    "drawerId": player_id,
                    "wordLength": len(message["word"])
                })

            elif msg_type == "start_game":
                from game_logic import start_game
                await start_game(room_id)

    except WebSocketDisconnect:
        remove_player(room_id, player_id)
        room = get_room(room_id)
        if room:
            await broadcast(room_id, {
                "type": "player_left",
                "playerName": player_name,
                "players": [{"id": p["id"], "name": p["name"], "score": p["score"]} for p in room["players"]]
            })
            
            