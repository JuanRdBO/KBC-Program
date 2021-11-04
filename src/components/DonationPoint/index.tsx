import { useState } from "react";
import {
    PublicKey,

} from "@solana/web3.js";
import {
    makeStyles,
    Button,
    Typography,
    TextField,
    useTheme,
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";

import TokenDialog from "../TokenDialog";
import { useMint, useOwnedTokenAccount } from "../../context/Token";
import { useDonationPointContext } from "../../context/DonationPoint";
import { useTokenMap } from "../../context/tokenList";

const useStyles = makeStyles((theme) => ({
    card: {
        width: theme.spacing(50),
        borderRadius: theme.spacing(2),
        boxShadow: "0px 0px 30px 5px rgba(0,0,0,0.075)",
        padding: theme.spacing(2),
    },
    tab: {
        width: "50%",
    },
    settingsButton: {
        padding: 0,
    },
    swapButton: {
        width: "100%",
        borderRadius: theme.spacing(2),
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        fontSize: 16,
        fontWeight: 700,
        padding: theme.spacing(1.5),
    },
    swapToFromButton: {
        display: "block",
        margin: "10px auto 10px auto",
        cursor: "pointer",
    },
    amountInput: {
        fontSize: 22,
        fontWeight: 600,
    },
    input: {
        textAlign: "right",
    },
    swapTokenFormContainer: {
        borderRadius: theme.spacing(2),
        boxShadow: "0px 0px 15px 2px rgba(33,150,243,0.1)",
        display: "flex",
        justifyContent: "space-between",
        padding: theme.spacing(1),
    },
    swapTokenSelectorContainer: {
        marginLeft: theme.spacing(1),
        display: "flex",
        flexDirection: "column",
        width: "50%",
    },
    balanceContainer: {
        display: "flex",
        alignItems: "center",
        fontSize: "14px",
    },
    maxButton: {
        marginLeft: theme.spacing(1),
        color: theme.palette.primary.main,
        fontWeight: 700,
        fontSize: "12px",
        cursor: "pointer",
    },
    tokenButton: {
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        marginBottom: theme.spacing(1),
    },
}));

export default function DonationPoint({
    containerStyle,
    contentStyle,
    swapTokenContainerStyle,
  }: {
    containerStyle?: any;
    contentStyle?: any;
    swapTokenContainerStyle?: any;
  }) {
    const styles = useStyles();
    const { mint, setMint, amount, setAmount } = useDonationPointContext();
    return (

        
        <div style={contentStyle}>
          <DonationTokenForm 
          from
          mint={mint}
          setMint={setMint}
          amount={amount}
          setAmount={setAmount}
          style={swapTokenContainerStyle} />
          <DonationButton />
        </div>
    );
  }

export function DonationTokenForm({
    style,
    mint,
    setMint,
    amount,
    setAmount,
}: {
    from: boolean;
    style?: any;
    mint: PublicKey;
    setMint: (m: PublicKey) => void;
    amount: number;
    setAmount: (a: number) => void;
}) {
    const styles = useStyles();

    const [showTokenDialog, setShowTokenDialog] = useState(false);
    const tokenAccount = useOwnedTokenAccount(mint);
    const mintAccount = useMint(mint);

    const balance =
        tokenAccount &&
        mintAccount &&
        tokenAccount.account.amount.toNumber() / 10 ** mintAccount.decimals;

    const formattedAmount =
        mintAccount && amount
            ? amount.toLocaleString("fullwide", {
                maximumFractionDigits: mintAccount.decimals,
                useGrouping: false,
            })
            : amount;

    return (
        <div className={styles.swapTokenFormContainer} style={style}>
            <div className={styles.swapTokenSelectorContainer}>
                <TokenButton mint={mint} onClick={() => setShowTokenDialog(true)} />
                <Typography color="textSecondary" className={styles.balanceContainer}>
                    {tokenAccount && mintAccount
                        ? `Balance: ${balance?.toFixed(mintAccount.decimals)}`
                        : `-`}
                    {!!balance ? (
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
                setMint={setMint}
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

export function DonationButton() {
    const styles = useStyles();

    // TODO : Logica Joan

    return (
        <Button
            variant="contained"
            className={styles.swapButton}
        /* onClick={sendSwapTransaction}
        disabled={!canSwap} */
        >
            Donate
        </Button>
    );
}