import { Fragment, useState } from "react";
import styled from 'styled-components';
import {
  PublicKey,
  Keypair,

} from "@solana/web3.js";
import {
  makeStyles,
  Card,
  Typography,
  TextField,
  useTheme,
  Button,
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import { useDonationPointContext } from "../context/DonationPoint";

import { useTokenMap } from "../context/TokenList";
import { useMint, useOwnedTokenAccount } from "../context/Token";
import TokenDialog, { pubkeyToString } from "./TokenDialog";
import { SOL_MINT } from "../utils/pubkeys";
import * as anchor from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { sendSol } from "../../../../logic/sendSol";
import { useSnackbar } from "notistack";

const useStyles = makeStyles(() => ({
  tab: {
    width: "50%",
  },
  amountInput: {
    fontSize: 60,
    fontWeight: 600,
    margin: 0,
    padding: 0,
    marginRight: '10px',

  },
  input: {
    textAlign: "right",
    color: '#222',
    fontSize: 60,
    fontWeight: 800,
    fontFamily: 'Heebo',
    width: 500
  },
}));

const ConnectButton = styled(WalletMultiButton)`
  height: 60px;
  margin-top: 20px;
  margin-bottom: 25px;
  width: 100%;
  color: #333;
  font-size: 16px;
  font-weight: bold;
`;

export default function DonationPointCard() {
  const wallet = useWallet();

  return (
    <Card className='piggybank-card'>
      <DonationPointHeader />
      {!wallet.connected ? (
        <ConnectButton>
          Connect
        </ConnectButton>
      ) : (
        <>
          <DonationPointForm />
          <DonationPointButton />
          <PiggyBankImage/>
        </>
      )}
    </Card>
  );
}

export function DonationPointHeader() {
  return (
    <div className='piggybank-header-container' >
      <div className='gradient-text wallet-adapter-modal-title piggybank-header-text '
      >
        PIGGYBANK
      </div>
    </div>
  );
}

function DonationPointForm() {
  const { tokenMint, setTokenMint, amount, setAmount } = useDonationPointContext();
  return (
    <DonationPointInput
      from
      tokenMint={tokenMint}
      setTokenMint={setTokenMint}
      amount={amount}
      setAmount={setAmount}
    />
  );
}

export function DonationPointInput({
  from,
  tokenMint,
  setTokenMint,
  amount,
  setAmount,
}: {
  from: boolean;
  tokenMint: PublicKey;
  setTokenMint: (m: PublicKey) => void;
  amount: number;
  setAmount: (a: number) => void;
}) {
  const styles = useStyles();

  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const tokenAccount = useOwnedTokenAccount(tokenMint);
  const mintAccount = useMint(tokenMint);

  const balance =
    tokenAccount &&
    mintAccount &&
    tokenAccount.account.amount.toNumber() / 10 ** mintAccount.decimals;

  const formattedAmount =
    mintAccount && amount
      ? amount.toLocaleString("en-US", {
        maximumFractionDigits: Math.ceil(mintAccount?.decimals / 3) || 3,
        useGrouping: false,
      })
      : amount;

  return (
    <div className='piggybank-input' style={{}}>
      <div className='piggybank-token-selector'>
        <TokenButton mint={tokenMint} onClick={() => setShowTokenDialog(true)} />
        <Typography className='piggybank-token-balance' color="textSecondary" >
          {tokenAccount && mintAccount
            ? `Balance: ${balance?.toFixed(Math.ceil(mintAccount?.decimals / 3) || 3)}`
            : `-`}
          {from && !!balance ? (
            <span
              className='piggybank-max-button'
              onClick={() => setAmount(balance)}
            >
              MAX
            </span>
          ) : null}
        </Typography>
      </div>
      <TextField
        type="number"
        value={formattedAmount}
        onChange={(e) => setAmount(parseFloat(e.target.value))}
        InputProps={{
          disableUnderline: true,
          classes: {
            root: styles.amountInput,
            input: styles.input,
          },
        }}
      />
      <TokenDialog
        setMint={setTokenMint}
        open={showTokenDialog}
        onClose={() => setShowTokenDialog(false)}
      />
    </div>
  );
}

function PiggyBankImage() {
  return (
    <div className='piggybank-image'>
      <img
        src="images/piggybank/piggybank-body.png"
        alt="piggybank"
        width='400'
      />
      <img
        src="images/piggybank/piggybank-head5.png"
        alt="piggybank"
        width='350'
        style={{position: 'absolute', left: '27%', bottom: 60}}
      />
    </div>
  );
}

function TokenButton({
  mint,
  onClick,
}: {
  mint: PublicKey;
  onClick: () => void;
}) {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <div onClick={onClick} className='piggybank-token-button'>
      <TokenIcon mint={mint} style={{ width: 30, borderRadius: 50 }} />
      <TokenName mint={mint} style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Heebo' }} />
      <ExpandMore />
    </div>
  );
}

export function TokenIcon({ mint, style }: { mint: PublicKey; style: any }) {
  const tokenMap = useTokenMap();
  let tokenInfo = tokenMap.get(mint.toString());
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {tokenInfo?.logoURI ? (
        <img alt="Logo" style={style} src={tokenInfo?.logoURI} />
      ) : (
        <div style={style}></div>
      )}
    </div>
  );
}

function TokenName({ mint, style }: { mint: PublicKey; style: any }) {
  const tokenMap = useTokenMap();
  const theme = useTheme();
  let tokenInfo = tokenMap.get(mint.toString());

  return (
    <Typography
      style={{
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(1),
        ...style,
      }}
    >
      {tokenInfo?.symbol}
    </Typography>
  );
}

export function CleanupError(err: any) {

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

  let err_msg = ""

  try {
    const err_index = JSON.parse(err)["InstructionError"][1]["Custom"]
    err_msg = `: ${err_meanings[err_index]}`
  } catch(e) {
    console.log("Error parsing error", err)
  }

  return err_msg
}

export function DonationPointButton() {
  const {
    tokenMint,
    amount,
  } = useDonationPointContext();

  const wallet = useWallet();
  const connection = useConnection();
  const tokenMintInfo = useMint(tokenMint);
  const { enqueueSnackbar } = useSnackbar();

  const fromWallet = wallet.publicKey;
  const toWallet = new PublicKey("HTPALvkqhfQzaJFdr9otBpsCDvMx2UZiQmPtpVuAw3Zw");

  const sendDonationTransaction = async () => {
    if (!tokenMintInfo) {
      throw new Error("Unable to calculate mint decimals");
    }

    const isSol = tokenMint.equals(SOL_MINT);

    const SnackbarButton = styled(Button)({
      component: "a",
      color: "green",
      target:'_blank',
      rel:'noopener',
      '&:hover': {
        color: "white"
      }
    })
    // Build the donation.
    let txs = await (async () => {

      try {
    
        const {tx, outcome, err} = await sendSol(
          connection.connection,
          wallet,
          fromWallet!,
          toWallet,
          amount,
          pubkeyToString(tokenMint),
          isSol
        )

        outcome == true?
          enqueueSnackbar(`Transaction success`, {variant: "success"})
          : enqueueSnackbar(`Transaction failure${CleanupError(err.message)}`, { variant: "error" })

      } catch (e) {
          const err = new Error();
          console.error(`TX failed. ERROR ${err.message}`);
          enqueueSnackbar(`Transaction failure${CleanupError(err.message)}`, { variant: "error" })
      }

    })();
    
  };

  return (
    <button
      className='flp-button'
      onClick={sendDonationTransaction}
      disabled={false}> {
        // TODO : if amount is greater than balance 
      }
      {/* {isSending ?:} */}
      Donate
    </button>
  );
}