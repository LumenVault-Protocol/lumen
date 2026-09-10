import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';

const FAQS = [
  {
    q: 'What is LumenVault?',
    a: 'LumenVault is a Stellar-native DeFi vault aggregator. It surfaces curated yield vaults built with Soroban smart contracts, letting you see and evaluate simplified ways to earn on assets like USDC, XLM, USDT, and RLUSD from a single interface.',
  },
  {
    q: 'Is LumenVault live on mainnet?',
    a: 'Not yet. LumenVault currently runs in demonstration mode with simulated data so you can explore the interface safely. The Soroban contracts (vault, vault factory, strategy, and risk manager) are written with soroban-sdk 21 and are under active development before any live deployment.',
  },
  {
    q: 'Which assets are supported?',
    a: 'The current vault lineup covers USDC, XLM (Lumens), USDT, and RLUSD, each in vaults targeting different strategies and risk profiles.',
  },
  {
    q: 'How do vaults generate yield?',
    a: 'Each vault routes deposits to strategies. Examples include Blend-style lending, Lemmus money markets, Phoenix liquidity provision and swap fees, Thylo yield pools, and xlToken-style staked lumens. Yields are shown as annualized percentage (APY) estimates that change with market conditions.',
  },
  {
    q: 'Do I need a wallet to use LumenVault?',
    a: 'No. You can browse everything and explore the interface with the Demo account. To simulate a real connection and deposits, you can connect a Stellar wallet using the Freighter browser extension.',
  },
  {
    q: 'Does LumenVault hold my funds?',
    a: 'No. LumenVault is non-custodial and does not touch your keys or assets. In the current demo build, deposits are simulated client-side and no on-chain transaction is broadcast.',
  },
  {
    q: 'What fees apply?',
    a: 'Vaults may charge management and performance fees expressed in basis points (bps), shown per vault. Any real on-chain activity would also incur Stellar network transaction fees.',
  },
  {
    q: 'How do vault shares and share price work?',
    a: 'When you deposit an asset you receive vault shares. The share price tracks accrued yield in fixed-point representation (for example, 1e6 = $1.00). As strategies earn, the share price grows. Withdrawals burn shares in exchange for the underlying asset.',
  },
  {
    q: 'What are the risks?',
    a: 'Digital assets are volatile and can lose value. Risks include smart-contract bugs, third-party protocol risk, impermanent loss in liquidity strategies, and stablecoin depegging. Yields are not guaranteed. See the Disclaimer page for full details.',
  },
  {
    q: 'Is this financial advice?',
    a: 'No. LumenVault is an educational interface and does not provide financial, legal, or investment advice. Do your own research and consult a professional before making any decisions.',
  },
  {
    q: 'How is my data handled?',
    a: 'Privacy-first: no accounts, email, or personal data are required. Your public wallet address is read locally, theme preference stays in localStorage, and no private keys are ever collected. See the Privacy Policy.',
  },
  {
    q: 'Where can I report issues or learn more?',
    a: 'The contracts, backend, and frontend are open source in the project repository. Report problems or get involved there, and refer to the Terms of Use, Disclaimer, and Privacy Policy above.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-8">
        <Link to="/" className="hover:text-primary-400 transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span>FAQ</span>
      </nav>

      <span className="text-xs font-semibold uppercase tracking-widest text-primary-400">Help Center</span>
      <h1 className="text-3xl font-bold gradient-text mt-2 mb-6">Frequently Asked Questions</h1>

      <div className="space-y-3">
        {FAQS.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={faq.q} className="card p-0 overflow-hidden">
              <button
                className="w-full flex items-start justify-between gap-4 text-left px-6 py-4 hover:bg-dark-surface/40 transition-colors"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span className="text-sm font-medium text-white">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && (
                <div className="px-6 pb-5 -mt-1">
                  <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}