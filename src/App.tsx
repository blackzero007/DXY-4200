import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import SoloGamePage from '@/pages/SoloGamePage';
import RoomPage from '@/pages/RoomPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game/solo" element={<SoloGamePage />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}
