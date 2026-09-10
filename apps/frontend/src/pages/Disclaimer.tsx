import React from 'react';
import LegalLayout from '../components/LegalLayout';

export default function Disclaimer() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Disclaimer"
      updated="September 10, 2026"
      intro="Risk warning: digital assets are volatile and can lose value. The information provided on LumenVault is for general information and educational purposes only and does not constitute financial, legal, or tax advice."
      sections={[
        {
          heading: 'Not Financial Advice',
          body: 'Nothing on LumenVault constitutes a recommendation to buy, sell, hold, or trade any digital asset. We are not investment advisors, brokers, or dealers. Any decision to allocate assets should be based on your own research and consultation with a qualified professional. Past performance, simulated or real, is not indicative of future results.',
        },
        {
          heading: 'Risk of Loss',
          items: [
            'All digital asset investments carry risk, including the possible total loss of principal.',
            'Asset prices, including XLM and stablecoins, can fluctuate significantly in short periods.',
            'Stablecoins are not guaranteed to hold their peg and may lose value.',
            'Yields are not guaranteed; APY figures are estimates and change with market conditions.',
          ],
        },
        {
          heading: 'Smart Contract and Protocol Risks',
          items: [
            'Vaults route funds to third-party protocols (for example, Blend, Lemmus, Phoenix, Thylo, and xlToken) that may contain bugs or vulnerabilities.',
            'Smart contracts, including the LumenVault contracts under development, have not been formally audited and may contain errors.',
            'Interactions with decentralized protocols may expose you to impermanent loss, liquidation, or reward-token volatility.',
            'There is no guarantee of availability, and on-chain failure could delay or prevent deposits or withdrawals.',
          ],
        },
        {
          heading: 'Demonstration Data',
          body: 'The dashboard currently displays simulated data for demonstration purposes. Figures such as TVL, APY, share price, and risk scores do not reflect live market data and should not be relied upon for real investment decisions.',
        },
        {
          heading: 'Third-Party Services',
          body: 'LumenVault may reference or integrate data from third parties, including DefiLlama and the Stellar ecosystem. We do not control these services and are not responsible for their content, accuracy, or availability.',
        },
        {
          heading: 'No Fiduciary Relationship',
          body: 'Your use of LumenVault creates no fiduciary or advisory relationship between you and LumenVault or its contributors. You are solely responsible for the assets, tools, and accounts you connect and for any decisions you make.',
        },
        {
          heading: 'Jurisdiction',
          body: 'LumenVault makes no representation that its content is appropriate or available for use in all locations. Accessing the Service from jurisdictions where such use is restricted is your own responsibility.',
        },
      ]}
    />
  );
}