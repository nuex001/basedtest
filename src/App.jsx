import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Nav from "./components/layout/Nav";
import Home from "./components/pages/Home";
import Leaderboard from "./components/pages/Leaderboard";

function App() {
  return (
    <BrowserRouter>
    <div className="container">
      <Nav />
      {/* <ScrollToTop /> */}
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/leaderboard" element={<Leaderboard />} />
        {/* <Route exact path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
      {/* <Footer /> */}
    </div>
  </BrowserRouter>
  );
}

export default App;
