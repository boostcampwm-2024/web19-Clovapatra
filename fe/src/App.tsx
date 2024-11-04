import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import RoomPage from './pages/RoomPage';

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoomPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
