import { Server, Socket } from "socket.io"
import express from "express"
import http from "http"
import { randomUUID } from "crypto"

import Model from "./Model.js"

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


function startTimer(model) {
  if (model.timer) {
    clearInterval(model.timer)
  }

  model.timer = setInterval(() => {
    if (model.remainingTime > 0) {
      model.remainingTime--;
    } else {
      model.setSelectedChamp("none")
      model.nextPhase()
    }
    sendModel(model, model.roomId)//sendModel(model,roomId) from app.js
  }, 1000);
}

/* ///////////////// SOCKET CALLBACK FUNCTIONS /////////////////*/
function createRoom(socket) {
  const roomId = randomUUID()
  rooms[roomId] = {
    players: {},
    model: null,
  }
  socket.emit("roomCreated", roomId)
}

async function joinRoom(socket, data) {
  console.log("Joined room")
  const roomId = data.roomId
  const team = data.team

  if (!rooms[roomId]) {
    console.log("Room Error")
    socket.emit("roomError")
    return
  }

  console.log(`Room ID: ${roomId}`)
  const room = rooms[roomId]

  // Check room full
  if (Object.keys(room.players).length >= 2) {
    console.log("Room Full")
    socket.emit("roomFull")
    return
  }

  // Check team not already joined
  if (Object.keys(room.players).length === 1 && room.players[team]) {
    console.log(`Team ${team} already joined`)
    socket.emit("alreadyJoined")
    return
  }

  //Accept the team joining the room
  socket.join(roomId)
  room.players[team] = socket.id
  if (!room.model) {
    room.model = new Model(roomId, champsList)
  }

  socket.data.team = team
  socket.data.roomId = roomId
  sendModel(room.model, roomId)
}

function playerReady(socket) {
  const { roomId, team } = socket.data
  if (!roomId || !team) {
    return
  }
  let model = rooms[roomId].model
  console.log(`Player ready: ${team}`)
  model.setPlayerReady(team)

  // Controlla se entrambi sono ready e starta la partita
  if (model.arePlayersReady()) {
    model.nextPhase()
    startTimer(model)
  }
}

function champSelected(data) {
  const team = data.team
  const selectedChamp = data.selectedChamp
  const roomId = data.roomId
  const model = rooms[roomId].model
  console.log(selectedChamp)
  //prevent Spam
  if (!model.teamHasPicked && model.activeTeam === team && (model.phaseType === "pick" || model.phaseType === "ban")) {
    model.teamHasPicked = true
    model.match.removedChamps.push(selectedChamp)
    model.setSelectedChamp(selectedChamp)
    model.nextPhase()
    startTimer(model)
  }
}


function sendModel(model, roomId) {
  io.to(roomId).emit("modelUpdate", model)
}

function disconnected(socket) {
  console.log("Disconnessione:", socket.id)
  const { roomId, team } = socket.data
  const room = rooms[roomId]

  if (roomId && team && rooms[roomId]) {
    delete room.players[team]
    if (Object.keys(room.players).length === 0) {
      delete rooms[roomId]
    }
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
const champsList = await getChampListAPI()


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

  socket.on("champSelected", (data) => { champSelected(data) })

  //Player disconnected
  socket.on("disconnect", () => { disconnected(socket) })
})

server.listen(3001, () => {
  console.log("🚀 Socket.IO server in ascolto su http://localhost:3001")
})