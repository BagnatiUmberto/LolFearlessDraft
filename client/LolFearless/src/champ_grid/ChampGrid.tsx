
import hover_sound from "../assets/sound/mouse_hover.flac";
import "./ChampGrid.css";
import champ_roles_json from "../assets/json/champ_roles.json"

type Props = {
  availableChamps: string[]
  removedChamps: string[]
  bannedChamps: string[]
  preSelectedId: string | null
  textFilter: string
  roleFilter: string[]
  onClickHandle: (champ: string) => void
};

function isChampToShow(champ: string, textFilter: string, roleFilter: string[]) {
  const champs_roles_list: { [key: string]: string[] } = champ_roles_json
  let textMatch = false
  let roleMatch = false

  if (champ.toLowerCase().includes(textFilter.toLowerCase()) || textFilter === "none") {
    textMatch = true
  }

  if (roleFilter.length == 0) {
    roleMatch = true
  }
  else {
    if (champ in champs_roles_list) {
      const champ_roles = champs_roles_list[champ]
      for (let role of roleFilter) {
        if (champ_roles.includes(role)) {
          console.log(champs_roles_list[champ])
          console.log(role)
          roleMatch = true
          break
        }
      }
    }
    else {
      console.log("champ not present: " + champ)
    }
  }
  console.log(roleMatch)

  return textMatch && roleMatch

}




function ChampGrid({ availableChamps, removedChamps, bannedChamps, preSelectedId, textFilter, roleFilter, onClickHandle }: Props) {
  const imgs_url = "https://ddragon.leagueoflegends.com/cdn/15.21.1/img/champion/";
  console.log(textFilter)

  return (
    <>
      <div className="champ-grid is-flex is-flex-wrap-wrap is-flex-1">
        {availableChamps.map((champ) => (
          <button
            key={champ}
            disabled={removedChamps.includes(champ) || bannedChamps.includes(champ) ? true : false}
            className={`
              ${removedChamps.includes(champ) || bannedChamps.includes(champ) ? "champ-card-removed" : "champ-card"} ${preSelectedId === champ ? "selected" : ""}
              ${isChampToShow(champ, textFilter, roleFilter) ? "" : "is-hidden"}
              `}
            onClick={() => {
              onClickHandle(champ);
              playHoverSound();
            }}
          >
            <div
              className={`${removedChamps.includes(champ) ? "champ-img-container-removed" : "champ-img-container"}  ${preSelectedId === champ ? "golden-border" : ""
                }`}
            >
              <img
                key={`img-` + champ}
                className={`champ-img ${preSelectedId === champ ? "img-grayscale" : ""
                  }`}
                src={`${imgs_url}${champ}.png`}
                alt={champ}
              />
            </div>

            <p className="has-text-centered">{champ}</p>
          </button>
        ))}
      </div>
    </>
  );

  function playHoverSound() {
    new Audio(hover_sound).play();
  }
}

export default ChampGrid;
