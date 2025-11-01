
import hover_sound from "../assets/sound/mouse_hover.flac";
import "./ChampGrid.css";

type Props = {
  availableChamps: string[]
  removedChamps: string[]
  preSelectedId: string | null
  onClickHandle: (champ: string) => void
};

function ChampGrid({ availableChamps, removedChamps, preSelectedId, onClickHandle }: Props) {
  const imgs_url = "https://ddragon.leagueoflegends.com/cdn/15.21.1/img/champion/";

  return (
    <>
      <div className="grid">
        {availableChamps.map((champ) => (
          <div
            key={champ}
            className={`${removedChamps.includes(champ) ? "champ-card-removed" : "champ-card"} ${preSelectedId === champ ? "selected" : ""
              }`}
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
          </div>
        ))}
      </div>
    </>
  );

  function playHoverSound() {
    new Audio(hover_sound).play();
  }
}

export default ChampGrid;
