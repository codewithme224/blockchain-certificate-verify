import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

interface Web3ContextType {
    account: string | null;
    chainId: number | null;
    provider: BrowserProvider | null;
    signer: JsonRpcSigner | null;
    connectWallet: () => Promise<void>;
    isConnecting: boolean;
    error: string | null;
}

const Web3Context = createContext<Web3ContextType>({
    account: null,
    chainId: null,
    provider: null,
    signer: null,
    connectWallet: async () => {},
    isConnecting: false,
    error: null,
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [account, setAccount] = useState<string | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const connectWallet = async () => {
        try {
            setIsConnecting(true);
            setError(null);
            
            const ethereumProvider = await detectEthereumProvider();
            
            if (!ethereumProvider) {
                throw new Error('Please install MetaMask!');
            }

            const provider = new BrowserProvider(window.ethereum);
            await provider.send('eth_requestAccounts', []);
            
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            const network = await provider.getNetwork();
            
            setProvider(provider);
            setSigner(signer);
            setAccount(address);
            setChainId(Number(network.chainId));
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect wallet');
        } finally {
            setIsConnecting(false);
        }
    };

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                setAccount(accounts[0] || null);
                // Reconnect with new account
                connectWallet();
            });

            window.ethereum.on('chainChanged', (chainId: string) => {
                setChainId(parseInt(chainId));
                // Reconnect with new chain
                connectWallet();
            });

            window.ethereum.on('disconnect', () => {
                setAccount(null);
                setChainId(null);
                setProvider(null);
                setSigner(null);
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners();
            }
        };
    }, []);

    return (
        <Web3Context.Provider
            value={{
                account,
                chainId,
                provider,
                signer,
                connectWallet,
                isConnecting,
                error,
            }}
        >
            {children}
        </Web3Context.Provider>
    );
}; 