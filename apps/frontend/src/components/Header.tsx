import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Vault, BarChart3, Zap, LogOut, CheckCircle2, Wallet, Loader2, AlertTriangle, ExternalLink, Sun, Moon } from 'lucide-react';
import { truncateAddress } from '../utils/format';
import { useWalletStore } from '../store/useWalletStore';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/vaults', label: 'Vaults', icon: Vault },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
];

const FREIGHTER_URL = 'https://www.freighter.app/';

export default function Header() {
  const location = useLocation();
  const { status, publicKey, network, freighterInstalled, checking, connectFreighter, connectDemo, disconnect, checkStatus } = useWalletStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return localStorage.getItem('lumen-theme') === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('lumen-theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  useEffect(() => {
    if (!modalOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setModalOpen(false);
        setError(null);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [modalOpen]);

  const isConnected = status === 'connected' || status === 'demo';
  const isDemo = status === 'demo';

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    const result = await connectFreighter();
    setConnecting(false);
    if (!result.ok) {
      setError(result.error || 'Connection failed');
      return;
    }
    setModalOpen(false);
  };

  const handleDisconnect = async () => {
    setModalOpen(false);
    await disconnect();
  };

  return (
    <header className="border-b border-dark-border bg-dark-card/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-stellar-purple flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">LumenVault</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-500/10 text-primary-400'
                        : 'text-gray-400 hover:text-white hover:bg-dark-surface'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-surface transition-all"
              title={theme === 'dark' ? 'Switch to white theme' : 'Switch to dark theme'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Stellar · Live
            </div>

            {isConnected && publicKey ? (
              <div className="flex items-center gap-2">
                {isDemo && (
                  <span className="hidden sm:inline text-[10px] uppercase tracking-wide font-semibold px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Demo
                  </span>
                )}
                <span className="flex items-center gap-2 text-sm font-mono text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2" title={publicKey}>
                  <CheckCircle2 className="w-4 h-4" />
                  {truncateAddress(publicKey)}
                </span>
                <button
                  onClick={handleDisconnect}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-surface transition-all"
                  title="Disconnect"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <button className="btn-primary text-sm" onClick={() => setModalOpen((v) => !v)}>
                  <span className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    {checking ? 'Checking…' : 'Connect Wallet'}
                  </span>
                </button>

                {modalOpen && (
                  <div ref={modalRef} className="absolute right-0 mt-2 w-80 card p-4 z-50">
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold mb-1">Connect a Stellar wallet</h3>
                      <p className="text-xs text-gray-500">Link your wallet to deposit into LumenVault Soroban vaults.</p>
                    </div>

                    <button
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-dark-border hover:border-primary-500/50 bg-dark-surface transition-all"
                      onClick={handleConnect}
                      disabled={connecting}
                    >
                      <div className="w-9 h-9 rounded-lg bg-stellar-purple/15 flex items-center justify-center">
                        {connecting ? (
                          <Loader2 className="w-5 h-5 text-stellar-purple animate-spin" />
                        ) : (
                          <Wallet className="w-5 h-5 text-stellar-purple" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">Freighter</p>
                        <p className="text-xs text-gray-500">
                          {connecting ? 'Waiting for approval…' : freighterInstalled ? 'Stellar extension wallet' : 'Not detected'}
                        </p>
                      </div>
                      {!freighterInstalled && (
                        <a
                          href={FREIGHTER_URL}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                        >
                          Install <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </button>

                    <button
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-dark-border hover:border-primary-500/50 bg-dark-surface transition-all mt-2"
                      onClick={() => {
                        connectDemo();
                        setModalOpen(false);
                        setError(null);
                      }}
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary-500/15 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-primary-400" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">Demo account</p>
                        <p className="text-xs text-gray-500">Pre-loaded positions, no extension needed</p>
                      </div>
                    </button>

                    {error && (
                      <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}