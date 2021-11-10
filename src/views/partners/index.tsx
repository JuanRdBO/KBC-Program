import { Link } from 'react-router-dom';

function Partners() {
  return (
    <div>
      <div className="header" style={{ margin: '0 50px' }}>
        <div className="logo">
          <Link to={`/`} className='standard-logo'>
            <img
              src="images/logo.png"
              alt="KidsBeatCancer"
              width='60'
            />
          </Link>
        </div>
        <div className="header-links">
          <ul className="header-items">

            <li className="header-item">
              <Link className="header-link" to="/">
                Home
              </Link>
            </li>
            <li className="header-item ">
              <Link className="header-link" to="/purpose">
                Puropse
              </Link>
            </li>
            <li className="header-item current">
              <Link className="header-link" to="/partners">
                Partners
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <section id="content" >
        <div className="content-wrap pb-0 " style={{
          background: "#fff url('images/hero-bg.svg') repeat top center",
          backgroundSize: "cover",
        }}>

          <div className="container mw-md mt-0">
            <h2 className="display-3 fw-bolder center">
              Childhood Cancer and the&nbsp; <span className="gradient-text gradient-red-yellow">Institutions</span> we are collaborating with

            </h2>
            <div className="row justify-content-center mt-4">
              <div className="col-md-10 col-11">
                <p className="mb-3 text-black-80 fw-light" style={{ textAlign: 'justify' }}>
                  Childhood cancer cannot generally be prevented or identified through screening.The most effective strategy to reduce the burden of cancer in children and improve outcomes is to focus on a prompt, correct diagnosis followed by effective, evidence-based therapy with tailored supportive care.
                </p>
                <p className="mb-3 text-black-80 fw-light" style={{ textAlign: 'justify' }}>
                  From the 400 000 children of 0-19 years old that are diagnosed with cancer every year, approximately 80% of them are cured when treated in high-income countries.This statistic drops to 15-45% if the treatment is carried out in low-income countries either because of lack of diagnosis, misdiagnosis, obstacles to accessing continuous treatment and higher rates of relapse.
                </p>
                <p className="mb-3 text-black-80 fw-light" style={{ textAlign: 'justify' }}>
                  Most childhood cancers can be cured with generic medicines and other forms of treatment, including surgery and radiotherapy.However, treatment of childhood cancer can be cost-effective in all income settings.
                </p>


              </div>
            </div>
          </div>
        </div>

        <div className="section bg-transparent py-3">
          <div className="container">
            <h3 className="fw-bolder h1 mb-4 center">Our Partners</h3>

            <h6 className=" fw-light center" style={{ lineHeight: 1.5, fontSize: 22 }}>
              We rely on transparent and committed
              &nbsp; <span className="gradient-text gradient-red-yellow">non-profit institutions</span>
              &nbsp; that ensure all the funds received are used towards <span className="gradient-text gradient-red-yellow">research</span> or <span className="gradient-text gradient-red-yellow">proper treatment</span>.
            </h6>
            <div className="row align-items-center justify-content-around mt-5">

              <div className="col-lg-6">
                <div className="testimonial border-0 shadow-none bg-transparent">
                  <div className="">
                    <div style={{ marginBottom: 5, fontWeight: 600 }}>
                      SJD Pediatric Cancer Centre Barcelona

                    </div>
                    <p className='mb-3 text-black-80 fw-light'>SJD Pediatric Cancer Centre Barcelona is an initiative impulsed by the Sant Joan de Deu Hospital and the Donors Foundation and is about to become the biggest oncologic childhood cancer centre in Europe, entirely funded with donations.</p>
                    <div className="testi-meta d-flex align-items-center">
                      <a className="button button-large button-light text-dark bg-transparent m-0"
                        href='https://www.youtube.com/watch?v=Uad5cM74fD0' target='_blank' rel='noreferrer'>
                        <i className="icon-line2-arrow-right fw-bold"></i>
                        <u>Watch SJD Project</u>
                      </a>

                      {/* <img src="demos/freelancer/images/testi/face.jpg" alt="Face" width="30" />
                      <div>
                        John Doe
                        <span className="ps-0">XYZ Inc.</span>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6 center">
                <a href='https://www.sjdhospitalbarcelona.org/en' rel='noreferrer' target='_blank'><img className='partner-image' style={{ width: '70%' }} src="https://www.sjdhospitalbarcelona.org/sites/default/files/u1/Sala_premsa/Noticias/2016/2016_07_14_noticia_nova_identitat_corporativa_x945.jpg" alt="" /></a>
              </div>
            </div>
            <div className="row align-items-center justify-content-around mt-5">

              <div className="col-lg-6">
                <div className="testimonial border-0 shadow-none bg-transparent">
                  <div className="">
                    <div style={{ marginBottom: 5, fontWeight: 600 }}>
                      Clínica Universidad de Navarra

                    </div>
                    <p className='mb-3 text-black-80 fw-light'>Niños Contra el Cáncer aids children and its families to access proper treatments and attention.It belongs to the Clínica Universidad de Navarra non-profit institution, a high-resolution hospital known for its trajectory in the diagnosis and treatment of highly complex pathologies.</p>
                    <div className="testi-meta d-flex align-items-center">
                      {/* <img src="demos/freelancer/images/testi/face.jpg" alt="Face" width="30" />
                      <div>
                        John Doe
                        <span className="ps-0">XYZ Inc.</span>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 center ">
                <a href='https://www.cun.es/en/' rel='noreferrer' target='_blank'><img className='partner-image' style={{ width: '70%', padding: 30 }} src="https://www.ninoscontraelcancer.org/wp-content/uploads/2018/12/NCC_LOGO_WEB.jpg" alt="" /></a>
              </div>
            </div>
          </div>
        </div>

        <div className="section bg-transparent py-3">
          <div className="container">
            <h3 className="fw-bolder h1 mb-4 center">Aknowledgements</h3>

            <h6 className=" fw-light center" style={{ lineHeight: 1.5, fontSize: 22 }}>
              This project is a reality because the technology behind it makes it possible.
            </h6>
            <div className="row align-items-center justify-content-around mt-5">
              <div className="col-lg-2 center">
                <a href='https://www.solana.com' rel='noreferrer' target='_blank'>
                  <img className=''
                    style={{width: 120, marginBottom: 50}}
                    src="images/solana_logo.png"
                    alt="" />
                </a>
              </div>
              <div className="col-lg-2 center">
                <a href='https://www.metaplex.com' rel='noreferrer' target='_blank'>
                  <img className=''
                    style={{width: 150, marginBottom: 25}}
                    src="images/metaplex_logo.png"
                    alt="" />
                </a>
              </div>
            </div>
          </div>
        </div >
      </section >

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


    </div >
  );
}

export default Partners;