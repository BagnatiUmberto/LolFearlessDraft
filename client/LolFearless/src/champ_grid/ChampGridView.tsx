import { useState, useEffect } from "react"
import { useSearchParams, useParams, Link } from "react-router-dom"

import "./ChampGridView.css"

import ChampGrid from "./ChampGrid"
import BanSection from "./pick_column/BanSection"
import SelectionSection from "./pick_column/SelectionSection"
import start_sound from "../assets/sound/start_game.wav"
import champ_sel_sound from "../assets/sound/champ_selected.mp3"
import clock from "../assets/sound/clock.wav"

import { socket } from "../socket"

type Match = {
  numberOfGames: number
  currentGame: number
  availableChamps: string[]
  removedChamps: string[]
}

type Team = {
  teamName: string
  isReady: boolean
  bannedChamps: string[]
  pickedChamps: string[]

}

type Model = {
  roomId: string
  match: Match
  blue: Team
  red: Team
  turnTime: number
  remainingTime: number
  activePhase: number
  phaseType: string //wait, ban, pick
  activeTeam: string | null
  teamHasPicked: boolean
  phases: string[]
}

function ChampGridView() {
  const [model, setModel] = useState<Model>({
    roomId: "",
    match: {
      numberOfGames: 3,
      currentGame: 0,
      availableChamps: [],
      removedChamps: []
    },
    blue: {
      teamName: "",
      isReady: false,
      bannedChamps: [],
      pickedChamps: []
    },
    red: {
      teamName: "",
      isReady: false,
      bannedChamps: [],
      pickedChamps: []
    },
    turnTime: 30,
    remainingTime: 30,
    activePhase: 0,
    phaseType: "",
    activeTeam: "",
    teamHasPicked: false,
    phases: []
  })

  const [selectedChamp, setSelectedChamp] = useState<string>("none")
  const [playerReady, setPlayerReady] = useState<boolean>(false)

  const [selectBtnDisabled, setSelectBtnDisabled] = useState<boolean>(false)

  const [searchParams] = useSearchParams()
  const { roomId } = useParams()
  const team = searchParams.get("team")
  //Join error cases
  const [roomFull, setRoomFull] = useState<boolean>(false)
  const [roomError, setRoomError] = useState<boolean>(false)
  const [alreadyJoined, setAlreadyJoined] = useState<boolean>(false)
  const [textFilter, setTextFilter] = useState<string>("none")
  const [redBanIndex, setRedBanIndex] = useState<number | null>(null)
  const [blueBanIndex, setBlueBanIndex] = useState<number | null>(null)
  const [redPickIndex, setRedPickIndex] = useState<number | null>(null)
  const [bluePickIndex, setBluePickIndex] = useState<number | null>(null)

  const baseUrl = window.location.origin

  /*
  ――――――――――――――――――――――――――――――――――――――――――――――
  ――――――――――――――――――――――――――――――――――――――――――――――
  LOGIC FUNCTIONS
  ――――――――――――――――――――――――――――――――――――――――――――――
  ――――――――――――――――――――――――――――――――――――――――――――――
  */
  const selectBtnClickHandle = () => {
    if (model.phaseType === "wait") {
      setPlayerReady(true)
      socket.emit("playerReady")
      new Audio(start_sound).play()
    }
    else {
      console.log("Sent selected champ" + selectedChamp)
      socket.emit("champSelected", { roomId, selectedChamp, team })
      setSelectedChamp("none")
      new Audio(champ_sel_sound).play()
    }
  }

  // Manage the select button disable status
  useEffect(() => {
    const amActivePlayer = team === model.activeTeam ? true : false
    if (model.phaseType === "wait") {
      setSelectBtnDisabled(playerReady)
    } else {
      setSelectBtnDisabled(!amActivePlayer || amActivePlayer && selectedChamp === "none")
    }
  }, [model, playerReady, selectedChamp])

  const filterChamps = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value)
    setTextFilter(e.target.value)
  }

  //Set the rotating icon border on selecting champ
  useEffect(() => {
    setRedBanIndex(null)
    setRedPickIndex(null)
    setBlueBanIndex(null)
    setBluePickIndex(null)

    if (model.activeTeam === "blue" && model.phaseType === "ban") {
      let index = model.blue.bannedChamps.indexOf("")
      setBlueBanIndex(index !== -1 ? index : null)
    }
    if (model.activeTeam === "blue" && model.phaseType === "pick") {
      let index = model.blue.pickedChamps.indexOf("")
      setBluePickIndex(index !== -1 ? index : null)
    }

    if (model.activeTeam === "red" && model.phaseType === "ban") {
      let index = model.red.bannedChamps.indexOf("")
      setRedBanIndex(index !== -1 ? index : null)
    }
    if (model.activeTeam === "red" && model.phaseType === "pick") {
      let index = model.red.pickedChamps.indexOf("")
      setRedPickIndex(index !== -1 ? index : null)
    }

  }, [model])



  /*
  ――――――――――――――――――――――――――――――――――――――――――――――
  ――――――――――――――――――――――――――――――――――――――――――――――
  SOCKET MANAGMENT
  ――――――――――――――――――――――――――――――――――――――――――――――
  ――――――――――――――――――――――――――――――――――――――――――――――
  */
  useEffect(() => {
    //Connection
    socket.connect()

    //Request joining room
    socket.on("connect", () => {
      console.log(`Room id: ${roomId}`)
      if (!roomId || !team) return
      socket.emit("joinRoom", { roomId, team })
    })

    //Manage the ROOM FULL event
    socket.on("roomFull", () => {
      console.log("Room is full")
      setRoomFull(true)
    })

    //Manage the ALREADY JOINED event
    socket.on("alreadyJoined", () => {
      console.log(`Team ${team} already joined`)
      setAlreadyJoined(true)
    })

    //Manage the GENERIC ROOM ERROR event
    socket.on("roomError", () => {
      console.log("Room error")
      setRoomError(true)
    })

    //Manage the  event
    socket.on("modelUpdate", (_model) => {
      console.log("Update Model")
      console.log(_model)
      setModel(_model)
      // New Game reset
      if (_model.phaseType == "wait" && _model.match.currentGame > 0) {
        setPlayerReady(false)
      }
      if (_model.remainingTime < 10) {
        new Audio(clock).play()
      }
    })

    return (() => {
      socket.off()
      socket.emit("leavingChampSelect")
      socket.disconnect()
    })
  }, [])


  if (roomFull || roomError || alreadyJoined) {
    return (
      <div className="is-flex is-flex-direction-column is-fullwidth is-fullheight is-justify-content-center is-align-items-center">
        {roomError ? <><h1 className="is-size-1">Oops, something went wrong...</h1></> : ""}
        {!roomError && roomFull ? <><h1 className="is-size-1">The room is full</h1> <h5 className="is-size-5">Please visit this link to open a new room</h5></> : ""}
        {!roomError && alreadyJoined ? <><h1 className="is-size-1">The team {team} already joined</h1><h5 className="is-size-5">Please open the provided link or visit this link to open a new room</h5></> : ""}

        <Link to={`/`} target="_blank">{baseUrl}</Link>
      </div>)

  } else {
    return (
      <>
        <div id="summoner-rift-bg" className="container is-fluid is-flex is-flex-direction-column">
          <div className="columns is-vcentered">
            <div id="role-filter" className="column is-4"></div>
            <div id="timer-container" className="column has-text-centered">
              <h1 className={`is-size-4 ${model.activeTeam === "blue" ? "bg-blue" : "bg-red"}`} style={{ width: (model.remainingTime / model.turnTime) * 100 + '%' }}>
                {model.phaseType === "ban" || model.phaseType === "pick" ? model.remainingTime : ""}
              </h1>
            </div>
            <div id="search-input-container" className="column is-4 has-text-right">
              <input id="search-input" placeholder="Search" type="text" onChange={(e) => { filterChamps(e) }} />
            </div>
          </div>

          <div className="columns is-flex-1" style={{ "minHeight": 0 }}>
            <div id="hero-column" className="column is-flex is-flex-1 is-flex-direction-column">
              <h2>Your Team</h2>
              <BanSection
                teamSide={team}
                champList={team === "blue" ? model.blue.bannedChamps : model.red.bannedChamps}
                indexIconBorder={team === "blue" ? blueBanIndex : redBanIndex} />
              <SelectionSection teamSide={team}
                champList={team === "blue" ? model.blue.pickedChamps : model.red.pickedChamps}
                indexIconBorder={team === "blue" ? bluePickIndex : redPickIndex} />
            </div>

            <div className="column is-two-fifths is-flex is-flex-1">
              <ChampGrid
                availableChamps={model.match.availableChamps}
                removedChamps={model.match.removedChamps}
                bannedChamps={model.red.bannedChamps.concat(model.blue.bannedChamps)}
                preSelectedId={selectedChamp}
                textFilter={textFilter}
                onClickHandle={(champ) => setSelectedChamp(champ)}
              />

            </div>

            <div id="opponent-column" className="column is-flex is-flex-direction-column">
              <h2>Enemy Team</h2>
              <BanSection
                teamSide={team === "blue" ? "red" : "blue"}
                champList={team === "blue" ? model.red.bannedChamps : model.blue.bannedChamps}
                indexIconBorder={team === "blue" ? redBanIndex : blueBanIndex} />
              <SelectionSection
                teamSide={team === "blue" ? "red" : "blue"}
                champList={team === "blue" ? model.red.pickedChamps : model.blue.pickedChamps}
                indexIconBorder={team === "blue" ? redPickIndex : bluePickIndex} />
            </div>

          </div>

          <div className="has-text-centered">
            <button id="lockin-btn"
              disabled={selectBtnDisabled}
              onClick={selectBtnClickHandle}>
              {model.phaseType === "wait" ? "READY" : "LOCK IN"}
            </button>
          </div>


        </div>
      </>
    )
  }

}

export default ChampGridView
