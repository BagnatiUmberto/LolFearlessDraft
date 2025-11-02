import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "react-router-dom";

import "./ChampGridView.css";

import ChampGrid from "./ChampGrid";
import BanSection from "./pick_column/BanSection";
import SelectionSection from "./pick_column/SelectionSection";

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

  const [searchParams] = useSearchParams();
  const { roomId } = useParams();
  const team = searchParams.get("team");

  const selectBtnClickHandle = () => {
    if (gamePhase === "wait") {
      setPlayerReady(true)
      socket.emit("playerReady")
    }
    else {
      console.log("Sent selected champ" + selectedChamp)
      socket.emit("champSelected", { roomId, selectedChamp, team })
    }
  }

  // Manage the select button disable status
  useEffect(() => {
    const amActivePlayer = team === activeTeam ? true : false
    console.log(`Selected champ ${selectedChamp}`)
    console.log(`Am I active: ${amActivePlayer}`)
    console.log(`Game phase: ${gamePhase}`)
    console.log(`Player ready: ${playerReady}`)

    if (gamePhase === "wait") {
      setSelectBtnDisabled(playerReady)
    } else {
      setSelectBtnDisabled(!amActivePlayer || amActivePlayer && selectedChamp === "none")
    }
  }, [gamePhase, playerReady, selectedChamp])

  //Socket.IO states
  useEffect(() => {
    if (!roomId || !team) return;
    socket.emit("joinRoom", { roomId, team });

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
      console.log(`current game: ${model.match.currentGame}`)
      if (model.phaseType == "wait" && model.match.currentGame > 0) {
        setPlayerReady(false)
      }
      setGamePhase(model.phaseType)
    })

    return (() => {
      socket.emit("disconnected")
      socket.off("joinRoom")
      socket.off("playerJoined")
      socket.off("startGame")
    })
  }, [roomId, team]);


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
  );
}

export default ChampGridView;
