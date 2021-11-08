import { useState, useEffect, useMemo } from "react";
import { SnackbarProvider, useSnackbar } from "notistack";
import { Button, Grid, makeStyles } from "@material-ui/core";
// @ts-ignore
import Wallet from "@project-serum/sol-wallet-adapter";
import {
  Signer,
  ConfirmOptions,
  Connection,
  Transaction,
  TransactionSignature,
  PublicKey,
} from "@solana/web3.js";
import {
  TokenListContainer,
  TokenListProvider,
} from "@solana/spl-token-registry";
import { DonationPoint } from "./src";
import * as anchor from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMeta } from "../../contexts/meta/meta";
import { SOL_MINT } from "./src/utils/pubkeys";

export const DonationPointEl = () => {
  const styles = useStyles()
  return (
    <SnackbarProvider maxSnack={5} autoHideDuration={8000} classes={{
      containerRoot: styles.snackbar,
      variantSuccess: styles.success,
      variantError: styles.error
      }}>
        <AppInner />
    </SnackbarProvider>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: '0',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  snackbar: {
     zIndex: 2000000000,
  },
  error: { 
    borderRadius: 8
    , backgroundColor: "White"
    , color: "#e00"
    , fontWeight: 600
    , border: "2px solid black"
  },
  success: {
    backgroundColor: "black"
    , borderRadius: 8
    , color: "white"
    , fontWeight: 600
  }
}));

function AppInner() {
  const styles = useStyles();
  // TODO: Add metadata with useMeta
  const { enqueueSnackbar } = useSnackbar();
  const wallet = useWallet();
  const {endpointUrl}  = useMeta()
  const [tokenList, setTokenList] = useState<TokenListContainer | null>(null);
  const [provider] = useMemo(() => {
    const opts: ConfirmOptions = {
      preflightCommitment: "recent",
      commitment: "recent",
    };
    const network = endpointUrl

    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new NotifyingProvider(
      connection,
      //@ts-ignore
      wallet,
      opts,
      (tx, err) => {
        if (err) {
          enqueueSnackbar(`Error: ${err.message}`, {
            variant: "error",
          });
        } else {
          enqueueSnackbar("Transaction sent", {
            variant: "success",
            action: (
              <Button
                color="inherit"
                component="a"
                target="_blank"
                rel="noopener"
                href={`https://explorer.solana.com/tx/${tx}`}
              >
                View on Solana Explorer
              </Button>
            ),
          });
        }
      }
    );
    return [provider];
  }, [enqueueSnackbar, wallet]);

  useEffect(() => {
    new TokenListProvider().resolve().then(setTokenList);
  }, [setTokenList]);

  // TODO: compute max sol if balance i sless than 1

  return (
    <Grid
      container
      justify="center"
      alignItems="center"
      className={styles.root}
    >
      {tokenList &&
        <DonationPoint provider={provider} tokenList={tokenList} amount={1}
          tokenMint={SOL_MINT}
        />}
    </Grid>
  );
}

// Cast wallet to AnchorWallet in order to be compatible with Anchor's Provider class
interface AnchorWallet {
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
  publicKey: PublicKey;
}
// Custom provider to display notifications whenever a transaction is sent.
class NotifyingProvider extends anchor.Provider {
  // Function to call whenever the provider sends a transaction;
  private onTransaction: (
    tx: TransactionSignature | undefined,
    err?: Error
  ) => void;

  constructor(
    connection: Connection,
    wallet: Wallet,
    opts: ConfirmOptions,
    onTransaction: (tx: TransactionSignature | undefined, err?: Error) => void
  ) {
    const newWallet = wallet as AnchorWallet;
    super(connection, newWallet, opts);
    this.onTransaction = onTransaction;
  }

  async send(
    tx: Transaction,
    signers?: Array<Signer | undefined>,
    opts?: ConfirmOptions
  ): Promise<TransactionSignature> {
    try {
      const txSig = await super.send(tx, signers, opts);
      this.onTransaction(txSig);
      return txSig;
    } catch (err) {
      if (err instanceof Error || err === undefined) {
        this.onTransaction(undefined, err);
      }
      return "";
    }
  }

  async sendAll(
    txs: Array<{ tx: Transaction; signers: Array<Signer | undefined> }>,
    opts?: ConfirmOptions
  ): Promise<Array<TransactionSignature>> {
    try {
      const txSigs = await super.sendAll(txs, opts);
      txSigs.forEach((sig) => {
        this.onTransaction(sig);
      });
      return txSigs;
    } catch (err) {
      if (err instanceof Error || err === undefined) {
        this.onTransaction(undefined, err);
      }
      return [];
    }
  }
}
