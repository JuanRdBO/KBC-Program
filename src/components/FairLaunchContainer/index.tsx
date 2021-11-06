import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  CircularProgress,
  Container,
  IconButton,
  Link,
  Slider,
  Snackbar,
} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { PhaseCountdown } from '../Countdown';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import CloseIcon from '@material-ui/icons/Close';

import Alert from '@material-ui/lab/Alert';

import * as anchor from '@project-serum/anchor';

import { LAMPORTS_PER_SOL } from '@solana/web3.js';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import {
  awaitTransactionSignatureConfirmation,
  CandyMachineAccount,
  getCandyMachineState,
  mintOneToken,
} from '../../logic/candy-machine';

import {
  FairLaunchAccount,
  getFairLaunchState,
  punchTicket,
  purchaseTicket,
  receiveRefund,
} from '../../logic/fair-launch';

import { formatNumber, getAtaForMint, toDate } from '../../logic/utils';
import Countdown from 'react-countdown';

const ConnectButton = styled(WalletMultiButton)`
  height: 60px;
  margin-top: 30px;
  margin-bottom: 5px;
  color: #333;
  font-size: 16px;
  font-weight: bold;
`;

const MintContainer = styled.div`
background-color: white;
border: 2px solid red
`; // add your styles here

const ValueSlider = styled(Slider)({
  color: 'red',
  height: 8,
  '& > *': {
    height: 3,
    color: 'black'
  },
  '& .MuiSlider-track': {
    border: 'none',
    height: 4,
  },
  '& .MuiSlider-thumb': {
    height: 20,
    width: 20,
    marginTop: -8,
    background: `linear-gradient(
      110.78deg,
      rgb(118, 230, 80) -1.13%,
      rgb(249, 214, 73) 15.22%,
      rgb(240, 142, 53) 32.09%,
      rgb(236, 81, 87) 48.96%,
      rgb(255, 24, 189) 67.94%,
      rgb(26, 75, 255) 85.34%
    ) !important`,
    border: '0px solid currentColor',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
    },
    '&:before': {
      display: 'none',
    },
  },
  '& .MuiSlider-valueLabel': {
    '& > *': {
      background: `black`,
    },
    lineHeight: 1.2,
    fontSize: 12,
    padding: 0,
    width: 32,
    height: 32,
    marginLeft: 9,
  },
});

enum Phase {
  Phase0,
  Phase1,
  Phase2,
  Lottery,
  Phase3,
  Phase4,
  Unknown,
}

const Header = (props: {
  phaseName: string;
  desc: string;
  date: anchor.BN | undefined;
  status?: string;
}) => {
  const { phaseName, desc, date, status } = props;
  return (
    <Grid container justifyContent="center">
      <Grid xs={phaseName == "JOJO's Candy Machine" ? 12 : 6} justifyContent='center' direction="column">
        <Typography style={{ fontWeight: 800, color: '#333', fontSize: phaseName == "JOJO's Candy Machine" ? 16 : 24, margin: 0, textAlign: phaseName == "JOJO's Candy Machine" ? 'center' : 'left' }}>
          {phaseName}
        </Typography>
        <Typography variant="body2" style={{ color: '#333', textAlign: 'left' }}>
          {desc}
        </Typography>
      </Grid>
      <Grid xs={6} container justifyContent="flex-end"  >
        <PhaseCountdown
          date={toDate(date)}
          style={{ justifyContent: 'flex-end', }}
          status={status || 'COMPLETE'}
        />
      </Grid>
    </Grid>
  );
};

function getPhase(
  fairLaunch: FairLaunchAccount | undefined,
  candyMachine: CandyMachineAccount | undefined,
): Phase {
  const curr = new Date().getTime();

  const phaseOne = toDate(fairLaunch?.state.data.phaseOneStart)?.getTime();
  const phaseOneEnd = toDate(fairLaunch?.state.data.phaseOneEnd)?.getTime();
  const phaseTwoEnd = toDate(fairLaunch?.state.data.phaseTwoEnd)?.getTime();
  const candyMachineGoLive = toDate(candyMachine?.state.goLiveDate)?.getTime();

  if (phaseOne && curr < phaseOne) {
    return Phase.Phase0;
  } else if (phaseOneEnd && curr <= phaseOneEnd) {
    return Phase.Phase1;
  } else if (phaseTwoEnd && curr <= phaseTwoEnd) {
    return Phase.Phase2;
  } else if (!fairLaunch?.state.phaseThreeStarted) {
    return Phase.Lottery;
  } else if (
    fairLaunch?.state.phaseThreeStarted &&
    candyMachineGoLive &&
    curr > candyMachineGoLive
  ) {
    return Phase.Phase4;
  } else if (fairLaunch?.state.phaseThreeStarted) {
    return Phase.Phase3;
  }

  return Phase.Unknown;
}

export interface FairLaunchContainerProps {
  candyMachineId?: anchor.web3.PublicKey;
  fairLaunchId: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  txTimeout: number;
}

const FAIR_LAUNCH_LOTTERY_SIZE =
  8 + // discriminator
  32 + // fair launch
  1 + // bump
  8; // size of bitmask ones

const isWinner = (
  fairLaunch: FairLaunchAccount | undefined,
  fairLaunchBalance: number,
): boolean => {
  if (fairLaunchBalance > 0) return true;
  if (
    !fairLaunch?.lottery.data ||
    !fairLaunch?.lottery.data.length ||
    !fairLaunch?.ticket.data?.seq ||
    !fairLaunch?.state.phaseThreeStarted
  ) {
    return false;
  }

  const myByte =
    fairLaunch.lottery.data[
    FAIR_LAUNCH_LOTTERY_SIZE +
    Math.floor(fairLaunch.ticket.data?.seq.toNumber() / 8)
    ];

  const positionFromRight = 7 - (fairLaunch.ticket.data?.seq.toNumber() % 8);
  const mask = Math.pow(2, positionFromRight);
  const isWinner = myByte & mask;
  return isWinner > 0;
};

const FairLaunchContainer = (props: FairLaunchContainerProps) => {
  const [fairLaunchBalance, setFairLaunchBalance] = useState<number>(0);
  const [yourSOLBalance, setYourSOLBalance] = useState<number | null>(null);

  const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT
  const [contributed, setContributed] = useState(0);

  const wallet = useWallet();

  const anchorWallet = useMemo(() => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signAllTransactions ||
      !wallet.signTransaction
    ) {
      return;
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as anchor.Wallet;
  }, [wallet]);

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    severity: undefined,
  });

  const [fairLaunch, setFairLaunch] = useState<FairLaunchAccount>();
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
  const [howToOpen, setHowToOpen] = useState(false);
  const [refundExplainerOpen, setRefundExplainerOpen] = useState(false);
  const [antiRugPolicyOpen, setAnitRugPolicyOpen] = useState(false);

  const onMint = async () => {
    try {
      setIsMinting(true);
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        if (
          fairLaunch?.ticket.data?.state.unpunched &&
          isWinner(fairLaunch, fairLaunchBalance)
        ) {
          await onPunchTicket();
        }

        const mintTxId = await mintOneToken(candyMachine, wallet.publicKey);

        const status = await awaitTransactionSignatureConfirmation(
          mintTxId,
          props.txTimeout,
          props.connection,
          'singleGossip',
          false,
        );

        if (!status?.err) {
          setAlertState({
            open: true,
            message: 'Congratulations! Mint succeeded!',
            severity: 'success',
          });
        } else {
          setAlertState({
            open: true,
            message: 'Mint failed! Please try again!',
            severity: 'error',
          });
        }
      }
    } catch (error: any) {
      // TODO: blech:
      let message = error.msg || 'Minting failed! Please try again!';
      if (!error.msg) {
        if (!error.message) {
          message = 'Transaction Timeout! Please try again.';
        } else if (error.message.indexOf('0x138')) {
        } else if (error.message.indexOf('0x137')) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf('0x135')) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          window.location.reload();
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: 'error',
      });
    } finally {
      setIsMinting(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (!anchorWallet) {
        return;
      }

      try {
        const balance = await props.connection.getBalance(
          anchorWallet.publicKey,
        );
        setYourSOLBalance(balance);

        const state = await getFairLaunchState(
          anchorWallet,
          props.fairLaunchId,
          props.connection,
        );

        setFairLaunch(state);

        try {
          if (state.state.tokenMint) {
            const fairLaunchBalance =
              await props.connection.getTokenAccountBalance(
                (
                  await getAtaForMint(
                    state.state.tokenMint,
                    anchorWallet.publicKey,
                  )
                )[0],
              );

            if (fairLaunchBalance.value) {
              setFairLaunchBalance(fairLaunchBalance.value.uiAmount || 0);
            }
          }
        } catch (e) {
          console.log('Problem getting fair launch token balance');
          console.log(e);
        }
        setContributed(
          (
            state.state.currentMedian || state.state.data.priceRangeStart
          ).toNumber() / LAMPORTS_PER_SOL,
        );
      } catch (e) {
        console.log('Problem getting fair launch state');
        console.log(e);
      }
      if (props.candyMachineId) {
        try {
          const cndy = await getCandyMachineState(
            anchorWallet,
            props.candyMachineId,
            props.connection,
          );
          setCandyMachine(cndy);
        } catch (e) {
          console.log('Problem getting candy machine state');
          console.log(e);
        }
      } else {
        console.log('No candy machine detected in configuration.');
      }
    })();
  }, [
    anchorWallet,
    props.candyMachineId,
    props.connection,
    props.fairLaunchId,
  ]);

  const min = formatNumber.asNumber(fairLaunch?.state.data.priceRangeStart);
  const max = formatNumber.asNumber(fairLaunch?.state.data.priceRangeEnd);
  const step = formatNumber.asNumber(fairLaunch?.state.data.tickSize);
  const median = formatNumber.asNumber(fairLaunch?.state.currentMedian);
  const marks = [
    {
      value: min || 0,
      label: `${min} SOL`,
    },
    // TODO:L
    {
      value: median || 0,
      label: `${median}`,
    },
    // display user comitted value
    // {
    //   value: 37,
    //   label: '37°C',
    // },
    {
      value: max || 0,
      label: `${max} SOL`,
    },
  ].filter(_ => _ !== undefined && _.value !== 0) as any;

  const onDeposit = async () => {
    if (!anchorWallet) {
      return;
    }

    console.log('deposit');
    setIsMinting(true);
    try {
      await purchaseTicket(contributed, anchorWallet, fairLaunch);
      setIsMinting(false);
      setAlertState({
        open: true,
        message: `Congratulations! Bid ${fairLaunch?.ticket.data ? 'updated' : 'inserted'
          }!`,
        severity: 'success',
      });
    } catch (e) {
      console.log(e);
      setIsMinting(false);
      setAlertState({
        open: true,
        message: 'Something went wrong.',
        severity: 'error',
      });
    }
  };
  const onRugRefund = async () => {
    if (!anchorWallet) {
      return;
    }

    console.log('refund');
    try {
      setIsMinting(true);
      await receiveRefund(anchorWallet, fairLaunch);
      setIsMinting(false);
      setAlertState({
        open: true,
        message:
          'Congratulations! You have received a refund. This is an irreversible action.',
        severity: 'success',
      });
    } catch (e) {
      console.log(e);
      setIsMinting(false);
      setAlertState({
        open: true,
        message: 'Something went wrong.',
        severity: 'error',
      });
    }
  };
  const onRefundTicket = async () => {
    if (!anchorWallet) {
      return;
    }

    console.log('refund');
    try {
      setIsMinting(true);
      await purchaseTicket(0, anchorWallet, fairLaunch);
      setIsMinting(false);
      setAlertState({
        open: true,
        message:
          'Congratulations! Funds withdrawn. This is an irreversible action.',
        severity: 'success',
      });
    } catch (e) {
      console.log(e);
      setIsMinting(false);
      setAlertState({
        open: true,
        message: 'Something went wrong.',
        severity: 'error',
      });
    }
  };

  const onPunchTicket = async () => {
    if (!anchorWallet || !fairLaunch || !fairLaunch.ticket) {
      return;
    }

    console.log('punch');
    setIsMinting(true);
    try {
      await punchTicket(anchorWallet, fairLaunch);
      setIsMinting(false);
      setAlertState({
        open: true,
        message: 'Congratulations! Ticket punched!',
        severity: 'success',
      });
    } catch (e) {
      console.log(e);
      setIsMinting(false);
      setAlertState({
        open: true,
        message: 'Something went wrong.',
        severity: 'error',
      });
    }
  };

  const phase = getPhase(fairLaunch, candyMachine);

  const candyMachinePredatesFairLaunch =
    candyMachine?.state.goLiveDate &&
    fairLaunch?.state.data.phaseTwoEnd &&
    candyMachine?.state.goLiveDate.lt(fairLaunch?.state.data.phaseTwoEnd);

  const notEnoughSOL = !!(
    yourSOLBalance != null &&
    fairLaunch?.state.data.priceRangeStart &&
    fairLaunch?.state.data.fee &&
    yourSOLBalance + (fairLaunch?.ticket?.data?.amount.toNumber() || 0) <
    contributed * LAMPORTS_PER_SOL +
    fairLaunch?.state.data.fee.toNumber() +
    0.01
  );

  return (
    <Container style={{ marginTop: 55 }}>

      <Container maxWidth="xs" style={{ position: 'relative', }}>
        <div className='gradient-red-yellow border-0 ' style={{ borderRadius: 10, padding: 3, border: '3px solid black', }}>
          <Paper
            style={{ padding: 24, backgroundColor: '#fff', borderRadius: 6, }}
          >

            <Grid container justifyContent="center" direction="column" style={{ background: '#fff' }}>
              {!wallet.connected ?
                <Header
                  phaseName={"JOJO's Candy Machine"}
                  desc={''}
                  date={undefined}
                /> :
                <>
                  {phase === Phase.Phase0 && (
                    <Header
                      phaseName={'Phase 0'}
                      desc={'Anticipation Phase'}
                      date={fairLaunch?.state.data.phaseOneStart}
                    />
                  )}
                  {phase === Phase.Phase1 && (
                    <Header
                      phaseName={'Phase 1'}
                      desc={'Set price phase'}
                      date={fairLaunch?.state.data.phaseOneEnd}
                    />
                  )}

                  {phase === Phase.Phase2 && (
                    <Header
                      phaseName={'Phase 2'}
                      desc={'Grace period'}
                      date={fairLaunch?.state.data.phaseTwoEnd}
                    />
                  )}

                  {phase === Phase.Lottery && (
                    <Header
                      phaseName={'Phase 3'}
                      desc={'Raffle in progress'}
                      date={fairLaunch?.state.data.phaseTwoEnd.add(
                        fairLaunch?.state.data.lotteryDuration,
                      )}
                    />
                  )}

                  {phase === Phase.Phase3 && !candyMachine && (
                    <Header
                      phaseName={'Phase 3'}
                      desc={'Raffle finished!'}
                      date={fairLaunch?.state.data.phaseTwoEnd}
                    />
                  )}

                  {phase === Phase.Phase3 && candyMachine && (
                    <Header
                      phaseName={'Phase 3'}
                      desc={'Minting starts in...'}
                      date={candyMachine?.state.goLiveDate}
                    />
                  )}

                  {phase === Phase.Phase4 && (
                    <Header
                      phaseName={
                        candyMachinePredatesFairLaunch ? 'Phase 3' : 'Phase 4'
                      }
                      desc={'Candy Time 🍬 🍬 🍬'}
                      date={candyMachine?.state.goLiveDate}
                      status="LIVE"
                    />
                  )}
                </>}

              {fairLaunch && (
                <Grid
                  container
                  direction="column"
                  justifyContent="center"
                  alignItems="center"
                  style={{
                    height: 200,
                    marginTop: 20,
                    marginBottom: 10,
                    background: 'transparent',
                    borderRadius: 6,
                    color: 'black',
                    border: '2px solid black'
                  }}
                >
                  {fairLaunch.ticket.data ? (
                    <>
                      <Typography>Your bid</Typography>
                      <Typography variant="h6" style={{ fontWeight: 900 }}>
                        {formatNumber.format(
                          (fairLaunch?.ticket.data?.amount.toNumber() || 0) /
                          LAMPORTS_PER_SOL,
                        )}{' '}
                        SOL
                      </Typography>
                    </>
                  ) : [Phase.Phase0, Phase.Phase1].includes(phase) ? (
                    <Typography>
                      You haven't entered this raffle yet. <br />
                      {fairLaunch?.state?.data?.fee && (
                        <span>
                          <b>
                            All initial bids will incur a ◎{' '}
                            {fairLaunch?.state?.data?.fee.toNumber() /
                              LAMPORTS_PER_SOL}{' '}
                            fee.
                          </b>
                        </span>
                      )}
                    </Typography>
                  ) : (
                    <Typography>
                      You didn't participate in this raffle.
                    </Typography>
                  )}
                </Grid>
              )}

              {fairLaunch && (
                <>
                  {[
                    Phase.Phase1,
                    Phase.Phase2,
                    Phase.Phase3,
                    Phase.Lottery,
                  ].includes(phase) &&
                    fairLaunch?.ticket?.data?.state.withdrawn && (
                      <div style={{ paddingTop: '20px' }}>
                        <Alert severity="error" icon={false} variant="outlined" style={{ border: 'none', margin: 0, padding: 0, fontSize: 12 }}>
                          Your bid was withdrawn and cannot be adjusted or
                          re-inserted.
                        </Alert>
                      </div>
                    )}
                  {[Phase.Phase1, Phase.Phase2].includes(phase) &&
                    fairLaunch.state.currentMedian &&
                    fairLaunch?.ticket?.data?.amount &&
                    !fairLaunch?.ticket?.data?.state.withdrawn &&
                    fairLaunch.state.currentMedian.gt(
                      fairLaunch?.ticket?.data?.amount,
                    ) && (
                      <div style={{ paddingTop: '20px' }}>
                        <Alert severity="warning" icon={false} variant="outlined" style={{ border: 'none', margin: 0, padding: 0, fontSize: 12 }}>
                          Your bid is currently below the median and will not be
                          eligible for the raffle.
                        </Alert>
                      </div>
                    )}
                  {[Phase.Phase3, Phase.Lottery].includes(phase) &&
                    fairLaunch.state.currentMedian &&
                    fairLaunch?.ticket?.data?.amount &&
                    !fairLaunch?.ticket?.data?.state.withdrawn &&
                    fairLaunch.state.currentMedian.gt(
                      fairLaunch?.ticket?.data?.amount,
                    ) && (
                      <div style={{ paddingTop: '20px' }}>
                        <Alert severity="error" icon={false} variant="outlined" style={{ border: 'none', margin: 0, padding: 0, fontSize: 12 }}>
                          Your bid was below the median and was not included in
                          the raffle. You may click <em>Withdraw</em> when the
                          raffle ends or you will be automatically issued one when
                          the Fair Launch authority withdraws from the treasury.
                        </Alert>
                      </div>
                    )}
                  {notEnoughSOL && (
                    <Alert severity="error" icon={false} variant="outlined" style={{ border: 'none', margin: 0, padding: 0, fontSize: 12 }}>
                      You do not have enough SOL in your account to place this
                      bid.
                    </Alert>
                  )}
                </>
              )}

              {[Phase.Phase1, Phase.Phase2].includes(phase) && (
                <>
                  <Grid style={{ marginTop: 20, marginBottom: 0, }}>
                    <ValueSlider
                      min={min}
                      marks={marks}
                      max={max}
                      step={step}
                      value={contributed}
                      onChange={(ev, val) => setContributed(val as any)}
                      valueLabelDisplay='auto'
                      style={{
                        width: 'calc(100% - 40px)',
                        marginLeft: 20,
                        marginRight: 20,
                        height: 0,
                        color: 'black'
                      }}
                    />
                  </Grid>
                </>
              )}
              {yourSOLBalance && <div className='' style={{marginBottom: 20, fontFamily: 'Heebo', fontWeight: 700, fontSize: 14}}>
                SOL Balance: {(yourSOLBalance/LAMPORTS_PER_SOL).toFixed(2)} 
              </div>}

              {!wallet.connected ? (
                <ConnectButton>
                  Connect{' '}
                  {[Phase.Phase1].includes(phase) ? 'to bid' : 'to see status'}
                </ConnectButton>
              ) : (
                <div style={{}}>
                  {[Phase.Phase1, Phase.Phase2].includes(phase) && (
                    <>
                      <button
                        className='flp-button'
                        onClick={onDeposit}
                        disabled={
                          isMinting ||
                          (!fairLaunch?.ticket.data && phase === Phase.Phase2) ||
                          notEnoughSOL
                        }
                      >
                        {isMinting ? (
                          <CircularProgress style={{ color: 'black' }} />
                        ) : !fairLaunch?.ticket.data ? (
                          'Place bid'
                        ) : (
                          'Change bid'
                        )}
                        { }
                      </button>
                    </>
                  )}

                  {[Phase.Phase3].includes(phase) && (
                    <>
                      {isWinner(fairLaunch, fairLaunchBalance) && (
                        <button
                          className='flp-button'
                          onClick={onPunchTicket}
                          disabled={
                            fairLaunch?.ticket.data?.state.punched !== undefined
                          }
                        >
                          {isMinting ? <CircularProgress style={{ color: 'black' }} /> : 'Punch Ticket'}
                        </button>
                      )}

                      {!isWinner(fairLaunch, fairLaunchBalance) && (
                        <button
                          className='flp-button'
                          onClick={onRefundTicket}
                          disabled={
                            isMinting ||
                            fairLaunch?.ticket.data === undefined ||
                            fairLaunch?.ticket.data?.state.withdrawn !== undefined
                          }
                        >
                          {isMinting ? <CircularProgress style={{ color: 'black' }} /> : 'Withdraw'}
                        </button>
                      )}
                    </>
                  )}

                  {phase === Phase.Phase4 && (
                    <>
                      {(!fairLaunch ||
                        isWinner(fairLaunch, fairLaunchBalance)) && (
                          <MintContainer>
                            <button
                              className='flp-button'
                              disabled={
                                candyMachine?.state.isSoldOut ||
                                isMinting ||
                                !candyMachine?.state.isActive ||
                                (fairLaunch?.ticket?.data?.state.punched &&
                                  fairLaunchBalance === 0)
                              }
                              onClick={onMint}
                            >
                              {fairLaunch?.ticket?.data?.state.punched &&
                                fairLaunchBalance === 0 ? (
                                'MINTED'
                              ) : candyMachine?.state.isSoldOut ? (
                                'SOLD OUT'
                              ) : isMinting ? (
                                <CircularProgress style={{ color: 'black' }} />
                              ) : (
                                'MINT'
                              )}
                            </button>
                          </MintContainer>
                        )}

                      {!isWinner(fairLaunch, fairLaunchBalance) && (
                        <button
                          className='flp-button'
                          onClick={onRefundTicket}
                          disabled={
                            isMinting ||
                            fairLaunch?.ticket.data === undefined ||
                            fairLaunch?.ticket.data?.state.withdrawn !== undefined
                          }
                        >
                          {isMinting ? <CircularProgress style={{ color: 'black' }} /> : 'Withdraw'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              <Grid
                container
                justifyContent="space-between"
                color="textSecondary"
              >

                {fairLaunch?.ticket.data && (
                  <Link
                    component="button"
                    variant="body2"
                    color="textSecondary"
                    align="right"
                    onClick={() => {
                      if (
                        !fairLaunch ||
                        phase === Phase.Lottery ||
                        isWinner(fairLaunch, fairLaunchBalance)
                      ) {
                        setRefundExplainerOpen(true);
                      } else {
                        onRefundTicket();
                      }
                    }}
                    style={{ textDecoration: 'none', color: '#555', fontWeight: 600, fontSize: 12, marginTop: 5 }}

                  >
                    Withdraw funds
                  </Link>
                )}
              </Grid>
              <Dialog
                open={refundExplainerOpen}
                onClose={() => setRefundExplainerOpen(false)}
                PaperProps={{
                  style: { backgroundColor: 'white', borderRadius: 6, color: 'black', border: '3px solid black' },
                }}
              >
                <MuiDialogContent style={{ padding: 24, color: 'black' }}>
                  During raffle phases, or if you are a winner, or if this website
                  is not configured to be a fair launch but simply a candy
                  machine, refunds are disallowed.
                </MuiDialogContent>
              </Dialog>
              <Dialog
                open={antiRugPolicyOpen}
                onClose={() => {
                  setAnitRugPolicyOpen(false);
                }}
                PaperProps={{
                  style: { backgroundColor: 'white', borderRadius: 6, color: 'black', border: '3px solid black', },
                }}
              >
                <MuiDialogContent style={{ padding: 24 }}>
                  {!fairLaunch?.state.data.antiRugSetting && (
                    <span>This Fair Launch has no anti-rug settings.</span>
                  )}
                  {fairLaunch?.state.data.antiRugSetting &&
                    fairLaunch.state.data.antiRugSetting.selfDestructDate && (
                      <div>
                        <h3>Anti-Rug Policy</h3>
                        <p>
                          This raffle is governed by a smart contract to prevent
                          the artist from running away with your money.
                        </p>
                        <p>How it works:</p>
                        This project will retain{' '}
                        {fairLaunch.state.data.antiRugSetting.reserveBp / 100}% (◎{' '}
                        {(fairLaunch?.treasury *
                          fairLaunch.state.data.antiRugSetting.reserveBp) /
                          (LAMPORTS_PER_SOL * 10000)}
                        ) of the pledged amount in a locked state until all but{' '}
                        {fairLaunch.state.data.antiRugSetting.tokenRequirement.toNumber()}{' '}
                        NFTs (out of up to{' '}
                        {fairLaunch.state.data.numberOfTokens.toNumber()}) have
                        been minted.
                        <p>
                          If more than{' '}
                          {fairLaunch.state.data.antiRugSetting.tokenRequirement.toNumber()}{' '}
                          NFTs remain as of{' '}
                          {toDate(
                            fairLaunch.state.data.antiRugSetting.selfDestructDate,
                          )?.toLocaleDateString()}{' '}
                          at{' '}
                          {toDate(
                            fairLaunch.state.data.antiRugSetting.selfDestructDate,
                          )?.toLocaleTimeString()}
                          , you will have the option to get a refund of{' '}
                          {fairLaunch.state.data.antiRugSetting.reserveBp / 100}%
                          of the cost of your token.
                        </p>
                        {fairLaunch?.ticket?.data &&
                          !fairLaunch?.ticket?.data.state.withdrawn && (
                            <button
                              className='flp-button'
                              onClick={onRugRefund}
                              disabled={
                                !!!fairLaunch.ticket.data ||
                                !fairLaunch.ticket.data.state.punched ||
                                Date.now() / 1000 <
                                fairLaunch.state.data.antiRugSetting.selfDestructDate.toNumber()
                              }
                            >
                              {isMinting ? (
                                <CircularProgress style={{ color: 'black' }} />
                              ) : Date.now() / 1000 <
                                fairLaunch.state.data.antiRugSetting.selfDestructDate.toNumber() ? (
                                <span>
                                  Refund in...
                                  <Countdown
                                    date={toDate(
                                      fairLaunch.state.data.antiRugSetting
                                        .selfDestructDate,
                                    )}
                                  />
                                </span>
                              ) : (
                                'Refund'
                              )}
                              { }
                            </button>
                          )}
                        <div style={{ textAlign: 'center', marginTop: '-5px' }}>
                          {fairLaunch?.ticket?.data &&
                            !fairLaunch?.ticket?.data?.state.punched && (
                              <small>
                                You currently have a ticket but it has not been
                                punched yet, so cannot be refunded.
                              </small>
                            )}
                        </div>
                      </div>
                    )}
                </MuiDialogContent>
              </Dialog>
              <Dialog
                open={howToOpen}
                onClose={() => setHowToOpen(false)}
                PaperProps={{
                  style: { backgroundColor: 'white', borderRadius: 6, color: 'black', border: '3px solid black' },
                }}
              >
                <MuiDialogTitle
                  disableTypography
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Link
                    component="button"
                    variant="h6"
                    onClick={() => {
                      setHowToOpen(true);
                    }}
                    className='gradient-text gradient-red-yellow fw-bolder fs-1'
                  >
                    How it works
                  </Link>
                  <IconButton
                    aria-label="close"
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: 10,
                      color: 'black',
                    }}
                    onClick={() => setHowToOpen(false)}
                  >
                    <CloseIcon />
                  </IconButton>
                </MuiDialogTitle>
                <MuiDialogContent>
                  <p className='flp-dialog-title'>
                    Phase 1 - Set the fair price:
                  </p>
                  <p className='flp-dialog-content'>
                    Enter a bid in the range provided by the artist. The median of
                    all bids will be the "fair" price of the raffle ticket.{' '}
                    {fairLaunch?.state?.data?.fee && (
                      <span>
                        <b>
                          All bids will incur a ◎{' '}
                          {fairLaunch?.state?.data?.fee.toNumber() /
                            LAMPORTS_PER_SOL}{' '}
                          fee.
                        </b>
                      </span>
                    )}
                  </p>
                  <p className='flp-dialog-title'>
                    Phase 2 - Grace period:</p>
                  <p className='flp-dialog-content'>
                    If your bid was at or above the fair price, you automatically
                    get a raffle ticket at that price. There's nothing else you
                    need to do. Your excess SOL will be returned to you when the
                    Fair Launch authority withdraws from the treasury. If your bid
                    is below the median price, you can still opt in at the fair
                    price during this phase.
                  </p>
                  {candyMachinePredatesFairLaunch ? (
                    <>
                      <p className='flp-dialog-title'>

                        Phase 3 - The Candy Machine:
                      </p>
                      <p className='flp-dialog-content'>
                        Everyone who got a raffle ticket at the fair price is
                        entered to win an NFT. If you win an NFT, congrats. If you
                        don’t, no worries, your SOL will go right back into your
                        wallet.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className='flp-dialog-title'>
                        Phase 3 - The Lottery:</p>
                      <p className='flp-dialog-content'>
                        Everyone who got a raffle ticket at the fair price is
                        entered to win a Fair Launch Token that entitles them to
                        an NFT at a later date using a Candy Machine here. If you
                        don’t win, no worries, your SOL will go right back into
                        your wallet.
                      </p>
                      <p className='flp-dialog-title'>
                        Phase 4 - The Candy Machine:
                      </p>
                      <p className='flp-dialog-content'>
                        On{' '}
                        {candyMachine?.state.goLiveDate
                          ? toDate(
                            candyMachine?.state.goLiveDate,
                          )?.toLocaleString()
                          : ' some later date'}
                        , you will be able to exchange your Fair Launch token for
                        an NFT using the Candy Machine at this site by pressing
                        the Mint Button.
                      </p>
                    </>
                  )}
                </MuiDialogContent>
              </Dialog>

              {/* {wallet.connected && (
              <p>
                Address: {shortenAddress(wallet.publicKey?.toBase58() || '')}
              </p>
            )}

            {wallet.connected && (
              <p>Balance: {(balance || 0).toLocaleString()} SOL</p>
            )} */}
            </Grid>
          </Paper>
        </div>
      </Container>
      <Container maxWidth="xs" style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Link
            component="button"
            variant="body2"
            align="left"
            onClick={() => {
              setHowToOpen(true);
            }}
            style={{ textDecoration: 'none', color: '#555', fontWeight: 600, fontSize: 12 }}

          >
            How this raffle works
          </Link>
          <Link
            component="button"
            variant="body2"
            align="right"
            onClick={() => {
              setAnitRugPolicyOpen(true);
            }}
            style={{ textDecoration: 'none', color: '#555', fontWeight: 600, fontSize: 12 }}
          >
            Anti-Rug Policy
          </Link>
        </div>
      </Container>
      {fairLaunch && (
        <Container
          maxWidth="xs"
          style={{ position: 'relative', marginTop: 10 }}
        >
          <div style={{ margin: '20px 10px' }}>
            <Grid container direction="row" wrap="nowrap">
              <Grid container md={4} direction="column">
                <Typography variant="body2" style={{ fontSize: 12, color: '#777' }} >
                  Bids
                </Typography>
                <Typography
                  variant="h6"
                  style={{ fontWeight: 800, fontSize: 28 }}
                >
                  {fairLaunch?.state.numberTicketsSold.toNumber() || 0}
                </Typography>
              </Grid>
              <Grid container md={4} direction="column">
                <Typography variant="body2" style={{ fontSize: 12, color: '#777' }}>
                  Median bid
                </Typography>
                <Typography
                  variant="h6"
                  style={{ fontWeight: 800, fontSize: 28 }}
                >
                  ◎ {formatNumber.format(median)}
                </Typography>
              </Grid>
              <Grid container md={4} direction="column">
                <Typography variant="body2" style={{ fontSize: 12, color: '#777' }}>
                  Total raised
                </Typography>
                <Typography
                  variant="h6"
                  style={{ fontWeight: 800, fontSize: 28 }}
                >
                  ◎{' '}
                  {formatNumber.format(
                    (fairLaunch?.treasury || 0) / LAMPORTS_PER_SOL,
                  )}
                </Typography>
              </Grid>
            </Grid>
          </div>
        </Container>
      )}
      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
          icon={false} variant="outlined" style={{ border: 'none', margin: 0, padding: 0, fontSize: 12 }}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

interface AlertState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error' | undefined;
}

export default FairLaunchContainer;
