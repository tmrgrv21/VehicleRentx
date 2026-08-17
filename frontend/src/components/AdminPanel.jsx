import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminPanel = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem('vrx_user') || '{}');

  const [activeTab, setActiveTab] = useState('analytics');

  const [institutions, setInstitutions] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(storedUser.institutionId || 'IGNTU');

  const [stats, setStats] = useState({ totalRevenue: 0, activeRentals: 0, totalUsers: 0, fleetSize: 0 });
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedKycUser, setSelectedKycUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [newNotice, setNewNotice] = useState({ title: '', content: '', type: 'notice' });

  const [newTenant, setNewTenant] = useState({
    code: '',
    name: '',
    type: 'central_university',
    emailDomain: '',
    primaryColor: '#15803D',
    secondaryColor: '#1D4ED8',
    logoUrl: '',
    campusImage: '',
    lat: 28.5398,
    lng: 77.1685,
    radiusMeters: 2000
  });

  const [newVehicle, setNewVehicle] = useState({
    type: 'scooter',
    model: '',
    qrCode: '',
    pricePerHour: '',
    batteryLevel: 100,
    address: 'Academic Block A',
    lat: 22.8025,
    lng: 81.7515,
    featuresString: 'GPS Tracked, Insured, Helmet Included',
    tenant: storedUser.institutionId || 'IGNTU'
  });

  useEffect(() => {
    const allowed = ['admin', 'super_admin', 'university_admin', 'security_officer'];
    if (!storedUser._id || !allowed.includes(storedUser.role)) {
      alert('Access Denied: Administrative privileges required.');
      navigate('/dashboard');
    } else {
      loadTenants();
    }
  }, []);

  useEffect(() => {
    if (storedUser._id) {
      loadAllAdminData();
    }
  }, [selectedTenant, activeTab]);

  const loadTenants = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/institutions');
      setInstitutions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAllAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const tenantParam = selectedTenant ? `?institutionId=${selectedTenant}` : '';
      
      const statsRes = await axios.get(`http://localhost:5000/api/admin/stats${tenantParam}`);
      setStats(statsRes.data);

      const bookingsRes = await axios.get(`http://localhost:5000/api/admin/bookings${tenantParam}`);
      setBookings(bookingsRes.data);

      const usersRes = await axios.get(`http://localhost:5000/api/admin/users${tenantParam}`);
      setUsers(usersRes.data);

      const fleetRes = await axios.get(`http://localhost:5000/api/vehicles${tenantParam}`);
      setFleet(fleetRes.data);

      const financeRes = await axios.get(`http://localhost:5000/api/admin/finance${tenantParam}`);
      setTransactions(financeRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch SaaS records.');
    }
    setLoading(false);
  };

  const handleVerifyKyc = async (userId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/kyc`, { 
        status, 
        rejectedReason: status === 'rejected' ? rejectionReason : '' 
      });
      alert(`User KYC status set to ${status}.`);
      setSelectedKycUser(null);
      setRejectionReason('');
      loadAllAdminData();
    } catch (err) {
      alert('Failed to audit user KYC.');
    }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/role`, { role });
      alert('User role updated successfully.');
      loadAllAdminData();
    } catch (err) {
      alert('Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete user and associated ride records?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
      alert('User removed from system.');
      loadAllAdminData();
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    const payload = {
      institutionId: storedUser.role === 'super_admin' ? newVehicle.tenant : selectedTenant,
      type: newVehicle.type,
      model: newVehicle.model,
      qrCode: newVehicle.qrCode,
      pricePerHour: parseFloat(newVehicle.pricePerHour),
      batteryLevel: parseInt(newVehicle.batteryLevel),
      features: newVehicle.featuresString.split(',').map(f => f.trim()).filter(Boolean),
      currentLocation: {
        address: newVehicle.address,
        lat: parseFloat(newVehicle.lat),
        lng: parseFloat(newVehicle.lng)
      }
    };

    try {
      await axios.post('http://localhost:5000/api/admin/vehicles', payload);
      alert('New vehicle registered.');
      setNewVehicle({
        type: 'scooter',
        model: '',
        qrCode: '',
        pricePerHour: '',
        batteryLevel: 100,
        address: 'Academic Block A',
        lat: 22.8025,
        lng: 81.7515,
        featuresString: 'GPS Tracked, Insured, Helmet Included',
        tenant: selectedTenant
      });
      loadAllAdminData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add vehicle.');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Remove this vehicle?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/vehicles/${vehicleId}`);
      alert('Vehicle removed.');
      loadAllAdminData();
    } catch (err) {
      alert('Failed to delete vehicle.');
    }
  };

  const handleUpdateVehicleStatus = async (vehicleId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/vehicles/${vehicleId}`, { status });
      alert('Status updated.');
      loadAllAdminData();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handlePublishNotice = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/admin/institutions/${selectedTenant}/announcements`, newNotice);
      alert('Campus notice broadcasted successfully!');
      setNewNotice({ title: '', content: '', type: 'notice' });
    } catch (err) {
      alert('Failed to publish notice.');
    }
  };

  const handleAddTenant = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/institutions', newTenant);
      alert('New SaaS university tenant created!');
      setNewTenant({
        code: '',
        name: '',
        type: 'central_university',
        emailDomain: '',
        primaryColor: '#15803D',
        secondaryColor: '#1D4ED8',
        logoUrl: '',
        campusImage: '',
        lat: 28.5398,
        lng: 77.1685,
        radiusMeters: 2000
      });
      loadTenants();
    } catch (err) {
      alert('Failed to register tenant.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Upper Navigation Bar */}
      <div style={{ backgroundColor: '#0F172A', color: 'white', padding: '14px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          
          {/* Brand Logo & Title */}
          <div className="d-flex align-items-center gap-2">
            <i className="fa-solid fa-shield-halved text-success fs-3"></i>
            <div className="d-flex flex-column text-start me-3">
              <span style={{ fontSize: '1.05rem', lineHeight: '1.2', color: 'white', fontWeight: '800' }}>Admin Controls</span>
              <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: '500' }}>SaaS VehicleRentX</span>
            </div>
          </div>

          {/* Upper Nav Menu Items */}
          <div className="d-flex align-items-center gap-2 flex-wrap flex-grow-1 justify-content-center">
            {[
              { id: 'analytics', icon: 'fa-chart-line', label: 'Analytics' },
              { id: 'users', icon: 'fa-users-gear', label: 'Users & KYC' },
              { id: 'fleet', icon: 'fa-motorcycle', label: 'Fleet Control' },
              { id: 'finance', icon: 'fa-file-invoice-dollar', label: 'Financials' },
              { id: 'notices', icon: 'fa-bullhorn', label: 'Announcements' },
              ...(storedUser.role === 'super_admin' ? [{ id: 'tenants', icon: 'fa-university', label: 'Manage Tenants' }] : [])
            ].map(tab => (
              <button 
                key={tab.id}
                className={`btn btn-sm px-3 py-2 rounded-pill d-flex align-items-center gap-2 transition-all fw-semibold ${activeTab === tab.id ? 'btn-success text-white shadow' : 'btn-outline-light border-0 text-white-50'}`}
                onClick={() => setActiveTab(tab.id)}>
                <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
              </button>
            ))}
          </div>

          {/* Action: Return to App */}
          <div>
            <button className="btn btn-sm btn-outline-danger rounded-pill px-3 py-2 d-flex align-items-center gap-2 fw-bold" onClick={() => navigate('/dashboard')}>
              <i className="fa-solid fa-arrow-left"></i> Return to App
            </button>
          </div>

        </div>
      </div>

      <div className="main-content" style={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 70px)', padding: '24px 30px' }}>
        
        <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm flex-wrap gap-3">
          <div>
            <h4 className="fw-bold m-0 text-dark">
              {storedUser.role === 'super_admin' ? 'Super Admin Control Panel' : `Tenant Admin - ${selectedTenant}`}
            </h4>
            <small className="text-muted">Closed-ecosystem campus audit logs & user verification queues</small>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            {storedUser.role === 'super_admin' && (
              <div className="d-flex align-items-center gap-2">
                <span className="small fw-bold text-muted text-nowrap">VIEW TENANT:</span>
                <select 
                  className="form-select form-select-sm p-2 rounded-3 border-1 fw-bold text-primary" 
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}>
                  <option value="SUPER">ALL (Global Platform)</option>
                  {institutions.map(i => (
                    <option key={i.code} value={i.code}>{i.name} ({i.code})</option>
                  ))}
                </select>
              </div>
            )}
            <button className="btn btn-sm btn-outline-dark rounded-circle p-2" onClick={loadAllAdminData} title="Refresh Records">
              <i className="fa-solid fa-rotate"></i>
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger p-3 mb-4 rounded-3 fw-bold">{error}</div>}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Auditing platform databases...</p>
          </div>
        ) : (
          <>
            {activeTab === 'analytics' && (
              <div>
                <div className="row g-4 mb-4">
                  {[
                    { title: 'SaaS Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: 'fa-wallet', color: 'text-success', bg: 'rgba(22, 163, 74, 0.1)' },
                    { title: 'Active Bookings', value: stats.activeRentals, icon: 'fa-route', color: 'text-warning', bg: 'rgba(217, 119, 6, 0.1)' },
                    { title: 'Verified Registrations', value: stats.totalUsers, icon: 'fa-users', color: 'text-primary', bg: 'rgba(29, 78, 216, 0.1)' },
                    { title: 'Fleet Inventory', value: stats.fleetSize, icon: 'fa-motorcycle', color: 'text-info', bg: 'rgba(6, 182, 212, 0.1)' }
                  ].map((stat, i) => (
                    <div className="col-md-3" key={i}>
                      <div className="bg-white p-4 rounded-4 shadow-sm d-flex align-items-center gap-3 border border-light">
                        <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }} className={stat.color}>
                          <i className={`fa-solid ${stat.icon}`}></i>
                        </div>
                        <div>
                          <h6 className="text-muted mb-1 small">{stat.title}</h6>
                          <h3 className="fw-bold m-0 text-dark">{stat.value}</h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-4 rounded-4 shadow-sm border border-light">
                  <h5 className="fw-bold mb-4 text-dark"><i className="fa-solid fa-list-check me-2 text-primary"></i>Active & Recent Bookings</h5>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>User Details</th>
                          <th>Institution</th>
                          <th>Vehicle Model</th>
                          <th>Booking Date</th>
                          <th>Ride Cost</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((b, i) => (
                          <tr key={b._id || i}>
                            <td>
                              <div className="fw-bold">{b.userId?.fullName || 'Deleted User'}</div>
                              <small className="text-muted">{b.userId?.email || 'N/A'}</small>
                            </td>
                            <td><span className="badge bg-light text-dark">{b.institutionId}</span></td>
                            <td>{b.vehicleId?.model || 'Deleted Vehicle'} <span className="badge bg-light text-dark small">{b.vehicleId?.type}</span></td>
                            <td>{new Date(b.startTime || b.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                            <td className="fw-bold text-success">₹{b.totalCost}</td>
                            <td>
                              <span className={`badge px-3 py-2 rounded-pill ${b.status === 'active' ? 'bg-success bg-opacity-10 text-success' : b.status === 'completed' ? 'bg-primary bg-opacity-10 text-primary' : 'bg-danger bg-opacity-10 text-danger'}`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="bg-white p-4 rounded-4 shadow-sm border border-light mb-4">
                  <h5 className="fw-bold mb-3 text-warning"><i className="fa-solid fa-clock-rotate-left me-2"></i>Pending KYC Verification Queue</h5>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>User</th>
                          <th>Campus</th>
                          <th>Role</th>
                          <th>Aadhaar / DL</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.filter(u => u.kyc?.status === 'pending').map(u => (
                          <tr key={u._id}>
                            <td>
                              <div className="fw-bold">{u.fullName}</div>
                              <small className="text-muted">{u.email}</small>
                            </td>
                            <td><span className="badge bg-light text-dark">{u.institutionId}</span></td>
                            <td className="text-uppercase small">{u.role}</td>
                            <td>
                              <div>UID: <code>{u.kyc?.aadhaarNumber}</code></div>
                              <small className="text-muted">DL: {u.kyc?.dlNumber}</small>
                            </td>
                            <td>
                              <button className="btn btn-warning btn-sm fw-bold px-3 py-1 rounded-pill" onClick={() => setSelectedKycUser(u)}>
                                Audit Documents
                              </button>
                            </td>
                          </tr>
                        ))}
                        {users.filter(u => u.kyc?.status === 'pending').length === 0 && (
                          <tr>
                            <td colSpan="5" className="text-center text-muted py-3 small">All KYC documents verified! No pending reviews.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-4 shadow-sm border border-light">
                  <h5 className="fw-bold mb-4 text-dark"><i className="fa-solid fa-users-gear me-2 text-primary"></i>SaaS Campus User Directory</h5>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Email / Phone</th>
                          <th>KYC Verification</th>
                          <th>Wallet Bal</th>
                          <th>Trust Score</th>
                          <th>System Role</th>
                          <th>Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u._id}>
                            <td>
                              <div className="fw-bold">{u.fullName}</div>
                              <small className="text-muted">Enroll: {u.academicDetails?.enrollmentNumber || 'N/A'}</small>
                            </td>
                            <td>
                              <div>{u.email}</div>
                              <small className="text-muted">{u.phone || 'N/A'}</small>
                            </td>
                            <td>
                              <span className={`badge px-2 py-1 rounded ${u.kyc?.status === 'approved' ? 'bg-success bg-opacity-10 text-success' : u.kyc?.status === 'pending' ? 'bg-warning bg-opacity-10 text-warning' : 'bg-danger bg-opacity-10 text-danger'}`}>
                                {u.kyc?.status || 'unverified'}
                              </span>
                            </td>
                            <td className="fw-bold">₹{u.walletBalance}</td>
                            <td className="fw-bold text-info">{u.trustScore}</td>
                            <td>
                              <select className="form-select form-select-sm" value={u.role || 'student'} onChange={(e) => handleUpdateRole(u._id, e.target.value)}>
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                                <option value="research_scholar">Scholar</option>
                                <option value="university_admin">Campus Admin</option>
                                <option value="super_admin">Super Admin</option>
                              </select>
                            </td>
                            <td>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteUser(u._id)} disabled={u.email === storedUser.email}>
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'fleet' && (
              <div className="row g-4">
                <div className="col-lg-4">
                  <div className="bg-white p-4 rounded-4 shadow-sm border border-light">
                    <h5 className="fw-bold mb-3 text-dark"><i className="fa-solid fa-plus text-success me-2"></i>Register New Vehicle</h5>
                    <form onSubmit={handleAddVehicle}>
                      {storedUser.role === 'super_admin' && (
                        <div className="mb-2">
                          <label className="form-label small text-muted fw-bold">ASSIGN TENANT</label>
                          <select className="form-select bg-light border-0 p-2 rounded-3" value={newVehicle.tenant} onChange={e => setNewVehicle({...newVehicle, tenant: e.target.value})}>
                            {institutions.map(i => <option key={i.code} value={i.code}>{i.name}</option>)}
                          </select>
                        </div>
                      )}
                      <div className="mb-2">
                        <label className="form-label small text-muted fw-bold">VEHICLE TYPE</label>
                        <select className="form-select bg-light border-0 p-2 rounded-3" value={newVehicle.type} onChange={e => setNewVehicle({...newVehicle, type: e.target.value})}>
                          <option value="bicycle">Bicycle</option>
                          <option value="ebike">E-Bike</option>
                          <option value="scooter">Electric Scooter</option>
                          <option value="bike">Motorcycle</option>
                          <option value="car-rental">Car Rental</option>
                        </select>
                      </div>
                      <div className="mb-2">
                        <label className="form-label small text-muted fw-bold">MODEL NAME</label>
                        <input type="text" required className="form-control bg-light border-0 p-2 rounded-3" placeholder="Ola S1 Pro" value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small text-muted fw-bold">QR CODE ID</label>
                        <input type="text" required className="form-control bg-light border-0 p-2 rounded-3" placeholder="QR200" value={newVehicle.qrCode} onChange={e => setNewVehicle({...newVehicle, qrCode: e.target.value})} />
                      </div>
                      <div className="row">
                        <div className="col-6 mb-2">
                          <label className="form-label small text-muted fw-bold">PRICE / HR (₹)</label>
                          <input type="number" required className="form-control bg-light border-0 p-2 rounded-3" placeholder="30" value={newVehicle.pricePerHour} onChange={e => setNewVehicle({...newVehicle, pricePerHour: e.target.value})} />
                        </div>
                        <div className="col-6 mb-2">
                          <label className="form-label small text-muted fw-bold">BATTERY LEVEL (%)</label>
                          <input type="number" max="100" className="form-control bg-light border-0 p-2 rounded-3" placeholder="100" value={newVehicle.batteryLevel} onChange={e => setNewVehicle({...newVehicle, batteryLevel: e.target.value})} />
                        </div>
                      </div>
                      <div className="mb-2">
                        <label className="form-label small text-muted fw-bold">STAND ADDRESS</label>
                        <input type="text" required className="form-control bg-light border-0 p-2 rounded-3" placeholder="VC Lodge" value={newVehicle.address} onChange={e => setNewVehicle({...newVehicle, address: e.target.value})} />
                      </div>
                      <div className="row mb-3">
                        <div className="col-6">
                          <label className="form-label small text-muted fw-bold">LATITUDE</label>
                          <input type="number" step="any" required className="form-control bg-light border-0 p-2 rounded-3" value={newVehicle.lat} onChange={e => setNewVehicle({...newVehicle, lat: e.target.value})} />
                        </div>
                        <div className="col-6">
                          <label className="form-label small text-muted fw-bold">LONGITUDE</label>
                          <input type="number" step="any" required className="form-control bg-light border-0 p-2 rounded-3" value={newVehicle.lng} onChange={e => setNewVehicle({...newVehicle, lng: e.target.value})} />
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary w-100 py-2 text-white fw-bold rounded-pill">
                        Register to Campus Fleet
                      </button>
                    </form>
                  </div>
                </div>

                <div className="col-lg-8">
                  <div className="bg-white p-4 rounded-4 shadow-sm border border-light h-100">
                    <h5 className="fw-bold mb-4 text-dark"><i className="fa-solid fa-motorcycle me-2 text-primary"></i>Active Fleet ({fleet.length})</h5>
                    <div className="table-responsive" style={{ maxHeight: '550px', overflowY: 'auto' }}>
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Model</th>
                            <th>Tenant</th>
                            <th>Odometer</th>
                            <th>Rate</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fleet.map((v) => (
                            <tr key={v._id}>
                              <td>
                                <div className="fw-bold">{v.model}</div>
                                <small className="text-muted">{v.currentLocation?.address}</small>
                              </td>
                              <td><span className="badge bg-light text-dark">{v.institutionId}</span></td>
                              <td>{v.odometer || 0} km</td>
                              <td className="fw-bold">₹{v.pricePerHour}/hr</td>
                              <td>
                                <select className="form-select form-select-sm fw-bold" value={v.status} onChange={(e) => handleUpdateVehicleStatus(v._id, e.target.value)}>
                                  <option value="available">Available</option>
                                  <option value="booked">Booked</option>
                                  <option value="maintenance">Maintenance</option>
                                  <option value="inactive">Inactive</option>
                                </select>
                              </td>
                              <td>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteVehicle(v._id)}>
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'finance' && (
              <div className="bg-white p-4 rounded-4 shadow-sm border border-light">
                <h5 className="fw-bold mb-4 text-dark"><i className="fa-solid fa-receipt me-2 text-primary"></i>Financial Transactions Log</h5>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>User</th>
                        <th>Tenant</th>
                        <th>Transaction Description</th>
                        <th>Method</th>
                        <th>Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx, i) => (
                        <tr key={tx._id || i}>
                          <td>
                            <div className="fw-bold">{tx.userId?.fullName || 'Seed User'}</div>
                            <small className="text-muted">{tx.userId?.email || 'N/A'}</small>
                          </td>
                          <td><span className="badge bg-light text-dark">{tx.institutionId}</span></td>
                          <td>
                            <div className="fw-bold">{tx.description}</div>
                            <small className="text-muted text-uppercase">{tx.type}</small>
                          </td>
                          <td><span className="badge bg-light text-dark">{tx.paymentMethod}</span></td>
                          <td className={`fw-bold ${['topup', 'deposit_refund'].includes(tx.type) ? 'text-success' : 'text-danger'}`}>
                            {['topup', 'deposit_refund'].includes(tx.type) ? '+' : '-'}₹{tx.amount}
                          </td>
                          <td>{new Date(tx.createdAt).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'notices' && (
              <div className="bg-white p-4 rounded-4 shadow-sm border border-light">
                <h5 className="fw-bold mb-3"><i className="fa-solid fa-bullhorn text-primary me-2"></i>Publish Campus Announcement</h5>
                <p className="text-muted small">Notices will immediately appear on the active user dashboards belonging to this university.</p>
                <form onSubmit={handlePublishNotice} style={{ maxWidth: '600px' }}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">TITLE</label>
                    <input type="text" className="form-control p-3 bg-light border-0" required placeholder="e.g. Charging Station Outage near Block B" value={newNotice.title} onChange={e => setNewNotice({...newNotice, title: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">NOTICE TYPE</label>
                    <select className="form-select p-3 bg-light border-0" value={newNotice.type} onChange={e => setNewNotice({...newNotice, type: e.target.value})}>
                      <option value="notice">General Notice</option>
                      <option value="emergency">Emergency Broadcast</option>
                      <option value="maintenance">Maintenance Update</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">CONTENT DESCRIPTION</label>
                    <textarea rows="4" className="form-control p-3 bg-light border-0" required placeholder="Describe the announcement details..." value={newNotice.content} onChange={e => setNewNotice({...newNotice, content: e.target.value})} />
                  </div>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 text-white" style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }}>
                    Publish Announcement
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'tenants' && storedUser.role === 'super_admin' && (
              <div className="row g-4">
                <div className="col-lg-4">
                  <div className="bg-white p-4 rounded-4 shadow-sm border border-light">
                    <h5 className="fw-bold mb-3"><i className="fa-solid fa-plus text-success me-2"></i>Register New University Tenant</h5>
                    <form onSubmit={handleAddTenant}>
                      <div className="mb-2">
                        <label className="form-label small text-muted fw-bold">INSTITUTION CODE</label>
                        <input type="text" required className="form-control bg-light border-0 p-2 rounded-3" placeholder="e.g. DU, JNU, NITT" value={newTenant.code} onChange={e => setNewTenant({...newTenant, code: e.target.value.toUpperCase()})} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small text-muted fw-bold">UNIVERSITY FULL NAME</label>
                        <input type="text" required className="form-control bg-light border-0 p-2 rounded-3" placeholder="University of Delhi" value={newTenant.name} onChange={e => setNewTenant({...newTenant, name: e.target.value})} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small text-muted fw-bold">INSTITUTION TYPE</label>
                        <select className="form-select bg-light border-0 p-2 rounded-3" value={newTenant.type} onChange={e => setNewTenant({...newTenant, type: e.target.value})}>
                          <option value="central_university">Central University</option>
                          <option value="nit">National Institute of Technology (NIT)</option>
                          <option value="iim">Indian Institute of Management (IIM)</option>
                        </select>
                      </div>
                      <div className="mb-2">
                        <label className="form-label small text-muted fw-bold">AUTHORIZED EMAIL DOMAIN</label>
                        <input type="text" required className="form-control bg-light border-0 p-2 rounded-3" placeholder="du.ac.in" value={newTenant.emailDomain} onChange={e => setNewTenant({...newTenant, emailDomain: e.target.value.toLowerCase()})} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small text-muted fw-bold">PRIMARY CSS THEME COLOR</label>
                        <input type="color" className="form-control form-control-color border-0 p-1 w-100" value={newTenant.primaryColor} onChange={e => setNewTenant({...newTenant, primaryColor: e.target.value})} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small text-muted fw-bold">SECONDARY THEME COLOR</label>
                        <input type="color" className="form-control form-control-color border-0 p-1 w-100" value={newTenant.secondaryColor} onChange={e => setNewTenant({...newTenant, secondaryColor: e.target.value})} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small text-muted fw-bold">CAMPUS GEOLOCATION LATITUDE</label>
                        <input type="number" step="any" required className="form-control bg-light border-0 p-2 rounded-3" value={newTenant.lat} onChange={e => setNewTenant({...newTenant, lat: parseFloat(e.target.value)})} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label small text-muted fw-bold">CAMPUS GEOLOCATION LONGITUDE</label>
                        <input type="number" step="any" required className="form-control bg-light border-0 p-2 rounded-3" value={newTenant.lng} onChange={e => setNewTenant({...newTenant, lng: parseFloat(e.target.value)})} />
                      </div>
                      <button type="submit" className="btn btn-dark w-100 py-2 rounded-pill">
                        Deploy New SaaS Instance
                      </button>
                    </form>
                  </div>
                </div>

                <div className="col-lg-8">
                  <div className="bg-white p-4 rounded-4 shadow-sm border border-light h-100">
                    <h5 className="fw-bold mb-4 text-dark"><i className="fa-solid fa-university me-2 text-primary"></i>Active SaaS Tenants ({institutions.length})</h5>
                    <div className="table-responsive">
                      <table className="table table-hover align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Domain</th>
                            <th>Branding Colors</th>
                            <th>Geofence</th>
                          </tr>
                        </thead>
                        <tbody>
                          {institutions.map(inst => (
                            <tr key={inst.code}>
                              <td className="fw-bold">{inst.name} ({inst.code})</td>
                              <td className="text-uppercase small">{inst.type ? inst.type.replace('_', ' ') : 'N/A'}</td>
                              <td><code>@{inst.emailDomain}</code></td>
                              <td>
                                <span className="badge p-2 me-1 border" style={{ backgroundColor: inst.branding?.primaryColor }}> </span>
                                <span className="badge p-2 border" style={{ backgroundColor: inst.branding?.secondaryColor }}> </span>
                              </td>
                              <td className="small text-muted">{inst.location?.lat}, {inst.location?.lng} ({inst.location?.radiusMeters}m)</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {selectedKycUser && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content rounded-4 border-0 shadow">
                <div className="modal-header border-0 pb-0">
                  <h5 className="fw-bold modal-title">Audit KYC Documents: {selectedKycUser.fullName}</h5>
                  <button type="button" className="btn-close" onClick={() => setSelectedKycUser(null)}></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <span className="small fw-bold text-muted d-block">AADHAAR NUMBER</span>
                      <strong className="fs-5"><code>{selectedKycUser.kyc?.aadhaarNumber}</code></strong>
                    </div>
                    <div className="col-md-6 mb-3">
                      <span className="small fw-bold text-muted d-block">DRIVING LICENSE NUMBER</span>
                      <strong className="fs-5"><code>{selectedKycUser.kyc?.dlNumber}</code></strong>
                    </div>
                    <div className="col-md-12 mb-3">
                      <span className="small fw-bold text-muted d-block">ACADEMIC PARAMS</span>
                      <div className="bg-light p-3 rounded small">
                        <strong>Dept:</strong> {selectedKycUser.academicDetails?.department || 'N/A'} | 
                        <strong> Course:</strong> {selectedKycUser.academicDetails?.course || 'N/A'} | 
                        <strong> Enrollment:</strong> {selectedKycUser.academicDetails?.enrollmentNumber || 'N/A'}
                      </div>
                    </div>
                    
                    <div className="col-md-4 text-center mb-3">
                      <span className="small fw-bold text-muted d-block">FACIAL SELFIE</span>
                      <img src={selectedKycUser.kyc?.selfieUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(selectedKycUser.fullName)} className="img-thumbnail rounded-3 mt-2" style={{ maxHeight: '150px' }} alt="Selfie" />
                    </div>
                    <div className="col-md-4 text-center mb-3">
                      <span className="small fw-bold text-muted d-block">DRIVING LICENSE CARD</span>
                      <img src={selectedKycUser.kyc?.dlUrl || "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=200"} className="img-thumbnail rounded-3 mt-2" style={{ maxHeight: '150px' }} alt="DL Scan" />
                    </div>
                    <div className="col-md-4 text-center mb-3">
                      <span className="small fw-bold text-muted d-block">STUDENT/EMP ID CARD</span>
                      <img src={selectedKycUser.kyc?.idCardUrl || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200"} className="img-thumbnail rounded-3 mt-2" style={{ maxHeight: '150px' }} alt="ID Card Scan" />
                    </div>

                    <div className="col-12 mt-2">
                      <label className="form-label small fw-bold text-muted">REJECTION REASON (Only required if rejecting)</label>
                      <input type="text" className="form-control p-2 bg-light border-0" placeholder="e.g. DL expiry date is blurred" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-outline-danger rounded-pill px-4" onClick={() => handleVerifyKyc(selectedKycUser._id, 'rejected')} disabled={!rejectionReason}>
                    Reject Documents
                  </button>
                  <button type="button" className="btn btn-success rounded-pill px-4 text-white" onClick={() => handleVerifyKyc(selectedKycUser._id, 'approved')}>
                    Approve KYC
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;