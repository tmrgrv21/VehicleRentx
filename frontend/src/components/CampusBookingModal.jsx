import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CampusBookingModal = ({ isOpen, onClose, onBookingSuccess }) => {
  const storedUser = JSON.parse(localStorage.getItem('vrx_user') || '{}');

  const [activeTab, setActiveTab] = useState('time'); // time, place
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Form Inputs
  const [pickupLocation, setPickupLocation] = useState('Admin Block Station');
  const [dropLocation, setDropLocation] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);

  // Fare Estimate State
  const [estimate, setEstimate] = useState(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [stations, setStations] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchStands();
      fetchVehicles();
    }
  }, [isOpen]);

  const fetchStands = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/stands?institutionId=${storedUser.institutionId || 'IGNTU'}`);
      setStations(res.data);
      if (res.data.length > 0) {
        setPickupLocation(res.data[0].standName);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEstimate();
    }
  }, [pickupLocation, dropLocation, durationMinutes, activeTab, isOpen]);

  const fetchVehicles = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/vehicles');
      const available = res.data.filter(v => (v.status || 'available') === 'available');
      setVehicles(available);
      if (available.length > 0) setSelectedVehicle(available[0]);
    } catch (err) { console.error(err); }
  };

  const fetchEstimate = async () => {
    setLoadingEstimate(true);
    setErrorMsg('');
    try {
      let requestedType = activeTab === 'time' ? 'TIME_BASED' : activeTab === 'place' ? 'PLACE_TO_PLACE' : null;
      const res = await axios.post('http://localhost:5000/api/bookings/estimate', {
        pickupLocation,
        dropLocation,
        durationMinutes,
        bookingType: requestedType,
        institutionId: storedUser.institutionId || 'IGNTU'
      });
      setEstimate(res.data);
    } catch (err) { console.error(err); }
    setLoadingEstimate(false);
  };

  const handleConfirmBooking = async () => {
    if (!selectedVehicle) return alert('Select an available vehicle first.');
    setBookingInProgress(true);
    setErrorMsg('');

    try {
      let requestedType = activeTab === 'time' ? 'TIME_BASED' : activeTab === 'place' ? 'PLACE_TO_PLACE' : null;
      const res = await axios.post('http://localhost:5000/api/bookings/create', {
        userId: storedUser._id,
        vehicleId: selectedVehicle.id,
        institutionId: storedUser.institutionId || 'IGNTU',
        pickupLocation,
        dropLocation: dropLocation || 'Central Library Hub',
        durationMinutes,
        bookingType: requestedType
      });

      alert(`🎉 Booking Confirmed! Ref: ${res.data.booking.bookingReference}\nVehicle Status: RESERVED. Deducted ₹${res.data.booking.totalCost} from Campus Wallet.`);
      if (onBookingSuccess) onBookingSuccess(res.data);
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Booking failed. Check wallet balance.');
    }
    setBookingInProgress(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
          
          {/* Modal Header */}
          <div className="modal-header bg-primary text-white p-3">
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-bolt fs-4 text-warning"></i>
              <h5 className="modal-title fw-bold m-0">Campus Vehicle Booking Engine</h5>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">

            {/* Mode Selection Tabs */}
            <div className="d-flex gap-2 mb-4 bg-light p-1 rounded-pill">
              <button
                className={`btn btn-sm flex-fill rounded-pill fw-bold ${activeTab === 'time' ? 'btn-primary text-white shadow' : 'btn-light text-muted'}`}
                onClick={() => { setActiveTab('time'); setDropLocation(''); }}>
                ⏱️ Rent by Time (Self-Drive)
              </button>
              <button
                className={`btn btn-sm flex-fill rounded-pill fw-bold ${activeTab === 'place' ? 'btn-primary text-white shadow' : 'btn-light text-muted'}`}
                onClick={() => { setActiveTab('place'); if(!dropLocation && stations.length > 1) setDropLocation(stations[1].standName); }}>
                📍 Ride Between Locations
              </button>
            </div>

            {errorMsg && (
              <div className="alert alert-danger rounded-3 py-2 small fw-bold mb-3">
                <i className="fa-solid fa-circle-exclamation me-2"></i>{errorMsg}
              </div>
            )}

            {/* INPUTS */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">PICKUP STATION</label>
                <select className="form-select fw-bold" value={pickupLocation} onChange={e => setPickupLocation(e.target.value)}>
                  {stations.map(st => (
                    <option key={st.id || st.standName} value={st.standName}>
                      {st.displayOrder ? `${st.displayOrder}. ` : ''}{st.standName} ({st.availableVehicles || 0} bikes)
                    </option>
                  ))}
                </select>
              </div>

              {activeTab === 'place' && (
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">DESTINATION DROP POINT</label>
                  <select className="form-select fw-bold" value={dropLocation} onChange={e => setDropLocation(e.target.value)}>
                    {stations.filter(st => st.standName !== pickupLocation).map(st => (
                      <option key={st.id || st.standName} value={st.standName}>
                        {st.displayOrder ? `${st.displayOrder}. ` : ''}{st.standName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab === 'time' && (
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">RENTAL DURATION</label>
                  <select className="form-select fw-bold" value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))}>
                    <option value={30}>30 Minutes (Quick Ride)</option>
                    <option value={60}>1 Hour (Standard)</option>
                    <option value={120}>2 Hours (Campus Tour)</option>
                    <option value={240}>4 Hours (Half Day)</option>
                    <option value={1440}>24 Hours (Full Day)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Smart Detection Banner */}
            {estimate && (
              <div className="p-3 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-3 mb-3 d-flex align-items-center justify-content-between">
                <div>
                  <span className="badge bg-primary me-2">SMART ENGINE RESOLVED</span>
                  <span className="fw-bold text-primary">
                    {estimate.resolvedBookingType === 'PLACE_TO_PLACE' ? '📍 Destination Ride (Base + Per-Km)' : `⏱️ Time-Based Rental (${estimate.estimatedDurationMins} Mins)`}
                  </span>
                </div>
                <span className="small text-muted fw-bold">Dist: {estimate.estimatedDistanceKm} km</span>
              </div>
            )}

            {/* Vehicle Selection Grid */}
            <label className="form-label small fw-bold text-muted mb-2">SELECT AVAILABLE CAMPUS VEHICLE</label>
            <div className="row g-2 mb-3" style={{ maxHeight: '180px', overflowY: 'auto' }}>
              {vehicles.length === 0 ? (
                <p className="text-muted small">No vehicles available at this station.</p>
              ) : (
                vehicles.map(v => (
                  <div className="col-6 col-md-4" key={v.id}>
                    <div
                      className={`p-2 rounded-3 border cursor-pointer transition-all ${selectedVehicle?.id === v.id ? 'border-primary bg-primary bg-opacity-10 shadow-sm' : 'bg-light'}`}
                      onClick={() => setSelectedVehicle(v)}>
                      <div className="fw-bold small">{v.name || v.model}</div>
                      <div className="d-flex justify-content-between align-items-center mt-1">
                        <span className="badge bg-dark text-white font-monospace">{v.plateNumber}</span>
                        <span className="small text-success fw-bold">🔋 {v.batteryLevel}%</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Fare Breakdown Card */}
            {estimate && (
              <div className="p-3 bg-light rounded-4 border">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                  <span className="small text-muted">Ride Fare</span>
                  <span className="fw-bold">₹{estimate.rideFare}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                  <span className="small text-muted">Security Deposit (Refundable)</span>
                  <span className="fw-bold text-info">₹{estimate.securityDeposit}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                  <span className="small text-muted">GST / Taxes (5%)</span>
                  <span className="fw-bold">₹{estimate.tax}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center pt-1">
                  <span className="fw-bold">Total Wallet Deduction</span>
                  <h4 className="fw-black text-primary m-0">₹{estimate.estimatedTotal}</h4>
                </div>
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="modal-footer bg-light p-3">
            <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>Cancel</button>
            <button
              type="button"
              className="btn btn-primary rounded-pill px-5 fw-bold"
              disabled={bookingInProgress || !selectedVehicle}
              onClick={handleConfirmBooking}>
              {bookingInProgress ? 'Processing...' : `Confirm & Pay ₹${estimate?.estimatedTotal || 0}`}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CampusBookingModal;
