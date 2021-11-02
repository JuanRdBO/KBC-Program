import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import styled, { createGlobalStyle } from 'styled-components';
import FairLaunchContainer from "../../components/FairLaunchContainer";
/* import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography'; */
import * as anchor from '@project-serum/anchor';
import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
//@ts-ignore
import { AccordionWrapper, AccordionItem } from 'custom-react-accordion'
import Navbar from '../../components/Nav/navBar';

const ConnectButton = styled(WalletMultiButton)`
  height: 50px;
`;

const DisconnectButton = styled(WalletDisconnectButton)`
  height: 50px;
`;

const candyMachineId = process.env.REACT_APP_CANDY_MACHINE_ID
  ? new anchor.web3.PublicKey(process.env.REACT_APP_CANDY_MACHINE_ID)
  : undefined;

const fairLaunchId = new anchor.web3.PublicKey(
  process.env.REACT_APP_FAIR_LAUNCH_ID!,
);

const rpcHost = process.env.REACT_APP_SOLANA_RPC_HOST!;
const connection = new anchor.web3.Connection(rpcHost);

const startDateSeed = parseInt(process.env.REACT_APP_CANDY_START_DATE!, 10);

const txTimeout = 30000; // milliseconds (confirm this works for your project)

function Home() {
  const wallet = useWallet();

  const data = [
    {
      "title": "What are JOJOs?",
      "content": `JOJO is the character illustrated in a series of NFTs collectibles
        under the name KidsBeatCancer.The NFT collection comprises 4.321 unique
        JOJOs, each one of them designed with remarkable traits that combined create
        a unique and special JOJO.`
    }, {
      "title": "What happens if I purchase a JOJO?",
      "content": `You make a change, and not only in your wallet where you will see your JOJO.You enter
        the KidsBeatCancer community where your voice will
        be heard regarding this and other initiatives alike, you are gifted with a paid version of
        the JOJO Canvas app, you enter a 20 SOL raffle and, last but not least, you are donating 33% of the purchase
        to fight & beat child cancer!`
    }, {
      "title": "What can I do with my JOJO?",
      "content": `You are JOJO and JOJO is you. Enjoy it! You are free to use it as a profile picture, to show your support, to print it, to send it
        as a gift (hopefully to a good friend), to sell it, to keep it...But it's fully yours
        and noone can ever do anything about it!`
    }, {
      "title": "Who is the team behind KidsBeatCancer?",
      "content": <div>KidsBeatCancer has been created by 4 people from Barcelona who
        joined because they were all open and motivated to
        work on something meaningful and fun. If you are too,
        <a href="mailto:jojo@kidsbeatcancer.org" className="h-op-07" style={{ color: "black" }}>
          <strong> contact us</strong>.
        </a> Let's make good things happen!</div>
    }, {
      "title": "Why should I get a JOJO?",
      "content": <div>When you purchase a JOJO you will be contributing to research projects to fight
        child cancer and activities for the children themselves.Moreover, you will be
        rewarded with Exclusive Passes and IRL Passes!

        Check {<ScrollLink
          to="future" spy={true} smooth={true} offset={0} duration={500} style={{ color: "black" }}>
          <strong>JOJOs Future</strong>
        </ScrollLink>} to see what's comming and how you can be rewarded for long-term owning a JOJO.

        Also, by owning a JOJO you will be eligible to enter Merchandise, NFT and SOL
        giveaways that will start once the minting is completed!</div>
    }, {
      "title": "Are there any reserved JOJO's?",
      "content": `We have reserved 321 JOJOs for the centers and institutions that will help this
        become a reality, for the community to be used in giveaways, competitions and airdrops, for marketing promotions and
        collaborations, etc.The 4000 remaining are all available for purchase.`
    }, {
      "title": "How can I get a JOJO?",
      "content": <div>JOJOs will be sold using the Fair Launch Protocol built by Metaplex.

        If you want more information, here you have a brief explanation of what is it and how it works:

        With the Fair Launch Protocol buyers can bid on the price they want
        for buying a certain NFT.It's comprised by 3 phases:
        <br /> <br />
        {<ul className="dashed">
          <li className="dashed">
            The <strong>Bidding Phase</strong> where buyers come in and
            set the price they are willing to pay in the range the creator has
            specified.
          </li>
          <li className="dashed">
            The <strong>Grace Period</strong> where you can adjust your
            bid in order to be eligible for a raffle ticket.Thus, if you final bid
            ends up below the median you are not eligible for a raffle ticket
            which means you can't get a JOJO.
          </li>
          <li className="dashed">
            The <strong>Raffle Phase</strong> where the raffle happens.If your final
            bid is higher than the median then you enter the raffle!Now the lottery runs and
            the winners are randomly chosen.If you are one of them bravo!If not, your tokens
            will be refunded.
          </li>
        </ul>}

        <br />

        What are we setting up for the JOJO Fair Launch Protocol?

        <br /> <br />

        {<ul className="dashed">
          <li className="dashed">
            Fees for fair launch.
          </li>
          <li className="dashed">
            A minimum price of 0.5 SOL and a maixmum price of 4 SOL.
          </li>
          <li className="dashed">
            An anti rug reserve of the 50% to issue refunds in case of a rug.
          </li>
          <li className="dashed">
            An anti rug token requirement of 2000 tokens, which is the minimum amount of unclaimed
            tokens at which point the anti rug reserve fund is released to KidsBeatCancer.
          </li>
          <li className="dashed">
            The self destruct date at which buyers will have the option of getting a refund from
            the Anti Rug Reserve if we don't deliver as expected. That date is the 11th
            of November at 12UTC.
          </li>
        </ul>}
      </div>
    }
  ]
  return (
    <div>

      {/* Header */}
      <header id="header" className="border-bottom-0 no-sticky transparent-header">
        <div id="header-wrap">
          <div className="container">
            <div className="header-row">
              <div id="logo">
                <Link to={`/`} className='standard-logo'>
                  <img
                    src="images/logo.png"
                    alt="KidsBeatCancer"
                    width='60'
                  />
                </Link>
              </div>

              <div className="header-misc">
                {!wallet.connected ? <ConnectButton className="button button-border rounded-pill">
                  Connect
                </ConnectButton> : <DisconnectButton className="button button-border rounded-pill">
                  Disconnect
                </DisconnectButton>}
              </div>

              <Navbar />

            </div>
          </div>
        </div>
      </header>

      {/* Slider  */}
      <section
        className=" min-vh-md-100 py-4 "
        style={{
          background: "#fff url('images/hero-bg.svg') repeat top center",
          backgroundSize: "cover",
          position: 'relative',
          top: 150
        }}
      >
        <div className="vertical-middle">
          <div className="container text-center py-5" >
            <div className="emphasis-title mb-2">
              <h4 className="text-uppercase ls3 fw-bolder mb-0">Welcome To</h4>
              <h1>
                <div className="oc-item gradient-text gradient-red-yellow">
                  KidsBeatCancer
                </div>
              </h1>
            </div>
            <div className="mx-auto" style={{ maxWidth: 600 }}>
              <p className="lead fw-normal text-dark mb-5">
                Get a JOJO and join this adventure to help kids beat cancer!
              </p>

              <Link
                to="/purpose"
                className="button button-dark button-hero h-translatey-3 tf-ts button-reveal overflow-visible bg-dark text-end"
              >
                <span>The Purpose</span>
                <i className="icon-line-arrow-right"></i>
              </Link>
              <ScrollLink className="button button-large button-light text-dark bg-transparent m-0"
                to="learn" spy={true} smooth={true} offset={0} duration={750}>
                <i className="icon-line2-arrow-down fw-bold"></i>
                <u>More About Jojo</u>
              </ScrollLink>
            </div>
            <div className="">
              <FairLaunchContainer candyMachineId={candyMachineId}
                fairLaunchId={fairLaunchId}
                connection={connection}
                startDate={startDateSeed}
                txTimeout={txTimeout} />
            </div>
          </div>
        </div>


      </section>

      {/* Content */}
      <section id="content">
        <div className="content-wrap p-0">

          {/* Learn */}
          <div id="learn"
            className="section mb-0 pt-3 pb-0"
            style={{
              backgroundColor: '#f4f4f4',
              marginTop: 150,
              overflow: 'visible',
            }}
          >
            <div
              className="shape-divider"
              data-shape="wave"
              data-height="150"
              data-outside="true"
              data-flip-vertical="true"
              data-fill="#F4F4F4"
            ></div>
            <div className="container">
              <div className="row justify-content-center text-center mt-5">
                <div className="col-lg-8">
                  <div>
                    <h3 className="fw-bolder h1 mb-4">
                      JOIN OUR MOVEMENT, BECOME A &nbsp;
                      <span className="gradient-text gradient-red-yellow">
                        JOJO
                      </span>
                    </h3>
                    <p className="mb-5 lead text-black-50 fw-light">
                      JOJO represents the bravest and strongest warriors of our
                      time, the children who face a daily battle against
                      cancer, with its ups and downs, but always with a smile on
                      their faces.We want to keep seeing the hope and joy in their
                      eyes for a better tomorrow and the unbeatable desire to live
                      and enjoy life.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-center position-relative">
              <div
                className="parallax min-vh-50"
                style={{
                  backgroundImage: "url('images/crazy-bg-black.png')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center',
                  width: '100%'
                }}
                data-bottom-top="width: 40vw"
                data-center-top="width: 100vw;"
              >
                <div
                  className="row align-items-center justify-content-center h-100"
                >
                  <div className="col-auto text-center">
                    <span
                      className="display-4 fw-bolder gradient-text gradient-red-yellow d-inline-block mx-4 h-op-08 op-ts"
                    >
                      #research
                    </span>
                    <span
                      className="display-4 fw-bolder gradient-text gradient-red-yellow text-white d-inline-block mx-4 h-op-08 op-ts"
                    >
                      #activities
                    </span>
                  </div>
                </div>
              </div>
              <div
                className="shape-divider"
                data-shape="wave"
                data-position="bottom"
              ></div>
            </div>
          </div>
          <div className="container">
            <div className="row justify-content-center text-center mt-5">
              <div className="col-lg-8 col-11">
                <p
                  className="mb-3 text-black-80 fw-light"
                  style={{ textAlign: 'justify' }}
                >
                  JOJO is the character illustrated in a series of NFTs
                  collectibles under the name KidsBeatCancer.The NFT
                  collection comprises 4.321 unique JOJOs, each one of them
                  designed with remarkable traits that combined create a unique
                  and special JOJO.</p>
                <p
                  className="mb-3 text-black-80 fw-light"
                  style={{ textAlign: 'justify' }}
                > The most exciting part of this NFT
                  collection and the main driver for its core team is the tight
                  link and commitment this initiative has with children affected by cancer.
                  Children participated in all the creative layers and are the true
                  heroes in this story.They designed the background layer for
                  each of the JOJOs, adding a genuine and authentic dimension to
                  the character and to the entire collection.Children also lead
                  some of the fundraising activities that with the support of
                  JOJO and other donations benefit assistance projects for our
                  brave warriors.
                </p>

                <p
                  className="mb-5 text-black-80 fw-light"
                  style={{ textAlign: 'justify' }}
                >
                  Finally, our real life JOJOs, the boys and
                  girls from the nonprofit SJD Hospital in Barcelona alongside
                  their doctors and investigators, will receive 33% of the NFT
                  proceeds, 66% of the royalties that the NFT generates, 100% of
                  the funds deposited to the KidsBeatCancer.sol wallet and all
                  the profits that JOJOs merchandise generate.
                </p>
              </div>
            </div>
          </div>

          {/* Numbers */}
          <div className="container" style={{ maxWidth: '1000px' }}>
            <div className="row col-mb-30 mb-3">
              <div className="col-md-4">
                <div className="d-flex align-items-center justify-content-center">
                  <div className="counter counter-xlarge text-dark fw-bolder">
                    <span
                      data-from="1"
                      data-to="4321"
                      data-refresh-interval="4"
                      data-speed="600"
                    >4321</span>
                  </div>
                  <span style={{ textTransform: 'none' }}>
                    JOJOs
                    <br />
                    Available
                  </span>
                </div>
              </div>

              <div className="col-md-4">
                <div className="d-flex align-items-center justify-content-center">
                  <div className="counter counter-xlarge text-dark fw-bolder">
                    <span
                      data-from="0"
                      data-to="33"
                      data-refresh-interval="5"
                      data-speed="1500"
                    >33</span>
                  </div>
                  <span style={{ textTransform: 'none' }}>
                    % of Proceeds
                    <br />
                    as Donations
                  </span>
                </div>
              </div>

              <div className="col-md-4">
                <div className="d-flex align-items-center justify-content-center">
                  <div className="counter counter-xlarge text-dark fw-bolder">
                    <span
                      data-from="0"
                      data-to="66"
                      data-refresh-interval="5"
                      data-speed="1200"
                    >66</span>
                  </div>
                  <span style={{ textTransform: 'none' }}>
                    % of Royalties
                    <br />
                    as Donations
                  </span>
                </div>
              </div>
            </div>

            <div className="row col-mb-10 mb-5">
              <div className="col-md-2 col-sm-4 col-6  h-invert-image">
                <img
                  src="images/head 1.png"
                  alt="KidsBeatCancer"
                />
              </div>

              <div className="col-md-2 col-sm-4 col-6 h-invert-image">
                <img
                  src="images/head 2.png"
                  alt="KidsBeatCancer"
                />
              </div>

              <div className="col-md-2 col-sm-4 col-6 h-invert-image">
                <img
                  src="images/head 6.png"
                  alt="KidsBeatCancer"
                />
              </div>

              <div className="col-md-2 col-sm-4 col-6 h-invert-image">
                <img
                  src="images/head 3.png"
                  alt="KidsBeatCancer"
                />
              </div>

              <div className="col-md-2 col-sm-4 col-6 h-invert-image">
                <img
                  src="images/head 4.png"
                  alt="KidsBeatCancer"
                />
              </div>

              <div className="col-md-2 col-sm-4 col-6 h-invert-image">
                <img
                  src="images/head 5.png"
                  alt="KidsBeatCancer"
                />
              </div>
            </div>


            <div className="line line-sm mb-0"></div>
          </div>

          <div className="clear"></div>

          {/* future  */}
          <div id="future" className="section bg-transparent py-5">
            <div className="container">
              <div className="row align-items-end mb-5">
                <div className="col-lg-10 offset-lg-1">
                  <h3 className="fw-bolder h1 center">
                    JOJOs Adventure With <span className="gradient-text gradient-red-yellow">KidsBeatCancer</span>
                  </h3>
                  <p className="center">
                    Want to be part of JOJOs adventure in a more active way?<br />
                    <a href="mailto:jojo@kidsbeatcancer.org" className="h-op-07" style={{ color: 'black' }}>
                      <strong>Contact us&nbsp; </strong>
                    </a>
                    and let's create more meaningful initiatives!
                  </p>
                </div>
              </div>

              <div className="row gutter-30 mb-5 align-items-stretch">
                <div className="col-md-6 col-sm-6">
                  <div
                    className="card d-flex align-items-end flex-column p-1 border-0 h-gradient-red-yellow"
                  >
                    <div className="mt-auto p-3" style={{ backgroundColor: 'white', borderRadius: '2px' }}>
                      <div className="card-body  h-invert-image">
                        <h3 className="card-title fw-bolder">Exclusive Pass</h3>
                        <p className="card-text mb-0 mt-2 fw-light">
                          All JOJO NFT owners will have early access to the KidsBeatCancer
                          <strong className="gradient-text gradient-red-yellow">&nbsp;merchandise pre-sale</strong>
                          , as well as an exclusive pass to the Kids Playground
                          where holders will have a voice and decide over
                          future initiatives regarding this and upcoming projects.
                        </p>
                        <div className="card-icon">
                          <img src="images/tickets.png" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-sm-6">
                  <div
                    className="card d-flex align-items-end flex-column p-1 border-0 h-gradient-red-yellow"
                  >
                    <div className="mt-auto p-3" style={{ backgroundColor: 'white', borderRadius: '2px' }}>
                      <div className="card-body  h-invert-image">

                        <h3 className="card-title fw-bolder">Social Impact</h3>
                        <p className="card-text mb-0 mt-2 fw-light">
                          SJD Hospital in Barcelona alongside their medical teams, investigators & families
                          will receive 33% of the NFT minting proceeds, 66% of the royalties and 100% of
                          the funds deposited to the <strong className="gradient-text gradient-red-yellow">KidsBeatCancer.sol</strong> wallet and all the profits
                          from JOJOs merchandise.
                        </p>
                        <div className="card-icon">
                          <img src="images/handshake.png" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-sm-6">
                  <div
                    className="card d-flex align-items-end flex-column p-1 border-0 h-gradient-red-yellow"
                  >
                    <div className="mt-auto p-3" style={{ backgroundColor: 'white', borderRadius: '2px' }}>
                      <div className="card-body h-invert-image">

                        <h3 className="card-title fw-bolder">IRL Passes</h3>
                        <p className="card-text mb-0 mt-2 fw-light">
                          Owners of a JOJO will be gifted the Paid Version of
                          the <strong className="gradient-text gradient-red-yellow">JOJO Canvas</strong> app, a tablet and smartphone app with a set of digital
                          JOJO parts ready to be combined, painted and decorated.Users will be
                          able to create their own 2<sup>nd</sup> generation JOJO and mint it as an NFT to store it on-chain
                          forever!
                        </p>
                        <div className="card-icon">
                          <img src="images/phone.png" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-sm-6">
                  <div
                    className="card d-flex align-items-end flex-column p-1 border-0 h-gradient-red-yellow"
                  >
                    <div className="mt-auto p-3" style={{ backgroundColor: 'white', borderRadius: '2px' }}>
                      <div className="card-body  h-invert-image">

                        <h3 className="card-title fw-bolder">Merchandise</h3>
                        <p className="card-text mb-0 mt-2 fw-light">
                          KidsBeatCancer will offer merchindise so anyone can
                          <strong className="gradient-text gradient-red-yellow">&nbsp;join JOJO's cause</strong>. Show everybody you support KidsBeatCancer's cause!All profits
                          will be donated to child cancer related projects.Help
                          us reaching more people by giving us merch ideas as
                          well as projects to support on our Discord channel
                          <strong>#jojo-caps</strong>!
                        </p>
                        <div className="card-icon">
                          <img src="images/cap.png" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-sm-6">
                  <div
                    className="card d-flex align-items-end flex-column p-1 border-0 h-gradient-red-yellow"
                  >
                    <div className="mt-auto p-3" style={{ backgroundColor: 'white', borderRadius: '2px' }}>
                      <div className="card-body  h-invert-image pb-0">

                        <h3 className="card-title fw-bolder">Giveaways</h3>
                        <p className="card-text mb-0 mt-2 fw-light">
                          <ul className="not-styled">
                            <li className="card-text mb-0 mt-2 fw-light">&#127775; Early Minter <strong>Special Edition</strong> JOJO caps for the first 250 minters</li>
                            <li className="card-text mb-0 mt-2 fw-light">&#127775; 20 SOL distributed among 5 Minting Wallets</li>
                            <li className="card-text mb-0 mt-2 fw-light">&#127775; 10 hidden Solana <strong>Special Edition</strong> JOJO caps to be found during the Solana Breakpoint</li>
                            <li className="card-text mb-0 mt-2 fw-light">&#127775; Paid Version of the the JOJO Canvas app</li>
                          </ul>
                        </p>
                        <div className="card-icon">
                          <img src="images/gift.png" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-sm-6">
                  <div
                    className="card d-flex align-items-end flex-column p-1 border-0 h-gradient-red-yellow"
                  >
                    <div className="mt-auto p-3" style={{ backgroundColor: 'white', borderRadius: '2px' }}>
                      <div className="card-body  h-invert-image">

                        <h3 className="card-title fw-bolder">Keep Beating</h3>
                        <p className="card-text mb-0 mt-2 fw-light">
                          The final goal for KidsBeatCancer is to allow all the
                          Solana and Crypto Communinty to join JOJO's cause as
                          well as empower other projects alike.More JOJOs are
                          needed and we hope more and more initiatives use this
                          amazing technologies to create new methods for
                          <strong className="gradient-text gradient-red-yellow">&nbsp;improving the world</strong>.
                        </p>
                        <div className="card-icon">
                          <img src="images/heart.png" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="clear"></div>


          </div>

          {/* FAQS */}
          <div className="section m-0" style={{ background: '#f1efe5', paddingTop: '100px' }}>
            <div className="container">
              <div className="row align-items-center">
                <div className="col-lg-8">
                  <h3 className="fw-bolder h1 my-5 gradient-text gradient-red-yellow">
                    Any questions?
                  </h3>

                  <AccordionWrapper>
                    {data.map((item, index) => (
                        <AccordionItem key={index} index={index} title={item.title} description={item.content} />
                    ))}
                  </AccordionWrapper>

                </div>
                <div className="col-lg-4">
                  <img src="images/jojo jump.png" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="border-0" style={{ backgroundColor: '#fff' }}>

        <div className="container">
          <div className="footer-widgets-wrap  m-0 p-3">
            <div className="row justify-content-between">
              <div className="col-sm-4 center footer-logo">
                <img
                  src="images/logo.png"
                  alt="KidsBeatCancer" width="50px"
                />
              </div>
              <div className="col-sm-4 row align-items-center justify-content-center footer-copy" style={{ margin: 'auto' }}>
                <div className="col-auto text-center">

                  <span
                    className="display-9  text-dark"
                  >
                    &copy; 2021 KidsBeatCancer
                  </span>
                </div>
              </div>
              <div className="col-sm-4  row align-items-center justify-content-center footer-social" style={{ margin: 'auto' }}>
                <div className="col-auto text-center">
                  <a href="https://discord.com" target='_blank' rel="noreferrer" className="social-icon  si-small  si-discord si-dark">
                    <i className="icon-discord"></i>
                    <i className="icon-discord"></i>
                  </a>

                  <a href="https://twitter.com" target='_blank' rel="noreferrer" className="social-icon  si-small si-twitter si-dark">
                    <i className="icon-twitter"></i>
                    <i className="icon-twitter"></i>
                  </a>

                  <a href="https://github.com" target='_blank' rel="noreferrer" className="social-icon si-small  si-github si-dark">
                    <i className="icon-github"></i>
                    <i className="icon-github"></i>
                  </a>
                </div>
              </div>
              <div className="col-sm-4 row align-items-center justify-content-center footer-copy-responsive" style={{ margin: 'auto' }}>
                <div className="col-auto text-center">

                  <span
                    className="display-9  text-dark"
                  >
                    &copy; 2021 KidsBeatCancer
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <div id="gotoTop" className="icon-double-angle-up bg-white text-dark rounded-circle shadow"></div>

    </div>

  );
}

export default Home;