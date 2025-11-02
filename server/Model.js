class Model {
    constructor(roomId, champsList) {
        //general room informations
        this.roomId = roomId

        // match informations - a match is composed by more than 1 game
        this.match = {
            numberOfGames: 3,
            currentGame: 0,
            availableChamps: champsList,
            removedChamps: []
        }

        // teams pick informations
        this.red = {
            teamName: "Red team",
            isReady: false,
            bannedChamps: ["", "", "", "", ""],
            pickedChamps: ["", "", "", "", ""]
        }
        this.blue = {
            teamName: "Blue team",
            isReady: false,
            bannedChamps: ["", "", "", "", ""],
            pickedChamps: ["", "", "", "", ""]
        }
        // timer related
        this.timer = null
        this.turnTime = 30
        this.remainingTime = this.timer

        // game phase related
        this.activePhase = 0
        this.phaseType = "wait" //wait, ban, pick
        this.activeTeam = null
        this.teamHasPicked = false
        this.phases = [
            "waitstart",
            "bluebanchamp1",
            "redbanchamp1",
            "bluebanchamp2",
            "redbanchamp2",
            "bluebanchamp3",
            "redbanchamp3",
            "bluepickchamp1",
            "redpickchamp1",
            "redpickchamp2",
            "bluepickchamp2",
            "bluepickchamp3",
            "redpickchamp3",
            "redbanchamp4",
            "bluebanchamp4",
            "redbanchamp5",
            "bluebanchamp5",
            "redpickchamp4",
            "bluepickchamp4",
            "bluepickchamp5",
            "redpickchamp5"
        ]
    }

    setPlayerReady(team) {
        if (team == "red") {
            this.red.isReady = true
        }
        if (team == "blue") {
            this.blue.isReady = true
        }
    }

    arePlayersReady() {
        if (this.red.isReady && this.blue.isReady)
            return true
        return false
    }

    setPhaseType() {
        const activePhase = this.activePhase
        if (this.phases[activePhase].includes("wait")) {
            this.phaseType = "wait"
            return
        }

        if (this.phases[activePhase].includes("ban")) {
            this.phaseType = "ban"
            return
        }

        if (this.phases[activePhase].includes("pick")) {
            this.phaseType = "pick"
            return
        }

    }

    setActiveTeam() {
        const activePhase = this.activePhase
        if (this.phases[activePhase].includes("red")) {
            this.activeTeam = "red"
            return
        }

        if (this.phases[activePhase].includes("blue")) {
            this.activeTeam = "blue"
            return
        }
        this.activeTeam = null
    }

    setSelectedChamp(selectedChamp) {
        let key = ""
        if (this.phaseType === "ban") {
            key = "bannedChamps"
        }
        if (this.phaseType === "pick") {
            key = "pickedChamps"
        }
        let firstFree = this[this.activeTeam][key].findIndex((champ) => champ === "")
        if (firstFree !== -1) {
            this[this.activeTeam][key][firstFree] = selectedChamp
            this.teamHasPicked = true //reset in nextPhase()
        }
    }


    nextPhase() {
        if (this.activePhase < this.phases.length - 1) {
            this.activePhase += 1
        } else {
            this.activePhase = 0
        }

        this.setPhaseType()
        this.setActiveTeam()
        if (this.phaseType == "ban" || this.phaseType == "pick") {
            this.teamHasPicked = false
            this.remainingTime = this.turnTime
        }

        //Reset on game end
        if (this.phaseType == "wait") {
            this.red.isReady = false
            this.blue.isReady = false
            this.activeTeam = null
            this.teamHasPicked = false
            this.match.currentGame++
            clearInterval(this.timer)
            this.remainingTime = this.turnTime
            this.red.bannedChamps = ["", "", "", "", ""]
            this.red.pickedChamps = ["", "", "", "", ""]
            this.blue.bannedChamps = ["", "", "", "", ""]
            this.blue.pickedChamps = ["", "", "", "", ""]
        }
    }


}

export default Model