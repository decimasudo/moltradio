import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FeedPage from './pages/FeedPage';
import RadioPage from './pages/RadioPage';
import StatsPage from './pages/StatsPage';
import './index.css';
import { config } from './config'; // Import to trigger validation

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/radio" element={<RadioPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
