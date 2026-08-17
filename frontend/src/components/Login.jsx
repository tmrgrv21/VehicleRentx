import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('vrx_token', res.data.token);
      localStorage.setItem('vrx_user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)', padding: '20px 15px' }}>
      <div className="bg-white p-4 p-md-5 rounded-4 shadow" style={{ width: '100%', maxWidth: '450px' }}>
        
        <div className="mb-3">
          <Link 
            to="/" 
            aria-label="Back to Home" 
            className="btn btn-sm btn-light text-muted fw-bold rounded-pill px-3 py-2 border-0 d-inline-flex align-items-center"
            style={{ backgroundColor: '#F1F5F9', transition: 'all 0.2s ease' }}
          >
            <i className="fa-solid fa-arrow-left me-2"></i>Back to Home
          </Link>
        </div>

        <div className="text-center mb-4">
          <Link to="/" style={{ textDecoration: 'none' }} aria-label="VehicleRentX Home">
            <img src="/assets/vehiclerentx_logo.png" alt="VehicleRentX Logo" className="mb-2" style={{ height: '65px', objectFit: 'contain' }} />
          </Link>
          <h4 className="fw-extrabold mt-2 mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>Welcome Back</h4>
          <p className="text-muted small mb-0">Sign in to manage your campus rentals.</p>
        </div>

        {error && <div className="alert alert-danger py-2 small fw-bold"><i className="fa-solid fa-circle-exclamation me-2"></i>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-bold small text-muted">EMAIL ADDRESS</label>
            <input type="email" required className="form-control p-3 bg-light border-0 rounded-3" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="form-label fw-bold small text-muted">PASSWORD</label>
            <input type="password" required className="form-control p-3 bg-light border-0 rounded-3" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary-custom w-100 py-3 text-white fw-bold" disabled={loading} style={{ background: '#10B981', borderColor: '#10B981' }}>
            {loading ? <><i className="fa-solid fa-spinner fa-spin me-2"></i>Signing in...</> : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-4 text-muted small">
          Don't have an account? <Link to="/register" className="fw-bold text-success">Create one</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;