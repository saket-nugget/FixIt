import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Results from './pages/Results';
import Chat from './pages/Chat';
import History from './pages/History';
import Settings from './pages/Settings';
import Manuals from './pages/Manuals';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/scan" element={<Scanner />} />
                <Route path="/results" element={<Results />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/manuals" element={<Manuals />} />
            </Routes>
        </Router>
    );
}

export default App;
