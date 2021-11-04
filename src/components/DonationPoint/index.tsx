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

export const DonationPointEl = () => {
  return (
    <SnackbarProvider maxSnack={5} autoHideDuration={8000}>
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
}));

function AppInner() {
  console.log("ENTERED DONATION POINT")
  const styles = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const _marketWallet = useWallet();
  const [tokenList, setTokenList] = useState<TokenListContainer | null>(null);

  const [provider, marketWallet] = useMemo(() => {
    const opts: ConfirmOptions = {
      preflightCommitment: "recent",
      commitment: "recent",
    };
    const network = "https://solana-api.projectserum.com"
    const marketWallet = _marketWallet
    const provider_url = marketWallet.wallet?.url? marketWallet.wallet?.url : "https://www.sollet.io"
    console.log("MARKET WALLET", marketWallet)
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new NotifyingProvider(
      connection,
      //@ts-ignore
      marketWallet,
      opts,
      (tx, err) => {
        if (err) {
          var clean_err = " "
          const err_len = err?.toString()?.split("custom program error: ").length>0? err?.toString()?.split("custom program error: ")[1]?.length : 0
          if (err_len > 0) {
            const err_str = err.toString().split("custom program error: ")[1]
            
            // from https://github.com/solana-labs/solana-program-library/blob/master/token/program/src/error.rs
            // You get an error like 0x22. Convert it to base10 = 34. Then look up error number 34 in the error.rs// where??
            const err_meanings = [ 
              "Lamport balance below rent-exempt threshold",
              "Insufficient funds",
              "Invalid Mint",
              "Account not associated with this Mint",
              "Owner does not match",
              "Fixed supply",
              "Already in use",
              "Invalid number of provided signers",
              "Invalid number of required signers",
              "State is unititialized",
              "Instruction does not support native tokens",
              "Non-native account can only be closed if its balance is zero",
              "Invalid instruction - Try with lower input!",
              "State is invalid for requested operation",
              "Operation overflowed",
              "Account does not support specified authority type",
              "This token mint cannot freeze accounts",
              "Account is frozen",
              "The provided decimals value different from the Mint decimals",
              "Instruction does not support non-native tokens"
            ]
            
            const err_number_dirty = err_str.split("0x")[1] 
            var regex = /\d+/g;
            var err_arr = err_number_dirty.match(regex)
            if (err_arr) {
              clean_err = err_meanings[Number(err_arr[0])]?err_meanings[Number(err_arr[0])]:""
            }

            console.log("ERR:", err_str, "ERR_clean", clean_err)

          }
          var snackbarError = " "

          if (clean_err.length > 0) snackbarError = ` (${clean_err})`

          enqueueSnackbar(`Error: ${err.message} ${snackbarError}`, {
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
    return [provider, marketWallet];
  }, [enqueueSnackbar]);

  useEffect(() => {
    new TokenListProvider().resolve().then(setTokenList);
  }, [setTokenList]);

  return (
    <Grid
      container
      justify="center"
      alignItems="center"
      className={styles.root}
    >
      {tokenList &&
        <DonationPoint provider={provider} tokenList={tokenList}
          amount={5}
          tokenMint={new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')}
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
//
// Note that this is an Anchor wallet/network provider--not a React provider,
// so all transactions will be flowing through here, which allows us to
// hook in to display all transactions sent from the `Swap` component
// as notifications in the parent app.
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
