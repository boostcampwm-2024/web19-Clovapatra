import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import RoomPage from './pages/RoomListPage';
import GamePage from './pages/GamePage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RoomPage />} />
            <Route path="/game/:roomId" element={<GamePage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </QueryClientProvider>
  );
}

export default App;
