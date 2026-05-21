import random
import string
import json
from words import get_random_words

rooms = {}


def generate_room_id():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


def create_room(host_name, settings):
    room_id = generate_room_id()
    rooms[room_id] = {
        "hostName": host_name,
        "players": [],
        "settings": {
            "rounds": settings.get("rounds", 3),
            "drawTime": settings.get("drawTime", 80),
        },
        "gameStarted": False,
        "currentRound": 0,
        "currentDrawerIndex": 0,
        "current_word": None,
        "playersGuessed": [],
    }
    return room_id


def get_room(room_id):
    return rooms.get(room_id)


def add_player(room_id, player_id, player_name, websocket):
    rooms[room_id]["players"].append({
        "id": player_id,
        "name": player_name,
        "score": 0,
        "websocket": websocket
    })


def remove_player(room_id, player_id):
    if room_id not in rooms:
        return
    rooms[room_id]["players"] = [p for p in rooms[room_id]["players"] if p["id"] != player_id]
    if len(rooms[room_id]["players"]) == 0:
        del rooms[room_id]


def check_guess(room_id, guess):
    room = get_room(room_id)
    if not room or not room["current_word"]:
        return False
    return guess.strip().lower() == room["current_word"].strip().lower()


def add_score(room_id, player_id, points):
    room = get_room(room_id)
    for player in room["players"]:
        if player["id"] == player_id:
            player["score"] += points
            break


async def broadcast(room_id, message):
    room = get_room(room_id)
    if not room:
        return
    for player in room["players"]:
        try:
            await player["websocket"].send_text(json.dumps(message))
        except:
            pass


async def start_game(room_id):
    room = get_room(room_id)
    if not room:
        return

    room["gameStarted"] = True
    room["currentRound"] = 1
    room["currentDrawerIndex"] = 0
    room["playersGuessed"] = []

    drawer = room["players"][0]
    word_options = get_random_words(3)
    room["wordOptions"] = word_options

    await broadcast(room_id, {
        "type": "round_start",
        "round": room["currentRound"],
        "totalRounds": room["settings"]["rounds"],
        "drawerId": drawer["id"],
        "drawerName": drawer["name"],
        "drawTime": room["settings"]["drawTime"],
        "wordOptions": word_options
    })


async def next_turn(room_id):
    room = get_room(room_id)
    if not room:
        return

    room["playersGuessed"] = []
    room["current_word"] = None
    room["currentDrawerIndex"] += 1

    if room["currentDrawerIndex"] >= len(room["players"]):
        room["currentDrawerIndex"] = 0
        room["currentRound"] += 1

    if room["currentRound"] > room["settings"]["rounds"]:
        sorted_players = sorted(room["players"], key=lambda p: p["score"], reverse=True)
        await broadcast(room_id, {
            "type": "game_over",
            "winner": sorted_players[0]["name"],
            "leaderboard": [{"name": p["name"], "score": p["score"]} for p in sorted_players]
        })
        return

    drawer = room["players"][room["currentDrawerIndex"]]
    word_options = get_random_words(3)
    room["wordOptions"] = word_options

    await broadcast(room_id, {
        "type": "round_start",
        "round": room["currentRound"],
        "totalRounds": room["settings"]["rounds"],
        "drawerId": drawer["id"],
        "drawerName": drawer["name"],
        "drawTime": room["settings"]["drawTime"],
        "wordOptions": word_options
    })