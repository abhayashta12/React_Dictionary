import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import { initTheme, getTheme } from './lib/theme';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getTheme());
  
  // Initialize theme on mount
  useEffect(() => {
    initTheme();
  }, []);
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage theme={theme} setTheme={setTheme} />} />
        <Route path="/admin" element={<AdminPage theme={theme} />} />
      </Routes>
    </Router>
  );
}

export default App;