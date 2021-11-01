import React from 'react';
import { Link } from 'react-router-dom';

function Purpose() {
  return (
    <div>
      <div id="wrapper" className="clearfix">
        <header id="header" className="border-bottom-0 no-sticky transparent-header">
          <div id="header-wrap">
            <div className="container">
              <div className="header-row">
                <div id="logo">
                  <Link to="/" className="standard-logo">
                    <img
                      src="images/logo.png"
                      alt="KidsBeatCancer"
                      width='60'
                    />
                  </Link>
                </div>

                <div className="header-misc">
                  <a href="#" className="button button-border rounded-pill">
                    Connect
                  </a>
                </div>

                <div id="primary-menu-trigger">
                  <svg className="svg-trigger" viewBox="0 0 100 100">
                    <path
                      d="m 30,33 h 40 c 3.722839,0 7.5,3.126468 7.5,8.578427 0,5.451959 -2.727029,8.421573 -7.5,8.421573 h -20"
                    ></path>
                    <path d="m 30,50 h 40"></path>
                    <path
                      d="m 70,67 h -40 c 0,0 -7.5,-0.802118 -7.5,-8.365747 0,-7.563629 7.5,-8.634253 7.5,-8.634253 h 20"
                    ></path>
                  </svg>
                </div>

                <nav className="primary-menu">
                  <ul className="menu-container">
                    <li className="menu-item">
                      <Link className="menu-link" to="/">
                        <div>Home</div>
                      </Link>
                    </li>

                    <li className="menu-item current">
                      <a className="menu-link" href="#">
                        <div>Purpose</div>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </header>

        <section id="content" >
          <div className="content-wrap pb-0 " style={{
            background: "#fff url('images/hero-bg.svg') repeat top center",
            backgroundSize: "cover",
          }}>

            <div className="container mw-md mt-5">
              <h2 className="display-3 fw-bolder">
                The&nbsp;<span className="gradient-text gradient-red-yellow">Purpose</span>

              </h2>
              <div className="row justify-content-center mt-4">
                <div className="col-md-10 col-11">
                  <p className="lead" style={{ textAlign: 'justify' }}>
                    JOJO encompasses the kid inside each of us. It is the true depiction of our most pure and emphatic emotions, the ones that arise in our early age accompanied by the love, care and kindness of our family, early friends and school mentors.
                    The illusion and ambition that woke us up as kids was the fuel for our everyday adventures, a magic power to tirelessly discover new things, to grow along the way and devise a happy future.
                  </p>
                  <p className="lead justify" style={{ textAlign: 'justify' }}>
                    JOJO represents all of it, represents the illusion and happiness in us
                    and the enormous will to live life to its fullest, to discover it.
                    But, above all, JOJO has a special meaning, a special purpose that resonates
                    with each of us, as individuals and as a society:
                  </p>

                  <h4 className="display-6 fw-light" style={{ lineHeight: 1.5 }}>
                    JOJO represents the
                    &nbsp;<span className="gradient-text gradient-red-yellow">bravest</span>
                    &nbsp;and
                    &nbsp;<span className="gradient-text gradient-red-yellow">strongest</span>
                    &nbsp;warriors of our time.

                  </h4>
                  <p className="lead justify" style={{ textAlign: 'justify' }}>
                    The ones who face every day the battle against
                    cancer, child cancer, with its ups and downs, falls and rises,
                    but always with a smile on their faces, the illusion and joy in
                    their eyes for a better tomorrow and the unbeatable desire to live and enjoy life.

                  </p>
                  <p className="lead" style={{ textAlign: 'justify' }}>

                    JOJO is one of them, and JOJO is one of us.
                    And let me tell you something... JOJO beats cancer. <span className="gradient-text gradient-red-yellow fw-bold">#KidsBeatCancer</span>.
                  </p>
                </div>
              </div>


            </div>
          </div>
          <div className="content-wrap pb-0 ">
            <div className="section text-center mb-0">
              <div className="mw-xs mx-auto">
                <h3 className="display-4 fw-bolder text-uppercase mt-3">
                  We do it thanks to
                  <span className="gradient-text gradient-red-yellow">&nbsp;Them</span>
                </h3>
                <p className="mt-4">
                  Thank you doctors, nurses, researchers, families, intitutions, social workers... And thank you <strong>Fighters</strong>.
                </p>

                <div className="clear"></div>

                <div
                  className="row justify-content-center align-items-center mt-4 col-mb-30"
                >


                </div>
              </div>
            </div>
          </div>

          <div className="clear"></div>

          <div className="container mb-5">
            <div className="row justify-content-center text-center mt-5">
              <div className="col-lg-8 mt-5">
                <div>
                  <h3 className="fw-bolder display-4 mb-4">
                    The Team
                  </h3>
                  <p className="mb-5 text-black-50 fw-light">
                    We joined because we were all open and motivated to work on something meaningful. If you are too, contact us. Let's make good things happen!

                  </p>

                </div>
              </div>
            </div>

            <div className="clear"></div>

            <div className="row justify-content-center col-mb-50 mt-3">
              <div className="col-lg-3 col-sm-6 h-translatey-4 tf-ts">
                <a href="mailto:marti@kidsbeatcancer.org">
                  <div className="team-image h-invert-image">
                    <img src="images/Marti.png" alt="Portfoio Item" />
                    <div className="bg-overlay">
                      <div
                        className="bg-overlay-content align-items-start justify-content-start flex-column px-5 py-4"
                      >
                        <h3 className="mb-0 mt-1 gradient-text gradient-red-yellow">Marti</h3>
                        <h5 className="gradient-text gradient-red-yellow">Community</h5>
                      </div>

                    </div>
                  </div>
                </a>
              </div>

              <div className="col-lg-3 col-sm-6 h-translatey-4 tf-ts">
                <a href="mailto:joan@kidsbeatcancer.org">

                  <div className="team-image h-invert-image">
                    <img src="images/Joan R.png" alt="Portfoio Item" />
                    <div className="bg-overlay">
                      <div
                        className="bg-overlay-content align-items-start justify-content-start flex-column px-5 py-4"
                      >
                        <h3 className="mb-0 mt-1 gradient-text gradient-red-yellow">Joan R.</h3>
                        <h5 className="gradient-text gradient-red-yellow">Developer</h5>
                      </div>

                    </div>
                  </div>
                </a>
              </div>

              <div className="col-lg-3 col-sm-6 h-translatey-4 tf-ts">
                <a href="mailto:art@kidsbeatcancer.org">

                  <div className="team-image h-invert-image">
                    <img src="images/Joan S.png" alt="Portfoio Item" />
                    <div className="bg-overlay">
                      <div
                        className="bg-overlay-content align-items-start justify-content-start flex-column px-5 py-4"
                      >
                        <h3 className="mb-0 mt-1 gradient-text gradient-red-yellow">Joan S.</h3>
                        <h5 className="gradient-text gradient-red-yellow">Artist</h5>
                      </div>

                    </div>
                  </div>
                </a>
              </div>



              <div className="col-lg-3 col-sm-6 h-translatey-4 tf-ts">
                <a href="mailto:nicolau@kidsbeatcancer.org">

                  <div className="team-image h-invert-image">
                    <img src="images/Nico.png" alt="Portfoio Item" />
                    <div className="bg-overlay">
                      <div
                        className="bg-overlay-content align-items-start justify-content-start flex-column px-5 py-4"
                      >
                        <h3 className="mb-0 mt-1 gradient-text gradient-red-yellow">Nico</h3>
                        <h5 className="gradient-text gradient-red-yellow">Developer</h5>
                      </div>

                    </div>
                  </div>
                </a>
              </div>


            </div>
          </div>

          <div className="clear"></div>
        </section>

        <div className="line line-sm mb-0"></div>

        {/* Footer */}
        <footer id="footer" className="border-0 " style={{ backgroundColor: '#fff' }}>

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
                    <a href="#" className="social-icon  si-small  si-discord si-dark">
                      <i className="icon-discord"></i>
                      <i className="icon-discord"></i>
                    </a>

                    <a href="#" className="social-icon  si-small si-twitter si-dark">
                      <i className="icon-twitter"></i>
                      <i className="icon-twitter"></i>
                    </a>

                    <a href="#" className="social-icon si-small  si-github si-dark">
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
      </div>

      <div
        id="gotoTop"
        className="icon-double-angle-up bg-white text-dark rounded-circle shadow"
      ></div>
    </div>
  );
}

export default Purpose;