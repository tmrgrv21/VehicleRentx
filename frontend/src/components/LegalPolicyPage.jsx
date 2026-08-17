import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const LegalPolicyPage = ({ defaultTab = 'privacy' }) => {
  const location = useLocation();
  
  const getTabFromPath = () => {
    if (location.pathname.includes('/privacy')) return 'privacy';
    if (location.pathname.includes('/terms')) return 'terms';
    if (location.pathname.includes('/cookies')) return 'cookies';
    if (location.pathname.includes('/refund')) return 'refund';
    return defaultTab;
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setActiveTab(getTabFromPath());
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyPageLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const policies = {
    privacy: {
      title: 'Privacy Policy',
      subtitle: 'How VehicleRentX collects, uses, stores, and safeguards your personal data.',
      effectiveDate: 'Effective Date: July 2026',
      icon: 'fa-shield-halved',
      sections: [
        {
          id: 'intro',
          title: '1. Introduction',
          content: (
            <>
              <p>VehicleRentX values your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our smart campus mobility platform.</p>
              <div className="alert alert-info py-3 rounded-3 small">
                <i className="fa-solid fa-circle-info me-2"></i>By creating an account or accessing VehicleRentX services, you consent to the data collection and usage practices described in this policy.
              </div>
            </>
          )
        },
        {
          id: 'collection',
          title: '2. Information We Collect',
          content: (
            <>
              <p>We collect essential information to provide secure and seamless vehicle rentals:</p>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100 border border-light">
                    <h6 className="fw-bold text-primary"><i className="fa-solid fa-user me-2"></i>Personal & Academic Data</h6>
                    <ul className="small text-muted mb-0 ps-3">
                      <li>Full Name & Choose Username</li>
                      <li>Email Address & Mobile Phone Number</li>
                      <li>Encrypted Password Hash</li>
                      <li>University / Institute Name & Type</li>
                      <li>Academic Course, Department & Semester</li>
                      <li>Student / Employee Roll Number</li>
                    </ul>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100 border border-light">
                    <h6 className="fw-bold text-primary"><i className="fa-solid fa-id-card me-2"></i>KYC & Booking Information</h6>
                    <ul className="small text-muted mb-0 ps-3">
                      <li>Aadhaar Card (Front & Back Scans)</li>
                      <li>Driving License Verification</li>
                      <li>Selfie Verification Photo</li>
                      <li>Vehicle Ownership & RC Documents (For Owners)</li>
                      <li>Booking History, Durations & Trip Logs</li>
                      <li>Wallet Balance & PayPal Transaction Logs</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )
        },
        {
          id: 'usage',
          title: '3. How We Use Your Information',
          content: (
            <>
              <p>Your personal and technical data is used exclusively to facilitate reliable campus transit:</p>
              <ul className="small text-secondary space-y-2">
                <li>Create and securely authenticate user accounts across campus.</li>
                <li>Verify student and staff eligibility via campus identification & KYC.</li>
                <li>Process ride reservations, digital wallet payments, and security deposits.</li>
                <li>Send automated SMS OTPs, booking confirmations, and critical alerts.</li>
                <li>Detect fraudulent activities, unauthorized vehicle usage, and safety violations.</li>
                <li>Provide prompt customer support and resolve technical queries.</li>
                <li>Comply with applicable legal, institutional, and regulatory obligations.</li>
              </ul>
            </>
          )
        },
        {
          id: 'security',
          title: '4. Data Security & Storage',
          content: (
            <>
              <p>VehicleRentX employs robust, industry-standard technical security controls to safeguard your data:</p>
              <div className="p-3 bg-light rounded-3 border">
                <div className="row g-2 text-dark small fw-semibold">
                  <div className="col-md-6"><i className="fa-solid fa-lock text-success me-2"></i>HTTPS SSL/TLS Encrypted Transmission</div>
                  <div className="col-md-6"><i className="fa-solid fa-key text-success me-2"></i>BCrypt Password Hashing</div>
                  <div className="col-md-6"><i className="fa-solid fa-mobile-screen-button text-success me-2"></i>SMS Mobile OTP Verification</div>
                  <div className="col-md-6"><i className="fa-solid fa-database text-success me-2"></i>Role-Based Database Access</div>
                </div>
              </div>
            </>
          )
        },
        {
          id: 'sharing',
          title: '5. Information Sharing & Disclosure',
          content: (
            <>
              <p><strong>VehicleRentX does not sell, trade, or rent your personal information to third parties.</strong> Data is shared only under strict operational necessity:</p>
              <ul className="small text-secondary">
                <li><strong>Payment Processors:</strong> Secure transaction details shared with PayPal for wallet top-ups.</li>
                <li><strong>Gateway Partners:</strong> Mobile numbers shared with SMS providers (Fast2SMS/MSG91) solely for OTP delivery.</li>
                <li><strong>Legal Compliance:</strong> Disclosed to university authorities or law enforcement agencies when mandated by law.</li>
              </ul>
            </>
          )
        },
        {
          id: 'rights',
          title: '6. User Rights & Data Deletion',
          content: (
            <>
              <p>Users possess full control over their personal profile and stored data:</p>
              <ul className="small text-secondary">
                <li>View and update academic profile details anytime in account settings.</li>
                <li>Request complete account deactivation and personal data deletion.</li>
                <li>Inquire about stored KYC document records and access logs.</li>
              </ul>
            </>
          )
        }
      ]
    },
    terms: {
      title: 'Terms & Conditions',
      subtitle: 'Rules, guidelines, and legal terms governing the use of VehicleRentX.',
      effectiveDate: 'Effective Date: July 2026',
      icon: 'fa-file-contract',
      sections: [
        {
          id: 'terms-intro',
          title: '1. Introduction & Agreement',
          content: (
            <>
              <p>By registering, logging in, or using VehicleRentX, you agree to comply with and be bound by these Terms & Conditions. If you do not agree with any part of these terms, you must not use the platform.</p>
            </>
          )
        },
        {
          id: 'eligibility',
          title: '2. User Eligibility',
          content: (
            <>
              <p>To register and rent vehicles on VehicleRentX, you must satisfy the following criteria:</p>
              <ul className="small text-secondary">
                <li>Be at least 18 years of age.</li>
                <li>Be an active student, faculty member, research scholar, or verified staff member of a participating institution.</li>
                <li>Successfully complete mandatory identity verification (Aadhaar & Driving License).</li>
                <li>Provide accurate, truthful, and up-to-date registration details.</li>
              </ul>
            </>
          )
        },
        {
          id: 'user-resp',
          title: '3. Rider Responsibilities',
          content: (
            <>
              <div className="p-3 bg-light rounded-3 border mb-3">
                <h6 className="fw-bold text-dark mb-2"><i className="fa-solid fa-person-biking text-primary me-2"></i>Rider Obligations</h6>
                <ul className="small text-muted mb-0 ps-3">
                  <li>Adhere strictly to speed limits and traffic safety regulations.</li>
                  <li>Inspect vehicles for existing damage prior to unlocking.</li>
                  <li>Return rented vehicles on or before the specified check-in time.</li>
                  <li>Park vehicles only at designated, authorized campus parking stands.</li>
                  <li>Report any breakdown, accident, or malfunction immediately to support.</li>
                </ul>
              </div>
            </>
          )
        },
        {
          id: 'owner-resp',
          title: '4. Vehicle Owner Responsibilities',
          content: (
            <>
              <p>Students or faculty members listing their personal vehicles on VehicleRentX must ensure:</p>
              <ul className="small text-secondary">
                <li>Vehicles hold valid Registration Certificates (RC) and active third-party insurance.</li>
                <li>Vehicles are maintained in safe, roadworthy operating condition.</li>
                <li>Confirmed user bookings are honored promptly without unannounced cancellations.</li>
              </ul>
            </>
          )
        },
        {
          id: 'prohibited',
          title: '5. Prohibited Conduct & Violations',
          content: (
            <>
              <div className="alert alert-danger py-3 rounded-3 small">
                <h6 className="fw-bold text-danger mb-2"><i className="fa-solid fa-ban me-2"></i>Strictly Forbidden Actions</h6>
                <ul className="mb-0 ps-3">
                  <li>Operating vehicles under the influence of alcohol, drugs, or intoxicating substances.</li>
                  <li>Sub-leasing, sharing, or transferring account credentials to third parties.</li>
                  <li>Using vehicles for commercial haulage, illegal activities, or stunt riding.</li>
                  <li>Submitting falsified or altered KYC identification documents.</li>
                </ul>
              </div>
            </>
          )
        },
        {
          id: 'suspension',
          title: '6. Account Suspension & Termination',
          content: (
            <>
              <p>VehicleRentX reserves the unconditional right to suspend, terminate, or restrict account access for users engaging in fraudulent activities, safety violations, or repeated policy non-compliance.</p>
            </>
          )
        }
      ]
    },
    cookies: {
      title: 'Cookie Policy',
      subtitle: 'Information on how VehicleRentX uses cookies and tracking technologies.',
      effectiveDate: 'Effective Date: July 2026',
      icon: 'fa-cookie-bite',
      sections: [
        {
          id: 'cookie-intro',
          title: '1. What Are Cookies?',
          content: (
            <>
              <p>Cookies are small data files stored on your browser or device when you visit websites. VehicleRentX utilizes cookies to enable essential features, maintain active authentication sessions, and personalize user experiences.</p>
            </>
          )
        },
        {
          id: 'types',
          title: '2. Types of Cookies We Use',
          content: (
            <>
              <div className="table-responsive">
                <table className="table table-bordered table-striped small">
                  <thead className="table-dark">
                    <tr>
                      <th>Cookie Category</th>
                      <th>Purpose</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Essential Session Cookies</strong></td>
                      <td>Maintains secure user login and active navigation tokens.</td>
                      <td>Session / 24 Hours</td>
                    </tr>
                    <tr>
                      <td><strong>Security Cookies</strong></td>
                      <td>Prevents Cross-Site Request Forgery (CSRF) & unauthorized access.</td>
                      <td>Persistent</td>
                    </tr>
                    <tr>
                      <td><strong>Preference Cookies</strong></td>
                      <td>Remembers selected campus location & filter settings.</td>
                      <td>30 Days</td>
                    </tr>
                    <tr>
                      <td><strong>Performance Analytics</strong></td>
                      <td>Monitors page load speeds & system response times.</td>
                      <td>90 Days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )
        },
        {
          id: 'manage-cookies',
          title: '3. Managing Cookie Preferences',
          content: (
            <>
              <p>You can control and manage cookie settings directly in your web browser preferences. Please note that disabling essential cookies may impact authentication and interactive features on VehicleRentX.</p>
            </>
          )
        }
      ]
    },
    refund: {
      title: 'Refund & Cancellation Policy',
      subtitle: 'Transparent guidelines regarding rental cancellations, security deposits, and wallet refunds.',
      effectiveDate: 'Effective Date: July 2026',
      icon: 'fa-receipt',
      sections: [
        {
          id: 'refund-intro',
          title: '1. Overview & Principles',
          content: (
            <>
              <p>VehicleRentX guarantees fair, automated, and transparent refund processing for eligible trip cancellations, technical glitches, or double debits.</p>
            </>
          )
        },
        {
          id: 'eligible',
          title: '2. Eligible Refund Conditions',
          content: (
            <>
              <p>Full or partial refunds are automatically approved under the following conditions:</p>
              <ul className="small text-secondary">
                <li>Vehicle is unavailable at the designated stand following booking confirmation.</li>
                <li>Rental booking is cancelled by the vehicle owner prior to trip initiation.</li>
                <li>Duplicate billing or transaction error occurs during PayPal wallet top-ups.</li>
                <li>Unforeseen technical system failures prevent vehicle unlock or trip completion.</li>
              </ul>
            </>
          )
        },
        {
          id: 'timelines',
          title: '3. Refund Processing Timelines',
          content: (
            <>
              <div className="table-responsive mb-3">
                <table className="table table-bordered align-middle small">
                  <thead className="table-success text-dark fw-bold">
                    <tr>
                      <th>Payment Method</th>
                      <th>Processing Time</th>
                      <th>Destination</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><i className="fa-solid fa-wallet text-success me-2"></i><strong>VehicleRentX Wallet</strong></td>
                      <td><span className="badge bg-success">Within 24 Hours</span></td>
                      <td>In-app Wallet Credit</td>
                    </tr>
                    <tr>
                      <td><i className="fa-solid fa-qrcode text-primary me-2"></i><strong>UPI / Direct Payment</strong></td>
                      <td>1 – 3 Business Days</td>
                      <td>Source Bank Account</td>
                    </tr>
                    <tr>
                      <td><i className="fa-solid fa-credit-card text-info me-2"></i><strong>Debit / Credit Card</strong></td>
                      <td>3 – 7 Business Days</td>
                      <td>Card Issuing Bank</td>
                    </tr>
                    <tr>
                      <td><i className="fa-solid fa-building-columns text-warning me-2"></i><strong>Bank Transfer / PayPal</strong></td>
                      <td>3 – 7 Business Days</td>
                      <td>Original Payment Source</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )
        },
        {
          id: 'non-refundable',
          title: '4. Non-Refundable Scenarios',
          content: (
            <>
              <div className="alert alert-warning py-3 rounded-3 small">
                <h6 className="fw-bold text-dark mb-2"><i className="fa-solid fa-triangle-exclamation me-2"></i>Non-Refundable Exceptions</h6>
                <ul className="mb-0 ps-3">
                  <li>User no-show or failure to collect vehicle without prior cancellation.</li>
                  <li>Cancellations attempted after vehicle unlock or trip commencement.</li>
                  <li>Accidental damage or policy violations resulting in account suspension.</li>
                </ul>
              </div>
            </>
          )
        }
      ]
    }
  };

  const currentPolicy = policies[activeTab] || policies.privacy;

  const filteredSections = currentPolicy.sections.filter(sec => 
    sec.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    sec.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      
      <nav className="navbar navbar-expand-lg navbar-dark shadow-sm py-3" style={{ background: '#0F172A', zIndex: 1000 }}>
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
            <img src="/assets/vehiclerentx_logo.png" alt="VehicleRentX Logo" style={{ height: '40px', objectFit: 'contain' }} />
            <span className="fw-extrabold text-white fs-4" style={{ letterSpacing: '-0.5px' }}>VehicleRentX</span>
          </Link>
          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="btn btn-outline-light btn-sm rounded-pill px-3">
              <i className="fa-solid fa-arrow-left me-2"></i>Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', padding: '50px 0 40px', color: 'white' }}>
        <div className="container">
          
          <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb small text-muted">
              <li className="breadcrumb-item"><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
              <li className="breadcrumb-item"><span className="text-secondary">Legal Policies</span></li>
              <li className="breadcrumb-item active text-white" aria-current="page">{currentPolicy.title}</li>
            </ol>
          </nav>

          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '48px', height: '48px', backgroundColor: '#10B981', fontSize: '20px' }}>
                  <i className={`fa-solid ${currentPolicy.icon}`}></i>
                </div>
                <h1 className="fw-extrabold mb-0 fs-2">{currentPolicy.title}</h1>
              </div>
              <p className="text-secondary mb-0 small" style={{ color: '#94A3B8' }}>{currentPolicy.subtitle}</p>
            </div>
            
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-30 rounded-pill px-3 py-2">
                <i className="fa-regular fa-clock me-1"></i>{currentPolicy.effectiveDate}
              </span>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2 mt-4 pt-3 border-top border-secondary border-opacity-25">
            {[
              { id: 'privacy', label: 'Privacy Policy', icon: 'fa-shield-halved' },
              { id: 'terms', label: 'Terms & Conditions', icon: 'fa-file-contract' },
              { id: 'cookies', label: 'Cookie Policy', icon: 'fa-cookie-bite' },
              { id: 'refund', label: 'Refund Policy', icon: 'fa-receipt' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2 ${activeTab === tab.id ? 'btn-success text-white' : 'btn-outline-light text-secondary'}`}
                style={activeTab === tab.id ? { backgroundColor: '#10B981', borderColor: '#10B981' } : { borderColor: 'rgba(255,255,255,0.2)' }}
              >
                <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      <div className="container py-5 flex-grow-1">
        <div className="row g-4">
          
          <div className="col-lg-3">
            <div className="bg-white p-4 rounded-4 shadow-sm border sticky-top" style={{ top: '90px', zIndex: 100 }}>
              
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Search Within Policy</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0"><i className="fa-solid fa-magnifying-glass text-muted"></i></span>
                  <input 
                    type="text" 
                    className="form-control bg-light border-start-0" 
                    placeholder="Search sections..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                  />
                </div>
              </div>

              <h6 className="fw-bold text-dark mb-3 small text-uppercase" style={{ letterSpacing: '0.5px' }}>Table of Contents</h6>
              <nav className="nav flex-column gap-1 small">
                {currentPolicy.sections.map(sec => (
                  <a 
                    key={sec.id} 
                    href={`#${sec.id}`} 
                    className="nav-link text-secondary px-2 py-1 rounded hover-bg-light text-truncate"
                    style={{ fontSize: '0.85rem' }}
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>

              <hr className="my-3" />

              <div className="d-flex flex-column gap-2">
                <button onClick={handlePrint} className="btn btn-outline-dark btn-sm rounded-3 w-100 text-start">
                  <i className="fa-solid fa-print me-2"></i>Print / Save as PDF
                </button>
                <button onClick={copyPageLink} className="btn btn-outline-secondary btn-sm rounded-3 w-100 text-start">
                  <i className="fa-solid fa-link me-2"></i>{copiedLink ? 'Link Copied!' : 'Copy Policy Link'}
                </button>
              </div>

            </div>
          </div>

          <div className="col-lg-9">
            <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border">
              
              {filteredSections.map(sec => (
                <div key={sec.id} id={sec.id} className="mb-5 pb-3 border-bottom border-light">
                  <h4 className="fw-bold text-dark mb-3" style={{ letterSpacing: '-0.3px' }}>{sec.title}</h4>
                  <div className="text-secondary leading-relaxed" style={{ fontSize: '0.95rem', lineHeight: '1.75' }}>
                    {sec.content}
                  </div>
                </div>
              ))}

              <div className="p-4 rounded-4 mt-5 shadow-sm" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: 'white' }}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '42px', height: '42px', backgroundColor: '#10B981' }}>
                    <i className="fa-solid fa-headset"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0">Legal & Support Enquiries</h5>
                    <p className="text-muted small mb-0">Have questions regarding this policy? Reach out directly to our team.</p>
                  </div>
                </div>
                <div className="row g-3 small">
                  <div className="col-md-6">
                    <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span className="text-muted d-block mb-1">Email Address:</span>
                      <a href="mailto:Gauravsinght52@gmail.com" className="text-success text-decoration-none fw-bold">Gauravsinght52@gmail.com</a>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span className="text-muted d-block mb-1">Phone Helpline:</span>
                      <a href="tel:+917400683677" className="text-white text-decoration-none fw-bold me-3">+91 7400683677</a>
                      <a href="tel:+917753027192" className="text-white text-decoration-none fw-bold">+91 7753027192</a>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {showScrollTop && (
        <button 
          onClick={scrollToTop} 
          aria-label="Scroll to Top" 
          className="btn btn-success rounded-circle shadow-lg position-fixed bottom-0 end-0 m-4 d-flex align-items-center justify-content-center"
          style={{ width: '48px', height: '48px', zIndex: 1050, backgroundColor: '#10B981', borderColor: '#10B981' }}
        >
          <i className="fa-solid fa-arrow-up text-white fs-5"></i>
        </button>
      )}

      <footer className="text-white pt-5 pb-4 mt-auto" style={{ backgroundColor: '#0F172A', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 small" style={{ color: '#94A3B8' }}>
            <div className="d-flex align-items-center gap-2">
              <img src="/assets/vehiclerentx_logo.png" alt="VehicleRentX Logo" style={{ height: '30px', objectFit: 'contain' }} />
              <span>&copy; 2026 <strong className="text-white">VehicleRentX</strong>. All Rights Reserved.</span>
              <span className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-30 rounded-pill px-3 py-1 ms-2">v1.0.0</span>
            </div>
            <div className="d-flex gap-3">
              <Link to="/privacy" className="text-decoration-none" style={{ color: activeTab === 'privacy' ? '#10B981' : '#CBD5E1' }}>Privacy Policy</Link>
              <span>•</span>
              <Link to="/terms" className="text-decoration-none" style={{ color: activeTab === 'terms' ? '#10B981' : '#CBD5E1' }}>Terms & Conditions</Link>
              <span>•</span>
              <Link to="/cookies" className="text-decoration-none" style={{ color: activeTab === 'cookies' ? '#10B981' : '#CBD5E1' }}>Cookie Policy</Link>
              <span>•</span>
              <Link to="/refund" className="text-decoration-none" style={{ color: activeTab === 'refund' ? '#10B981' : '#CBD5E1' }}>Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LegalPolicyPage;