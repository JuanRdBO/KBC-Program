import './App.css';
import { useMemo } from 'react';

import FLP from './views/flp';

import * as anchor from '@project-serum/anchor';
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

import { WalletDialogProvider } from '@solana/wallet-adapter-material-ui';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { HashRouter, Route, Switch } from 'react-router-dom';
import Home from './views/home';

const theme = createTheme({
  palette: {
    type: 'dark',
  },
});

const candyMachineId = process.env.REACT_APP_CANDY_MACHINE_ID
  ? new anchor.web3.PublicKey(process.env.REACT_APP_CANDY_MACHINE_ID)
  : undefined;

const fairLaunchId = new anchor.web3.PublicKey(
  process.env.REACT_APP_FAIR_LAUNCH_ID!,
);

const network = process.env.REACT_APP_SOLANA_NETWORK as WalletAdapterNetwork;

const rpcHost = process.env.REACT_APP_SOLANA_RPC_HOST!;
const connection = new anchor.web3.Connection(rpcHost);

const startDateSeed = parseInt(process.env.REACT_APP_CANDY_START_DATE!, 10);

const txTimeout = 30000; // milliseconds (confirm this works for your project)

const App = () => {
  const endpoint = useMemo(() => clusterApiUrl(network), []);

  const wallets = useMemo(
    () => [getPhantomWallet(), getSolflareWallet(), getSolletWallet()],
    [],
  );

  return (
    <HashRouter basename={'/'}>
    <ThemeProvider theme={theme}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletDialogProvider>
            <Switch>
              <Route exact path="/flp" component={() => <FLP
                candyMachineId={candyMachineId}
                fairLaunchId={fairLaunchId}
                connection={connection}
                startDate={startDateSeed}
                txTimeout={txTimeout}
              />}/>
              <Route path="/" component={() => <Home />} />
            </Switch>
          </WalletDialogProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
    </HashRouter>
  );
};

export default App;
