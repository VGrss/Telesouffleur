import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Setup from './routes/setup';
import Prompter from './routes/prompter';
import ErrorBoundary from './components/ErrorBoundary';
import { useSettings, applyTheme } from './store/settings';

function App() {
  const { theme, highContrast, loadSettings } = useSettings();

  // Load settings and apply theme on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    applyTheme(theme, highContrast);
  }, [theme, highContrast]);

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          {/* Skip link for accessibility */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          
          <main id="main-content">
            <Routes>
              <Route path="/" element={<Setup />} />
              <Route path="/prompter" element={<Prompter />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;