import { Routes, Route } from "react-router-dom";


import Header from "./nav_components/Header";
import Footer from "./nav_components/Footer";
import Settings from "./nav_components/Settings";
import Contacts from "./nav_components/Contacts";
import WelcomePage from "./welcome_page/WelcomePage";
import ChampGridView from "./champ_grid/ChampGridView";

import "./App.css";

function App() {
  return (
    <div id="app">
      <Header />
      <main className="main-content is-flex is-flex-direction-column">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/room/:roomId" element={<ChampGridView />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
