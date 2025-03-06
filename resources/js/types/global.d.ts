import type { route as routeFn } from 'ziggy-js';
import type { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
    const route: typeof routeFn;
    interface Window {
        ethereum: MetaMaskInpageProvider & {
            on(event: 'accountsChanged', handler: (accounts: string[]) => void): void;
            on(event: 'chainChanged', handler: (chainId: string) => void): void;
            on(event: 'disconnect', handler: () => void): void;
            removeListener(event: string, handler: (...args: any[]) => void): void;
        };
    }
}
