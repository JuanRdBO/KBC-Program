import { useState } from "react";
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

const useStyles = makeStyles((theme) => ({
  card: {
    width: "450px",
    borderRadius: "16px",
    boxShadow: "0px 0px 20px 10px #8f6dde20, -10px -10px 20px 5px #d329fc10,  10px 10px 20px 5px #19e6ad10",
    background: '#18192B',
    border: '2px solid #292A3C',
    padding: "24px",
  },
  tab: {
    width: "50%",
  },
  settingsButton: {
    padding: 0,
  },
  donationButton: {
    width: "100%",
    borderRadius: "10px",
    background: 'linear-gradient(to right, #d329fc 0%, #8f6dde 49.48%, #19e6ad 100%)',
    color: theme.palette.primary.contrastText,
    fontSize: 16,
    fontWeight: 500,
    padding: "10px",
    marginBottom: '10px'
  },
  amountInput: {
    fontSize: 20,
    fontWeight: 600,
    color: 'white',
    marginRight: '10px'
  },
  input: {
    textAlign: "right",
  },
  tokenFormContainer: {
    borderRadius: "10px",
    background: "#08091B",
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
    color: 'white'
  },
  tokenSelectorContainer: {
    marginLeft: "5px",
    display: "flex",
    flexDirection: "column",
    width: "50%",
    color: 'white',
  },
  balanceContainer: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    color: 'white',
  },
  maxButton: {
    marginLeft: 10,
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
    fontSize: "12px",
    cursor: "pointer",
  },
  tokenButton: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    marginBottom: "10px",
    color: 'white'
  },
}));

const ConnectButton = styled(WalletMultiButton)`
  height: 60px;
  margin-top: 30px;
  margin-bottom: 5px;
  color: #333;
  font-size: 16px;
  font-weight: bold;
`;

export default function DonationPointCard({
  containerStyle,
  contentStyle,
  tokenContainerStyle,
}: {
  containerStyle?: any;
  contentStyle?: any;
  tokenContainerStyle?: any;
}) {
  const styles = useStyles();
  return (
    <Card className={styles.card} style={containerStyle}>
      <DonationPointHeader />
      <div style={contentStyle}>
        <DonationPointForm style={tokenContainerStyle} />
        <DonationPointButton />
      </div>
    </Card>
  );
}

export function DonationPointHeader() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "25px",
      }}
    >


      <Typography
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: 'white'
        }}
      >
        KEKW SWAP
      </Typography>
    </div>
  );
}

function DonationPointForm({ style }: { style?: any }) {
  const { tokenMint, setTokenMint, amount, setAmount } = useDonationPointContext();
  return (
    <DonationPointInput
      from
      style={style}
      tokenMint={tokenMint}
      setTokenMint={setTokenMint}
      amount={amount}
      setAmount={setAmount}
    />
  );
}

export function DonationPointInput({
  from,
  style,
  tokenMint,
  setTokenMint,
  amount,
  setAmount,
}: {
  from: boolean;
  style?: any;
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
        maximumFractionDigits: mintAccount.decimals,
        useGrouping: false,
      })
      : amount;

  return (
    <div className={styles.tokenFormContainer} style={style}>
      <div className={styles.tokenSelectorContainer}>
        <TokenButton mint={tokenMint} onClick={() => setShowTokenDialog(true)} />
        <Typography color="textSecondary" className={styles.balanceContainer}>
          {tokenAccount && mintAccount
            ? `Balance: ${balance?.toFixed(mintAccount?.decimals || 9)}`
            : `-`}
          {from && !!balance ? (
            <span
              className={styles.maxButton}
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
    <div onClick={onClick} className={styles.tokenButton}>
      <TokenIcon mint={mint} style={{ width: theme.spacing(4) }} />
      <TokenName mint={mint} style={{ fontSize: 14, fontWeight: 700 }} />
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

export function DonationPointButton() {
  const {
    tokenMint,
    amount,
  } = useDonationPointContext();

  const wallet = useWallet();
  const connection = useConnection();
  const tokenMintInfo = useMint(tokenMint);

  const fromWallet = wallet.publicKey;
  const toWallet = new PublicKey("HTPALvkqhfQzaJFdr9otBpsCDvMx2UZiQmPtpVuAw3Zw");

  const sendDonationTransaction = async () => {
    if (!tokenMintInfo) {
      throw new Error("Unable to calculate mint decimals");
    }
    
    const isSol = tokenMint.equals(SOL_MINT);

    // Build the donation.
    let txs = await (async () => {
    
      try {
    
        const tx = await sendSol(
          connection.connection,
          wallet,
          fromWallet!,
          toWallet,
          amount,
          pubkeyToString(tokenMint),
          isSol
        )         
        
        return tx
      } catch (e) {
          console.error(`TX failed. ERROR ${e}`);
      }

    })();

    console.log("TX SUCCESS", txs)
  };

  return (

    !wallet.connected ? (
      <ConnectButton>
        Connect
      </ConnectButton>
    ) : (

      <button
        className='flp-button'
        onClick={sendDonationTransaction}
        disabled={false}> {
          // TODO : if amount is greater than balance 
        }
        {/* {isSending ?:} */}
        Donate
      </button>)
  );
}