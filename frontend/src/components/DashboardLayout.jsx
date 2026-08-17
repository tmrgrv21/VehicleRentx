import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DashboardLayout = ({ children, activeTab }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('vrx_user') || '{}'));
  const [institution, setInstitution] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('vrx_user') || '{}');
    if (!stored._id) {
      navigate('/login');
    } else {
      axios.get(`http://localhost:5000/api/profile/${stored._id}`)
        .then(res => {
          const updated = { 
            ...stored, 
            ...res.data.user, 
            walletBalance: res.data.user.walletBalance 
          };
          localStorage.setItem('vrx_user', JSON.stringify(updated));
          setUser(updated);
          
          if (res.data.institution) {
            setInstitution(res.data.institution);
            const branding = res.data.institution.branding;
            if (branding) {
              document.documentElement.style.setProperty('--primary', branding.primaryColor || '#15803D');
              document.documentElement.style.setProperty('--secondary', branding.secondaryColor || '#1D4ED8');
              document.documentElement.style.setProperty('--accent', branding.accentColor || '#D97706');
            }
          }
        })
        .catch(() => {});
    }
  }, [location.pathname, navigate]);

  const baseItems = [
    { path: '/dashboard', icon: 'fa-gauge', label: 'Overview' },
    { path: '/dashboard/rides', icon: 'fa-route', label: 'My Rides' },
    { path: '/dashboard/wallet', icon: 'fa-wallet', label: 'Wallet' },
    { path: '/dashboard/profile', icon: 'fa-user', label: 'Profile' },
  ];

  const showAdmin = ['university_admin', 'super_admin', 'security_officer'].includes(user.role) || user.role === 'admin';
  const navItems = showAdmin 
    ? [...baseItems, { path: '/admin', icon: 'fa-shield-halved', label: 'Admin Panel' }] 
    : baseItems;

  const handleLogout = () => {
    localStorage.removeItem('vrx_user');
    localStorage.removeItem('vrx_token');
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F1F5F9' }}>
      <nav className="navbar navbar-expand-lg navbar-dark shadow-sm py-3" style={{ background: 'var(--dark, #0F172A)', zIndex: 1000 }}>
        <div className="container-fluid px-4">
          
          <Link to="/dashboard" aria-label="VehicleRentX Home" className="navbar-brand d-flex align-items-center gap-2" style={{ marginRight: '30px' }}>
            <img src="/assets/vehiclerentx_logo.png" alt="VehicleRentX Logo" style={{ height: '36px', objectFit: 'contain' }} />
            <div className="d-flex flex-column text-start">
              <span className="fw-extrabold text-white" style={{ fontSize: '1rem', lineHeight: '1.2', fontWeight: '800' }}>
                VehicleRentX
              </span>
              <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: '500' }}>{institution?.code || 'Campus Portal'}</span>
            </div>
          </Link>

          <button 
            className="navbar-toggler border-0" 
            type="button" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1 mt-3 mt-lg-0">
              {navItems.map(item => (
                <li key={item.path} className="nav-item">
                  <Link 
                    to={item.path} 
                    className={`nav-link px-3 py-2 rounded-3 d-flex align-items-center gap-2 ${location.pathname === item.path ? 'active fw-bold text-white' : 'text-secondary'}`}
                    style={location.pathname === item.path ? { background: 'rgba(255,255,255,0.08)' } : {}}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className={`fa-solid ${item.icon}`}></i> {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
              <Link to="/dashboard/wallet" className="text-decoration-none" onClick={() => setIsMenuOpen(false)}>
                <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                  <i className="fa-solid fa-wallet me-2"></i>₹{user.walletBalance || 0}
                </span>
              </Link>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'U')}&background=1D4ED8&color=fff&bold=true`}
                className="rounded-circle"
                width="38"
                height="38"
                alt="User"
                style={{ cursor: 'pointer', border: '2px solid #E2E8F0' }}
                onClick={() => { navigate('/dashboard/profile'); setIsMenuOpen(false); }}
              />
              <button 
                onClick={handleLogout} 
                className="btn btn-outline-danger btn-sm rounded-pill px-3 py-2 d-flex align-items-center gap-2 border-0"
                style={{ color: '#EF4444' }}
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                <span className="d-lg-none">Logout</span>
              </button>
            </div>
          </div>

        </div>
      </nav>

      <div className="container-fluid py-4 px-4 px-lg-5" style={{ flex: 1 }}>
        <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm">
          <h4 className="fw-bold m-0 text-truncate" style={{ maxWidth: '85%' }}>
            {activeTab === 'overview' && `🗺️ Overview - ${institution?.name || 'Find Your Ride'}`}
            {activeTab === 'rides' && '🏍️ My Rides'}
            {activeTab === 'wallet' && '💰 My Wallet'}
            {activeTab === 'profile' && '👤 My Profile'}
            {!activeTab && `Welcome, ${user.fullName || 'User'}! 👋`}
          </h4>
        </div>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;