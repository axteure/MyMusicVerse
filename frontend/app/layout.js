'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Toast from '@/components/Toast'
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { hardhat, sepolia } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

const { chains, publicClient } = configureChains(
  [hardhat, sepolia],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID,
  chains
});

const wagmiConfig = createConfig({
  autoConnect: false,
  connectors,
  publicClient
})


export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <body>
      <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider  theme={darkTheme({  accentColor: '#38353d', accentColorForeground: 'white',borderRadius: 'small', fontWeight: '500' ,overlayBlur: 'small',})} chains={chains}>

      <Header />

            <main className="flex min-h-screen flex-col items-center justify-between p-12 ">

              {children}
              <Toast />
              <Footer />

            </main>
          </RainbowKitProvider>
          </WagmiConfig>

      </body>
    </html>
  )
}
