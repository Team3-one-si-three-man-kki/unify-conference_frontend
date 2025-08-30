import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WaitingRoom from './pages/SessionRoom/WaitingRoom';
import { SessionRoom } from './pages/SessionRoom/SessionRoom';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WaitingRoom />} />
        <Route path="/session/:roomId" element={<SessionRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
