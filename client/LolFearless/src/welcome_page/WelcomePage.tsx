import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

import { socket } from "../socket";
import "./WelcomePage.css";


type Links = {
    red: string
    blue: string
}

library.add(faCopy, faArrowUpRightFromSquare);


function WelcomePage() {
    const [roomId, setRoomId] = useState<string>("")
    const [links, setLinks] = useState<Links>({ red: "", blue: "" });

    const cmdCreateRoom = () => {
        console.log("On Connect")
        socket.emit("createRoom")
    }

    const onRoomCreated = (id: string) => {
        setRoomId(id);
        const baseUrl = window.location.origin;
        setLinks({
            blue: `${baseUrl}/room/${id}?team=blue`,
            red: `${baseUrl}/room/${id}?team=red`,
        });
    }

    useEffect(() => {
        console.log("Use effect")
        if (!socket.connected) {
            socket.on("connect", cmdCreateRoom)
        } else {
            cmdCreateRoom()
        }

        socket.on("roomCreated", onRoomCreated)

        return (() => {
            socket.off("connect", cmdCreateRoom)
            socket.off("roomCreated", onRoomCreated)
        })

    }, [])

    return (
        <>
            <section className="hero">
                <div className="hero-body">
                    <p className="title">WELCOME TO LOL FEARLESS DRAFT
                    </p>
                    <p className="subtitle">Simulator</p>
                </div>
            </section>
            <section className="section" id="red-team">
                <h2 className="title">Red team room: </h2>
                <div id="red-wrapper" className="columns is-mobile">
                    <div className="column is-10">
                        <input id="red-link-input" className=" input is-info" type="text" value={links.red} placeholder={links.red} readOnly={true} />
                    </div>
                    <div className="column is-1 is-flex is-justify-content-center is-align-items-center">
                        <Link to={`/room/${roomId}?team=red`} target="_blank">
                            <button>
                                <FontAwesomeIcon icon="arrow-up-right-from-square" />
                            </button>
                        </Link>
                    </div>
                    <div className="column is-1 is-flex is-justify-content-center is-align-items-center">
                        <button onClick={() => {
                            navigator.clipboard.writeText(links.red)
                        }}>
                            <FontAwesomeIcon icon="copy" />
                        </button>
                    </div>
                </div>
            </section >

            <section className="section" id="blue-team">
                <h2 className="title">Blue team room: </h2>
                <div id="blue-wrapper" className="columns is-mobile">
                    <div className="column is-10">
                        <input id="blue-link-input" className=" input is-info" type="text" value={links.blue} placeholder={links.blue} readOnly={true} />
                    </div>
                    <div className="column is-1 is-flex is-justify-content-center is-align-items-center">
                        <Link to={`/room/${roomId}?team=blue`} target="_blank">
                            <button>
                                <FontAwesomeIcon icon="arrow-up-right-from-square" />
                            </button>
                        </Link>
                    </div>
                    <div className="column is-1 is-flex is-justify-content-center is-align-items-center">
                        <button onClick={() => { navigator.clipboard.writeText(links.blue) }}><FontAwesomeIcon icon="copy" /></button>
                    </div>
                </div>
            </section>
        </>
    );
}

export default WelcomePage;
