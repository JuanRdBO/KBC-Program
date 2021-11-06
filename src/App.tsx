
import { useMemo } from 'react';

import { clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
} from '@solana/wallet-adapter-wallets';

import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';

import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { HashRouter, Route, Switch } from 'react-router-dom';
import Home from './views/home';
import Purpose from './views/purpose';

import './style/bootstrap.css';
import './App.css';
import './style/font-icons.css';
import './style/animate.css';
import './style/fonts.css';
import './style/custom.css';
import { SPLTokenListProvider } from './contexts/TokenList';
import { MetaProvider } from './contexts/meta/meta';

const theme = createTheme({
  palette: {
    type: 'dark',
  },
  props: {
    MuiButtonBase: {
      // The properties to apply
      disableRipple: true // No more ripple, on the whole application 💣!
    }
  }
  
});

const ENDPOINTS = [
  {
    name: 'mainnet-beta',
    endpoint: 'https://api.metaplex.solana.com/',
  },
  {
    name: 'mainnet-beta (Solana)',
    endpoint: 'https://api.mainnet-beta.solana.com',
  },
  {
    name: 'mainnet-beta (Serum)',
    endpoint: 'https://solana-api.projectserum.com/',
  },
  {
    name: 'testnet',
    endpoint: 'https://api.testnet.solana.com',
  },
  {
    name: 'devnet',
    endpoint: 'https://api.devnet.solana.com',
  },
];

const App = () => {
  const endpointUrl = ENDPOINTS[0].endpoint

  const endpoint = useMemo(() => endpointUrl, []);

  const wallets = useMemo(
    () => [getPhantomWallet(), getSolflareWallet(), getSolletWallet()],
    [],
  );

  return (
    <HashRouter basename={'/'}>
      <ThemeProvider theme={theme}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <MetaProvider endpointUrl={endpointUrl}>
              <SPLTokenListProvider>

                <WalletModalProvider logo="images/logo.png" featuredWallets={4}>
                  <Switch>
                    <Route path="/purpose" component={() => <Purpose />} />
                    <Route path="/" component={() => <Home />} />
                  </Switch>
                </WalletModalProvider>
              </SPLTokenListProvider>

            </MetaProvider>
          </WalletProvider>
        </ConnectionProvider>
      </ThemeProvider>
    </HashRouter>
  );
};

export default App;
