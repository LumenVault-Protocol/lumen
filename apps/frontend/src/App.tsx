import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import Header from './components/Header';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Vaults from './pages/Vaults';
import Analytics from './pages/Analytics';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Disclaimer from './pages/Disclaimer';
import Privacy from './pages/Privacy';
import './styles/globals.css';

function NotFound() {
  const location = useLocation();
  return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-center">
      <div className="text-7xl font-bold gradient-text mb-4">404</div>
      <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
      <p className="text-gray-400 mb-6">
        The page <span className="font-mono text-primary-400">{location.pathname}</span> does not exist
      </p>
      <a href="/dashboard" className="btn-primary">Return to Dashboard</a>
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ color: '#ff4444', padding: 40, fontFamily: 'monospace', background: '#111', minHeight: '100vh' }}>
          <h1>Render Error</h1>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error.message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, marginTop: 16, color: '#888' }}>
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (isLanding) {
    return <Landing />;
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      <main>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vaults" element={<Vaults />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="border-t border-dark-border py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">LumenVault Protocol - Stellar DeFi Vault Aggregator</p>
          <p className="mt-1 text-xs text-gray-500">Powered by Soroban smart contracts on the Stellar network</p>
          <nav className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500">
            <Link to="/faq" className="hover:text-primary-400 transition-colors">FAQ</Link>
            <Link to="/terms" className="hover:text-primary-400 transition-colors">Terms of Use</Link>
            <Link to="/disclaimer" className="hover:text-primary-400 transition-colors">Disclaimer</Link>
            <Link to="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}