import { PublicKey } from "@solana/web3.js";
import { TokenInfo } from "@solana/spl-token-registry";
import {
    makeStyles,
    Dialog,
    DialogTitle,
    DialogContent,
    ListItem,
    Typography,
    Grid,
    Paper,
} from "@material-ui/core";
import { TokenIcon } from "./DonationPoint";
import { useTokens } from "../context/TokenList";
import { useMeta } from "../../../../contexts/meta/meta";
//@ts-ignore
import { AccordionWrapper, AccordionItem } from 'custom-react-accordion';
import { DoneOutlineRounded } from "@material-ui/icons";
import { useState } from "react";

const useStyles = makeStyles((theme) => ({
    dialogContent: {
        padding: 0,
        fontFamily: 'Heebo',
        border: '1px solid #eee'
    },
    tab: {
        color: '#797A8C',
        width: '200px',
        fontWeight: 500,
    },
    tabSelected: {
        color: 'black',
        width: '200px',
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

export default function DonorsDialog({
    donorsList,
}: {
    donorsList: [];
}) {
    const { metadata, isLoading } = useMeta();
    const [showDonorsDialog, setShowDonorsDialog] = useState(false);

    const styles = useStyles();

    const nftsGrid = (nfts: []) => (
        <Grid container spacing={2} style={{ padding: 25 }}>

            {nfts.map((nft, _) => {
                /* const pubkey = nft.info.mint;
                const image = nft.data.image; */
                return (
                    <Grid item xs={6}>
                        <Paper
                            style={{ background: 'transparent', boxShadow: 'none', cursor: 'pointer' }}>
                            {/* <MediaContent key={pubkey} pubkey={pubkey} uri={image} preview={false} style={{ borderRadius: 20 }} /> */}
                            <p style={{ margin: '5px 0', fontSize: 14, color: '#111', fontWeight: 700, fontFamily: 'Heebo', textAlign: 'center' }}>
                                {/* {nft.data.name} */}
                                NFT name
                            </p>
                        </Paper>
                    </Grid>
                );
            })
            }
        </Grid>
    );

    return (
        <>
            <button className='wof-button gradient-text h-gradient-red-yellow' onClick={() => setShowDonorsDialog(true)} >See Wall of Fame</button>
           {/*  <Dialog
                open={showDonorsDialog}
                onClose={() => setShowDonorsDialog(false)}
                scroll={"paper"}
                PaperProps={{
                    style: {
                        borderRadius: "16px",
                        width: "420px",
                        background: '#fff',
                        border: '3px solid #000',
                        color: "#333",
                        height: 600
                    },
                }}
            >
                <DialogTitle>
                    <Typography variant="h6" style={{
                        textAlign: 'center', marginTop: 10,
                        textTransform: 'uppercase', fontSize: 24, fontWeight: 800
                    }} className='gradient-text gradient-red-yellow'>
                        Wall of Fame
                    </Typography>
                </DialogTitle>
                <DialogContent className={styles.dialogContent} dividers={true}>

                    <AccordionWrapper>
                        {donorsList.map((donor, index) => (
                            <AccordionItem key={index} index={index} title={<DonorBasics donorInfo='a' />} description={'aa'} />
                        ))}
                    </AccordionWrapper>
                </DialogContent>
            </Dialog> */}
        </>
    );
}

function DonorBasics({
    donorInfo,
}: {
    donorInfo: string;
}) {

    return (
        <ListItem
            button
            style={{ padding: "10px 20px" }}
            className={'listItem'}
        >
            Hello
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


