class Game {
    constructor() {
        this.activePhase = 0
        this.remainingTime = 10
        this.phaseType = "wait"
        this.activePlayer = "blue"
        this.playerHasPicked = false
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
            "redpickchamp5",
            "end"
        ]
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

    setActivePlayer() {
        const activePhase = this.activePhase
        if (this.phases[activePhase].includes("red")) {
            this.activePlayer = "red"
            return
        }

        if (this.phases[activePhase].includes("blue")) {
            this.activePlayer = "blue"
            return
        }
    }

    setSelectedChamp(model, team, selectedChamp) {
        if (!this.playerHasPicked) {
            if (model.game.phaseType === "ban") {
                let firstFree = model[team + "Team"].bannedChamps.findIndex((champ) => champ === "")
                model[team + "Team"].bannedChamps[firstFree] = selectedChamp
            }
            if (model.game.phaseType === "pick") {
                let firstFree = model[team + "Team"].pickedChamps.findIndex((champ) => champ === "")
                model[team + "Team"].pickedChamps[firstFree] = selectedChamp
            }
        }
        this.playerHasPicked = true
    }


    nextPhase() {
        if (this.activePhase < this.phases.length - 1) {
            this.activePhase += 1
        } else {
            this.activePhase = 0
        }
        this.setPhaseType()
        this.setActivePlayer()
        this.remainingTime = 10
    }
}

export default Game