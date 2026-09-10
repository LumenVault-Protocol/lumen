import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ShieldCheck, KeyRound, Layers, TrendingUp, Lock, Wallet, ArrowRight,
  Sparkles, Cpu, Activity, CheckCircle2, Rocket, Gauge, Coins, Star, ArrowUpRight,
} from 'lucide-react';
import { vaultApi } from '../api';
import { formatUSD, formatAPY, getRiskLabel } from '../utils/format';
import { Vault } from '../types';

const stats = [
  { label: 'Vaults live', value: '30' },
  { label: 'Total TVL', value: '$2.71B', detail: 'demo data' },
  { label: 'Avg. APY', value: '8.90%' },
  { label: 'Depositors', value: '18.8K' },
];

const features = [
  {
    icon: KeyRound,
    title: 'Non-custodial, self-custody',
    body: 'LumenVault never holds your keys or assets. Your wallet stays in your control through the Freighter extension — no accounts, no custody, no emails.',
  },
  {
    icon: Cpu,
    title: 'Soroban smart contracts',
    body: 'Every vault, strategy, and risk check is built in Rust for Soroban — Stellar\u2019s native smart-contract platform. Fully on-chain, fully auditable.',
  },
  {
    icon: Gauge,
    title: 'On-chain risk scoring',
    body: 'A dedicated risk manager scores every vault from 0\u2013100 and maintains blacklists and health checks, so risks are visible before you commit.',
  },
  {
    icon: Layers,
    title: 'Multi-asset vaults',
    body: 'Deposit USDC, USDT, XLM, or RLUSD into curated vaults, each tuned for a specific yield strategy and risk profile.',
  },
  {
    icon: TrendingUp,
    title: 'Auto-compounding harvest',
    body: 'Curators harvest strategy rewards and vaults accrue yield into the share price automatically — your growth compounds over time.',
  },
  {
    icon: Lock,
    title: 'Privacy-first by design',
    body: 'No personal data, no tracking, no private keys — ever. Connect with a click, disconnect with a click, and stay anonymous.',
  },
];

const strategies = [
  { name: 'Blend', tag: 'Lending', desc: 'Earn supply APY plus BLND rewards in Stellar\u2019s largest lending market.', apy: '8.9%' },
  { name: 'Phoenix', tag: 'Liquidity', desc: 'Collect swap fees and reward tokens as an automated liquidity provider.', apy: '10.9%' },
  { name: 'Lemmus', tag: 'Money Market', desc: 'Optimized stable money-market allocations for dependable base yield.', apy: '8.9%' },
  { name: 'xlToken', tag: 'Staked xLM', desc: 'Earn unbonded staking yield on Lumens with minimal impermanent loss.', apy: '10.0%' },
  { name: 'Thylo', tag: 'Yield Pools', desc: 'Balanced multi-pool yield for moderate risk appetites.', apy: '7.6%' },
];

const steps = [
  {
    icon: Wallet,
    step: '01',
    title: 'Connect your wallet',
    body: 'Link the Freighter extension in one click, or explore frictionlessly with a pre-loaded demo account — no signups.',
  },
  {
    icon: Coins,
    step: '02',
    title: 'Pick your vault',
    body: 'Filter by asset, strategy, APY, and risk score. Every vault shows its fees, share price, and deposits up front.',
  },
  {
    icon: ArrowUpRight,
    step: '03',
    title: 'Grow with the network',
    body: 'Your deposit is routed to the strategy, yield accrues into the share price, and the risk manager watches over it all.',
  },
];

export default function Landing() {
  const [featuredVaults, setFeaturedVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vaultApi
      .getAll({ sort: 'tvl', limit: '4' })
      .then((res) => setFeaturedVaults(res.data?.data ?? []))
      .catch(() => setFeaturedVaults([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg overflow-x-hidden">
      {/* ------------------------------ NAV ------------------------------ */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-dark-border/60 bg-dark-bg/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-stellar-purple flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">LumenVault</span>
            </Link>
            <nav className="hidden md:flex items-center gap-7 text-sm text-gray-400">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#strategies" className="hover:text-white transition-colors">Strategies</a>
              <a href="#how" className="hover:text-white transition-colors">How it works</a>
              <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="btn-primary text-sm">
                <span className="flex items-center gap-2">Open App <ArrowRight className="w-4 h-4" /></span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ------------------------------ HERO ------------------------------ */}
      <section className="relative pt-40 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(closest-side, rgba(123,97,255,0.28), transparent)' }} />
          <div className="absolute top-40 right-0 w-[500px] h-[400px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(closest-side, rgba(0,196,255,0.16), transparent)' }} />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border border-stellar-purple/30 bg-stellar-purple/10 text-white">
              <Sparkles className="w-3.5 h-3.5 text-stellar-purple" />
              Stellar-native · Powered by Soroban
            </span>
            <h1 className="mt-6 text-5xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight text-white">
              Earn <span className="gradient-text">stellar yields</span>
              <br />
              on the Stellar network
            </h1>
            <p className="mt-6 text-lg text-gray-400 leading-relaxed max-w-xl">
              LumenVault is a curated vault aggregator for USDC, USDT, XLM and RLUSD.
              Audit-grade Soroban contracts, on-chain risk scoring, auto-compounding,
              and zero custody — all from a single, beautiful dashboard.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/dashboard" className="btn-primary text-base px-7 py-3">
                <span className="flex items-center gap-2">Enter App <ArrowRight className="w-4 h-4" /></span>
              </Link>
              <Link to="/vaults" className="btn-secondary text-base px-7 py-3">
                Explore Vaults
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Non-custodial</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> No accounts or KYC</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> 100% on-chain</li>
            </ul>
          </div>

          {/* Floating vault mock */}
          <div className="relative hidden lg:block">
            <div className="absolute -inset-10 -z-10 rounded-3xl blur-2xl"
              style={{ background: 'radial-gradient(closest-side, rgba(123,97,255,0.25), transparent)' }} />
            <div className="card shadow-2xl shadow-stellar-purple/10 animate-pulse-glow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500">LumenVault</p>
                  <p className="text-sm font-semibold text-white">USDC · Core Lending</p>
                </div>
                <span className="badge-green">Risk 28</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-dark-surface">
                <span className="text-xs text-gray-500">Current APY</span>
                <span className="font-mono text-2xl font-bold text-green-400">8.20%</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-dark-surface">
                  <p className="text-xs text-gray-500">TVL</p>
                  <p className="font-mono font-semibold text-white mt-1">$512M</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-surface">
                  <p className="text-xs text-gray-500">Fee</p>
                  <p className="font-mono font-semibold text-white mt-1">1.5% / 10%</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl px-4 py-3 bg-stellar-purple/10 border border-stellar-purple/20">
                <span className="flex items-center gap-2 text-sm font-medium text-white"><Activity className="w-4 h-4 text-stellar-cyan" /> Share price</span>
                <span className="font-mono text-sm text-stellar-cyan">1.0374</span>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-8 card p-4 shadow-lg rotate-[-4deg]">
              <p className="text-xs text-gray-500 mb-1">XLM · xlToken Staked</p>
              <p className="font-mono font-bold text-green-400">+9.30% APY</p>
            </div>
            <div className="absolute -top-6 -right-6 card p-4 shadow-lg rotate-[3deg]">
              <p className="text-xs text-gray-500 mb-1">RLUSD · Blend</p>
              <p className="font-mono font-bold text-stellar-cyan">$1.00</p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ STATS ------------------------------ */}
      <section className="border-y border-dark-border bg-dark-card/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-xs text-gray-500 uppercase tracking-widest">{s.label}</p>
              <p className="mt-1 font-mono text-2xl font-bold text-white">
                {s.value}
                {s.detail && <span className="ml-2 text-[10px] font-sans text-gray-500 normal-case">{s.detail}</span>}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------ FEATURED VAULTS ------------------------------ */}
      <section id="vaults" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary-400">Curated Yield</span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-white">Featured vaults</h2>
            </div>
            <Link to="/vaults" className="btn-secondary text-sm shrink-0">
              <span className="flex items-center gap-2">View all 30 vaults <ArrowRight className="w-4 h-4" /></span>
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="card h-44 animate-pulse bg-dark-surface/50" />
              ))}
            </div>
          ) : featuredVaults.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
              {featuredVaults.map((v) => {
                const risk = getRiskLabel(v.riskScore);
                return (
                  <Link key={v.address} to="/vaults" className="card card-hover p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-stellar-purple/20 flex items-center justify-center font-bold text-white">
                        {v.assetSymbol?.slice(0, 2) || 'V'}
                      </div>
                      <span className={`badge ${risk.color}`}>{risk.label}</span>
                    </div>
                    <p className="text-sm font-medium text-white truncate">{v.name}</p>
                    <p className="mt-3 font-mono text-2xl font-bold text-green-400">{formatAPY(v.apy)}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <span>{v.assetSymbol} · TVL {formatUSD(v.tvl)}</span>
                      <ArrowUpRight className="w-4 h-4 text-primary-400" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="card p-10 text-center text-gray-500">Demo vaults are currently offline — check back shortly.</div>
          )}
        </div>
      </section>

      {/* ------------------------------ FEATURES ------------------------------ */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-dark-border bg-dark-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-stellar-cyan">Why LumenVault</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-white">Built different, on purpose</h2>
            <p className="mt-4 text-gray-400">Every decision — custody, architecture, data — was made to put you back in control.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="card card-hover">
                <div className="w-11 h-11 rounded-xl bg-stellar-purple/10 border border-stellar-purple/20 flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-stellar-purple" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ STRATEGIES ------------------------------ */}
      <section id="strategies" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-dark-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-400">Strategy Layer</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-white">One vault, many engines</h2>
            <p className="mt-4 text-gray-400">Behind every vault is a battle-tested strategy engine across the Stellar ecosystem.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {strategies.map((s) => (
              <div key={s.name} className="card card-hover flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{s.name}</span>
                  <span className="badge-blue">{s.tag}</span>
                </div>
                <p className="mt-3 text-xs text-gray-400 leading-relaxed grow">{s.desc}</p>
                <p className="mt-4 font-mono font-bold text-green-400">{s.apy} APY</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ HOW IT WORKS ------------------------------ */}
      <section id="how" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-dark-border bg-dark-card/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-stellar-cyan">How it works</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-white">Start earning in three steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="relative card">
                <span className="font-mono text-5xl font-extrabold text-stellar-purple/20 absolute top-5 right-6">{s.step}</span>
                <div className="w-11 h-11 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-primary-400" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ CTA ------------------------------ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto relative overflow-hidden rounded-3xl border border-stellar-purple/30 p-12 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(123,97,255,0.18), rgba(0,196,255,0.10))' }}>
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(closest-side, rgba(123,97,255,0.4), transparent)' }} />
          <Rocket className="w-8 h-8 text-white mx-auto mb-6" />
          <h2 className="relative text-3xl sm:text-4xl font-bold text-white">Ready to earn on Stellar?</h2>
          <p className="relative mt-4 max-w-xl mx-auto text-gray-300">
            Explore curated vaults, check risk scores, and see exactly what your deposits could earn — demo mode, no signup required.
          </p>
          <div className="relative mt-8 flex justify-center gap-4">
            <Link to="/dashboard" className="btn-primary px-7 py-3 text-base">
              <span className="flex items-center gap-2">Launch Dashboard <ArrowRight className="w-4 h-4" /></span>
            </Link>
            <Link to="/vaults" className="btn-secondary px-7 py-3 text-base">Browse Vaults</Link>
          </div>
        </div>
      </section>

      {/* ------------------------------ FOOTER ------------------------------ */}
      <footer className="border-t border-dark-border py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-500 to-stellar-purple flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">LumenVault</span>
          </div>
          <p className="text-xs text-gray-500 text-center sm:text-right">
            Stellar DeFi Vault Aggregator · Demo data shown · Not financial advice
          </p>
          <nav className="flex items-center gap-5 text-xs text-gray-500">
            <Link to="/faq" className="hover:text-primary-400 transition-colors">FAQ</Link>
            <Link to="/terms" className="hover:text-primary-400 transition-colors">Terms</Link>
            <Link to="/disclaimer" className="hover:text-primary-400 transition-colors">Disclaimer</Link>
            <Link to="/privacy" className="hover:text-primary-400 transition-colors">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}