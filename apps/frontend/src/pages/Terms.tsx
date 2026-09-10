import React from 'react';
import LegalLayout from '../components/LegalLayout';

export default function Terms() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Terms of Use"
      updated="September 10, 2026"
      intro="These Terms of Use ('Terms') govern your access to and use of LumenVault, a Stellar-native DeFi vault aggregator ('the Service'). Please read them carefully before using the Service."
      sections={[
        {
          heading: '1. Acceptance of Terms',
          body: 'By accessing or using LumenVault, you agree to be bound by these Terms and all applicable laws and regulations. If you do not agree, you must not use the Service. We may update these Terms at any time; continued use after changes constitutes acceptance of the revised Terms.',
        },
        {
          heading: '2. Description of the Service',
          body: 'LumenVault is an interface and aggregation layer that surfaces curated yield vaults built on the Stellar network using Soroban smart contracts. It currently operates in demonstration mode: the data shown is simulated for educational purposes, and the underlying contracts are under active development.',
        },
        {
          heading: '3. Non-Custodial and Educational Nature',
          items: [
            'LumenVault does not custody, store, or control your assets or your wallet keys.',
            'Wallet connection is optional and performed locally through the Freighter browser extension; private keys never leave your browser.',
            'The Service is provided for informational and educational purposes and is not a licensed financial service. Nothing on LumenVault constitutes an offer, solicitation, or investment advice.',
            'A demo account is available to explore the interface without connecting a wallet or holding real funds.',
          ],
        },
        {
          heading: '4. Eligibility and Acceptable Use',
          body: 'You must be at least 18 years old and legally capable of entering into agreements. You agree not to:',
          items: [
            'Use the Service in violation of applicable laws or regulations in your jurisdiction.',
            'Attempt to circumvent rate limits, interfere with the Service, or probe its infrastructure.',
            'Misrepresent your identity or attempt to gain unauthorized access to other users\u2019 data.',
            'Use the Service for unlawful, deceptive, or abusive purposes.',
          ],
        },
        {
          heading: '5. Fees and Costs',
          body: 'Vaults may carry management and performance fees expressed in basis points (bps), which are disclosed per vault on the interface. Fees are deducted from vault assets and reflected in the share price. You are solely responsible for network transaction fees (e.g., Stellar network fees) associated with any on-chain activity.',
        },
        {
          heading: '6. Availability and Changes',
          body: 'We may modify, suspend, or discontinue any part of the Service at any time without notice. Demo data and performance figures may be reset, changed, or removed without notice and do not reflect future results.',
        },
        {
          heading: '7. Intellectual Property',
          body: 'The LumenVault name, logo, interface, and original content are provided for your personal, non-commercial use. You may not reproduce, distribute, or create derivative works without prior written permission.',
        },
        {
          heading: '8. Limitation of Liability',
          body: 'To the maximum extent permitted by law, LumenVault and its contributors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or digital assets, arising from or related to your use of the Service.',
        },
        {
          heading: '9. Indemnification',
          body: 'You agree to indemnify and hold harmless LumenVault and its contributors from any claims, losses, liabilities, or expenses arising out of your use of the Service or your violation of these Terms.',
        },
        {
          heading: '10. Governing Law and Severability',
          body: 'These Terms are governed by the applicable laws of your jurisdiction where not otherwise required. If any provision is found unenforceable, the remaining provisions shall remain in full force and effect.',
        },
      ]}
    />
  );
}