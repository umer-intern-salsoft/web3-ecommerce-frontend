import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { sepolia } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Keep constants internal to the module (removed 'export')
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'b56e64d476b8b28023b99e0413630d06';

const metadata = {
  name: 'Web3 Storefront',
  description: 'Web3 E-Commerce Storefront on Sepolia',
  url: window.location.origin,
  icons: ['https://assets.reown.com/reown-profile-pic.png']
};

const wagmiAdapter = new WagmiAdapter({
  networks: [sepolia],
  projectId,
  ssr: false
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [sepolia],
  projectId,
  metadata,
  allWallets: 'SHOW',
  featuredWalletIds: [
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369'
  ],
  features: {
    analytics: false
  }
});

// The ONLY export in this .jsx file is the React component
export function Web3Provider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}