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

  tab: {
    width: "50%",
  },
  amountInput: {
    fontSize: 20,
    fontWeight: 600,
    marginRight: '10px'
  },
  input: {
    textAlign: "right",
    color: 'black',
    border: '1px solid orange',
    fontSize: 34,
    width: 150,
  },
  tokenFormContainer: {
    background: "transparent",
    borderBottom: '4px solid black',
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
  },
  tokenSelectorContainer: {
    marginLeft: "5px",
    display: "flex",
    flexDirection: "column",
    width: "50%",
    border: '1px solid pink',
  },
  balanceContainer: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    border: '1px solid green',
    color: '#333',
  },
  maxButton: {
    marginLeft: 10,
    color: '#333',
    fontWeight: 600,
    fontSize: "12px",
    cursor: "pointer",
    border: '1px solid blue',
  },
  tokenButton: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    marginBottom: "10px",
    color: '#333',
    border: '1px solid lime',
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
  tokenContainerStyle,
}: {
  containerStyle?: any;
  tokenContainerStyle?: any;
}) {
  return (
    <Card style={{
      borderRadius: '50%',
      border: '4px solid black',
      background: '#fff',
      padding: 75,
    }}>
      <DonationPointHeader />
      <DonationPointForm/>
      <DonationPointButton />
    </Card>
  );
}

export function DonationPointHeader() {
  return (
    <div
      style={{
        marginBottom: "25px",
        textAlign: 'center'
      }}
    >
      <Typography
        className={'gradient-text wallet-adapter-modal-title'}
        style={{
          fontSize: 32,
          fontFamily: 'Heebo',
          fontWeight: 800,
          textAlign: 'center'
        }}
      >
        PIGGYBANK
      </Typography>
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
        maximumFractionDigits: mintAccount.decimals,
        useGrouping: false,
      })
      : amount;

  return (
    <div className={styles.tokenFormContainer} style={{}}>
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