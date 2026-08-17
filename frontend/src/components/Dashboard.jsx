import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from './DashboardLayout';
import CampusBookingModal from './CampusBookingModal';

const Dashboard = () => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [category, setCategory] = useState('all');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeRide, setActiveRide] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [profileData, setProfileData] = useState(null);
  
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [startOdometer, setStartOdometer] = useState(0);
  const [inspectionPhotos, setInspectionPhotos] = useState(['/assets/bicycle.png']);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const user = JSON.parse(localStorage.getItem('vrx_user') || '{}');

  const fetchProfileAndActiveRide = () => {
    if (!user._id) return;
    axios.get(`http://localhost:5000/api/profile/${user._id}`)
      .then(res => {
        setProfileData(res.data);
        const updatedUser = { ...user, ...res.data.user };
        localStorage.setItem('vrx_user', JSON.stringify(updatedUser));
      })
      .catch(err => console.error(err));

    axios.get(`http://localhost:5000/api/bookings/${user._id}`)
      .then(res => {
        const active = res.data.find(b => b.status === 'active');
        setActiveRide(active || null);
      }).catch(err => console.error(err));
  };

  const [stands, setStands] = useState([]);

  useEffect(() => {
    if (!user.institutionId) return;
    axios.get(`http://localhost:5000/api/vehicles?institutionId=${user.institutionId}`)
      .then(res => setVehicles(res.data))
      .catch(err => console.error('Error fetching vehicles:', err));

    axios.get(`http://localhost:5000/api/stands?institutionId=${user.institutionId}`)
      .then(res => setStands(res.data))
      .catch(err => console.error('Error fetching stands:', err));
    
    fetchProfileAndActiveRide();
  }, []);

  useEffect(() => {
    let timer;
    if (activeRide) {
      const start = new Date(activeRide.startTime || activeRide.createdAt);
      setElapsedSeconds(Math.floor((new Date() - start) / 1000));
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeRide]);

  useEffect(() => {
    window.handleMapBook = (vehicleId) => {
      const target = vehicles.find(v => v._id === vehicleId);
      if (target) {
        initiateBook(target);
      }
    };
    return () => {
      delete window.handleMapBook;
    };
  }, [vehicles]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    if (typeof window.L === 'undefined') return;

    const centerLat = profileData?.institution?.location?.lat || 22.8025;
    const centerLng = profileData?.institution?.location?.lng || 81.7515;

    const map = window.L.map(mapRef.current, { zoomControl: false }).setView([centerLat, centerLng], 15);
    window.L.control.zoom({ position: 'bottomright' }).addTo(map);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);
    mapInstanceRef.current = map;

    const radius = profileData?.institution?.location?.radiusMeters || 2000;
    window.L.circle([centerLat, centerLng], {
      radius: radius,
      color: '#1E3A8A',
      fillColor: '#1E3A8A',
      fillOpacity: 0.05,
      weight: 1
    }).addTo(map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        window.L.circle([pos.coords.latitude, pos.coords.longitude], { radius: 30, color: '#15803D', fillColor: '#15803D', fillOpacity: 0.3 }).addTo(map);
        window.L.marker([pos.coords.latitude, pos.coords.longitude], {
          icon: window.L.divIcon({ className: 'user-marker', html: '<div style="width:16px;height:16px;background:#15803D;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(21,128,61,0.5)"></div>', iconSize: [16, 16], iconAnchor: [8, 8] })
        }).addTo(map).bindPopup('<b>You are here</b>');
      }, () => {}, { enableHighAccuracy: true });
    }

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, [profileData]);

  useEffect(() => {
    if (!mapInstanceRef.current || typeof window.L === 'undefined') return;
    const map = mapInstanceRef.current;
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const filtered = category === 'all' ? vehicles : vehicles.filter(v => {
      if (category === 'campus') return ['ebike', 'scooter', 'bicycle'].includes(v.type);
      if (category === 'bike') return ['bike', 'bike-taxi'].includes(v.type);
      if (category === 'car') return v.type === 'car-rental';
      return true;
    });

    filtered.forEach(v => {
      if (!v.currentLocation?.lat || !v.currentLocation?.lng) return;
      const iconColors = { 'car-rental': '#EF4444', 'bike-taxi': '#D97706', 'bike': '#D97706', 'scooter': '#1D4ED8', 'ebike': '#15803D', 'bicycle': '#06B6D4' };
      const iconSymbols = { 'car-rental': '🚗', 'bike-taxi': '🏍️', 'bike': '🏍️', 'scooter': '🛵', 'ebike': '🚲', 'bicycle': '🚲' };
      const color = iconColors[v.type] || '#15803D';
      
      const bookButton = v.status === 'available' 
        ? `<button onclick="window.handleMapBook('${v._id}')" class="btn btn-primary btn-sm w-100 mt-2 text-white border-0 rounded-pill py-1 fw-bold" style="background:var(--primary)">Book Now</button>`
        : `<button disabled class="btn btn-secondary btn-sm w-100 mt-2 border-0 rounded-pill py-1 fw-bold" style="cursor:not-allowed">Booked</button>`;

      const marker = window.L.marker([v.currentLocation.lat, v.currentLocation.lng], {
        icon: window.L.divIcon({
          className: 'vehicle-marker',
          html: `<div style="background:${color};color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 10px ${color}80;border:2px solid white;cursor:pointer;transition:transform 0.2s" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'">${iconSymbols[v.type] || '🛵'}</div>`,
          iconSize: [36, 36], iconAnchor: [18, 18]
        })
      }).addTo(map);

      marker.bindPopup(`<div style="font-family:Inter,sans-serif;min-width:180px"><b style="font-size:14px">${v.model}</b><br/><span style="color:#666;font-size:12px"><i class="fa-solid fa-location-dot" style="color:#EF4444"></i> ${v.currentLocation.address}</span><br/><span style="color:var(--primary);font-weight:700;font-size:16px">₹${v.pricePerHour}/hr</span><br/><div class="d-flex justify-content-between align-items-center mt-1"><span style="background:${v.status === 'available' ? '#DCFCE7' : '#FEE2E2'};color:${v.status === 'available' ? '#16A34A' : '#DC2626'};padding:2px 8px;border-radius:10px;font-size:11px">${v.status}</span></div>${bookButton}</div>`);
      markersRef.current.push(marker);
    });
  }, [vehicles, category, profileData]);

  const getVehicleImage = (v) => {
    if (v.image) return v.image;
    if (v.type === 'car-rental') return '/assets/car.png';
    if (v.type === 'bike-taxi' || v.type === 'bike') return '/assets/bike.png';
    if (v.type === 'bicycle' || v.type === 'ebike') return '/assets/bicycle.png';
    return '/assets/scooter.png';
  };

  const filteredVehicles = category === 'all' ? vehicles : vehicles.filter(v => {
    if (category === 'campus') return ['ebike', 'scooter', 'bicycle'].includes(v.type);
    if (category === 'bike') return ['bike', 'bike-taxi'].includes(v.type);
    if (category === 'car') return v.type === 'car-rental';
    return true;
  });

  const initiateBook = (vehicle) => {
    if (!user._id) return alert('Please log in first');
    
    if (profileData?.user?.kyc?.status !== 'approved') {
      alert(`⚠️ KYC Required: Your current verification status is "${profileData?.user?.kyc?.status || 'unverified'}". Please go to your Profile page and submit your DL/Aadhaar details to gain booking permissions.`);
      return;
    }

    setSelectedVehicle(vehicle);
    setStartOdometer(vehicle.odometer || 0);
    setShowCheckInModal(true);
  };

  const handleConfirmBook = async () => {
    if (!selectedVehicle) return;
    setBookingLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/bookings', { 
        userId: user._id, 
        vehicleId: selectedVehicle._id,
        checkInOdometer: startOdometer,
        imagesBefore: inspectionPhotos
      });
      
      setVehicles(prev => prev.map(v => v._id === selectedVehicle._id ? { ...v, status: 'booked' } : v));
      setActiveRide(res.data);
      setShowCheckInModal(false);
      alert(`🎉 Ride booked! ${res.data.vehicleId?.model || 'Vehicle'} has been unlocked. Please verify battery level and helmets before starting.`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to initiate booking. Check wallet balance.');
    }
    setBookingLoading(false);
  };

  const handleEndRide = async () => {
    if (!activeRide) return;
    if (!window.confirm('Are you sure you want to end this trip?')) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/bookings/${activeRide._id}/complete`, {
        checkOutOdometer: startOdometer + Math.round(elapsedSeconds * 0.15), 
        imagesAfter: ['/assets/bicycle.png']
      });
      
      alert(`🏁 Ride completed successfully!\nDuration: ${res.data.durationMinutes} minutes.\nCharges: ₹${res.data.totalCost}.\nSecurity Deposit returned.`);
      setActiveRide(null);
      
      const vRes = await axios.get(`http://localhost:5000/api/vehicles?institutionId=${user.institutionId}`);
      setVehicles(vRes.data);
      
      fetchProfileAndActiveRide();
      window.location.reload();
    } catch (err) {
      alert('Failed to end ride');
    }
  };

  const categories = [
    { id: 'all', emoji: '🌍', label: 'All Vehicles' },
    { id: 'campus', emoji: '⚡', label: 'Campus Rides' },
    { id: 'bike', emoji: '🏍️', label: 'Bike Taxi' },
    { id: 'car', emoji: '🚗', label: 'Cars' },
  ];

  return (
    <DashboardLayout activeTab="overview">
      {activeRide && (
        <div className="floating-hud p-4 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3" style={{ background: 'var(--primary, #15803D)' }}>
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              🛵
            </div>
            <div>
              <h5 className="fw-bold m-0 text-white">Active Ride: {activeRide.vehicleId?.model || 'Vehicle'}</h5>
              <div className="d-flex gap-3 text-white-50 small mt-1 flex-wrap">
                <span><i className="fa-solid fa-clock me-1 text-warning"></i>Started: {new Date(activeRide.startTime || activeRide.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <span><i className="fa-solid fa-location-dot me-1 text-danger"></i>Odometer Start: {activeRide.inspection?.checkInOdometer || 0} km</span>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-4 flex-wrap">
            <div className="text-end">
              <span className="text-white-50 small d-block" style={{ fontSize: '10px', letterSpacing: '1px' }}>TIME ELAPSED</span>
              <span className="fw-bold fs-5 text-warning">{Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s</span>
            </div>
            <div className="text-end">
              <span className="text-white-50 small d-block" style={{ fontSize: '10px', letterSpacing: '1px' }}>ACCUMULATING COST</span>
              <span className="fw-bold fs-5 text-success">₹{Math.max(10, Math.round(elapsedSeconds * ((activeRide.vehicleId?.pricePerHour || 30) / 3600) * 10) / 10)}</span>
            </div>
            <button className="btn btn-danger rounded-pill px-4 py-2 fw-bold shadow-sm" onClick={handleEndRide}>
              <i className="fa-solid fa-flag-checkered me-2"></i>End Ride
            </button>
          </div>
        </div>
      )}

      {profileData?.user?.kyc?.status !== 'approved' && (
        <div className="alert alert-warning rounded-4 shadow-sm mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h6 className="fw-bold mb-1"><i className="fa-solid fa-triangle-exclamation me-2"></i>KYC Profile Pending Validation</h6>
            <p className="m-0 small text-muted">You cannot unlock campus motorized vehicles until university administration approves your driving license & official records.</p>
          </div>
          <Link to="/dashboard/profile" className="btn btn-warning btn-sm fw-bold px-3 py-2 rounded-pill">Submit KYC Now</Link>
        </div>
      )}

      {profileData?.institution?.announcements?.length > 0 && (
        <div className="bg-white p-3 rounded-4 shadow-sm mb-4 border-start border-primary border-4">
          <h6 className="fw-bold text-primary mb-2"><i className="fa-solid fa-bullhorn me-2"></i>Campus Notices & Notices</h6>
          {profileData.institution.announcements.slice(-2).map((a, idx) => (
            <div key={idx} className="small mb-1 border-bottom pb-1 last-mb-0">
              <span className="badge bg-danger me-2" style={{ fontSize: '9px' }}>{a.type.toUpperCase()}</span>
              <strong>{a.title}</strong>: {a.content}
            </div>
          ))}
        </div>
      )}

      {/* Multi-Model Booking Engine Hero Cards */}
      <div className="row g-3 mb-4">
        
        {/* Card 1: Rent by Time */}
        <div className="col-12 col-md-6">
          <div className="p-4 rounded-4 shadow-sm h-100 bg-white border border-primary border-opacity-25 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="badge bg-primary bg-opacity-10 text-primary fw-bold px-3 py-2">SELF-DRIVE</span>
                <i className="fa-solid fa-clock-rotate-left fs-3 text-primary"></i>
              </div>
              <h5 className="fw-black mb-1">Rent by Time</h5>
              <p className="small text-muted mb-3">Pay by hours or days. Unlimited travel within campus geofence.</p>
              <ul className="list-unstyled small text-muted mb-4">
                <li className="mb-1"><i className="fa-solid fa-check text-success me-2"></i>Flexible 30m / 1h / 24h rates</li>
                <li className="mb-1"><i className="fa-solid fa-check text-success me-2"></i>Ideal for multi-station campus stops</li>
              </ul>
            </div>
            <button className="btn btn-primary rounded-pill w-100 fw-bold shadow-sm" onClick={() => setShowBookingModal(true)}>
              Start Time-Based Rental <i className="fa-solid fa-arrow-right ms-2"></i>
            </button>
          </div>
        </div>

        {/* Card 2: Place-to-Place Ride */}
        <div className="col-12 col-md-6">
          <div className="p-4 rounded-4 shadow-sm h-100 bg-white border border-info border-opacity-25 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="badge bg-info bg-opacity-10 text-info fw-bold px-3 py-2">DESTINATION</span>
                <i className="fa-solid fa-route fs-3 text-info"></i>
              </div>
              <h5 className="fw-black mb-1">Ride Between Locations</h5>
              <p className="small text-muted mb-3">Pay by distance & duration. Upfront fare estimation before ride.</p>
              <ul className="list-unstyled small text-muted mb-4">
                <li className="mb-1"><i className="fa-solid fa-check text-success me-2"></i>Base fare + ₹4/km + ₹1/min</li>
                <li className="mb-1"><i className="fa-solid fa-check text-success me-2"></i>Approved pickup & drop stations</li>
              </ul>
            </div>
            <button className="btn btn-info text-white rounded-pill w-100 fw-bold shadow-sm" onClick={() => setShowBookingModal(true)}>
              Book Destination Ride <i className="fa-solid fa-arrow-right ms-2"></i>
            </button>
          </div>
        </div>

      </div>

      <div className="rounded-4 overflow-hidden shadow-sm mb-4" style={{ position: 'relative' }}>
        <div ref={mapRef} style={{ height: '400px', width: '100%', zIndex: 1 }}></div>
        <div style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 1000, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '10px 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div className="d-flex align-items-center gap-2">
            <div style={{ width: '10px', height: '10px', background: '#10B981', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
            <span className="fw-bold small">{vehicles.filter(v => v.status === 'available').length} vehicles ready on campus</span>
          </div>
        </div>
      </div>

      <div className="d-flex gap-3 mb-4 flex-wrap">
        {categories.map(cat => (
          <button key={cat.id}
            className={`btn rounded-pill fw-bold px-4 py-2 d-flex align-items-center gap-2 ${category === cat.id ? 'btn-dark shadow' : 'btn-white bg-white shadow-sm'}`}
            onClick={() => setCategory(cat.id)}
            style={{ transition: 'all 0.3s', border: category === cat.id ? 'none' : '1px solid #E2E8F0' }}>
            <span>{cat.emoji}</span> {cat.label}
          </button>
        ))}
      </div>

      <h4 className="fw-bold mb-4">Available Near You <span className="badge bg-primary bg-opacity-10 text-primary ms-2">{filteredVehicles.filter(v => v.status === 'available').length}</span></h4>

      <div className="row g-4">
        {filteredVehicles.map((v, i) => {
          const isVerified = profileData?.user?.kyc?.status === 'approved';
          const buttonDisabled = v.status !== 'available' || bookingLoading || !!activeRide;
          return (
            <div className="col-md-4 col-lg-3" key={v._id || i}>
              <div className="bg-white rounded-4 overflow-hidden shadow-sm border border-light h-100 d-flex flex-column"
                style={{ transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ height: '160px', background: 'linear-gradient(135deg, #F8FAFC, #E2E8F0)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                  <img src={getVehicleImage(v)} alt={v.model} style={{ maxHeight: '130px', maxWidth: '90%', objectFit: 'contain', transition: 'transform 0.3s' }} />
                  <span className="position-absolute top-0 end-0 m-2 badge rounded-pill" style={{ background: v.status === 'available' ? '#DCFCE7' : '#FEE2E2', color: v.status === 'available' ? '#16A34A' : '#DC2626', fontSize: '11px' }}>
                    {v.status === 'available' ? '● Available' : '● ' + v.status}
                  </span>
                </div>
                <div className="p-3 flex-grow-1 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold m-0" style={{ fontSize: '0.95rem' }}>{v.model}</h6>
                    <span className="text-primary fw-bold" style={{ color: 'var(--primary)' }}>₹{v.pricePerHour}<small className="text-muted fw-normal">/hr</small></span>
                  </div>
                  <div className="text-muted small mb-2">
                    <i className="fa-solid fa-location-dot text-danger me-1"></i>{v.currentLocation?.address || 'Campus parking zone'}
                  </div>
                  <div className="d-flex gap-1 flex-wrap mb-3">
                    {v.batteryLevel && <span className="badge bg-light text-success" style={{ fontSize: '10px' }}><i className="fa-solid fa-battery-full me-1"></i>{v.batteryLevel}%</span>}
                    <span className="badge bg-light text-secondary" style={{ fontSize: '10px' }}>Deposit: ₹{v.securityDeposit || 500}</span>
                  </div>
                  <button className="btn btn-primary-custom w-100 rounded-pill mt-auto py-2"
                    style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }}
                    disabled={buttonDisabled}
                    onClick={() => initiateBook(v)}>
                    {v.status !== 'available' ? <><i className="fa-solid fa-lock me-2"></i>Booked</> : !!activeRide ? <><i className="fa-solid fa-ban me-2"></i>Ride Active</> : <><i className="fa-solid fa-qrcode me-2"></i>Unlock & Ride</>}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showCheckInModal && selectedVehicle && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold modal-title">Check-in Odometer & Safety Inspection</h5>
                <button type="button" className="btn-close" onClick={() => setShowCheckInModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted small">VehicleRentx enforces safety audits. Please verify the vehicle parameters before unlocking.</p>
                
                <div className="bg-light p-3 rounded-3 mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="small text-muted">Vehicle Model:</span>
                    <strong className="small">{selectedVehicle.model}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="small text-muted">Base Rate:</span>
                    <strong className="small text-primary">₹{selectedVehicle.pricePerHour}/hour</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="small text-muted">Security Deposit Hold:</span>
                    <strong className="small text-danger">
                      ₹{profileData?.user?.trustScore >= 90 ? Math.round((selectedVehicle.securityDeposit || 500) * 0.5) : (selectedVehicle.securityDeposit || 500)} 
                      {profileData?.user?.trustScore >= 90 && <span className="text-success ms-1">(50% Trust Discount Applied!)</span>}
                    </strong>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">VERIFY STARTING ODOMETER READING (KM)</label>
                  <input type="number" className="form-control p-3 bg-light border-0" value={startOdometer} onChange={(e) => setStartOdometer(Number(e.target.value))} />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">MOCK INSPECTION IMAGES (4-SIDES)</label>
                  <div className="d-flex gap-2">
                    <span className="badge bg-success bg-opacity-10 text-success p-2"><i className="fa-solid fa-image me-1"></i>front_view.jpg</span>
                    <span className="badge bg-success bg-opacity-10 text-success p-2"><i className="fa-solid fa-image me-1"></i>side_view.jpg</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowCheckInModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary rounded-pill px-4 text-white" style={{ background: 'var(--primary)' }} onClick={handleConfirmBook} disabled={bookingLoading}>
                  {bookingLoading ? 'Initiating Unlock...' : 'Agree & Unlock Ride'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CampusBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onBookingSuccess={() => fetchProfileAndActiveRide()}
      />
    </DashboardLayout>
  );
};

export default Dashboard;