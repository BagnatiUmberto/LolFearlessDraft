import { CHAMP_ICONS_URL } from '../../config'
import noChampIcon from '../../assets/images/no_selection_icon.jpg'
import "./SelectionSection.css"

type Props = {
    teamSide: string | null
    champList: string[]
    indexIconBorder: number | null
}


function SelectionSection({ teamSide, champList, indexIconBorder }: Props) {
    const setBackground = (champ: string) => {
        if (champ === "") {
            return {
            }
        }
        if (champ === "none") {
            return {
                backgroundImage: `url(${noChampIcon})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat"
            }
        }

        return {
            backgroundImage: `url(${CHAMP_ICONS_URL}${champ}.png)`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat"
        }


    }

    return (
        <div className='is-flex is-flex-1 is-flex-direction-column is-justify-content-space-around is-align-items-center'>
            {champList.map((champ, index) => (
                <div key={"select" + teamSide + index} className={`champ-wrapper ${indexIconBorder === index ? "rotating-border" : ""}`}>
                    <div className={`selected-champ-icon ${teamSide === "red" ? "border-red" : "border-blue"}`} style={setBackground(champ)}></div>
                </div>

            ))}
        </div>
    )

}

export default SelectionSection