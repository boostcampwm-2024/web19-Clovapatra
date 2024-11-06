import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import RoomPage from './pages/RoomPage';
import GamePage from './pages/GamePage';

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoomPage />} />
          <Route path="/game/:roomId" element={<GamePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
