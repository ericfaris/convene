import { Routes, Route } from 'react-router-dom';
import CreateEvent from './pages/CreateEvent.jsx';
import ParticipantView from './pages/ParticipantView.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/"             element={<CreateEvent />} />
      <Route path="/e/:token"     element={<ParticipantView />} />
      <Route path="/admin/:token" element={<AdminDashboard />} />
    </Routes>
  );
}
