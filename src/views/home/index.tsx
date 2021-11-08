import { Link } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import FairLaunchContainer from "../../components/FairLaunchContainer";

import * as anchor from '@project-serum/anchor';
import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
//@ts-ignore
import { AccordionWrapper, AccordionItem } from 'custom-react-accordion';
import CountUp from 'react-countup';

import { Connection, PublicKey } from '@solana/web3.js';

import { useMeta } from '../../contexts/meta/meta';
import { DonationPointEl } from '../../components/DonationPoint';
import { getProvider, Program, web3 } from '@project-serum/anchor';

const candyMachineId = process.env.REACT_APP_CANDY_MACHINE_ID
  ? new anchor.web3.PublicKey(process.env.REACT_APP_CANDY_MACHINE_ID)
  : undefined;

const fairLaunchId = new anchor.web3.PublicKey(
  process.env.REACT_APP_FAIR_LAUNCH_ID!,
);

const startDateSeed = parseInt(process.env.REACT_APP_CANDY_START_DATE!, 10);

const txTimeout = 30000; // milliseconds (confirm this works for your project)


function Home() {
  const { endpointUrl } = useMeta()
  const wallet = useWallet();
  const connection = new Connection(endpointUrl, "confirmed");


  const data = [
    {
      "title": "What's KidsBeatCancer?",
      "content": `KidsBeatCancer is a non-profit project created by four blockchain enthusiasts 
      aiming to bring the best of this technology to the world while making a social impact with 
      it. The multidisciplinary team is experienced in graphic design, music, marketing and 
      programming and truly motivated to grow, evolve and bridge the traditional and crypto world
       by providing new meaningful solutions and helpful tools .
      `
    },
    {
      "title": "What’s the link between KidsBeatCancer and JOJO?",
      "content": `KidsBeatCancer is the project and the JOJO NFT collection is the first initiative launched through it.
      `
    },
    {
      "title": "What are JOJOs?",
      "content": `JOJO is the character illustrated in a series of NFTs collectibles under 
      the KidsBeatCancer Project. The NFT collection comprises 8.421 unique JOJOs, each 
      one of them designed with remarkable traits that combined create a unique and special 
      JOJO. The NFT collection is registered and stored on the Solana Blockchain.`
    }, {
      "title": "What happens if I purchase a JOJO?",
      "content": `First of all, when you purchase a JOJO, you become a JOJO member! Enjoy it! 
      You are free to use it as a profile picture, to show your support, to print it, to send 
      it as a gift, to sell it, etc. The JOJO is fully yours and no one can ever do anything 
      about it! However, purchasing a JOJO means much more. You make a change but not only 
      in your wallet where you will see your JOJO. You enter the KidsBeatCancer DAO, where your 
      voice and vote set the future initiatives KidsBeatCancer collaborates with, you qualify 
      for numerous events and experiences and, above all, your purchase directly supports 
      researchers, doctors and the real life JOJOs, the children diagnosed with cancer.`
    }, {
      "title": "What can I do with my JOJO?",
      "content": `You are JOJO and JOJO is you. Enjoy it! You are free to use it as a profile picture, to show your support, to print it, to send it
        as a gift (hopefully to a good friend), to sell it, to keep it...But it's fully yours
        and noone can ever do anything about it!`
    }, {
      "title": "Why should I get a JOJO?",
      "content": <div>When you purchase a JOJO you will be contributing to research projects to fight
        child cancer and activities for the children themselves. Moreover, you will be
        rewarded with Exclusive Passes and IRL experiences and events!

        Check {<ScrollLink
          to="future" spy={true} smooth={true} offset={0} duration={500} style={{ color: "black" }}>
          <strong>JOJOs Future</strong>
        </ScrollLink>} to see what's comming and how you can be rewarded for long-term owning a JOJO.
      </div>
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
      <div className="header">
        <div className="logo">
          <Link to={`/`} className='standard-logo'>
            <img
              src="images/logo.png"
              alt="KidsBeatCancer"
              width='60'
            />
          </Link>
        </div>
        <div className='header-button'>
          {!wallet.connected ? <WalletMultiButton className="button button-border rounded-pill header-element-centered">
            Connect
          </WalletMultiButton> : <WalletDisconnectButton className="button button-border rounded-pill header-element-centered">
            Disconnect
          </WalletDisconnectButton>}
        </div>
        <div className="header-links">
          <ul className="header-items">
            <li className="header-item ">
              <ScrollLink className="header-link" to="learn" spy={true} smooth={true} offset={0} duration={750}>
                Learn
              </ScrollLink>
            </li>

            <li className="header-item">
              <ScrollLink className="header-link" to="future" spy={true} smooth={true} offset={0} duration={1250}>
                Future
              </ScrollLink>
            </li>
            <li className="header-item">
              <ScrollLink className="header-link" to="donate" spy={true} smooth={true} offset={0} duration={1750}>
                Donate
              </ScrollLink>
            </li>
            <li className="header-item">
              <Link className="header-link" to="/purpose">
                Purpose
              </Link>
            </li>
          </ul>
        </div>
        <div className='header-button header-button-sm'>
          {!wallet.connected ? <WalletMultiButton className="button button-border rounded-pill header-element-centered">
            Connect
          </WalletMultiButton> : <WalletDisconnectButton className="button button-border rounded-pill header-element-centered">
            Disconnect
          </WalletDisconnectButton>}
        </div>
      </div>


      {/* Slider  */}
      <section
        className=" min-vh-md-100 py-4 "
        style={{
          background: "#fff url('images/hero-bg.svg') repeat top center",
          backgroundSize: "cover",
          position: 'relative',
          top: 25,
        }}
      >
        <div className="vertical-middle">
          <div className="container text-center py-0" >
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
                The world’s first blockchain backed non-profit initiative powered by Solana.
                Meet JOJO and join our adventure to help kids beat cancer!
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
            className="section mb-0 pt-5 pb-0"
            style={{
              backgroundColor: '#f4f4f4',
              marginTop: 50,
              overflow: 'visible',
            }}
          >
            {/*             <div
              className="shape-divider"
              data-shape="wave"
              data-height="150"
              data-outside="true"
              data-flip-vertical="true"
              data-fill="#F4F4F4"
            ></div> */}
            <div className="container">
              <div className="row justify-content-center text-center mt-5">
                <div className="col-lg-8">
                  <div>
                    <h3 className="fw-bolder h1 mb-4">
                      JOIN OUR MOVEMENT, BECOME A&nbsp;
                      <span className="gradient-text gradient-red-yellow">
                        JOJO
                      </span>
                    </h3>
                    <p className="mb-5 lead text-black-50 fw-light">
                      JOJO is the character illustrated in a series of NFTs collectibles under the KidsBeatCancer project. The NFT collection comprises 4.321 unique JOJOs, each one of them designed with remarkable traits that combined create a unique and special JOJO.
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
                      #treatments
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
                  JOJO represents the bravest and strongest warriors of our time, the children who face a daily battle against cancer, but always with a smile on their faces and the unbeatable desire to enjoy life to its fullest.
                </p>
                <p
                  className="mb-3 text-black-80 fw-light"
                  style={{ textAlign: 'justify' }}
                > The most exciting part of this NFT
                  collection and the main driver for its core team is the tight
                  link and commitment this initiative has with children affected by cancer.
                  Children participated in all the creative layers and are the true
                  heroes in this story. They designed the background layer for
                  each of the JOJOs, adding a genuine and authentic dimension to
                  the character and to the entire collection. Children also lead
                  some of the fundraising activities that with the support of
                  JOJO and other donations benefit assistance projects for our
                  brave warriors.
                </p>

                <p
                  className="mb-3 text-black-80 fw-light"
                  style={{ textAlign: 'justify' }}
                > All this implication gives the JOJO NFT collection a much bigger purpose than itself, a purpose that exceeds personal interests or objectives, and the team behind is committed fully to it. That’s why 90% of the proceeds generated by the JOJO NFT launch are destined to non-profit institutions like de SJD Pediatric Cancer Center and also to fund future social initiatives of the KidsBeatCancer Foundation. Moreover, royalties generated by secondary sales are sent fully to the donation wallet KidsBeatCancer.sol, which you can use to donate as well. Finally all JOJO merchandise profits are also destined 100% to cancer fight causes.
                </p>
              </div>
            </div>
          </div>

          {/* Numbers */}
          <div className="container" style={{ maxWidth: '1000px' }}>
            <div className="row col-mb-30 mb-3">
              <div className="col-md-6">
                <div className="d-flex align-items-center justify-content-center">
                  <div className="counter counter-xlarge text-dark fw-bolder">
                    <CountUp end={4321} duration={2} />
                  </div>
                  <span style={{ textTransform: 'none' }}>
                    available JOJOs in this first generation
                    NFT collection
                  </span>
                </div>
              </div>

              <div className="col-md-6">
                <div className="d-flex align-items-center justify-content-center">
                  <div className="counter counter-xlarge text-dark fw-bolder">
                    <CountUp end={90} duration={2} />
                  </div>
                  <span style={{ textTransform: 'none' }}>
                    % of proceeds are destined to research programs, to fight
                    cancer and fund childhood cancer projects
                  </span>
                </div>
              </div>

              <div className="col-md-6">
                <div className="d-flex align-items-center justify-content-center">
                  <div className="counter counter-xlarge text-dark fw-bolder">
                    <CountUp end={100} duration={2} />
                  </div>
                  <span style={{ textTransform: 'none' }}>
                    % of royalties donated to KidsBeatCancer.sol wallet,
                    a non-profit fund
                  </span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex align-items-center justify-content-center">
                  <div className="counter counter-xlarge text-dark fw-bolder">
                    <CountUp end={100} duration={2} />
                  </div>
                  <span style={{ textTransform: 'none' }}>
                    % of Merchandise profits used to support childhood
                    cancer projects
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
                    When you join the KidsBeatCancer family you also get access <br />to a variety of
                    exclusive events and experiences.
                  </p>
                </div>
              </div>

              <div className="row gutter-30 mb-5 align-items-stretch">
                <div className="col-md-6 col-sm-6 col-xl-4">
                  <div
                    className="card d-flex align-items-end flex-column p-1 border-0 h-gradient-red-yellow"
                  >
                    <div className="mt-auto p-3" style={{ backgroundColor: 'white', borderRadius: '2px' }}>
                      <div className="card-body  h-invert-image">
                        <h3 className="card-title fw-bolder">Exclusive Pass</h3>
                        <p className="card-text mb-0 mt-2 fw-light">
                          Early access to the KidsBeatCancer non-profit
                          <strong className="gradient-text gradient-red-yellow">&nbsp;merchandise pre-sale&nbsp;</strong>
                          and exclusive voting rights in the KidsBeatCancer
                          <strong className="gradient-text gradient-red-yellow">&nbsp;DAO&nbsp;</strong>
                          , where JOJO NFT holders will
                          have the power to decide over new campaigns the KidsBeatCancer Foundation should support.
                        </p>
                        <div className="card-icon">
                          <img src="images/tickets.png" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-sm-6 col-xl-4">
                  <div
                    className="card d-flex align-items-end flex-column p-1 border-0 h-gradient-red-yellow"
                  >
                    <div className="mt-auto p-3" style={{ backgroundColor: 'white', borderRadius: '2px' }}>
                      <div className="card-body  h-invert-image">

                        <h3 className="card-title fw-bolder">Social Impact</h3>
                        <p className="card-text mb-0 mt-2 fw-light">
                          When joining the KidsBeatCancer family, you don’t only help children and their families.
                          You also support the KidsBeatCancer team and non-profit institutions investigate for
                          better treatments, build proper infrastructures and train future professionals.
                        </p>
                        <div className="card-icon">
                          <img src="images/handshake.png" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-sm-6 col-xl-4">
                  <div
                    className="card d-flex align-items-end flex-column p-1 border-0 h-gradient-red-yellow"
                  >
                    <div className="mt-auto p-3" style={{ backgroundColor: 'white', borderRadius: '2px' }}>
                      <div className="card-body h-invert-image">

                        <h3 className="card-title fw-bolder">IRL Passes</h3>
                        <p className="card-text mb-0 mt-2 fw-light">
                          JOJO NFT owners will be gifted a minting through the <strong className="gradient-text gradient-red-yellow">JOJO Canvas</strong>  app, set to design and customize your own 2nd generation JOJO NFT. The app will enable anyone to create their own JOJO and store it on-chain forever.
                        </p>
                        <div className="card-icon">
                          <img src="images/phone.png" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-sm-6 col-xl-4">
                  <div
                    className="card d-flex align-items-end flex-column p-1 border-0 h-gradient-red-yellow"
                  >
                    <div className="mt-auto p-3" style={{ backgroundColor: 'white', borderRadius: '2px' }}>
                      <div className="card-body  h-invert-image">

                        <h3 className="card-title fw-bolder">Merchandise</h3>
                        <p className="card-text mb-0 mt-2 fw-light">
                          Another way to support <strong className="gradient-text gradient-red-yellow">&nbsp;join JOJO's cause</strong> while looking cooler than ever is by purchasing the KidsBeatCancer merchandise. Wear the KidsBeatCancer customized T-shirts, sweaters and caps knowing all the profits go towards helping the right cause.
                        </p>
                        <div className="card-icon">
                          <img src="images/cap.png" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-sm-6 col-xl-4">
                  <div
                    className="card d-flex align-items-end flex-column p-1 border-0 h-gradient-red-yellow"
                  >
                    <div className="mt-auto p-3" style={{ backgroundColor: 'white', borderRadius: '2px' }}>
                      <div className="card-body  h-invert-image">

                        <h3 className="card-title fw-bolder">Giveaways</h3>
                        <p className="card-text mb-0 mt-2 fw-light">
                          Own a JOJO and get the chance to participate in exclusive contests, events and giveaways. Special edition JOJO caps, NFTs and JOJO canvas app free mintings are some of the multiple prizes JOJO owners will be eligible to receive.
                        </p>
                        <div className="card-icon">
                          <img src="images/gift.png" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-sm-6 col-xl-4">
                  <div
                    className="card d-flex align-items-end flex-column p-1 border-0 h-gradient-red-yellow"
                  >
                    <div className="mt-auto p-3" style={{ backgroundColor: 'white', borderRadius: '2px' }}>
                      <div className="card-body  h-invert-image">

                        <h3 className="card-title fw-bolder">Keep Beating</h3>
                        <p className="card-text mb-0 mt-2 fw-light">
                          JOJO is the first initiative of the KidsBeatCancer Foundation, but not the last. At  KidsBeatCancer we aim to create new initiatives and support more projects that use these technologies to create new methods for
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

          {/* donate */}
          <section id="donate"
            className="section mb-0 pt-5 pb-0"
            style={{
              backgroundColor: '#f4f4f4',
              marginTop: 50,
              overflow: 'visible',

            }}
          >
            <div className="container">
              <div className="row justify-content-center text-center mt-5 pb-5" >
                <div className="col-lg-8 pb-3">
                  <h3 className="fw-bolder h1 mb-4">
                    DONATE TO&nbsp;
                    <span className="gradient-text gradient-red-yellow">
                      KIDSBEATCANCER.SOL
                    </span>
                  </h3>
                  <p className="mb-5  text-black-50 fw-light">
                    We want everyone to be able to collaborate with the initiatives and campaigns we support. Join our cause by donating to the
                    <strong style={{ color: '#333' }}>
                      kidsbeatcancer.sol
                    </strong>
                    &nbsp;wallet address or by using &nbsp;
                    <strong style={{ color: '#333' }}>
                      JOJO's piggybank
                    </strong>
                    . JOJO loves all Solana tokens so feel free to send SOL, SPL tokens or even NFTs!
                    The top 1.000 donors will be featured on the
                    <strong>&nbsp;JOJO's Wall of Fame</strong>!
                  </p>
                  <div style={{ textAlign: 'center' }}>
                    <DonationPointEl />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQS */}
          <div className="section m-0" style={{ background: '#f1efe5', paddingTop: '50px' }}>
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

      {/* <div id="gotoTop" className="icon-double-angle-up bg-white text-dark rounded-circle shadow"></div> */}

    </div>

  );
}

export default Home;