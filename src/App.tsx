import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import SoloGamePage from '@/pages/SoloGamePage';
import RoomPage from '@/pages/RoomPage';
import DailyChallengePage from '@/pages/DailyChallengePage';
import { ToastProvider, ToastContainer } from '@/components/toast';

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/solo" element={<SoloGamePage />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="/challenge" element={<DailyChallengePage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Router>
      <ToastContainer />
    </ToastProvider>
  );
}
