import { Server, Socket } from "socket.io"
import express from "express"
import http from "http"
import { randomUUID } from "crypto"

import Game from "./Game.js"


/*
――――――――――――――――――――――――――――――――――――――――――――――
――――――――――――――――――――――――――――――――――――――――――――――
CLASSES DECLARATION
――――――――――――――――――――――――――――――――――――――――――――――
――――――――――――――――――――――――――――――――――――――――――――――
*/
class Model {
  constructor() {
    this.match = {
      numberOfGames: 3,
      currentRound: 1,
      availableChamps: [],
      removedChamps: []
    }
    this.game = new Game(),
      this.redTeam = {
        teamName: "Red team",
        bannedChamps: ["", "", "", "", ""],
        pickedChamps: ["", "", "", "", ""]
      }
    this.blueTeam = {
      teamName: "Blue team",
      bannedChamps: ["", "", "", "", ""],
      pickedChamps: ["", "", "", "", ""]
    }
  }
}

/*
――――――――――――――――――――――――――――――――――――――――――――――
――――――――――――――――――――――――――――――――――――――――――――――
FUNCTIONS DECLARATION
――――――――――――――――――――――――――――――――――――――――――――――
――――――――――――――――――――――――――――――――――――――――――――――
*/

/* ///////////////// GENERAL FUNCTIONS /////////////////*/
const getChampListAPI = async () => {
  let response_body = await fetch("https://ddragon.leagueoflegends.com/cdn/15.21.1/data/en_US/champion.json")
    .then((res) => res.json())
    .then((json) => { return json })
  let champs_arr = [];
  for (let key in response_body.data) {
    champs_arr.push(key)
  }
  return champs_arr
}

function startTimer(model, roomId) {
  if (model.timer) clearInterval(model.timer);

  model.timer = setInterval(() => {
    const game = model.game;
    if (game.remainingTime > 0) {
      game.remainingTime--;
    } else {
      model.game.setSelectedChamp(model, model.game.activePlayer, "none")
      game.nextPhase();
    }
    sendModel(model, roomId);
  }, 1000);
}

/* ///////////////// SOCKET CALLBACK FUNCTIONS /////////////////*/
function createRoom(socket) {
  const roomId = randomUUID()
  rooms[roomId] = {
    players: {},
    ready: {},
    model: null,
    timer: null
  }
  socket.emit("roomCreated", roomId)
}

async function joinRoom(socket, data) {
  console.log("Joined room")
  const roomId = data.roomId
  const team = data.team

  if (!rooms[roomId]) return socket.emit("roomError", "Room non esiste")
  const room = rooms[roomId]

  if (Object.keys(room.players).length >= 2)
    return socket.emit("roomFull")

  socket.join(roomId)
  room.players[team] = socket.id
  room.ready[team] = false
  if (!room.model) {
    room.model = new Model()
    room.model.match.availableChamps = await getChampListAPI()
  }
  socket.data.team = team
  socket.data.roomId = roomId
  sendModel(room.model, roomId)
}

function playerReady(socket) {
  const { roomId, team } = socket.data
  if (!roomId || !team) return

  console.log(`Player ready: ${team}`)
  rooms[roomId].ready[team] = true

  // Controlla se entrambi sono ready e starta la partita
  const readyStatus = Object.values(rooms[roomId].ready)
  if (readyStatus.every(Boolean) && readyStatus.length === 2) {
    let room = rooms[roomId]
    room.model.game.nextPhase()
    sendModel(room.model, roomId)
    startTimer(room.model, roomId)
  }
}

function champSelected(socket, data) {
  const team = data.team
  const selectedChamp = data.selectedChamp
  const roomId = data.roomId
  const room = rooms[roomId]
  const model = room.model

  model.match.removedChamps.push(selectedChamp)

  model.game.setSelectedChamp(model, team, selectedChamp)
  console.log(model)
  model.game.nextPhase()
  startTimer(room.model, roomId)
}

function sendModel(model, roomId) {
  io.to(roomId).emit("modelUpdate", model)
}

function disconnected(socket) {
  console.log("Disconnessione:", socket.id)
  const { roomId, team } = socket.data
  if (roomId && team && rooms[roomId]) {
    delete rooms[roomId].players[team]
    delete rooms[roomId].ready[team]
    delete rooms[roomId]
    console.log("Deleted room: " + roomId)
  }
}

/*
――――――――――――――――――――――――――――――――――――――――――――――
――――――――――――――――――――――――――――――――――――――――――――――
VARIABLES DECLARATION
――――――――――――――――――――――――――――――――――――――――――――――
――――――――――――――――――――――――――――――――――――――――――――――
*/
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // URL della tua app React
    methods: ["GET", "POST"],
  },
})

const rooms = {} // memorizza lo stato delle room


/*
――――――――――――――――――――――――――――――――――――――――――――――
――――――――――――――――――――――――――――――――――――――――――――――
SOCKET MANAGMENT
――――――――――――――――――――――――――――――――――――――――――――――
――――――――――――――――――――――――――――――――――――――――――――――
*/
io.on("connection", (socket) => {
  console.log("🔌 Nuova connessione:", socket.id)

  // Creazione della room
  socket.on("createRoom", () => { createRoom(socket) })

  // Join a una room
  socket.on("joinRoom", (data) => { joinRoom(socket, data) })

  // Ready
  socket.on("playerReady", () => { playerReady(socket) })

  socket.on("champSelected", (data) => { champSelected(socket, data) })

  //Player disconnected
  socket.on("disconnected", () => { disconnected(socket) })
})

server.listen(3001, () => {
  console.log("🚀 Socket.IO server in ascolto su http://localhost:3001")
})