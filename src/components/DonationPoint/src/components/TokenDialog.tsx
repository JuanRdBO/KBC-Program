import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { TokenInfo } from "@solana/spl-token-registry";
import {
  makeStyles,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  Typography,
  Tabs,
  Tab,
} from "@material-ui/core";
import { TokenIcon } from "./DonationPoint";
import { useTokens } from "../context/TokenList";
import { useMediaQuery } from "@material-ui/core";
import { useMeta } from "../../../../contexts/meta/meta";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: 0,
  },
  textField: {
    marginBottom: "8px",
  },
  input: {
    color: '#fff',
    border: '1px solid #797A8C'

  },
  tab: {
    minWidth: "134px",
    color: '#797A8C',
    fontWeight: 500,
  },
  tabSelected: {
    color: 'white',
    fontWeight: 500,
    backgroundColor: '#292A3C',
    borderRadius: "10px",
  },
  tabIndicator: {
    opacity: 0,
  },
}));

export const pubkeyToString = (key: PublicKey | null | string = '') => {
  return typeof key === 'string' ? key : key?.toBase58() || '';
};

export default function TokenDialog({
  open,
  onClose,
  setMint,
}: {
  open: boolean;
  onClose: () => void;
  setMint: (mint: PublicKey) => void;
}) {
  const {metadata, isLoading} = useMeta()
  const [tabSelection, setTabSelection] = useState(0);
  const [tokenFilter, setTokenFilter] = useState("");
  const filter = tokenFilter.toLowerCase();
  const styles = useStyles();
  const { tokens, tokensSollet, tokensWormhole } =
    useTokens();
  const displayTabs = !useMediaQuery("(max-width:450px)");
  const selectedTokens =
    tabSelection === 0
      ? tokens
      : tabSelection === 1
        ? tokensWormhole
        : tokensSollet;
  let walletTokens =
    tokenFilter === ""
      ? selectedTokens
      : selectedTokens.filter(
        (t: { symbol: string; name: string; address: string; }) =>
          t.symbol.toLowerCase().startsWith(filter) ||
          t.name.toLowerCase().startsWith(filter) ||
          t.address.toLowerCase().startsWith(filter)
      );
        
  if (metadata)
    walletTokens = walletTokens.filter(w => 
          metadata.some(m => pubkeyToString(m.info.mint) == w.address 
          || w.name == "Native SOL")
        )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      scroll={"paper"}
      PaperProps={{
        style: {
          borderRadius: "10px",
          width: "420px",
          background: '#18192B',
          border: '2px solid #292A3C',
          color: "white",
        },
      }}
    >
      <DialogTitle style={{ fontWeight: "bold" }}>
        <Typography variant="h6" style={{ paddingBottom: "16px" }}>
          Select a token
        </Typography>
        <TextField
          className={styles.textField}
          placeholder={"Search name"}
          value={tokenFilter}
          fullWidth
          variant="outlined"
          InputProps={{
            className: styles.input,
          }}
          onChange={(e) => setTokenFilter(e.target.value)}
        />
      </DialogTitle>
      <DialogContent className={styles.dialogContent} dividers={true}>
        <List disablePadding>
          {walletTokens.map((tokenInfo: TokenInfo) => (
            <TokenListItem
              key={tokenInfo.address}
              tokenInfo={tokenInfo}
              onClick={(mint) => {
                setMint(mint);
                onClose();
              }}
            />
          ))}
        </List>
      </DialogContent>
      {displayTabs && (
        <DialogActions>
          <Tabs
            value={tabSelection}
            onChange={(e, v) => setTabSelection(v)}
            classes={{
              indicator: styles.tabIndicator,
            }}
          >
            <Tab
              value={0}
              className={styles.tab}
              classes={{ selected: styles.tabSelected }}
              label="Main"
            />
            <Tab
              value={1}
              className={styles.tab}
              classes={{ selected: styles.tabSelected }}
              label="Wormhole"
            />
            <Tab
              value={2}
              className={styles.tab}
              classes={{ selected: styles.tabSelected }}
              label="Sollet"
            />
          </Tabs>
        </DialogActions>
      )}
    </Dialog>
  );
}

function TokenListItem({
  tokenInfo,
  onClick,
}: {
  tokenInfo: TokenInfo;
  onClick: (mint: PublicKey) => void;
}) {
  const mint = new PublicKey(tokenInfo.address);
  return (
    <ListItem
      button
      onClick={() => onClick(mint)}
      style={{ padding: "10px 20px" }}
    >
      <TokenIcon mint={mint} style={{ width: "30px", borderRadius: "15px" }} />
      <TokenName tokenInfo={tokenInfo} />
    </ListItem>
  );
}

function TokenName({ tokenInfo }: { tokenInfo: TokenInfo }) {
  return (
    <div style={{ marginLeft: "16px" }}>
      <Typography style={{ fontWeight: "bold" }}>
        {tokenInfo?.symbol}
      </Typography>
      <Typography color="textSecondary" style={{ fontSize: "14px", color: '#797A8C' }}>
        {tokenInfo?.name}
      </Typography>
    </div>
  );
}
