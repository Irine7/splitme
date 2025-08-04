'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactNode, useMemo } from 'react';

// Morph Holesky Testnet configuration
const morphHolesky = {
  id: 2810,
  name: 'Morph Holesky Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-quicknode-holesky.morphl2.io'] },
  },
  blockExplorers: {
    default: { name: 'Morph Explorer', url: 'https://explorer-holesky.morphl2.io' },
  },
  testnet: true,
};

// Create a singleton instance of the config
const createWagmiConfig = () => {
  return getDefaultConfig({
    appName: 'SplitMe',
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo',
    chains: [morphHolesky],
    ssr: true,
  });
};

let wagmiConfig: any;
const getWagmiConfig = () => {
  if (!wagmiConfig) {
    wagmiConfig = createWagmiConfig();
  }
  return wagmiConfig;
};

// Create a singleton instance of the query client
let client: QueryClient | undefined;
const getQueryClient = () => {
  if (!client) {
    client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
        },
      },
    });
  }
  return client;
};

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = useMemo(() => getQueryClient(), []);
  const config = useMemo(() => getWagmiConfig(), []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}