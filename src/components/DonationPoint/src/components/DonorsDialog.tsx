import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { TokenInfo } from "@solana/spl-token-registry";
import {
    makeStyles,
    ListItem,
    Typography,
    Grid,
    Paper,
    DialogTitle,
    Dialog,
    DialogContent,
    Tooltip,
    List,
    withStyles,
    ClickAwayListener,
} from "@material-ui/core";
import { DonorInfo, } from "./DonationPoint";

import { useMeta } from "../../../../contexts/meta/meta";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTokens } from "../context/TokenList";

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

const DonationsTooltip = withStyles(() => ({
    tooltip: {
        backgroundColor: 'white',
        border: '2px solid black',
        borderRadius: 8,
        color: 'rgba(0, 0, 0, 0.87)',
        fontSize: 12,
        padding: 10,
    },
}))(Tooltip);

export const pubkeyToString = (key: PublicKey | null | string = '') => {
    return typeof key === 'string' ? key : key?.toBase58() || '';
};

export default function DonorsDialog({
    donorsList,
}: {
    donorsList: DonorInfo[];
}) {
    const wallet = useWallet();
    const { isLoading } = useMeta();
    const [showDonorsDialog, setShowDonorsDialog] = useState(false);
    const styles = useStyles();

    /*  if (donorsList) {
         donorsList.push(...donorsList);
         donorsList.push(...donorsList);
     } */

    return (
        <>
            {wallet.connected && !isLoading && <button className={'wof-button gradient-text h-gradient-red-yellow'} disabled={isLoading} onClick={() => setShowDonorsDialog(true)} >See Wall of Fame</button>}
            <Dialog
                fullWidth={true}
                maxWidth={'xl'}
                open={showDonorsDialog}
                onClose={() => setShowDonorsDialog(false)}
                scroll={"paper"}
                PaperProps={{
                    style: {
                        borderRadius: "16px",
                        width: "90vw",
                        background: '#fff',
                        border: '3px solid #000',
                        color: "#333",
                        height: '90vh'
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
                    {
                        donorsList ?
                            <div className="row col-mb-10 mb-5">
                                <div className=" col-lg-3 col-md-4  col-sm-4 col-xs-6 col-6  my-2">
                                    {
                                        donorsList.length > 100 ?
                                            donorsList.slice(0, 100).map((donor, index) => (
                                                <DonorBasics index={index + 1} donorInfo={donor} />
                                            )) : donorsList.map((donor, index) => (
                                                <DonorBasics index={index + 1} donorInfo={donor} />
                                            ))
                                    }
                                </div>

                                <div className=" col-lg-3 col-md-4  col-sm-4 col-xs-6 col-6 my-2">
                                    {
                                        donorsList.length > 200 ?
                                            donorsList.slice(100, 200).map((donor, index) => (
                                                <DonorBasics index={index + 1 + 100} donorInfo={donor} />
                                            )) : donorsList.slice(100, -1).map((donor, index) => (
                                                <DonorBasics index={index + 1 + 100} donorInfo={donor} />
                                            ))
                                    }
                                </div>

                                <div className=" col-lg-3 col-md-4  col-sm-4 col-xs-6 col-6 my-2">
                                    {
                                        donorsList.length > 300 ?
                                            donorsList.slice(200, 300).map((donor, index) => (
                                                <DonorBasics index={index + 1 + 200} donorInfo={donor} />
                                            )) : donorsList.slice(200, -1).map((donor, index) => (
                                                <DonorBasics index={index + 1 + 200} donorInfo={donor} />
                                            ))
                                    }
                                </div>

                                <div className=" col-lg-3 col-md-4  col-sm-4 col-xs-6 col-6 my-2">
                                    {
                                        donorsList.length > 300 ?
                                            donorsList.slice(300, 400).map((donor, index) => (
                                                <DonorBasics index={index + 1 + 300} donorInfo={donor} />
                                            )) : donorsList.slice(300, -1).map((donor, index) => (
                                                <DonorBasics index={index + 1 + 300} donorInfo={donor} />
                                            ))
                                    }
                                </div>

                                <div className=" col-lg-3 col-md-4  col-sm-4 col-xs-6 col-6 my-2">
                                    {
                                        donorsList.length > 400 ?
                                            donorsList.slice(400, 500).map((donor, index) => (
                                                <DonorBasics index={index + 1 + 400} donorInfo={donor} />
                                            )) : donorsList.slice(400, -1).map((donor, index) => (
                                                <DonorBasics index={index + 1 + 400} donorInfo={donor} />
                                            ))
                                    }
                                </div>

                                <div className=" col-lg-3 col-md-4  col-sm-4 col-xs-6 col-6 my-2">
                                    {
                                        donorsList.length > 500 ?
                                            donorsList.slice(500, 600).map((donor, index) => (
                                                <DonorBasics index={index + 1 + 500} donorInfo={donor} />
                                            )) : donorsList.slice(500, -1).map((donor, index) => (
                                                <DonorBasics index={index + 1 + 500} donorInfo={donor} />
                                            ))
                                    }
                                </div>

                                <div className=" col-lg-3 col-md-4  col-sm-4 col-xs-6 col-6 my-2">
                                    {
                                        donorsList.length > 600 ?
                                            donorsList.slice(600, 700).map((donor, index) => (
                                                <DonorBasics index={index + 1 + 600} donorInfo={donor} />
                                            )) : donorsList.slice(600, -1).map((donor, index) => (
                                                <DonorBasics index={index + 1 + 600} donorInfo={donor} />
                                            ))
                                    }
                                </div>

                                <div className=" col-lg-3 col-md-4  col-sm-4 col-xs-6 col-6 my-2">
                                    {
                                        donorsList.length > 700 ?
                                            donorsList.slice(700, 800).map((donor, index) => (
                                                <DonorBasics index={index + 1 + 700} donorInfo={donor} />
                                            )) : donorsList.slice(700, -1).map((donor, index) => (
                                                <DonorBasics index={index + 1 + 700} donorInfo={donor} />
                                            ))
                                    }
                                </div>

                                <div className=" col-lg-3 col-md-4  col-sm-4 col-xs-6 col-6 my-2">
                                    {
                                        donorsList.length > 800 ?
                                            donorsList.slice(800, 900).map((donor, index) => (
                                                <DonorBasics index={index + 1 + 800} donorInfo={donor} />
                                            )) : donorsList.slice(800, -1).map((donor, index) => (
                                                <DonorBasics index={index + 1 + 800} donorInfo={donor} />
                                            ))
                                    }
                                </div>

                                <div className=" col-lg-2 col-md-3  col-sm-4 col-xs-6 col-6 my-2">
                                    {
                                        donorsList.length > 900 ?
                                            donorsList.slice(900, 1000).map((donor, index) => (
                                                <DonorBasics index={index + 1 + 900} donorInfo={donor} />
                                            )) : donorsList.slice(900, -1).map((donor, index) => (
                                                <DonorBasics index={index + 1 + 900} donorInfo={donor} />
                                            ))
                                    }
                                </div>

                                <div className=" col-lg-2 col-md-3  col-sm-4 col-xs-6 col-6 my-2">
                                    {
                                        donorsList.length > 1000 ?
                                            donorsList.slice(1000, 1100).map((donor, index) => (
                                                <DonorBasics index={index + 1 + 1000} donorInfo={donor} />
                                            )) : donorsList.slice(1000, -1).map((donor, index) => (
                                                <DonorBasics index={index + 1 + 1000} donorInfo={donor} />
                                            ))
                                    }
                                </div>

                                <div className=" col-lg-2 col-md-3  col-sm-4 col-xs-6 col-6 my-2">
                                    {
                                        donorsList.length > 1100 ?
                                            donorsList.slice(1100, 1200).map((donor, index) => (
                                                <DonorBasics index={index + 1 + 1100} donorInfo={donor} />
                                            )) : donorsList.slice(1100, -1).map((donor, index) => (
                                                <DonorBasics index={index + 1 + 1100} donorInfo={donor} />
                                            ))
                                    }
                                </div>
                            </div>
                            :
                            <div>No donations yet</div>
                    }
                </DialogContent>
            </Dialog>
        </>
    );
}



function DonorBasics({
    index,
    donorInfo,
}: {
    index: number,
    donorInfo: DonorInfo;
}) {

    const [open, setOpen] = useState(false);

    const handleTooltipClose = () => {
        setOpen(false);
    };

    const handleTooltipOpen = () => {
        setOpen(true);
    };


    return (
        <div
            className={'wof-item'}
        >
            <ClickAwayListener onClickAway={handleTooltipClose}>
                <div>
                    <DonationsTooltip arrow
                        onClose={handleTooltipClose}
                        open={open}
                        disableFocusListener
                        disableHoverListener
                        disableTouchListener
                        title={<DonationsBox donorInfo={donorInfo} />}>
                        <div onClick={handleTooltipOpen} className="row justify-content-between" style={{ textAlign: 'left', padding: '0px 7px', fontWeight: 500 }}>
                            <div className="col-2" style={{ color: '#aaa' }}>
                                {index}.
                            </div>
                            <div className="col-6" style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {donorInfo.donorName}
                            </div>
                            <div className="col-4" style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>

                                {
                                    //@ts-ignore
                                    (donorInfo.donatedSol / LAMPORTS_PER_SOL).toFixed(1)
                                } SOL
                            </div>
                        </div>
                    </DonationsTooltip>
                </div>
            </ClickAwayListener>
        </div>
    );
}

function DonationsBox({
    donorInfo,
}: {
    donorInfo: DonorInfo;
}) {
    const { tokens } = useTokens();

    const links = donorInfo.donatedTokens.map(token =>
        token.arweaveLink);

    let [symbols, setSymbols] = useState([]) as any;
    let [images, setImages] = useState([]) as any;

    // 3. Create out useEffect function
    useEffect(() => {
        for (var i = 0; i < links.length; i++)
            loadData(links[i]);
    }, []);

    const loadData = async (link: string) => {
        try {
            if (link === '_') {
                setSymbols([...symbols, 'err']);
                setImages([...images, 'err']);
            }
            else {
                let response = await fetch(link);
                let responseJson = await response.json();
                setSymbols([...symbols, responseJson.symbol]);
                setImages([...images, responseJson.image]);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const tokenDonations = donorInfo.donatedTokens.map((token, index) =>
        token.donatedAmount.map(donation => {
            const tokenSymbol = tokens.filter(t => t.address === token.donatedToken.toBase58())[0]?.symbol;

            return (
                <div className="row" style={{ width: 240 }}>
                    <div className=" col-4" style={{ overflow: 'hidden', }}>
                        {tokenSymbol ? tokenSymbol : symbols[index] ? symbols[index] : 'NFT'}
                    </div>
                    {token.isNft ?
                        <div className=" col-3" style={{ textAlign: 'center', }}>
                            <img height={15}
                                src={images[index]}
                                style={{ borderRadius: 4 }}
                                alt="" />
                        </div>
                        :
                        <div className="col-3" style={{ textAlign: 'center', }}>
                            {tokenSymbol === 'SOL' ?
                                //@ts-ignore
                                (donorInfo.donatedSol / LAMPORTS_PER_SOL).toFixed(2) :
                                donation.donatedAmount.toString()}
                        </div>}
                    <div className=" col-5" >
                        {new Date(donation.timestamp.toNumber() * 1000).toLocaleString().split(',')[0]}
                    </div>
                </div>
            );
        })
    );

    return (
        <>
            <div >
                <div className="row" style={{ width: 240, marginBottom: 5, }}>
                    <div className=" col-6" style={{ textAlign: 'left', fontWeight: 700 }}>
                        {donorInfo.donorName}
                    </div>
                    <div className=" col-6" style={{ textAlign: 'right', fontWeight: 700 }}>
                        {donorInfo.twitterHandle}
                    </div>
                </div>
                <div className="row" style={{ width: 240, }}>
                    <div className=" col-4" style={{ overflow: 'hidden', color: '#aaa' }}>
                        Token
                    </div>

                    <div className="col-3" style={{ textAlign: 'center', color: '#aaa' }}>
                        #
                    </div>

                    <div className=" col-5" style={{ color: '#aaa' }}>
                        Date
                    </div>
                </div>
                {tokenDonations ? tokenDonations : 'Loading...'}
            </div>
        </>
    )
}