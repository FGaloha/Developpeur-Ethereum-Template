import '@/styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider, darkTheme, lightTheme
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { hardhat, goerli, mainnet } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { Layout } from '@/components/Layout/Layout';
import { MembersProvider } from '@/context/MembersProvider'

const { chains, provider } = configureChains(
  [hardhat, goerli, mainnet],
  [
    // alchemyProvider({ apiKey: process.env.ALCHEMY_GOERLI }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'High Jedi Council Dapp',
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
          <MembersProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </MembersProvider>
        </ChakraProvider>
      </RainbowKitProvider>
    </WagmiConfig >
  )
}
