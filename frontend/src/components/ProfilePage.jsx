import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from './DashboardLayout';

const ProfilePage = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('vrx_user') || '{}'));
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState({ totalRides: 0, completedRides: 0 });
  const [institution, setInstitution] = useState(null);
  
  const [form, setForm] = useState({ 
    fullName: '', 
    phone: '', 
    department: '', 
    course: '', 
    yearOrSemester: '', 
    enrollmentNumber: '' 
  });

  const [kycForm, setKycForm] = useState({
    aadhaarNumber: '',
    dlNumber: '',
    aadhaarFront: '',
    aadhaarBack: '',
    dlFront: '',
    dlBack: '',
    selfieUrl: ''
  });

  const [progress, setProgress] = useState({
    aadhaar_front: 0,
    aadhaar_back: 0,
    dl_front: 0,
    dl_back: 0,
    selfie: 0
  });

  const [previews, setPreviews] = useState({
    aadhaar_front: '',
    aadhaar_back: '',
    dl_front: '',
    dl_back: '',
    selfie: ''
  });

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraDocType, setCameraDocType] = useState('');

  const [saving, setSaving] = useState(false);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchProfile = () => {
    if (user._id) {
      axios.get(`http://localhost:5000/api/profile/${user._id}`)
        .then(res => {
          const u = res.data.user;
          setUser(u);
          setStats(res.data.stats);
          setInstitution(res.data.institution);
          
          setForm({ 
            fullName: u.fullName || '', 
            phone: u.phone || '', 
            department: u.academicDetails?.department || '', 
            course: u.academicDetails?.course || '', 
            yearOrSemester: u.academicDetails?.yearOrSemester || '', 
            enrollmentNumber: u.academicDetails?.enrollmentNumber || '' 
          });

          setKycForm({
            aadhaarNumber: u.kyc?.aadhaarNumber || '',
            dlNumber: u.kyc?.dlNumber || '',
            aadhaarFront: u.kyc?.aadhaarFront || '',
            aadhaarBack: u.kyc?.aadhaarBack || '',
            dlFront: u.kyc?.dlFront || '',
            dlBack: u.kyc?.dlBack || '',
            selfieUrl: u.kyc?.selfieUrl || ''
          });

          setPreviews({
            aadhaar_front: u.kyc?.aadhaarFront || '',
            aadhaar_back: u.kyc?.aadhaarBack || '',
            dl_front: u.kyc?.dlFront || '',
            dl_back: u.kyc?.dlBack || '',
            selfie: u.kyc?.selfie || ''
          });

          localStorage.setItem('vrx_user', JSON.stringify(u));
        })
        .catch(console.error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/profile/${user._id}`, form);
      setUser(prev => ({ ...prev, ...res.data }));
      setEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      fetchProfile();
    } catch (err) {
      setMessage('Failed to update profile');
    }
    setSaving(false);
  };

  const handleFileChange = async (e, docType) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      return alert("File size exceeds 10MB limit.");
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return alert("Unsupported file type. Please select a valid JPG, PNG or WEBP image.");
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviews(prev => ({ ...prev, [docType]: objectUrl }));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user._id);
    formData.append('docType', docType);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/kyc/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('vrx_token')}`
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(prev => ({ ...prev, [docType]: percent }));
        }
      });

      setKycForm(prev => {
        const fieldName = docType === 'aadhaar_front' ? 'aadhaarFront' :
                          docType === 'aadhaar_back' ? 'aadhaarBack' :
                          docType === 'dl_front' ? 'dlFront' :
                          docType === 'dl_back' ? 'dlBack' : 'selfieUrl';
        return { ...prev, [fieldName]: res.data.url };
      });

      setMessage(`${docType.replace('_', ' ').toUpperCase()} uploaded successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Document upload failed. Please try again.');
      setPreviews(prev => ({ ...prev, [docType]: '' }));
      setProgress(prev => ({ ...prev, [docType]: 0 }));
    }
  };

  const startCamera = async (docType) => {
    setCameraDocType(docType);
    setCameraActive(true);
    try {
      const constraints = {
        video: {
          facingMode: docType === 'selfie' ? 'user' : 'environment'
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      
      setTimeout(() => {
        const videoElement = document.getElementById('kyc-video-preview');
        if (videoElement) {
          videoElement.srcObject = stream;
        }
      }, 300);
    } catch (err) {
      alert("Camera permission denied. Please choose an image from your gallery instead.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    const video = document.getElementById('kyc-video-preview');
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${cameraDocType}.jpg`, { type: 'image/jpeg' });
        const customEvent = { target: { files: [file] } };
        handleFileChange(customEvent, cameraDocType);
      }
      stopCamera();
    }, 'image/jpeg', 0.95);
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    
    if (!previews.aadhaar_front || !previews.aadhaar_back || !previews.dl_front || !previews.dl_back || !previews.selfie) {
      return alert("Please upload all 5 required documents before submitting verification.");
    }

    setKycSubmitting(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/kyc/submit', {
        userId: user._id,
        ...kycForm
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('vrx_token')}`
        }
      });
      setMessage(res.data.message || 'KYC submitted successfully!');
      setTimeout(() => setMessage(''), 3000);
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.error || 'KYC parameters submission failed. Try again.');
    }
    setKycSubmitting(false);
  };

  const renderUploadCard = (label, docType) => {
    const preview = previews[docType];
    const percent = progress[docType];
    
    return (
      <div className="card border-0 bg-light p-3 rounded-4 mb-3 position-relative text-center d-flex flex-column align-items-center justify-content-center" style={{ border: '2px dashed #CBD5E1', minHeight: '180px' }}>
        {preview ? (
          <div className="position-relative w-100" style={{ maxHeight: '160px', overflow: 'hidden', borderRadius: '12px' }}>
            <img 
              src={preview.startsWith('/api') ? `http://localhost:5000${preview}` : preview} 
              alt={label} 
              style={{ width: '100%', maxHeight: '140px', objectFit: 'contain' }} 
            />
            <div className="position-absolute top-0 end-0 m-2 d-flex gap-2">
              <button 
                type="button" 
                className="btn btn-sm btn-dark rounded-circle d-flex align-items-center justify-content-center" 
                style={{ width: '28px', height: '28px' }}
                onClick={() => document.getElementById(`file-${docType}`).click()} 
                title="Replace File"
              >
                <i className="fa-solid fa-sync" style={{ fontSize: '10px' }}></i>
              </button>
              <button 
                type="button" 
                className="btn btn-sm btn-danger rounded-circle d-flex align-items-center justify-content-center" 
                style={{ width: '28px', height: '28px' }}
                onClick={() => {
                  setPreviews(prev => ({ ...prev, [docType]: '' }));
                  setProgress(prev => ({ ...prev, [docType]: 0 }));
                }} 
                title="Remove File"
              >
                <i className="fa-solid fa-trash" style={{ fontSize: '10px' }}></i>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-2 cursor-pointer w-100" onClick={() => document.getElementById(`file-${docType}`).click()}>
            <i className="fa-solid fa-cloud-arrow-up text-muted fs-3 mb-2"></i>
            <h6 className="fw-bold small text-dark mb-1" style={{ fontSize: '12px' }}>{label}</h6>
            <span className="text-muted d-block" style={{ fontSize: '10px' }}>JPG, PNG, WEBP (Max 10MB)</span>
          </div>
        )}

        <input 
          type="file" 
          id={`file-${docType}`} 
          accept="image/jpeg,image/png,image/webp" 
          style={{ display: 'none' }} 
          onChange={(e) => handleFileChange(e, docType)} 
        />

        <div className="d-flex gap-2 mt-2 w-100 justify-content-center">
          {!preview && (
            <button 
              type="button" 
              className="btn btn-sm btn-outline-dark rounded-pill px-3 py-1" 
              style={{ fontSize: '10px' }} 
              onClick={() => startCamera(docType)}
            >
              <i className="fa-solid fa-camera me-1"></i> Camera Capture
            </button>
          )}
        </div>

        {percent > 0 && percent < 100 && (
          <div className="w-100 mt-2">
            <div className="progress" style={{ height: '4px' }}>
              <div className="progress-bar bg-success" style={{ width: `${percent}%` }}></div>
            </div>
            <span className="text-muted mt-1 d-block" style={{ fontSize: '9px' }}>Uploading: {percent}%</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout activeTab="profile">
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="bg-white rounded-4 shadow-sm overflow-hidden">
            <div style={{ height: '120px', background: 'linear-gradient(135deg, var(--primary, #15803D), var(--secondary, #1D4ED8))' }}></div>
            <div className="text-center" style={{ marginTop: '-50px' }}>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'U')}&background=15803D&color=fff&size=100&bold=true`}
                className="rounded-circle border border-4 border-white shadow"
                width="100"
                height="100"
                alt="Avatar"
              />
              <h4 className="fw-bold mt-3 mb-1">{user.fullName}</h4>
              <p className="text-muted mb-1"><i className="fa-solid fa-envelope me-2"></i>{user.email}</p>
              <div className="d-flex justify-content-center gap-2 mb-3">
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                  <i className="fa-solid fa-shield-halved me-1"></i> {user.role || 'student'}
                </span>
                <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill">
                  {institution?.code || user.institutionId}
                </span>
              </div>
            </div>
            
            <div className="p-4 border-top">
              <div className="d-flex justify-content-around text-center mb-3">
                <div>
                  <h5 className="fw-bold text-primary mb-0">{stats.totalRides}</h5>
                  <small className="text-muted">Total Rides</small>
                </div>
                <div style={{ borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', padding: '0 20px' }}>
                  <h5 className="fw-bold text-success mb-0">{stats.completedRides}</h5>
                  <small className="text-muted">Completed</small>
                </div>
                <div>
                  <h5 className="fw-bold text-info mb-0">₹{user.walletBalance || 0}</h5>
                  <small className="text-muted">Balance</small>
                </div>
              </div>

              <div className="bg-light p-3 rounded-3 mt-2 text-center">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-bold text-muted">Trust Score:</span>
                  <span className={`fw-bold ${user.trustScore >= 90 ? 'text-success' : 'text-warning'}`}>{user.trustScore} / 100</span>
                </div>
                <div className="progress mb-2" style={{ height: '6px' }}>
                  <div className="progress-bar bg-success" style={{ width: `${user.trustScore}%` }}></div>
                </div>
                <span className="text-muted" style={{ fontSize: '10px' }}>
                  {user.trustScore >= 90 
                    ? "🌟 High Trust User! 50% discount on security deposits enabled." 
                    : "Maintain high scores by completing trips on-time to unlock premium access."}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold m-0"><i className="fa-solid fa-pen-to-square me-2 text-primary"></i>Campus Profile Details</h5>
              {!editing ? (
                <button className="btn btn-outline-primary rounded-pill px-4" onClick={() => setEditing(true)}>
                  <i className="fa-solid fa-edit me-2"></i>Edit Profile
                </button>
              ) : (
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-secondary rounded-pill px-3" onClick={() => setEditing(false)}>Cancel</button>
                  <button className="btn btn-primary-custom rounded-pill px-4 animate-pulse" style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }} onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {message && <div className="alert alert-info py-2 small">{message}</div>}

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small">FULL NAME</label>
                {editing ? (
                  <input type="text" className="form-control p-3 bg-light border-0 rounded-3" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
                ) : (
                  <p className="form-control-plaintext fs-6 fw-bold">{user.fullName}</p>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small">CAMPUS REGISTERED DOMAIN</label>
                <p className="form-control-plaintext fs-6 text-muted">{user.email} <i className="fa-solid fa-lock ms-1 small"></i></p>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small">MOBILE PHONE</label>
                {editing ? (
                  <input type="tel" className="form-control p-3 bg-light border-0 rounded-3" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                ) : (
                  <p className="form-control-plaintext fs-6">{user.phone || 'Not provided'}</p>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small">DEPARTMENT</label>
                {editing ? (
                  <input type="text" className="form-control p-3 bg-light border-0 rounded-3" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
                ) : (
                  <p className="form-control-plaintext fs-6">{form.department || 'Not registered'}</p>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small">COURSE / ROLE POSITION</label>
                {editing ? (
                  <input type="text" className="form-control p-3 bg-light border-0 rounded-3" value={form.course} onChange={e => setForm({...form, course: e.target.value})} />
                ) : (
                  <p className="form-control-plaintext fs-6">{form.course || 'Not registered'}</p>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small">YEAR / SEMESTER</label>
                {editing ? (
                  <input type="text" className="form-control p-3 bg-light border-0 rounded-3" value={form.yearOrSemester} onChange={e => setForm({...form, yearOrSemester: e.target.value})} />
                ) : (
                  <p className="form-control-plaintext fs-6">{form.yearOrSemester || 'Not registered'}</p>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small">UNIVERSITY ENROLLMENT ID</label>
                {editing ? (
                  <input type="text" className="form-control p-3 bg-light border-0 rounded-3" value={form.enrollmentNumber} onChange={e => setForm({...form, enrollmentNumber: e.target.value})} />
                ) : (
                  <p className="form-control-plaintext fs-6">{form.enrollmentNumber || 'Not registered'}</p>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold text-muted small">ACCOUNT CREATED</label>
                <p className="form-control-plaintext fs-6 text-muted">{new Date(user.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-4 shadow-sm p-4">
            <h5 className="fw-bold mb-3"><i className="fa-solid fa-address-card me-2 text-primary"></i>SaaS Campus KYC Verification</h5>
            
            {user.kyc?.status === 'approved' ? (
              <div className="alert alert-success rounded-3 d-flex align-items-center gap-3">
                <i className="fa-solid fa-circle-check fs-3"></i>
                <div>
                  <h6 className="fw-bold m-0">KYC Status: Verified</h6>
                  <p className="m-0 small">Your driving privileges are active. You can check out any vehicle across the campus geofence.</p>
                </div>
              </div>
            ) : user.kyc?.status === 'pending' ? (
              <div className="alert alert-info rounded-3 d-flex align-items-center gap-3">
                <i className="fa-solid fa-clock-rotate-left fs-3"></i>
                <div>
                  <h6 className="fw-bold m-0">KYC Status: Under Audit</h6>
                  <p className="m-0 small">Documents submitted. Campus security or administrator will approve your files shortly.</p>
                </div>
              </div>
            ) : (
              <div>
                {user.kyc?.status === 'rejected' && (
                  <div className="alert alert-danger rounded-3 mb-3">
                    <h6 className="fw-bold m-0">KYC Rejected</h6>
                    <p className="m-0 small">Reason: {user.kyc?.rejectedReason || 'Unclear documents. Re-submit details.'}</p>
                  </div>
                )}
                <p className="text-muted small mb-4">Motorized vehicles registration requires submitting your Aadhaar and Driving License credentials. Please complete the form below:</p>
                
                <form onSubmit={handleKycSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-muted small">AADHAAR NUMBER (UIDAI)</label>
                      <input type="text" className="form-control p-3 bg-light border-0 rounded-3" placeholder="12-digit number" value={kycForm.aadhaarNumber} onChange={e => setKycForm({...kycForm, aadhaarNumber: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-muted small">DRIVING LICENSE NUMBER</label>
                      <input type="text" className="form-control p-3 bg-light border-0 rounded-3" placeholder="DL-XXXXXXXXXXXXXXXX" value={kycForm.dlNumber} onChange={e => setKycForm({...kycForm, dlNumber: e.target.value})} required />
                    </div>

                    <div className="col-12 mt-4">
                      <h6 className="fw-bold text-secondary mb-2" style={{ fontSize: '13px' }}>Aadhaar Card Document Photos</h6>
                      <div className="row">
                        <div className="col-md-6">
                          {renderUploadCard("Aadhaar Card Front", "aadhaar_front")}
                        </div>
                        <div className="col-md-6">
                          {renderUploadCard("Aadhaar Card Back", "aadhaar_back")}
                        </div>
                      </div>
                    </div>

                    <div className="col-12 mt-3">
                      <h6 className="fw-bold text-secondary mb-2" style={{ fontSize: '13px' }}>Driving License Document Photos</h6>
                      <div className="row">
                        <div className="col-md-6">
                          {renderUploadCard("Driving License Front", "dl_front")}
                        </div>
                        <div className="col-md-6">
                          {renderUploadCard("Driving License Back", "dl_back")}
                        </div>
                      </div>
                    </div>

                    <div className="col-12 mt-3">
                      <h6 className="fw-bold text-secondary mb-2" style={{ fontSize: '13px' }}>Live Selfie Photo Verification</h6>
                      <div className="row">
                        <div className="col-md-6 mx-auto">
                          {renderUploadCard("User Selfie Photo", "selfie")}
                        </div>
                      </div>
                    </div>

                  </div>
                  <button type="submit" className="btn btn-dark rounded-pill px-5 py-3 mt-4 w-100 fw-bold" disabled={kycSubmitting}>
                    {kycSubmitting ? 'Submitting details...' : 'Submit Verification Files'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {cameraActive && (
        <div className="modal show d-block animate-fade-in" style={{ backgroundColor: 'rgba(15,23,42,0.85)', zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
            <div className="modal-content rounded-4 border-0 p-4 shadow-lg text-center">
              <div className="modal-header border-0 pb-0 justify-content-between">
                <h5 className="modal-title fw-bold text-dark"><i className="fa-solid fa-camera text-primary me-2"></i>Live Document Capture</h5>
                <button type="button" className="btn-close" onClick={stopCamera}></button>
              </div>
              <div className="modal-body py-3">
                <div className="bg-dark rounded-3 overflow-hidden position-relative mb-3" style={{ height: '320px' }}>
                  <video id="kyc-video-preview" autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }}></video>
                </div>
                <p className="text-muted small">Align your {cameraDocType.replace('_', ' ').toUpperCase()} inside the screen frame and click Capture.</p>
              </div>
              <div className="modal-footer border-0 pt-0 d-flex gap-2">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4 flex-grow-1" onClick={stopCamera}>Cancel</button>
                <button type="button" className="btn btn-primary-custom rounded-pill px-4 flex-grow-1 text-white fw-bold" style={{ background: 'var(--primary)' }} onClick={capturePhoto}>
                  Capture Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProfilePage;