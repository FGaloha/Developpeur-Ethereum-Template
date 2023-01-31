import { ChakraProvider } from '@chakra-ui/react'
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { hardhat, goerli, mainnet } from 'wagmi/chains';
// import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const { chains, provider } = configureChains(
  [hardhat, goerli, mainnet],
  [
    // alchemyProvider({ apiKey: process.env.ALCHEMY_GOERLI }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'NFT History Dapp',
  chains
});

const wagmiClient = createClient({
  autoConnect: false,
  connectors,
  provider
})

export default function App({ Component, pageProps }) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider modalSize="compact" chains={chains}
        theme={lightTheme({
          accentColor: '#25D366',
          accentColorForeground: 'white',
          borderRadius: 'medium',
        })}>
        <ChakraProvider>
          <Component {...pageProps} />
          <ConnectButton label='Log in' accountStatus='avatar' chainStatus="none" />
        </ChakraProvider>
      </RainbowKitProvider>
    </WagmiConfig >
  )
}
