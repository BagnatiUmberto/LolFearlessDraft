
import hover_sound from "../assets/sound/mouse_hover.flac";
import "./ChampGrid.css";

type Props = {
  availableChamps: string[]
  removedChamps: string[]
  bannedChamps: string[]
  preSelectedId: string | null
  textFilter: string
  onClickHandle: (champ: string) => void
};

function ChampGrid({ availableChamps, removedChamps, bannedChamps, preSelectedId, textFilter, onClickHandle }: Props) {
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
              ${(champ.toLowerCase().includes(textFilter.toLowerCase()) || textFilter === "none") ? "" : "is-hidden"}
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
