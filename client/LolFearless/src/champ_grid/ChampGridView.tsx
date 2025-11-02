import { useState, useEffect } from "react";
import { useSearchParams, useParams, Link } from "react-router-dom";

import "./ChampGridView.css";

import ChampGrid from "./ChampGrid";
import BanSection from "./pick_column/BanSection";
import SelectionSection from "./pick_column/SelectionSection";
import start_sound from "../assets/sound/start_game.wav";
import champ_sel_sound from "../assets/sound/champ_selected.mp3";

import { socket } from "../socket";


function ChampGridView() {
  const [blueBanned, setBlueBanned] = useState<string[]>(["", "", "", "", ""])
  const [redBanned, setRedBanned] = useState<string[]>(["", "", "", "", ""])
  const [bluePicked, setBluePicked] = useState<string[]>(["", "", "", "", ""])
  const [redPicked, setRedPicked] = useState<string[]>(["", "", "", "", ""])

  const [availableChamps, setAvailableChamps] = useState<string[]>([])
  const [removedChamps, setRemovedChamps] = useState<string[]>([])
  const [gamePhase, setGamePhase] = useState<string>("")
  const [timer, setTimer] = useState<number>(30)
  const [activeTeam, setActiveTeam] = useState<string>("blue")

  const [selectedChamp, setSelectedChamp] = useState<string>("none");
  const [playerReady, setPlayerReady] = useState<boolean>(false)

  const [selectBtnDisabled, setSelectBtnDisabled] = useState<boolean>(false)

  const [searchParams] = useSearchParams()
  const { roomId } = useParams()
  const team = searchParams.get("team")
  //Join error cases
  const [roomFull, setRoomFull] = useState<boolean>(false)
  const [roomError, setRoomError] = useState<boolean>(false)
  const [alreadyJoined, setAlreadyJoined] = useState<boolean>(false)

  const baseUrl = window.location.origin;

  const selectBtnClickHandle = () => {
    if (gamePhase === "wait") {
      setPlayerReady(true)
      socket.emit("playerReady")
      new Audio(start_sound).play()
    }
    else {
      console.log("Sent selected champ" + selectedChamp)
      socket.emit("champSelected", { roomId, selectedChamp, team })
      new Audio(champ_sel_sound).play()
    }
  }

  // Manage the select button disable status
  useEffect(() => {
    const amActivePlayer = team === activeTeam ? true : false
    if (gamePhase === "wait") {
      setSelectBtnDisabled(playerReady)
    } else {
      setSelectBtnDisabled(!amActivePlayer || amActivePlayer && selectedChamp === "none")
    }
  }, [gamePhase, playerReady, selectedChamp])

  /*
  ――――――――――――――――――――――――――――――――――――――――――――――
  ――――――――――――――――――――――――――――――――――――――――――――――
  SOCKET MANAGMENT
  ――――――――――――――――――――――――――――――――――――――――――――――
  ――――――――――――――――――――――――――――――――――――――――――――――
  */
  useEffect(() => {
    console.log(`Room id: ${roomId}`)
    if (!roomId || !team) return
    socket.emit("joinRoom", { roomId, team })

    socket.on("roomFull", () => {
      console.log("Room is full")
      setRoomFull(true)
    })

    socket.on("alreadyJoined", () => {
      console.log(`Team ${team} already joined`)
      setAlreadyJoined(true)
    })

    socket.on("roomError", () => {
      console.log("Room error")
      setRoomError(true)
    })

    socket.on("modelUpdate", (model) => {
      console.log("Update Model")
      console.log(model)
      setRedBanned(model.red.bannedChamps)
      setBlueBanned(model.blue.bannedChamps)
      setRedPicked(model.red.pickedChamps)
      setBluePicked(model.blue.pickedChamps)
      if (availableChamps.length === 0) {
        setAvailableChamps(model.match.availableChamps)
      }
      setRemovedChamps(model.match.removedChamps)
      setActiveTeam(model.activeTeam)
      setTimer(model.remainingTime)
      // New Game reset
      if (model.phaseType == "wait" && model.match.currentGame > 0) {
        setPlayerReady(false)
      }
      setGamePhase(model.phaseType)
    })

    return (() => {
      socket.off("joinRoom")
      socket.off("playerJoined")
      socket.off("startGame")
    })
  }, []);


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
            <div id="timer-container" className="column is-4 has-text-centered">
              <h1 className={`is-size-4 ${activeTeam === "blue" ? "bg-blue" : "bg-red"}`}>{gamePhase === "ban" || gamePhase === "pick" ? timer : ""}</h1>
            </div>
            <div id="search-input-container" className="column is-4 has-text-right">
              <input id="search-input" placeholder="Search" type="text" />
            </div>
          </div>

          <div className="columns is-flex-1">
            <div id="hero-column" className="column is-3 is-flex is-flex-1 is-flex-direction-column">
              <h2>Your Team</h2>
              <BanSection teamSide={team} champList={team === "blue" ? blueBanned : redBanned} />
              <SelectionSection teamSide={team} champList={team === "blue" ? bluePicked : redPicked} />

            </div>

            <div className="column is-6">
              <ChampGrid
                availableChamps={availableChamps}
                removedChamps={removedChamps}
                preSelectedId={selectedChamp}
                onClickHandle={(champ) => setSelectedChamp(champ)}
              />

            </div>

            <div id="opponent-column" className="column is-3 is-flex is-flex-1 is-flex-direction-column">
              <h2>Enemy Team</h2>
              <BanSection teamSide={team === "blue" ? "red" : "blue"} champList={team === "blue" ? redBanned : blueBanned} />
              <SelectionSection teamSide={team === "blue" ? "red" : "blue"} champList={team === "blue" ? redPicked : bluePicked} />
            </div>

          </div>

          <div className="has-text-centered">
            <button id="lockin-btn"
              disabled={selectBtnDisabled}
              onClick={selectBtnClickHandle}>
              {gamePhase === "wait" ? "READY" : "LOCK IN"}
            </button>
          </div>


        </div>
      </>
    )
  }

}

export default ChampGridView;
