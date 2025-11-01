import { CHAMP_ICONS_URL } from '../../config'
import noChampIcon from '../../assets/images/no_selection_icon.jpg'
import "./BanSection.css"

type Props = {
    teamSide: string | null
    champList: string[]
}

function BanSection({ teamSide, champList }: Props) {

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
        <div className="is-flex is-justify-content-space-between">
            {champList.map((champ, index) => (
                <div key={"ban" + teamSide + index} className={`banned-icon ${teamSide === "red" ? "border-red" : "border-blue"}`}
                    style={setBackground(champ)}>
                </div>
            ))}
        </div>
    )
}

export default BanSection