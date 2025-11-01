import { CHAMP_ICONS_URL } from '../../config'
import noChampIcon from '../../assets/images/no_selection_icon.jpg'
import "./SelectionSection.css"

type Props = {
    teamSide: string | null
    champList: string[]
}


function SelectionSection({ teamSide, champList }: Props) {
    const setBackground = (champ: string) => {
        if (champ === "") {
            return {
                backgroundImage: "none",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat"
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
        <div className='is-flex is-flex-1 is-flex-direction-column is-justify-content-space-around'>
            {champList.map((champ, index) => (
                <div
                    key={"select" + teamSide + index}
                    className={`mx-auto selected-champ-icon-wrapper ${teamSide === "red" ? "border-red" : "border-blue"}`}
                    style={setBackground(champ)}>
                </div>
            ))}
        </div>
    )

}

export default SelectionSection