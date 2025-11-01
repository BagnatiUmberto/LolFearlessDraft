import { Link } from "react-router-dom";
import logo from "../assets/images/League-of-Legends-Logo.png"

import "./Header.css"
function Header() {
    return (
        <header className="hero">
            <div className="hero-head">
                <nav className="navbar">
                    <div className="container">
                        <div className="navbar-brand">
                            <Link to="/" className="navbar-item">
                                <img src={logo} alt="" />
                            </Link>
                        </div>
                        <div className="navbar-end">
                            <Link to="/settings" className="navbar-item">Settings</Link>
                            <Link to="/contacts" className="navbar-item">Contacts</Link>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
}

export default Header