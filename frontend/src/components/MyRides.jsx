import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from './DashboardLayout';

const MyRides = () => {
  const user = JSON.parse(localStorage.getItem('vrx_user') || '{}');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchRides = () => {
    if (!user._id) return;
    setLoading(true);
    axios.get(`http://localhost:5000/api/bookings/${user._id}`)
      .then(res => { setRides(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchRides(); }, []);

  const handleComplete = async (bookingId) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/bookings/${bookingId}/complete`);
      alert(`🏁 Ride completed! Duration: ${res.data.durationMinutes} min, Total Cost: ₹${res.data.totalCost}.`);
      
      const stored = JSON.parse(localStorage.getItem('vrx_user') || '{}');
      if (stored._id) {
        stored.walletBalance = Math.max(0, stored.walletBalance - res.data.totalCost);
        localStorage.setItem('vrx_user', JSON.stringify(stored));
      }
      
      fetchRides();
      window.location.reload();
    } catch (err) { alert('Failed to complete ride'); }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this ride?')) return;
    try {
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}/cancel`);
      fetchRides();
    } catch (err) { alert('Failed to cancel ride'); }
  };

  const filtered = filter === 'all' ? rides : rides.filter(r => r.status === filter);
  const activeCount = rides.filter(r => r.status === 'active').length;
  const completedCount = rides.filter(r => r.status === 'completed').length;

  const getVehicleImage = (v) => {
    if (!v) return '/assets/scooter.png';
    if (v.image) return v.image;
    if (v.type === 'car-rental') return '/assets/car.png';
    if (v.type === 'bike-taxi' || v.type === 'bike') return '/assets/bike.png';
    if (v.type === 'bicycle' || v.type === 'ebike') return '/assets/bicycle.png';
    return '/assets/scooter.png';
  };

  const statusColors = { active: { bg: '#DCFCE7', text: '#16A34A' }, completed: { bg: '#DBEAFE', text: '#2563EB' }, cancelled: { bg: '#FEE2E2', text: '#DC2626' } };

  return (
    <DashboardLayout activeTab="rides">
      <div className="row g-4 mb-4">
        {[
          { label: 'Total Rides', value: rides.length, icon: 'fa-route', color: '#2563EB', bg: 'rgba(37,99,235,0.1)' },
          { label: 'Active Now', value: activeCount, icon: 'fa-play-circle', color: '#16A34A', bg: 'rgba(22,163,74,0.1)' },
          { label: 'Completed', value: completedCount, icon: 'fa-check-circle', color: '#06B6D4', bg: 'rgba(6,182,212,0.1)' },
        ].map((stat, i) => (
          <div className="col-md-4" key={i}>
            <div className="bg-white p-4 rounded-4 shadow-sm d-flex align-items-center gap-3">
              <div style={{ width: '55px', height: '55px', borderRadius: '14px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                <i className={`fa-solid ${stat.icon}`}></i>
              </div>
              <div>
                <h6 className="text-muted mb-1 small">{stat.label}</h6>
                <h3 className="fw-bold m-0">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex gap-2 mb-4">
        {['all', 'active', 'completed', 'cancelled'].map(f => (
          <button key={f} className={`btn rounded-pill fw-bold px-4 ${filter === f ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'all' ? `(${rides.length})` : `(${rides.filter(r => f === 'all' || r.status === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center p-5"><div className="spinner-border text-primary" role="status"></div><p className="mt-3 text-muted">Loading rides...</p></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-4 shadow-sm p-5 text-center">
          <i className="fa-solid fa-motorcycle fs-1 text-muted mb-3" style={{ opacity: 0.3 }}></i>
          <h5 className="text-muted">No rides found</h5>
          <p className="text-muted small">Your ride history will appear here once you book a vehicle.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtered.map((ride, i) => {
            const v = ride.vehicleId;
            const sc = statusColors[ride.status] || statusColors.completed;
            return (
              <div key={ride._id || i} className="bg-white rounded-4 shadow-sm p-4" style={{ transition: 'transform 0.2s', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="d-flex align-items-center gap-4">
                  <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={getVehicleImage(v)} alt={v?.model || 'Vehicle'} style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="fw-bold mb-1">{v?.model || 'Unknown Vehicle'}</h5>
                        <div className="d-flex gap-2 flex-wrap mb-2">
                          <span className="badge rounded-pill" style={{ background: sc.bg, color: sc.text }}>
                            <i className={`fa-solid ${ride.status === 'active' ? 'fa-circle fa-beat-fade' : ride.status === 'completed' ? 'fa-check' : 'fa-xmark'} me-1`} style={{ fontSize: '8px' }}></i>
                            {ride.status}
                          </span>
                          {v?.type && <span className="badge bg-light text-dark rounded-pill"><i className="fa-solid fa-tag me-1"></i>{v.type}</span>}
                          {ride.inspection?.checkInOdometer !== undefined && (
                            <span className="badge bg-light text-secondary rounded-pill">
                              <i className="fa-solid fa-gauge me-1"></i>
                              {ride.inspection.checkInOdometer} - {ride.inspection.checkOutOdometer || 'Active'} km
                            </span>
                          )}
                        </div>
                      </div>
                      {ride.totalCost > 0 && <h4 className="fw-bold text-primary m-0">₹{ride.totalCost}</h4>}
                    </div>
                    <div className="d-flex gap-4 text-muted small">
                      <span><i className="fa-regular fa-clock me-1"></i>{new Date(ride.startTime || ride.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      {ride.durationMinutes > 0 && <span><i className="fa-solid fa-hourglass-half me-1"></i>{ride.durationMinutes} min</span>}
                      {v?.currentLocation?.address && <span><i className="fa-solid fa-location-dot me-1"></i>{v.currentLocation.address}</span>}
                    </div>
                  </div>
                  {ride.status === 'active' && (
                    <div className="d-flex flex-column gap-2" style={{ flexShrink: 0 }}>
                      <button className="btn btn-success rounded-pill px-3 py-2" onClick={() => handleComplete(ride._id)}>
                        <i className="fa-solid fa-flag-checkered me-1"></i>End Ride
                      </button>
                      <button className="btn btn-outline-danger rounded-pill px-3 py-2" onClick={() => handleCancel(ride._id)}>
                        <i className="fa-solid fa-xmark me-1"></i>Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyRides;