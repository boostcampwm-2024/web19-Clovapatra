import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import GamePage from './pages/GamePage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RoomListPage from './pages/RoomListPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RoomListPage />} />
            <Route path="/game/:roomId" element={<GamePage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </QueryClientProvider>
  );
}

export default App;
