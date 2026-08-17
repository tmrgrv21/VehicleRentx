import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !/\S+@\S+\.\S+/.test(newsletterEmail)) {
      setNewsletterMsg('Please enter a valid email address.');
      return;
    }
    setNewsletterMsg('🎉 Thank you for subscribing to VehicleRentX updates!');
    setNewsletterEmail('');
    setTimeout(() => setNewsletterMsg(''), 4000);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg fixed-top shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/" style={{ fontWeight: 800 }}>
            <img src="/assets/vehiclerentx_logo.png" alt="VehicleRentX Logo" style={{ height: '42px', objectFit: 'contain' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>VehicleRentX</span>
          </Link>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item"><a className="nav-link text-dark fw-semibold" href="#how-it-works">How It Works</a></li>
              <li className="nav-item"><a className="nav-link text-dark fw-semibold ms-lg-3" href="#team">Project Team</a></li>
              <li className="nav-item ms-lg-3"><Link className="nav-link text-dark fw-bold" to="/login">Login</Link></li>
              <li className="nav-item ms-lg-2"><Link className="btn btn-primary-custom" to="/register">Sign Up</Link></li>
            </ul>
          </div>
        </div>
      </nav>

      <section className="hero-section" style={{ padding: '150px 0 80px', minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, rgba(21,128,61,0.05) 0%, rgba(29,78,216,0.05) 100%)' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3 fw-bold" style={{ letterSpacing: '1px' }}>
                🏫 INDIRA GANDHI NATIONAL TRIBAL UNIVERSITY
              </span>
              <h1 className="display-4 fw-bold mb-4 text-dark" style={{ lineHeight: '1.2' }}>
                Move Smarter Across <br />
                <span style={{ color: 'var(--primary)' }}>IGNTU Campus</span>
              </h1>
              <p className="lead mb-5 text-secondary" style={{ fontSize: '1.1rem' }}>
                Rent eco-friendly cycles, electric bikes, scooters, and cars instantly. Designed specifically for IGNTU students, staff, and visitors to travel effortlessly around the university campus.
              </p>
              <div className="d-flex gap-3">
                <Link to="/dashboard" className="btn btn-primary-custom">Rent Now <i className="fa-solid fa-arrow-right ms-2"></i></Link>
                <a href="#how-it-works" className="btn btn-outline-dark rounded-pill px-4 py-2 fw-bold"><i className="fa-regular fa-compass me-2"></i> Learn More</a>
              </div>
            </div>
            <div className="col-lg-6 position-relative mt-5 mt-lg-0">
              <img src="/assets/igntu_campus.png" alt="IGNTU Campus" className="img-fluid rounded-4 shadow-lg border border-light" style={{ width: '100%', height: '400px', objectFit: 'cover' }} />
              <div className="glass-card position-absolute bottom-0 start-0 translate-middle-y ms-4 d-none d-md-block" style={{ borderLeft: '4px solid var(--primary)', background: 'rgba(255,255,255,0.9)' }}>
                <div className="d-flex align-items-center gap-3">
                  <div style={{ width: '40px', height: '40px', fontSize: '16px', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">VehicleRentx</h6>
                    <small className="text-muted">Direct Campus Transit</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-5 bg-white border-top border-light">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold">How It Works</h2>
            <p className="text-muted">Get riding across campus in 4 simple steps</p>
          </div>
          <div className="row g-4 text-center">
            {[
              { icon: 'fa-user-plus', title: '1. Create Account', desc: 'Sign up using your student or staff email ID.' },
              { icon: 'fa-location-dot', title: '2. Locate Vehicle', desc: 'Find nearby bikes or cars on the live campus map.' },
              { icon: 'fa-qrcode', title: '3. Scan to Unlock', desc: 'Scan the vehicle QR code to instantly start your ride.' },
              { icon: 'fa-flag-checkered', title: '4. End & Pay', desc: 'Park at any authorized campus stand and lock it to complete.' }
            ].map((step, idx) => (
              <div className="col-md-3" key={idx}>
                <div style={{ width: '65px', height: '65px', borderRadius: '50%', background: 'rgba(21, 128, 61, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 20px', boxShadow: '0 4px 10px rgba(21, 128, 61, 0.1)' }}>
                  <i className={`fa-solid ${step.icon}`}></i>
                </div>
                <h5 className="fw-bold">{step.title}</h5>
                <p className="text-muted small px-3">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="team" className="py-5" style={{ background: '#F8FAFC' }}>
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill mb-2 fw-bold">
              👥 DEVELOPMENT TEAM
            </span>
            <h2 className="fw-bold">Project Members</h2>
            <p className="text-muted">The developers behind the IGNTU VehicleRentx System</p>
          </div>
          <div className="row g-4 justify-content-center">
            <div className="col-md-4 col-sm-6">
              <div className="team-member-card text-center p-3">
                <div className="team-img-wrapper rounded-4 mb-3">
                  <img src="/assets/navin.png" alt="Navin Divan" className="team-img" />
                </div>
                <h4 className="fw-bold mb-1">Navin Divan</h4>
                <p className="text-primary fw-bold mb-2">Team Leader</p>
                <p className="text-muted small mb-0 px-2">Project planning, requirement analysis, system architecture, documentation, and project coordination.</p>
              </div>
            </div>

            <div className="col-md-4 col-sm-6">
              <div className="team-member-card text-center p-3">
                <div className="team-img-wrapper rounded-4 mb-3">
                  <img src="/assets/gaurav.png" alt="Gaurav Singh Tomar" className="team-img" />
                </div>
                <h4 className="fw-bold mb-1">Gaurav Singh Tomar</h4>
                <p className="text-success fw-bold mb-2">Coordinator</p>
                <p className="text-muted small mb-0 px-2">Database design, testing, integration, documentation, requirement analysis.</p>
              </div>
            </div>

            <div className="col-md-4 col-sm-6">
              <div className="team-member-card text-center p-3">
                <div className="team-img-wrapper rounded-4 mb-3">
                  <img src="/assets/roshan.png" alt="Roshan Yadav" className="team-img" />
                </div>
                <h4 className="fw-bold mb-1">Roshan Yadav</h4>
                <p className="text-info fw-bold mb-2">Co-Coordinator</p>
                <p className="text-muted small mb-0 px-2">Frontend development, UI/UX design, JavaScript implementation, deployment support, backend development, and PHP coding.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="text-white pt-5 pb-4" style={{ backgroundColor: '#0F172A', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <div className="container">
          
          <div className="p-4 p-md-5 rounded-4 mb-5 shadow-lg" style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div className="row align-items-center g-3">
              <div className="col-lg-6">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm" style={{ width: '52px', height: '52px', backgroundColor: '#10B981', fontSize: '22px' }}>
                    <i className="fa-solid fa-paper-plane"></i>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-1 text-white" style={{ fontSize: '1.35rem' }}>Stay Updated</h4>
                    <p className="small mb-0" style={{ color: '#CBD5E1' }}>Subscribe to our newsletter for latest updates, campus offers & ride discounts.</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <form onSubmit={handleNewsletterSubmit} className="d-flex gap-2">
                  <input 
                    type="email" 
                    className="form-control p-3 bg-dark border-0 text-white rounded-3 small" 
                    placeholder="Enter your email address" 
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required 
                    style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF' }}
                  />
                  <button type="submit" className="btn btn-success px-4 py-3 fw-bold rounded-3 text-nowrap shadow-sm" style={{ backgroundColor: '#10B981', borderColor: '#10B981' }}>
                    Subscribe <i className="fa-solid fa-arrow-right ms-2"></i>
                  </button>
                </form>
                {newsletterMsg && <p className="text-success small fw-bold mt-2 mb-0">{newsletterMsg}</p>}
              </div>
            </div>
          </div>

          <div className="row g-4 mb-5">
            <div className="col-lg-4 col-md-6">
              <div className="d-flex align-items-center gap-2 mb-3">
                <img src="/assets/vehiclerentx_logo.png" alt="VehicleRentX Logo" style={{ height: '44px', objectFit: 'contain' }} />
                <span className="fw-extrabold fs-4 text-white" style={{ letterSpacing: '-0.5px' }}>VehicleRentX</span>
              </div>
              <p className="small mb-4" style={{ lineHeight: '1.8', color: '#CBD5E1', fontSize: '0.925rem' }}>
                Smart Campus Vehicle Rental Platform providing secure, convenient, and affordable transportation solutions for students, faculty, and staff.
              </p>
              
              <div className="d-flex gap-2">
                {[
                  { icon: 'fa-linkedin-in', url: 'https://linkedin.com', label: 'LinkedIn' },
                  { icon: 'fa-github', url: 'https://github.com', label: 'GitHub' },
                  { icon: 'fa-instagram', url: 'https://instagram.com', label: 'Instagram' },
                  { icon: 'fa-facebook-f', url: 'https://facebook.com', label: 'Facebook' },
                  { icon: 'fa-x-twitter', url: 'https://twitter.com', label: 'X (Twitter)' },
                  { icon: 'fa-youtube', url: 'https://youtube.com', label: 'YouTube' }
                ].map((soc, idx) => (
                  <a 
                    key={idx} 
                    href={soc.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label={soc.label} 
                    className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center p-0 shadow-sm" 
                    style={{ 
                      width: '38px', 
                      height: '38px', 
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.2)', 
                      color: '#E2E8F0',
                      transition: 'all 0.25 ease'
                    }}
                  >
                    <i className={`fa-brands ${soc.icon}`}></i>
                  </a>
                ))}
              </div>
            </div>

            <div className="col-lg-2 col-md-6">
              <h6 className="fw-bold text-white text-uppercase small mb-4" style={{ letterSpacing: '1.2px', fontSize: '0.85rem' }}>Quick Links</h6>
              <ul className="list-unstyled small d-flex flex-column gap-3 mb-0">
                <li><a href="/" className="text-decoration-none fw-medium" style={{ color: '#E2E8F0', transition: 'color 0.2s ease' }}>Home</a></li>
                <li><a href="#how-it-works" className="text-decoration-none fw-medium" style={{ color: '#E2E8F0', transition: 'color 0.2s ease' }}>How It Works</a></li>
                <li><a href="#team" className="text-decoration-none fw-medium" style={{ color: '#E2E8F0', transition: 'color 0.2s ease' }}>Project Team</a></li>
                <li><Link to="/login" className="text-decoration-none fw-medium" style={{ color: '#E2E8F0', transition: 'color 0.2s ease' }}>Login</Link></li>
                <li><Link to="/register" className="text-decoration-none fw-medium" style={{ color: '#E2E8F0', transition: 'color 0.2s ease' }}>Sign Up</Link></li>
              </ul>
            </div>

            <div className="col-lg-2 col-md-6">
              <h6 className="fw-bold text-white text-uppercase small mb-4" style={{ letterSpacing: '1.2px', fontSize: '0.85rem' }}>Services</h6>
              <ul className="list-unstyled small d-flex flex-column gap-3 mb-0">
                <li><Link to="/dashboard" className="text-decoration-none fw-medium" style={{ color: '#E2E8F0', transition: 'color 0.2s ease' }}>Rent a Vehicle</Link></li>
                <li><Link to="/register" className="text-decoration-none fw-medium" style={{ color: '#E2E8F0', transition: 'color 0.2s ease' }}>List Your Vehicle</Link></li>
                <li><a href="#how-it-works" className="text-decoration-none fw-medium" style={{ color: '#E2E8F0', transition: 'color 0.2s ease' }}>Campus Mobility</a></li>
                <li><Link to="/dashboard/wallet" className="text-decoration-none fw-medium" style={{ color: '#E2E8F0', transition: 'color 0.2s ease' }}>Digital Wallet</Link></li>
                <li><Link to="/dashboard/rides" className="text-decoration-none fw-medium" style={{ color: '#E2E8F0', transition: 'color 0.2s ease' }}>Ride History</Link></li>
              </ul>
            </div>

            <div className="col-lg-4 col-md-6">
              <h6 className="fw-bold text-white text-uppercase small mb-4" style={{ letterSpacing: '1.2px', fontSize: '0.85rem' }}>Contact & Support</h6>
              <ul className="list-unstyled small d-flex flex-column gap-3 mb-0">
                <li className="d-flex align-items-start gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center text-success flex-shrink-0" style={{ width: '32px', height: '32px', backgroundColor: 'rgba(16,185,129,0.12)' }}>
                    <i className="fa-solid fa-envelope"></i>
                  </div>
                  <a href="mailto:Gauravsinght52@gmail.com" className="text-decoration-none fw-medium mt-1" style={{ color: '#E2E8F0' }}>Gauravsinght52@gmail.com</a>
                </li>
                <li className="d-flex align-items-start gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center text-success flex-shrink-0" style={{ width: '32px', height: '32px', backgroundColor: 'rgba(16,185,129,0.12)' }}>
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <div className="mt-1">
                    <a href="tel:+917400683677" className="text-decoration-none fw-medium d-block" style={{ color: '#E2E8F0' }}>+91 7400683677</a>
                    <a href="tel:+917753027192" className="text-decoration-none fw-medium d-block mt-1" style={{ color: '#E2E8F0' }}>+91 7753027192</a>
                  </div>
                </li>
                <li className="d-flex align-items-start gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center text-success flex-shrink-0" style={{ width: '32px', height: '32px', backgroundColor: 'rgba(16,185,129,0.12)' }}>
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <span className="fw-medium mt-1" style={{ color: '#CBD5E1', lineHeight: '1.6' }}>Indira Gandhi National Tribal University, Amarkantak, Madhya Pradesh, India</span>
                </li>
              </ul>
            </div>
          </div>

          <hr style={{ borderColor: 'rgba(255,255,255,0.18)' }} />

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 pt-3 small" style={{ color: '#94A3B8' }}>
            <div className="d-flex align-items-center flex-wrap gap-2">
              <span>&copy; 2026 <strong className="text-white">VehicleRentX</strong>. All Rights Reserved. Designed & Developed by VehicleRentX Development Team.</span>
              <span className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-30 rounded-pill px-3 py-1 shadow-sm" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>v1.0.0</span>
            </div>
            <div className="d-flex gap-3">
              <Link to="/privacy" className="text-decoration-none" style={{ color: '#CBD5E1' }}>Privacy Policy</Link>
              <span>•</span>
              <Link to="/terms" className="text-decoration-none" style={{ color: '#CBD5E1' }}>Terms & Conditions</Link>
              <span>•</span>
              <Link to="/cookies" className="text-decoration-none" style={{ color: '#CBD5E1' }}>Cookie Policy</Link>
              <span>•</span>
              <Link to="/refund" className="text-decoration-none" style={{ color: '#CBD5E1' }}>Refund Policy</Link>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
};

export default LandingPage;