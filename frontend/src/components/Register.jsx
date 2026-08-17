import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '+91',
    password: '',
    confirmPassword: '',
    role: 'student',
    institutionId: '',
    department: '',
    course: '',
    yearOrSemester: '',
    enrollmentNumber: '',
    termsAccepted: false
  });

  const [institutions, setInstitutions] = useState([]);
  const [selectedInst, setSelectedInst] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [otpModal, setOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [sandboxOtpHint, setSandboxOtpHint] = useState('');

  const [pwdStrength, setPwdStrength] = useState({
    score: 0,
    hasMinLen: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
    label: 'Too Weak',
    color: '#EF4444'
  });

  useEffect(() => {
    axios.get('http://localhost:5000/api/vehicles?institutionId=IGNTU')
      .then(() => {
        setInstitutions([
          { code: 'IGNTU', name: 'Indira Gandhi National Tribal University', type: 'Central University', primaryColor: '#15803D' },
          { code: 'JNU', name: 'Jawaharlal Nehru University', type: 'Central University', primaryColor: '#B91C1C' },
          { code: 'DU', name: 'University of Delhi', type: 'Central University', primaryColor: '#6D28D9' },
          { code: 'IITB', name: 'Indian Institute of Technology, Bombay', type: 'IIT', primaryColor: '#0284C7' },
          { code: 'NITT', name: 'National Institute of Technology, Trichy', type: 'NIT', primaryColor: '#0369A1' },
          { code: 'IIITH', name: 'International Institute of Information Technology, Hyderabad', type: 'IIIT', primaryColor: '#4F46E5' },
          { code: 'IIMA', name: 'Indian Institute of Management, Ahmedabad', type: 'IIM', primaryColor: '#C2410C' },
          { code: 'PU', name: 'Panjab University', type: 'State University', primaryColor: '#059669' },
          { code: 'BITS', name: 'BITS Pilani', type: 'Private University', primaryColor: '#7C3AED' },
          { code: 'GPP', name: 'Government Polytechnic College', type: 'Polytechnic', primaryColor: '#475569' },
          { code: 'OTHER', name: 'Other Recognized Institution', type: 'Engineering / General College', primaryColor: '#2563EB' }
        ]);
      })
      .catch(err => {
        console.error("Failed to load institutions list", err);
      });
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const evalPassword = (pwd) => {
    const minLen = pwd.length >= 8;
    const upper = /[A-Z]/.test(pwd);
    const lower = /[a-z]/.test(pwd);
    const number = /[0-9]/.test(pwd);
    const special = /[^A-Za-z0-9]/.test(pwd);

    let score = 0;
    if (pwd.length > 0) {
      if (minLen) score++;
      if (upper) score++;
      if (lower) score++;
      if (number) score++;
      if (special) score++;
    }

    let label = 'Too Weak';
    let color = '#EF4444';

    if (score >= 4 && minLen) {
      label = 'Strong';
      color = '#10B981';
    } else if (score >= 2 && minLen) {
      label = 'Medium';
      color = '#F59E0B';
    }

    setPwdStrength({
      score,
      hasMinLen: minLen,
      hasUpper: upper,
      hasLower: lower,
      hasNumber: number,
      hasSpecial: special,
      label,
      color
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));

    if (name === 'password') {
      evalPassword(value);
    }
  };

  const selectInstitution = (inst) => {
    setSelectedInst(inst);
    setSearchTerm(inst.name);
    setShowDropdown(false);
    setFormData(prev => ({ 
      ...prev, 
      institutionId: inst.code 
    }));
  };

  const sendMobileOtp = async () => {
    if (!/^\+91[6-9]\d{9}$/.test(formData.phone)) {
      return alert('Please enter a valid Indian mobile number starting with +91 (e.g. +919876543210)');
    }

    setOtpLoading(true);
    setOtpError('');
    setOtpSuccess('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register/otp/send', { phone: formData.phone });
      setOtpSuccess(res.data.message);
      
      if (res.data.details?.otp) {
        setSandboxOtpHint(res.data.details.otp);
      }

      setAttemptsRemaining(5);
      setResendCooldown(60);
      setOtpModal(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send mobile OTP. Please try again.');
    }
    setOtpLoading(false);
  };

  const verifyMobileOtp = async (e) => {
    e.preventDefault();
    if (!otpInput || otpInput.length !== 6) {
      setOtpError('Please enter a valid 6-digit verification code.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      await axios.post('http://localhost:5000/api/auth/register/otp/verify', {
        phone: formData.phone,
        code: otpInput
      });

      setMobileVerified(true);
      setOtpModal(false);
      alert('Mobile verification successful! Number marked as verified.');
    } catch (err) {
      setOtpError(err.response?.data?.error || 'Verification failed.');
      if (err.response?.data?.attemptsRemaining !== undefined) {
        setAttemptsRemaining(err.response.data.attemptsRemaining);
      }
    }
    setOtpLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!mobileVerified) {
      setError('You must complete mobile number verification before registering.');
      return;
    }

    if (!formData.termsAccepted) {
      setError('You must accept the Terms and Conditions.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (pwdStrength.label !== 'Strong') {
      setError('Password does not meet the security requirements.');
      return;
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      setSuccess('Registration Successful! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2500);

    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Check your inputs.');
    }
    setLoading(false);
  };

  const filteredInstitutions = institutions.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMaskedPhone = () => {
    if (formData.phone.length < 5) return formData.phone;
    return formData.phone.slice(0, 3) + ' XXXXX' + formData.phone.slice(-5);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', padding: '40px 15px' }}>
      <div className="bg-white p-4 p-md-5 rounded-4 shadow-lg animate-fade-in" style={{ width: '100%', maxWidth: '750px', border: '1px solid rgba(255,255,255,0.1)' }}>
        
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
            <img src="/assets/vehiclerentx_logo.png" alt="VehicleRentX Logo" className="mb-2" style={{ height: '60px', objectFit: 'contain' }} />
          </Link>
          <h4 className="fw-extrabold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>Create Your Account</h4>
          <p className="text-muted small mb-0">Campus Mobility Network - User Registration Portal</p>
        </div>

        {error && <div className="alert alert-danger py-3 rounded-3 small fw-bold mb-4"><i className="fa-solid fa-triangle-exclamation me-2"></i>{error}</div>}
        {success && <div className="alert alert-success py-3 rounded-3 small fw-bold mb-4"><i className="fa-solid fa-circle-check me-2"></i>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            
            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted">FULL NAME</label>
              <input type="text" name="fullName" required className="form-control p-3 bg-light border-0 rounded-3" placeholder="Enter your full name" value={formData.fullName} onChange={handleInputChange} />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted">USERNAME (Unique ID)</label>
              <input type="text" name="username" required className="form-control p-3 bg-light border-0 rounded-3" placeholder="Choose a unique username" value={formData.username} onChange={handleInputChange} />
            </div>

            <div className="col-md-8 position-relative" ref={dropdownRef}>
              <label className="form-label small fw-bold text-muted">SEARCH INSTITUTE</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0"><i className="fa-solid fa-magnifying-glass text-muted"></i></span>
                <input type="text" className="form-control p-3 bg-light border-0 rounded-end-3" placeholder="Type to search university, institute or college..." value={searchTerm} onFocus={() => setShowDropdown(true)} onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }} />
              </div>
              {showDropdown && (
                <div className="position-absolute w-100 bg-white shadow-lg rounded-3 mt-1 overflow-hidden" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto', border: '1px solid #E2E8F0' }}>
                  {filteredInstitutions.map(inst => (
                    <div key={inst.code} className="p-3 cursor-pointer hover-bg-light border-bottom small text-dark d-flex justify-content-between align-items-center" onClick={() => selectInstitution(inst)} style={{ cursor: 'pointer' }}>
                      <strong>{inst.name} ({inst.code})</strong>
                      <span className="badge bg-secondary">{inst.type}</span>
                    </div>
                  ))}
                  {filteredInstitutions.length === 0 && (
                    <div className="p-3 text-muted small text-center">No matching campus found. You can proceed with general registration.</div>
                  )}
                </div>
              )}
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-bold text-muted">INSTITUTE TYPE</label>
              <input type="text" readOnly className="form-control p-3 bg-light border-0 rounded-3 fw-bold text-secondary" placeholder="Auto" value={selectedInst ? selectedInst.type : ''} />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted">EMAIL ADDRESS</label>
              <input type="email" name="email" required className="form-control p-3 bg-light border-0 rounded-3" placeholder="Enter your email address" value={formData.email} onChange={handleInputChange} />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted">MOBILE NUMBER (+91)</label>
              <div className="input-group">
                <input type="tel" name="phone" required readOnly={mobileVerified} className={`form-control p-3 bg-light border-0 ${mobileVerified ? 'border border-success text-success fw-bold' : ''}`} placeholder="+919876543210" value={formData.phone} onChange={handleInputChange} />
                
                {!mobileVerified ? (
                  <button type="button" className="btn btn-dark px-3 rounded-end-3" onClick={sendMobileOtp} disabled={otpLoading || !formData.phone}>
                    {otpLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Verify Mobile'}
                  </button>
                ) : (
                  <span className="input-group-text bg-success bg-opacity-10 text-success border-0 px-3"><i className="fa-solid fa-circle-check"></i></span>
                )}
              </div>
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-bold text-muted">COURSE / PROGRAM</label>
              <input type="text" name="course" required className="form-control p-3 bg-light border-0 rounded-3" placeholder="e.g. B.Tech, BCA, MCA" value={formData.course} onChange={handleInputChange} />
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-bold text-muted">DEPARTMENT</label>
              <input type="text" name="department" required className="form-control p-3 bg-light border-0 rounded-3" placeholder="e.g. Computer Science" value={formData.department} onChange={handleInputChange} />
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-bold text-muted">YEAR / SEMESTER</label>
              <input type="text" name="yearOrSemester" required className="form-control p-3 bg-light border-0 rounded-3" placeholder="e.g. Year 2 / Semester 4" value={formData.yearOrSemester} onChange={handleInputChange} />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted">ENROLLMENT / ROLL NO</label>
              <input type="text" name="enrollmentNumber" required className="form-control p-3 bg-light border-0 rounded-3" placeholder="Enter enrollment or roll number" value={formData.enrollmentNumber} onChange={handleInputChange} />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted">ROLE</label>
              <select name="role" className="form-select p-3 bg-light border-0 rounded-3" value={formData.role} onChange={handleInputChange}>
                <option value="student">Student</option>
                <option value="faculty">Faculty Member</option>
                <option value="research_scholar">Research Scholar</option>
                <option value="non_teaching">Non-Teaching Staff</option>
                <option value="vehicle_owner">Vehicle Owner / Partner</option>
              </select>
            </div>

            <div className="col-md-6 position-relative">
              <label className="form-label small fw-bold text-muted">PASSWORD</label>
              <div className="input-group">
                <input type={showPassword ? "text" : "password"} name="password" required className="form-control p-3 bg-light border-0 rounded-start-3" placeholder="Create a password" value={formData.password} onChange={handleInputChange} />
                <button type="button" className="btn btn-light bg-light border-0 px-3" onClick={() => setShowPassword(!showPassword)}>
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                </button>
              </div>
              
              {formData.password && (
                <div className="mt-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small text-muted" style={{ fontSize: '11px' }}>Password Strength:</span>
                    <strong className="small" style={{ color: pwdStrength.color, fontSize: '11px' }}>{pwdStrength.label}</strong>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div className="progress-bar" style={{ width: `${(pwdStrength.score / 5) * 100}%`, backgroundColor: pwdStrength.color }}></div>
                  </div>
                  <ul className="text-muted list-unstyled mt-2 small" style={{ fontSize: '10px', lineHeight: '14px' }}>
                    <li className={pwdStrength.hasMinLen ? "text-success" : ""}>✔ Minimum 8 characters</li>
                    <li className={pwdStrength.hasUpper ? "text-success" : ""}>✔ One uppercase letter</li>
                    <li className={pwdStrength.hasLower ? "text-success" : ""}>✔ One lowercase letter</li>
                    <li className={pwdStrength.hasNumber ? "text-success" : ""}>✔ One number</li>
                    <li className={pwdStrength.hasSpecial ? "text-success" : ""}>✔ One special symbol</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="col-md-6 position-relative">
              <label className="form-label small fw-bold text-muted">CONFIRM PASSWORD</label>
              <div className="input-group">
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" required className="form-control p-3 bg-light border-0 rounded-start-3" placeholder="Re-enter your password" value={formData.confirmPassword} onChange={handleInputChange} />
                <button type="button" className="btn btn-light bg-light border-0 px-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                </button>
              </div>
            </div>

            <div className="col-12 mt-3">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleInputChange} required id="termsAccepted" />
                <label className="form-check-label small text-muted cursor-pointer" htmlFor="termsAccepted">
                  I accept the mandatory <strong>Terms & Conditions</strong> and <strong>Privacy Policy</strong> of the Vehiclerentx Campus Portal.
                </label>
              </div>
            </div>

          </div>

          <button type="submit" className="btn btn-primary-custom w-100 py-3 mt-4 text-white font-bold" disabled={loading} style={{ background: '#10B981', borderColor: '#10B981' }}>
            {loading ? <><i className="fa-solid fa-spinner fa-spin me-2"></i>Creating Profile...</> : 'Registration'}
          </button>
        </form>

        <div className="text-center mt-4 text-muted small">
          Already registered? <Link to="/login" className="fw-bold text-success">Log in</Link>
        </div>

      </div>

      {otpModal && (
        <div className="modal show d-block animate-fade-in" style={{ backgroundColor: 'rgba(15,23,42,0.85)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content rounded-4 border-0 p-4 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark"><i className="fa-solid fa-shield-halved text-success me-2"></i>Mobile Verification</h5>
                <button type="button" className="btn-close" onClick={() => setOtpModal(false)}></button>
              </div>
              <form onSubmit={verifyMobileOtp}>
                <div className="modal-body py-3">
                  <p className="text-muted small">We sent a 6-digit secure code to your phone <strong>{getMaskedPhone()}</strong>. Please check your SMS.</p>
                  
                  {sandboxOtpHint && (
                    <div className="alert alert-warning py-2 rounded-3 small border-0 text-center fw-bold">
                      🔑 Sandbox testing OTP: <code>{sandboxOtpHint}</code>
                    </div>
                  )}

                  {otpError && <div className="alert alert-danger py-2 rounded-3 small fw-bold mb-3">{otpError}</div>}
                  {otpSuccess && <div className="alert alert-success py-2 rounded-3 small fw-bold mb-3">{otpSuccess}</div>}

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">ENTER 6-DIGIT OTP</label>
                    <input type="text" maxLength="6" className="form-control p-3 text-center fs-4 fw-bold bg-light border-0 rounded-3" style={{ letterSpacing: '4px' }} placeholder="000000" value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/\D/g,''))} required />
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small text-muted">Remaining Attempts: <strong>{attemptsRemaining} / 5</strong></span>
                    {resendCooldown > 0 ? (
                      <span className="small text-muted fw-bold">Resend in {resendCooldown}s</span>
                    ) : (
                      <button type="button" className="btn btn-link btn-sm text-success p-0 fw-bold" onClick={sendMobileOtp}>Resend OTP</button>
                    )}
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0 d-flex gap-2">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-3 flex-grow-1" onClick={() => setOtpModal(false)}>Edit Mobile</button>
                  <button type="submit" className="btn btn-success rounded-pill px-4 flex-grow-1 text-white fw-bold" disabled={otpLoading || otpInput.length !== 6}>
                    {otpLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Confirm Verification'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Register;