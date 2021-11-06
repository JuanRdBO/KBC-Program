import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { TokenInfo } from "@solana/spl-token-registry";
import {
  makeStyles,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  Typography,
  Tabs,
  Tab,
  Grid,
  Paper,
} from "@material-ui/core";
import { TokenIcon } from "./DonationPoint";
import { useTokens } from "../context/TokenList";
import { useMediaQuery } from "@material-ui/core";
import { useMeta } from "../../../../contexts/meta/meta";
import { MediaContent } from "../../../MediaContent";
import { CardLoader } from "../../../MyLoader";
import { Metadata } from "../../../../logic/get-mints";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: 0,
    fontFamily: 'Heebo',
  },
  tab: {
    color: '#797A8C',
    width:'200px',
    fontWeight: 500,
  },
  tabSelected: {
    color: 'black',
    width:'200px',
    fontWeight: 700,
    backgroundColor: 'white',
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
  const { metadata, isLoading } = useMeta()
  const [tabSelection, setTabSelection] = useState(0);
  const [tokenFilter, setTokenFilter] = useState("");
  const filter = tokenFilter.toLowerCase();
  const styles = useStyles();
  const { tokens/* , tokensSollet, tokensWormhole  */ } =
    useTokens();
  const displayTabs = true;
  let walletTokens =
    tokenFilter === ""
      ? tokens
      : tokens.filter(
        (t: { symbol: string; name: string; address: string; }) =>
          t.symbol.toLowerCase().startsWith(filter) ||
          t.name.toLowerCase().startsWith(filter) ||
          t.address.toLowerCase().startsWith(filter)
      );

  if (metadata) {
    walletTokens = walletTokens.filter(w =>
      metadata.some(m => pubkeyToString(m.info.mint) == w.address
        || w.name == "Native SOL")
    );
  }

  var walletNfts: Metadata[] = [];
  if (metadata) walletNfts = metadata.filter(m => m.info.isNFT);

  const mediaGrid = (
    <Grid container spacing={2} style={{ padding: 12 }}>

      {walletNfts.length > 0
        ? walletNfts.map((nft, _) => {
          const pubkey = nft.info.mint;
          const image = nft.data.image;
          
          return (
            //{/* <img src={nft.data.image}/> */}
            image && <Grid item xs={6}  > <Paper onClick={(_) => {
              console.log('minttt', pubkey);
              setMint(new PublicKey(pubkey));
              onClose();
            }}
            style={{background: 'transparent', boxShadow: 'none', cursor: 'pointer'}}>
              <MediaContent key={pubkey} pubkey={pubkey} uri={image} preview={false} style={{borderRadius: 20}} />
              <p style={{margin: '5px 0', fontSize: 14,color: '#111', fontWeight: 700, fontFamily: 'Heebo', textAlign: 'center'}}>{nft.data.name}</p>
            </Paper>
            </Grid>
          );
        })
        : [...Array(10)].map((_, idx) => <CardLoader key={idx} />)}

    </Grid>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      scroll={"paper"}
      PaperProps={{
        style: {
          borderRadius: "16px",
          width: "420px",
          background: '#fff',
          border: '3px solid #000',
          color: "#333",
          transition: 'height 5 ease',
        },
      }}
    >

      <DialogTitle>
        <Typography variant="h6" style={{
           textAlign: 'center',
          textTransform: 'uppercase', fontSize: 24, fontWeight: 800
        }} className='gradient-text gradient-red-yellow'>
          {tabSelection == 0 ? 'Select a token' : 'Select an NFT'}
        </Typography>
        {/* <SearchTokenTextField
          className={styles.textField}
          placeholder={"Search token"}
          value={tokenFilter}
          fullWidth
          variant="standard"
          InputProps={{
            className: styles.input,
          }}
          onChange={(e) => setTokenFilter(e.target.value)}
        /> */}
      </DialogTitle>
      <DialogContent className={styles.dialogContent} dividers={true}>
        {tabSelection === 0 ?
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
          </List> : mediaGrid}
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
              label="Tokens"
            />
            <Tab
              value={1}
              className={styles.tab}
              classes={{ selected: styles.tabSelected }}
              label="NFTs"
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
      <Typography style={{ fontWeight: 800, fontFamily: 'Heebo', fontSize: 24 }}>
        {tokenInfo?.symbol}
      </Typography>
      {/* <Typography color="textSecondary" style={{ fontSize: "14px", color: '#797A8C' }}>
        {tokenInfo?.name}
      </Typography> */}
    </div>
  );
}
