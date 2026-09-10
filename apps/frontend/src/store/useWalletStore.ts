import { create } from 'zustand';
import {
  isAllowed,
  requestAccess,
  getAddress,
  getNetworkDetails,
  isBrowser,
} from '@stellar/freighter-api';

export const DEMO_ADDRESS = 'GDEJUQPNUB42FK4AR4W7N425DMOLXPYZFBZB645UQMJRQA5JSXEMO2IM';
export const STELLAR_PUBLIC_NETWORK = 'Public Global Stellar Network ; September 2015';

export type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'demo';

export interface ConnectResult {
  ok: boolean;
  error?: string;
  publicKey?: string;
}

interface WalletState {
  status: WalletStatus;
  publicKey: string | null;
  network: string | null;
  freighterInstalled: boolean;
  checking: boolean;
  connectFreighter: () => Promise<ConnectResult>;
  connectDemo: () => ConnectResult;
  disconnect: () => Promise<void>;
  checkStatus: () => Promise<void>;
}

function assertBrowser() {
  if (!isBrowser) {
    throw new Error('Wallet connection only works in a browser');
  }
}

type FreighterResponse<T> = T & { error?: { code?: number; message?: string } };

function responseError(res: FreighterResponse<Record<string, unknown>>): string | null {
  return res?.error?.message || res?.error?.code ? res.error.message || 'Freighter error' : null;
}

/**
 * Detect whether the Freighter extension is responding.
 * isAllowed resolves once the extension answers; a missing extension throws
 * or returns an error payload.
 */
async function detectExtension(): Promise<boolean> {
  assertBrowser();
  try {
    const res = await isAllowed();
    return !res.error;
  } catch {
    return false;
  }
}

export const useWalletStore = create<WalletState>((set) => ({
  status: 'disconnected',
  publicKey: null,
  network: null,
  freighterInstalled: false,
  checking: true,

  connectFreighter: async () => {
    try {
      assertBrowser();
      set({ status: 'connecting' });

      const installed = await detectExtension();
      set({ freighterInstalled: installed });
      if (!installed) {
        set({ status: 'disconnected' });
        return {
          ok: false,
          error: 'Freighter is not installed. Install the Stellar wallet extension and refresh the page.',
        };
      }

      // requestAccess prompts the user to authorize this dApp.
      const access = (await requestAccess()) as FreighterResponse<{ address: string }>;
      const err = responseError(access);
      if (err || !access.address) {
        set({ status: 'disconnected' });
        return { ok: false, error: err || 'Connection cancelled by user' };
      }

      const details = (await getNetworkDetails()) as FreighterResponse<{ network: string }>;
      const network = details?.network || STELLAR_PUBLIC_NETWORK;

      set({ status: 'connected', publicKey: access.address, network });
      return { ok: true, publicKey: access.address };
    } catch (e: any) {
      set({ status: 'disconnected' });
      return {
        ok: false,
        error:
          e?.message ||
          e?.toString() ||
          'Failed to connect Freighter. Make sure the extension is unlocked.',
      };
    }
  },

  connectDemo: () => {
    set({ status: 'demo', publicKey: DEMO_ADDRESS, network: STELLAR_PUBLIC_NETWORK });
    return { ok: true, publicKey: DEMO_ADDRESS };
  },

  disconnect: async () => {
    // Freighter manages authorization in-extension; the dApp simply forgets.
    set({ status: 'disconnected', publicKey: null, network: null });
  },

  checkStatus: async () => {
    try {
      assertBrowser();
      const installed = await detectExtension();
      set({ freighterInstalled: installed, checking: false });
      if (!installed) return;

      const current = (await getAddress()) as FreighterResponse<{ address: string }>;
      if (!current?.address) return;
      const details = (await getNetworkDetails()) as FreighterResponse<{ network: string }>;
      set({
        status: 'connected',
        publicKey: current.address,
        network: details?.network || STELLAR_PUBLIC_NETWORK,
      });
    } catch {
      set({ checking: false });
    }
  },
}));