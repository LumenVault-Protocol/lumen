import React from 'react';
import LegalLayout from '../components/LegalLayout';

export default function Privacy() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Privacy Policy"
      updated="September 10, 2026"
      intro="This Privacy Policy explains what information LumenVault collects, how it is used, and the choices you have. LumenVault is built with a privacy-first approach: we do not require accounts, email addresses, or personal information to use the interface."
      sections={[
        {
          heading: '1. Information We Collect',
          body: 'We collect very little information, and never your private keys or seed phrases. Specifically:',
          items: [
            'Wallet details: when you connect a wallet (e.g., through the Freighter extension), your public Stellar address is read directly from your browser. Private keys never leave your device.',
            'Local preferences: your theme preference (dark/white) is stored in your browser\u2019s localStorage under the key "lumen-theme".',
            'Server logs: the backend may record basic request metadata (IP address, user agent, time, endpoint) for operational and security purposes.',
            'Demo data: if you use the demo account, a pre-seeded public Stellar address is used to display sample positions. No real personal data is involved.',
          ],
        },
        {
          heading: '2. What We Do NOT Collect',
          items: [
            'We do not collect your name, email, phone number, or other identity data.',
            'We do not collect or store your private keys, seed phrases, or passwords.',
            'We do not sell or rent personal data to third parties.',
            'We do not use cross-site tracking or advertising cookies.',
          ],
        },
        {
          heading: '3. How We Use Information',
          body: 'Any information we do collect is used solely to operate and improve the Service: displaying relevant data, remembering your preferences, diagnosing issues, and protecting against abuse.',
        },
        {
          heading: '4. Third-Party Services',
          items: [
            'Public market and yield data may be fetched from services such as DefiLlama and Stellar network endpoints; those services may log their own requests.',
            'Google Fonts, if loaded, may process your IP address to serve font files.',
            'We do not share your wallet address or other data with any third party.',
          ],
        },
        {
          heading: '5. Storage and Retention',
          body: 'Local preferences remain on your device until cleared. Server logs are retained only as long as necessary for operational purposes and are not associated with any account that you own.',
        },
        {
          heading: '6. Your Rights and Choices',
          items: [
            'Clear browser storage or use incognito mode to prevent persistence of local preferences.',
            'Disconnect your wallet at any time using the interface.',
            'Request deletion of any log data attributable to you by contacting us through the project repository.',
          ],
        },
        {
          heading: '7. Children\u2019s Privacy',
          body: 'The Service is not directed to children under the age of 18, and we do not knowingly collect personal information from children.',
        },
        {
          heading: '8. Changes to This Policy',
          body: 'We may update this policy as the Service evolves. The "Last updated" date at the top of this page reflects the latest revision. Material changes will be highlighted in the project repository.',
        },
      ]}
    />
  );
}