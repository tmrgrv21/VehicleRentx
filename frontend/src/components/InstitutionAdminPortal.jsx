import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const InstitutionAdminPortal = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem('vrx_user') || '{}');

  // Multi-Tenant Context (Locked to storedUser.institutionId unless Super Admin)
  const isSuperAdmin = storedUser.role === 'super_admin';
  const initialTenant = isSuperAdmin ? (storedUser.institutionId || 'IGNTU') : (storedUser.institutionId || 'IGNTU');
  const [tenantId, setTenantId] = useState(initialTenant);
  const [tenants, setTenants] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Sidebar Layout Controls
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('vrx_institution_sidebar_collapsed') === 'true';
  });
  const [sidebarSearch, setSidebarSearch] = useState('');

  // Core Campus Data States
  const [kpis, setKpis] = useState({});
  const [students, setStudents] = useState([]);
  const [owners, setOwners] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [liveRides, setLiveRides] = useState([]);
  const [finance, setFinance] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [zones, setZones] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [settings, setSettings] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Admin Profile Self State
  const [myProfile, setMyProfile] = useState({
    fullName: storedUser.fullName || 'Campus Administrator',
    email: storedUser.email || 'admin@igntu.ac.in',
    mobile: storedUser.mobile || '+919876543210',
    password: ''
  });

  // Vehicle Registration Modal & State
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [selectedQrVehicle, setSelectedQrVehicle] = useState(null);
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    plateNumber: '',
    type: 'scooter',
    model: '',
    batteryLevel: 100,
    rangeKm: 85,
    status: 'available'
  });

  // UI Control & Modal States
  const [loading, setLoading] = useState(true);
  const [newStaff, setNewStaff] = useState({ fullName: '', username: '', email: '', password: '', staffRole: 'KYC Officer' });
  const [newZone, setNewZone] = useState({ zoneName: '', zoneType: 'parking_station', capacity: 20, lat: 22.8021, lng: 81.7543 });

  useEffect(() => {
    fetchInstitutions();
    loadAllCampusData();
  }, [tenantId, activeTab]);

  useEffect(() => {
    let timer;
    if (autoRefresh) {
      timer = setInterval(() => {
        loadLiveTelemetry();
      }, 10000);
    }
    return () => clearInterval(timer);
  }, [tenantId, autoRefresh]);

  const toggleSidebar = () => {
    const nextState = !sidebarCollapsed;
    setSidebarCollapsed(nextState);
    localStorage.setItem('vrx_institution_sidebar_collapsed', nextState);
  };

  const fetchInstitutions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/institutions');
      setTenants(res.data);
    } catch (err) { console.error(err); }
  };

  const loadAllCampusData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadLiveTelemetry(),
        fetchStudents(),
        fetchOwners(),
        fetchVehicles(),
        fetchBookings(),
        fetchFinance(),
        fetchTickets(),
        fetchStaff(),
        fetchZones(),
        fetchPricing(),
        fetchMaintenance(),
        fetchEmergencies(),
        fetchSettings(),
        fetchAuditLogs()
      ]);
    } catch (err) { console.error('Error loading campus data:', err); }
    setLoading(false);
  };

  const loadLiveTelemetry = async () => {
    try {
      const [kpiRes, ridesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/institution-admin/kpis?institutionId=${tenantId}`),
        axios.get(`http://localhost:5000/api/institution-admin/live-rides?institutionId=${tenantId}`)
      ]);
      setKpis(kpiRes.data);
      setLiveRides(ridesRes.data);
    } catch (err) { console.error(err); }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/institution-admin/students?institutionId=${tenantId}`);
      setStudents(res.data || []);
    } catch (err) { setStudents([]); }
  };

  const fetchOwners = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/institution-admin/owners?institutionId=${tenantId}`);
      setOwners(res.data || []);
    } catch (err) { setOwners([]); }
  };

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/vehicles?institutionId=${tenantId}`);
      setVehicles(res.data || []);
    } catch (err) { setVehicles([]); }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/bookings');
      const filtered = (res.data || []).filter(b => String(b.institutionId || 'IGNTU').toLowerCase() === String(tenantId).toLowerCase());
      setBookings(filtered);
    } catch (err) { setBookings([]); }
  };

  const fetchFinance = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/finance');
      const filtered = (res.data || []).filter(f => String(f.institutionId || 'IGNTU').toLowerCase() === String(tenantId).toLowerCase());
      setFinance(filtered);
    } catch (err) { setFinance([]); }
  };

  const fetchTickets = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/superadmin/tickets');
      setTickets(res.data || []);
    } catch (err) { setTickets([]); }
  };

  const fetchStaff = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/institution-admin/staff?institutionId=${tenantId}`);
      setStaffList(res.data || []);
    } catch (err) { setStaffList([]); }
  };

  const fetchZones = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/institution-admin/zones?institutionId=${tenantId}`);
      setZones(res.data || []);
    } catch (err) { setZones([]); }
  };

  const fetchPricing = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/institution-admin/pricing?institutionId=${tenantId}`);
      setPricing(res.data || []);
    } catch (err) { setPricing([]); }
  };

  const fetchMaintenance = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/institution-admin/maintenance?institutionId=${tenantId}`);
      setMaintenance(res.data || []);
    } catch (err) { setMaintenance([]); }
  };

  const fetchEmergencies = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/institution-admin/emergency?institutionId=${tenantId}`);
      setEmergencies(res.data || []);
    } catch (err) { setEmergencies([]); }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/institution-admin/settings?institutionId=${tenantId}`);
      setSettings(res.data || []);
    } catch (err) { setSettings([]); }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/institution-admin/audit-logs?institutionId=${tenantId}`);
      setAuditLogs(res.data || []);
    } catch (err) { setAuditLogs([]); }
  };

  // Actions
  const handleRegisterVehicle = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/vehicles', {
        ...newVehicle,
        institutionId: tenantId
      });
      alert('Vehicle registered and listed in campus fleet successfully!');
      setShowVehicleModal(false);
      setNewVehicle({
        name: '',
        plateNumber: '',
        type: 'scooter',
        model: '',
        batteryLevel: 100,
        rangeKm: 85,
        status: 'available'
      });
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to register vehicle.');
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Are you sure you want to remove this vehicle from the campus fleet?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/vehicles/${id}`);
      alert('Vehicle removed successfully.');
      fetchVehicles();
    } catch (err) { alert('Failed to delete vehicle.'); }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/institution-admin/staff?institutionId=${tenantId}`, newStaff);
      alert('Campus Staff account created successfully!');
      setNewStaff({ fullName: '', username: '', email: '', password: '', staffRole: 'KYC Officer' });
      fetchStaff();
    } catch (err) { alert(err.response?.data?.error || 'Failed to create staff account.'); }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campus staff member?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/institution-admin/staff/${id}?institutionId=${tenantId}`);
      alert('Campus staff member deleted successfully.');
      fetchStaff();
    } catch (err) { alert(err.response?.data?.error || 'Failed to delete staff member.'); }
  };

  const handleCreateZone = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/institution-admin/zones?institutionId=${tenantId}`, newZone);
      alert('Campus parking zone created successfully!');
      setNewZone({ zoneName: '', zoneType: 'parking_station', capacity: 20, lat: 22.8021, lng: 81.7543 });
      fetchZones();
    } catch (err) { alert(err.response?.data?.error || 'Failed to create zone.'); }
  };

  const handleResolveSOS = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/institution-admin/emergency/${id}/resolve?institutionId=${tenantId}`);
      alert('Emergency SOS Alert marked as RESOLVED.');
      fetchEmergencies();
    } catch (err) { alert('Failed to resolve SOS.'); }
  };

  const handleSaveOwnProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/institution-admin/profile', {
        userId: storedUser._id || 1,
        fullName: myProfile.fullName,
        mobile: myProfile.mobile,
        password: myProfile.password
      });
      alert('Your administrator profile has been updated successfully.');
      const updatedUser = { ...storedUser, fullName: myProfile.fullName, mobile: myProfile.mobile };
      localStorage.setItem('vrx_user', JSON.stringify(updatedUser));
    } catch (err) { alert('Failed to update profile.'); }
  };

  const exportToCsv = (filename, rows) => {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows.map(row => keys.map(k => `"${(row[k] || '').toString().replace(/"/g, '""')}"`).join(separator)).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Nav Navigation Schema (Grouped Sidebar Structure with My Profile & RBAC Isolation)
  const navGroups = [
    {
      groupTitle: 'Personal Account',
      items: [
        { id: 'profile', icon: 'fa-id-badge', label: 'My Profile', desc: 'Manage your administrator profile & security credentials' }
      ]
    },
    {
      groupTitle: 'Dashboard',
      items: [
        { id: 'overview', icon: 'fa-gauge-high', label: 'Campus Overview', desc: 'Real-time telemetry and operational metrics' }
      ]
    },
    {
      groupTitle: 'User Management',
      items: [
        { id: 'students', icon: 'fa-user-graduate', label: 'Students Roster', desc: 'Enrolled student accounts and wallet balances' },
        { id: 'owners', icon: 'fa-handshake', label: 'Vehicle Owners', desc: 'Faculty and vehicle host profiles' },
        { id: 'staff', icon: 'fa-users-gear', label: 'Campus Staff', desc: 'Subordinate KYC, Finance, and Support staff' }
      ]
    },
    {
      groupTitle: 'Vehicle Management',
      items: [
        { id: 'fleet', icon: 'fa-motorcycle', label: 'Campus Fleet', desc: 'Register & list e-bikes, scooters, and status' },
        { id: 'zones', icon: 'fa-parking', label: 'Parking Zones', desc: 'Stand stations, pickup points, and capacity' },
        { id: 'maintenance', icon: 'fa-wrench', label: 'Maintenance Logs', desc: 'Vehicle repair and battery service queue' }
      ]
    },
    {
      groupTitle: 'Booking Management',
      items: [
        { id: 'bookings', icon: 'fa-calendar-check', label: 'Bookings Engine', desc: 'Active rentals, history, and trip receipts' },
        { id: 'live-rides', icon: 'fa-location-dot', label: 'Live GPS Telemetry', desc: 'Real-time rider tracking and battery levels' }
      ]
    },
    {
      groupTitle: 'Finance & Pricing',
      items: [
        { id: 'finance', icon: 'fa-wallet', label: 'Campus Finance', desc: 'Ride payments, payouts, and revenue' },
        { id: 'pricing', icon: 'fa-tags', label: 'Campus Pricing', desc: 'Hourly rates, daily caps, and coupons' }
      ]
    },
    {
      groupTitle: 'Verification & Safety',
      items: [
        { id: 'kyc', icon: 'fa-id-card', label: 'KYC Queue', desc: 'Student Aadhaar and Driving License verification' },
        { id: 'tickets', icon: 'fa-headset', label: 'Complaints & Support', desc: 'Student support tickets and issue resolution' },
        { id: 'notifications', icon: 'fa-bullhorn', label: 'Campus Broadcaster', desc: 'Broadcast announcements to campus users' },
        { id: 'emergency', icon: 'fa-triangle-exclamation', label: 'SOS Control', desc: 'Real-time emergency breakdown alerts' }
      ]
    },
    {
      groupTitle: 'System Settings',
      items: [
        { id: 'security', icon: 'fa-shield', label: 'Tenant Audit Trail', desc: 'Campus security log and administrative actions' },
        { id: 'settings', icon: 'fa-gear', label: 'Campus Config', desc: 'Operating hours, domain, and emergency helpline' }
      ]
    }
  ];

  // Flat active item helper
  const allNavItems = navGroups.flatMap(g => g.items);
  const currentNav = allNavItems.find(i => i.id === activeTab) || navGroups[0].items[0];

  const bgStyle = darkMode ? '#0F172A' : '#F8FAFC';
  const textStyle = darkMode ? '#F8FAFC' : '#0F172A';
  const cardBg = darkMode ? '#1E293B' : '#FFFFFF';
  const cardBorder = darkMode ? '1px solid #334155' : '1px solid #E2E8F0';

  return (
    <div className="d-flex" style={{ backgroundColor: bgStyle, color: textStyle, minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* 1. COLLAPSIBLE ENTERPRISE SIDEBAR */}
      <aside
        style={{
          width: sidebarCollapsed ? '75px' : '265px',
          minWidth: sidebarCollapsed ? '75px' : '265px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: darkMode ? '#0F172A' : '#0284C7',
          color: '#FFFFFF',
          minHeight: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 1050,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
          overflowX: 'hidden'
        }}>
        
        {/* Sidebar Brand Header */}
        <div className="p-3 d-flex align-items-center justify-content-between border-bottom border-white border-opacity-25" style={{ minHeight: '68px' }}>
          <div className="d-flex align-items-center gap-2 overflow-hidden">
            <div className="bg-warning text-dark rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '38px', height: '38px', flexShrink: 0 }}>
              <i className="fa-solid fa-graduation-cap fs-5"></i>
            </div>
            {!sidebarCollapsed && (
              <div className="d-flex flex-column text-start overflow-hidden">
                <span className="fw-black text-white text-truncate" style={{ fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                  {tenantId} Node
                </span>
                <span className="small text-white-50 text-truncate" style={{ fontSize: '0.65rem' }}>
                  Tenant Admin SaaS
                </span>
              </div>
            )}
          </div>
          <button className="btn btn-sm text-white-50 hover-white p-1 border-0" onClick={toggleSidebar} title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}>
            <i className={`fa-solid ${sidebarCollapsed ? 'fa-angles-right' : 'fa-angles-left'}`}></i>
          </button>
        </div>

        {/* Search Inside Sidebar Menu */}
        {!sidebarCollapsed && (
          <div className="p-2 border-bottom border-white border-opacity-10">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white bg-opacity-10 border-0 text-white-50"><i className="fa-solid fa-magnifying-glass"></i></span>
              <input
                type="text"
                className="form-control bg-white bg-opacity-10 border-0 text-white placeholder-white-50 shadow-none"
                placeholder="Search menu..."
                value={sidebarSearch}
                onChange={e => setSidebarSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Grouped Sidebar Menu Items */}
        <div className="flex-grow-1 py-3 px-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
          {navGroups.map((group, gIdx) => {
            const filteredItems = group.items.filter(item => 
              item.label.toLowerCase().includes(sidebarSearch.toLowerCase()) || 
              item.desc.toLowerCase().includes(sidebarSearch.toLowerCase())
            );

            if (filteredItems.length === 0) return null;

            return (
              <div key={gIdx} className="mb-3">
                {!sidebarCollapsed && (
                  <div className="px-2 mb-1 small fw-bold text-uppercase text-white-50" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
                    {group.groupTitle}
                  </div>
                )}
                {filteredItems.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      className={`btn w-100 mb-1 d-flex align-items-center gap-3 transition-all rounded-3 text-start ${sidebarCollapsed ? 'justify-content-center px-0 py-2' : 'px-3 py-2'} ${isActive ? 'bg-white text-primary fw-bold shadow-sm' : 'text-white-50 hover-bg-white-10'}`}
                      onClick={() => setActiveTab(item.id)}
                      title={sidebarCollapsed ? `${item.label} — ${item.desc}` : ''}
                      style={{ fontSize: '0.85rem' }}>
                      <i className={`fa-solid ${item.icon} ${isActive ? 'text-primary' : 'text-white'}`} style={{ fontSize: '1rem', width: '20px', textAlign: 'center' }}></i>
                      {!sidebarCollapsed && (
                        <span className="text-truncate flex-grow-1">{item.label}</span>
                      )}
                      {!sidebarCollapsed && isActive && (
                        <i className="fa-solid fa-chevron-right small opacity-75"></i>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-3 border-top border-white border-opacity-25 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2 overflow-hidden">
            <div className="bg-white text-primary rounded-circle fw-bold d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', flexShrink: 0, fontSize: '0.8rem' }}>
              {storedUser.fullName ? storedUser.fullName.charAt(0) : 'A'}
            </div>
            {!sidebarCollapsed && (
              <div className="d-flex flex-column text-start overflow-hidden">
                <span className="small fw-bold text-white text-truncate">{storedUser.fullName || 'Campus Admin'}</span>
                <span className="text-white-50 text-truncate" style={{ fontSize: '0.65rem' }}>{tenantId} Administrator</span>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button className="btn btn-sm btn-outline-light rounded-circle p-1" onClick={() => navigate('/dashboard')} title="Exit to User Dashboard">
              <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: '0.75rem' }}></i>
            </button>
          )}
        </div>

      </aside>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <main className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        
        {/* Top Header Bar */}
        <header className="bg-white border-bottom px-4 py-3 sticky-top shadow-sm d-flex flex-wrap align-items-center justify-content-between gap-3" style={{ zIndex: 1000, backgroundColor: cardBg, borderColor: darkMode ? '#334155' : '#E2E8F0' }}>
          
          {/* Breadcrumb & Module Title */}
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-sm btn-light border d-md-none" onClick={toggleSidebar}>
              <i className="fa-solid fa-bars"></i>
            </button>
            <div>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0 small text-muted" style={{ fontSize: '0.75rem' }}>
                  <li className="breadcrumb-item"><i className="fa-solid fa-graduation-cap me-1 text-primary"></i>Campus Node</li>
                  <li className="breadcrumb-item fw-bold text-primary">{tenantId}</li>
                  <li className="breadcrumb-item active">{currentNav.label}</li>
                </ol>
              </nav>
              <h5 className="fw-black m-0 mt-1 d-flex align-items-center gap-2">
                <i className={`fa-solid ${currentNav.icon} text-primary`}></i>
                {currentNav.label}
              </h5>
            </div>
          </div>

          {/* Controls Header Right */}
          <div className="d-flex align-items-center gap-3 flex-wrap">
            
            {/* Tenant Switcher Dropdown (Strictly Disabled for Non-Super-Admins) */}
            <div className="d-flex align-items-center gap-2 bg-light px-3 py-1.5 rounded-pill border">
              <span className="small fw-bold text-muted" style={{ fontSize: '0.75rem' }}>TENANT NODE:</span>
              {isSuperAdmin ? (
                <select className="form-select form-select-sm bg-transparent border-0 fw-bold shadow-none text-dark p-0" style={{ cursor: 'pointer', width: 'auto' }} value={tenantId} onChange={e => setTenantId(e.target.value)}>
                  {tenants.map(t => <option key={t.code} value={t.code}>{t.name} ({t.code})</option>)}
                </select>
              ) : (
                <span className="fw-bold text-primary small px-1">{tenantId} (Isolated)</span>
              )}
            </div>

            {/* Telemetry Switcher */}
            <button className={`btn btn-sm ${autoRefresh ? 'btn-success' : 'btn-outline-secondary'} rounded-pill px-3 fw-bold`} onClick={() => setAutoRefresh(!autoRefresh)}>
              <i className="fa-solid fa-arrows-rotate me-1"></i> Live Feed {autoRefresh ? 'ON' : 'OFF'}
            </button>

            {/* Dark Mode */}
            <button className="btn btn-sm btn-outline-secondary rounded-circle p-2" onClick={() => setDarkMode(!darkMode)} title="Toggle Dark Mode">
              <i className={`fa-solid ${darkMode ? 'fa-sun text-warning' : 'fa-moon'}`}></i>
            </button>

            {/* Exit Portal */}
            <button className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold" onClick={() => navigate('/dashboard')}>
              <i className="fa-solid fa-house me-1"></i> User App
            </button>

          </div>
        </header>

        {/* Module Sub-Header Description Banner */}
        <div className="px-4 py-2 bg-primary bg-opacity-10 border-bottom d-flex align-items-center justify-content-between">
          <span className="small text-primary fw-semibold">
            <i className="fa-solid fa-circle-info me-2"></i>{currentNav.desc}
          </span>
          <span className="badge bg-primary rounded-pill px-3 py-1">{kpis.campusName || `${tenantId} Campus`}</span>
        </div>

        {/* Content Body Area */}
        <div className="p-4 flex-grow-1">
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
              <p className="mt-3 fw-bold text-muted">Securing Tenant Connection ({tenantId})...</p>
            </div>
          ) : (
            <>

              {/* MODULE 0: MY PROFILE */}
              {activeTab === 'profile' && (
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                      <h4 className="fw-bold mb-3"><i className="fa-solid fa-id-badge text-primary me-2"></i>My Administrator Profile</h4>
                      <p className="small text-muted mb-4">Manage your administrator credentials and personal account details for {tenantId}.</p>
                      
                      <form onSubmit={handleSaveOwnProfile}>
                        <div className="mb-3">
                          <label className="form-label small fw-bold">FULL NAME</label>
                          <input type="text" required className="form-control" value={myProfile.fullName} onChange={e => setMyProfile({...myProfile, fullName: e.target.value})} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label small fw-bold">EMAIL ADDRESS (READ ONLY)</label>
                          <input type="email" readOnly disabled className="form-control bg-light" value={myProfile.email} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label small fw-bold">MOBILE NUMBER</label>
                          <input type="text" className="form-control" value={myProfile.mobile} onChange={e => setMyProfile({...myProfile, mobile: e.target.value})} />
                        </div>
                        <div className="mb-4">
                          <label className="form-label small fw-bold">NEW PASSWORD (LEAVE BLANK TO KEEP CURRENT)</label>
                          <input type="password" className="form-control" placeholder="••••••••" value={myProfile.password} onChange={e => setMyProfile({...myProfile, password: e.target.value})} />
                        </div>
                        <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
                          <i className="fa-solid fa-floppy-disk me-1"></i> Save Profile Changes
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                      <h5 className="fw-bold mb-3"><i className="fa-solid fa-user-shield text-success me-2"></i>Administrator Privileges & Scope</h5>
                      <ul className="list-group list-group-flush mb-3">
                        <li className="list-group-item bg-transparent"><strong>Role Scope:</strong> <span className="badge bg-primary">Institution Administrator</span></li>
                        <li className="list-group-item bg-transparent"><strong>Assigned Institution:</strong> <span className="badge bg-info">{tenantId}</span></li>
                        <li className="list-group-item bg-transparent"><strong>Account Status:</strong> <span className="badge bg-success">Active & Verified</span></li>
                        <li className="list-group-item bg-transparent"><strong>Multi-Tenant Isolation:</strong> <span className="badge bg-success">Enforced</span></li>
                      </ul>
                      <div className="p-3 bg-light rounded-3 border">
                        <small className="text-muted">
                          <i className="fa-solid fa-shield-halved text-success me-2"></i>
                          You are managing node <strong>{tenantId}</strong>. You do not have visibility into other campus institutions or Super Admin accounts.
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 1: CAMPUS OVERVIEW */}
              {activeTab === 'overview' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold m-0"><i className="fa-solid fa-chart-line text-primary me-2"></i>Campus Operations & Live Telemetry</h4>
                    <span className="badge bg-primary bg-opacity-10 text-primary fs-6 px-3 py-2">Node: {tenantId}</span>
                  </div>

                  <div className="row g-3 mb-4">
                    {[
                      { title: 'Active Campus Students', val: kpis.activeStudents || 0, icon: 'fa-user-graduate', color: 'primary' },
                      { title: 'Registered Vehicle Owners', val: kpis.activeVehicleOwners || 0, icon: 'fa-handshake', color: 'info' },
                      { title: 'Total Campus Fleet', val: kpis.registeredVehicles || 0, icon: 'fa-motorcycle', color: 'dark' },
                      { title: 'Available Fleet', val: kpis.availableVehicles || 0, icon: 'fa-circle-check', color: 'success' },
                      { title: 'Active Campus Rentals', val: kpis.activeRentals || 0, icon: 'fa-key', color: 'warning' },
                      { title: 'Completed Trips', val: kpis.completedRentals || 0, icon: 'fa-flag-checkered', color: 'primary' },
                      { title: "Today's Campus Revenue", val: `₹${kpis.todayRevenue || 0}`, icon: 'fa-money-bill-wave', color: 'success' },
                      { title: 'Monthly Revenue', val: `₹${kpis.monthlyRevenue || 0}`, icon: 'fa-chart-simple', color: 'info' },
                      { title: 'Campus Wallet Balance', val: `₹${(kpis.campusWalletBalance || 0).toLocaleString()}`, icon: 'fa-wallet', color: 'purple' },
                      { title: 'Pending KYC Queue', val: kpis.pendingKyc || 0, icon: 'fa-id-card', color: 'warning' },
                      { title: 'Active Emergency SOS Alerts', val: kpis.activeEmergencyAlerts || 0, icon: 'fa-triangle-exclamation', color: 'danger' },
                      { title: 'Maintenance Service Requests', val: kpis.activeMaintenanceAlerts || 0, icon: 'fa-wrench', color: 'dark' }
                    ].map((stat, idx) => (
                      <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={idx}>
                        <div className="p-3 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="small fw-bold text-muted">{stat.title}</span>
                            <i className={`fa-solid ${stat.icon} text-${stat.color} fs-4`}></i>
                          </div>
                          <h3 className="fw-black m-0">{stat.val}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 2: STUDENTS ROSTER */}
              {activeTab === 'students' && (
                <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                  <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                    <div>
                      <h4 className="fw-bold m-0"><i className="fa-solid fa-user-graduate text-primary me-2"></i>Campus Student Roster ({tenantId})</h4>
                      <span className="small text-muted">Enrolled student users for {kpis.campusName}</span>
                    </div>
                    <button className="btn btn-sm btn-success rounded-pill fw-bold px-3" onClick={() => exportToCsv(`students_${tenantId}.csv`, students)}>
                      <i className="fa-solid fa-file-export me-1"></i> Export Student CSV
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Email / Mobile</th>
                          <th>Dept & Course</th>
                          <th>Enrollment #</th>
                          <th>Wallet</th>
                          <th>KYC</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map(s => (
                          <tr key={s._id}>
                            <td className="fw-bold">{s.fullName}</td>
                            <td><small>{s.email}<br/>{s.mobile}</small></td>
                            <td><span className="badge bg-light text-dark">{s.academicDept} ({s.academicCourse})</span></td>
                            <td className="fw-bold font-monospace">{s.enrollmentNumber}</td>
                            <td className="fw-bold text-success">₹{s.walletBalance}</td>
                            <td><span className="badge bg-info">{s.kycStatus}</span></td>
                            <td><span className="badge bg-success">{s.accountStatus || 'active'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODULE 3: VEHICLE OWNERS */}
              {activeTab === 'owners' && (
                <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold m-0"><i className="fa-solid fa-handshake text-info me-2"></i>Vehicle Owners & Hosts ({tenantId})</h4>
                    <button className="btn btn-sm btn-success rounded-pill fw-bold px-3" onClick={() => exportToCsv(`owners_${tenantId}.csv`, owners)}>
                      <i className="fa-solid fa-file-export me-1"></i> Export Owners CSV
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Owner Name</th>
                          <th>Email / Contact</th>
                          <th>Wallet Balance</th>
                          <th>KYC Status</th>
                          <th>Account Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {owners.map(o => (
                          <tr key={o._id}>
                            <td className="fw-bold">{o.fullName}</td>
                            <td>{o.email}<br/><small className="text-muted">{o.mobile}</small></td>
                            <td className="fw-bold text-success">₹{o.walletBalance}</td>
                            <td><span className="badge bg-success">{o.kycStatus}</span></td>
                            <td><span className="badge bg-primary">{o.accountStatus || 'active'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODULE 4: CAMPUS FLEET (WITH VEHICLE REGISTRATION & QR CODES) */}
              {activeTab === 'fleet' && (
                <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                  <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                    <div>
                      <h4 className="fw-bold m-0"><i className="fa-solid fa-motorcycle text-primary me-2"></i>Campus Vehicle Fleet ({tenantId})</h4>
                      <span className="small text-muted">Register, manage, and generate scannable QR codes for campus vehicles</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <button className="btn btn-primary rounded-pill fw-bold px-4 shadow-sm" onClick={() => setShowVehicleModal(true)}>
                        <i className="fa-solid fa-plus me-1"></i> Register New Vehicle
                      </button>
                    </div>
                  </div>

                  {/* Register Vehicle Modal */}
                  {showVehicleModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000 }}>
                      <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content rounded-4 shadow border-0">
                          <div className="modal-header bg-primary text-white p-4">
                            <h5 className="modal-title fw-bold"><i className="fa-solid fa-shield-halved me-2"></i>Vehicle Registration & Fleet Listing Form</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={() => setShowVehicleModal(false)}></button>
                          </div>
                          <form onSubmit={handleRegisterVehicle}>
                            <div className="modal-body p-4">
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <label className="form-label small fw-bold">VEHICLE NAME / DISPLAY MODEL</label>
                                  <input type="text" required className="form-control" placeholder="e.g. Ather 450X EV" value={newVehicle.name} onChange={e => setNewVehicle({...newVehicle, name: e.target.value})} />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label small fw-bold text-danger">REGISTRATION NUMBER (PLATE #)</label>
                                  <input type="text" required className="form-control font-monospace text-uppercase" placeholder="e.g. MP-18-EV-2026" value={newVehicle.plateNumber} onChange={e => setNewVehicle({...newVehicle, plateNumber: e.target.value})} />
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label small fw-bold">VEHICLE TYPE</label>
                                  <select className="form-select" value={newVehicle.type} onChange={e => setNewVehicle({...newVehicle, type: e.target.value})}>
                                    <option value="scooter">Scooter (IC Engine / EV)</option>
                                    <option value="ebike">Electric Bike</option>
                                    <option value="motorcycle">Motorcycle</option>
                                    <option value="moped">Moped</option>
                                    <option value="electric_bicycle">Electric Bicycle</option>
                                  </select>
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label small fw-bold">MODEL & VARIANT</label>
                                  <input type="text" className="form-control" placeholder="e.g. Gen 3 Pro" value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} />
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label small fw-bold">ESTIMATED RANGE (KM)</label>
                                  <input type="number" className="form-control" value={newVehicle.rangeKm} onChange={e => setNewVehicle({...newVehicle, rangeKm: e.target.value})} />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label small fw-bold">INITIAL BATTERY %</label>
                                  <input type="number" min="0" max="100" className="form-control" value={newVehicle.batteryLevel} onChange={e => setNewVehicle({...newVehicle, batteryLevel: e.target.value})} />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label small fw-bold">INITIAL OPERATIONAL STATUS</label>
                                  <select className="form-select" value={newVehicle.status} onChange={e => setNewVehicle({...newVehicle, status: e.target.value})}>
                                    <option value="available">Available for Rent</option>
                                    <option value="under_maintenance">Under Maintenance</option>
                                    <option value="out_of_service">Out of Service</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <div className="modal-footer p-3 bg-light">
                              <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setShowVehicleModal(false)}>Cancel</button>
                              <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold">Register & List Vehicle</button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* QR Code Modal */}
                  {selectedQrVehicle && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000 }}>
                      <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content rounded-4 shadow border-0 text-center p-4">
                          <h5 className="fw-bold mb-2"><i className="fa-solid fa-qrcode text-primary me-2"></i>Campus Vehicle Scannable QR Code</h5>
                          <p className="small text-muted mb-3">{selectedQrVehicle.name} ({selectedQrVehicle.plateNumber})</p>
                          <div className="p-4 bg-white border rounded-4 d-inline-block mx-auto mb-3 shadow-sm">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=VEHICLE_ID:${selectedQrVehicle.id}|REG:${selectedQrVehicle.plateNumber}|INST:${tenantId}`} alt="Vehicle QR Code" className="img-fluid" />
                          </div>
                          <div className="small font-monospace bg-light p-2 rounded border mb-3">
                            ID: #{selectedQrVehicle.id} | REG: {selectedQrVehicle.plateNumber} | INST: {tenantId}
                          </div>
                          <button className="btn btn-dark rounded-pill px-4 fw-bold" onClick={() => setSelectedQrVehicle(null)}>Close QR Code</button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Vehicle Name</th>
                          <th>Model</th>
                          <th>Type</th>
                          <th>Plate Number</th>
                          <th>Battery Level</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicles.map(v => (
                          <tr key={v.id}>
                            <td className="fw-bold">{v.name}</td>
                            <td>{v.model}</td>
                            <td><span className="badge bg-light text-dark text-uppercase">{v.type}</span></td>
                            <td><span className="badge bg-dark font-monospace">{v.plateNumber}</span></td>
                            <td>
                              <div className="progress" style={{ height: '16px', width: '90px' }}>
                                <div className={`progress-bar ${v.batteryLevel > 50 ? 'bg-success' : 'bg-warning'}`} style={{ width: `${v.batteryLevel}%` }}>
                                  {v.batteryLevel}%
                                </div>
                              </div>
                            </td>
                            <td><span className={`badge ${v.status === 'available' ? 'bg-success' : 'bg-warning'}`}>{v.status}</span></td>
                            <td>
                              <button className="btn btn-sm btn-outline-primary rounded-pill px-3 me-2" onClick={() => setSelectedQrVehicle(v)}>
                                <i className="fa-solid fa-qrcode me-1"></i> QR Code
                              </button>
                              <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => handleDeleteVehicle(v.id)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODULE 5: BOOKINGS ENGINE */}
              {activeTab === 'bookings' && (
                <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                  <h4 className="fw-bold mb-4"><i className="fa-solid fa-calendar-check text-primary me-2"></i>Campus Rental Bookings ({tenantId})</h4>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Ref #</th>
                          <th>Booking Type</th>
                          <th>Pickup Station</th>
                          <th>Drop Station</th>
                          <th>Total Cost</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map(b => (
                          <tr key={b.id}>
                            <td className="fw-bold font-monospace">{b.bookingReference || `#${b.id}`}</td>
                            <td><span className="badge bg-info">{b.bookingType}</span></td>
                            <td>{b.pickupLocation}</td>
                            <td>{b.dropLocation || 'N/A'}</td>
                            <td className="fw-bold text-success">₹{b.totalCost}</td>
                            <td><span className="badge bg-success">{b.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODULE 6: LIVE GPS TELEMETRY */}
              {activeTab === 'live-rides' && (
                <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="fw-bold m-0"><i className="fa-solid fa-location-dot text-danger me-2"></i>Live GPS Ride Telemetry Stream</h4>
                    <span className="badge bg-danger pulse-badge">LIVE TRACKING FEED</span>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Booking #</th>
                          <th>Rider Name</th>
                          <th>Vehicle Model</th>
                          <th>Plate #</th>
                          <th>GPS Coords</th>
                          <th>Battery</th>
                          <th>Started At</th>
                          <th>Trip Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {liveRides.map(r => (
                          <tr key={r.bookingId}>
                            <td className="fw-bold font-monospace">#{r.bookingId}</td>
                            <td>{r.riderName}<br/><small className="text-muted">{r.riderMobile}</small></td>
                            <td className="fw-bold">{r.vehicleModel}</td>
                            <td><span className="badge bg-dark">{r.plateNumber}</span></td>
                            <td className="small font-monospace">{r.lat}, {r.lng}</td>
                            <td>
                              <div className="progress" style={{ height: '16px', width: '90px' }}>
                                <div className={`progress-bar ${r.batteryLevel > 50 ? 'bg-success' : 'bg-warning'}`} style={{ width: `${r.batteryLevel}%` }}>
                                  {r.batteryLevel}%
                                </div>
                              </div>
                            </td>
                            <td className="small">{r.startTime}</td>
                            <td className="fw-bold text-primary">₹{r.tripCostSoFar}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODULE 7: CAMPUS FINANCE */}
              {activeTab === 'finance' && (
                <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                  <h4 className="fw-bold mb-4"><i className="fa-solid fa-wallet text-success me-2"></i>Campus Financials & Payout Transactions ({tenantId})</h4>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Tx ID</th>
                          <th>Amount</th>
                          <th>Type</th>
                          <th>Payment Method</th>
                          <th>Description</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {finance.map(f => (
                          <tr key={f.id}>
                            <td className="fw-bold font-monospace">{f.transactionId}</td>
                            <td className="fw-bold text-success">₹{f.amount}</td>
                            <td><span className="badge bg-info">{f.type}</span></td>
                            <td>{f.paymentMethod}</td>
                            <td className="small">{f.description}</td>
                            <td><span className="badge bg-success">{f.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODULE 8: KYC QUEUE */}
              {activeTab === 'kyc' && (
                <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                  <h4 className="fw-bold mb-4"><i className="fa-solid fa-id-card text-primary me-2"></i>Student KYC Verification Queue ({tenantId})</h4>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Email</th>
                          <th>KYC Documents</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map(s => (
                          <tr key={s._id}>
                            <td className="fw-bold">{s.fullName}</td>
                            <td>{s.email}</td>
                            <td>
                              <span className="badge bg-light text-dark me-1">Aadhaar: Verified</span>
                              <span className="badge bg-light text-dark">DL: Verified</span>
                            </td>
                            <td><span className="badge bg-success">{s.kycStatus}</span></td>
                            <td>
                              <button className="btn btn-sm btn-outline-primary rounded-pill px-3">Review Documents</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODULE 9: COMPLAINTS & TICKETS */}
              {activeTab === 'tickets' && (
                <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                  <h4 className="fw-bold mb-4"><i className="fa-solid fa-headset text-warning me-2"></i>Student & Faculty Complaints ({tenantId})</h4>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Ticket #</th>
                          <th>User Email</th>
                          <th>Subject</th>
                          <th>Category</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.map(t => (
                          <tr key={t.id}>
                            <td className="fw-bold">{t.ticketNumber}</td>
                            <td>{t.userEmail}</td>
                            <td>{t.subject}</td>
                            <td><span className="badge bg-light text-dark">{t.category}</span></td>
                            <td>
                              <span className={`badge ${t.priority === 'high' ? 'bg-danger' : 'bg-warning text-dark'}`}>{t.priority}</span>
                            </td>
                            <td>
                              <span className={`badge ${t.status === 'resolved' ? 'bg-success' : 'bg-info'}`}>{t.status}</span>
                            </td>
                            <td>
                              <button className="btn btn-sm btn-outline-success rounded-pill px-3" onClick={() => {
                                axios.put(`http://localhost:5000/api/superadmin/tickets/${t.id}`, { status: 'resolved' })
                                  .then(() => { alert('Ticket resolved'); fetchTickets(); });
                              }}>Resolve</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODULE 10: CAMPUS STAFF */}
              {activeTab === 'staff' && (
                <div className="row g-4">
                  <div className="col-md-5">
                    <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                      <h5 className="fw-bold mb-3"><i className="fa-solid fa-user-gear text-primary me-2"></i>Deploy Subordinate Campus Staff</h5>
                      <form onSubmit={handleCreateStaff}>
                        <div className="mb-2">
                          <label className="form-label small fw-bold">FULL NAME</label>
                          <input type="text" required className="form-control" placeholder="Officer Name" value={newStaff.fullName} onChange={e => setNewStaff({...newStaff, fullName: e.target.value})} />
                        </div>
                        <div className="mb-2">
                          <label className="form-label small fw-bold">EMAIL ADDRESS (ANY NORMAL EMAIL)</label>
                          <input type="email" required className="form-control" placeholder="e.g. staff@gmail.com or name@yahoo.com" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
                        </div>
                        <div className="mb-2">
                          <label className="form-label small fw-bold">PASSWORD</label>
                          <input type="password" required className="form-control" placeholder="••••••••" value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label small fw-bold">ASSIGN STAFF ROLE</label>
                          <select className="form-select" value={newStaff.staffRole} onChange={e => setNewStaff({...newStaff, staffRole: e.target.value})}>
                            <option value="KYC Officer">KYC Officer</option>
                            <option value="Finance Officer">Finance Officer</option>
                            <option value="Support Executive">Support Executive</option>
                            <option value="Operations Officer">Operations Officer</option>
                            <option value="Security Officer">Security Officer</option>
                          </select>
                        </div>
                        <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold">Deploy Campus Staff</button>
                      </form>
                    </div>
                  </div>

                  <div className="col-md-7">
                    <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                      <h5 className="fw-bold mb-3"><i className="fa-solid fa-users me-2 text-primary"></i>Subordinate Staff Officers ({tenantId})</h5>
                      <div className="table-responsive">
                        <table className="table align-middle">
                          <thead>
                            <tr>
                              <th>Staff Name</th>
                              <th>Email</th>
                              <th>Role</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {staffList.map(st => (
                              <tr key={st.id}>
                                <td className="fw-bold">{st.fullName}</td>
                                <td>{st.email}</td>
                                <td><span className="badge bg-info">{st.role}</span></td>
                                <td>
                                  <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => handleDeleteStaff(st.id)}>
                                    Delete Staff
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

              {/* MODULE 11: PARKING ZONES */}
              {activeTab === 'zones' && (
                <div className="row g-4">
                  <div className="col-md-5">
                    <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                      <h5 className="fw-bold mb-3"><i className="fa-solid fa-parking text-primary me-2"></i>Create Parking & Drop Hub Zone</h5>
                      <form onSubmit={handleCreateZone}>
                        <div className="mb-2">
                          <label className="form-label small fw-bold">ZONE NAME</label>
                          <input type="text" required className="form-control" placeholder="Hostel 4 Parking Hub" value={newZone.zoneName} onChange={e => setNewZone({...newZone, zoneName: e.target.value})} />
                        </div>
                        <div className="mb-2">
                          <label className="form-label small fw-bold">ZONE TYPE</label>
                          <select className="form-select" value={newZone.zoneType} onChange={e => setNewZone({...newZone, zoneType: e.target.value})}>
                            <option value="parking_station">Parking Station</option>
                            <option value="pickup_point">Pickup Point</option>
                            <option value="drop_point">Drop Point</option>
                            <option value="restricted_area">Restricted No-Ride Area</option>
                          </select>
                        </div>
                        <div className="mb-2">
                          <label className="form-label small fw-bold">CAPACITY</label>
                          <input type="number" className="form-control" value={newZone.capacity} onChange={e => setNewZone({...newZone, capacity: e.target.value})} />
                        </div>
                        <button type="submit" className="btn btn-success w-100 rounded-pill fw-bold">Deploy Campus Zone</button>
                      </form>
                    </div>
                  </div>

                  <div className="col-md-7">
                    <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                      <h5 className="fw-bold mb-3"><i className="fa-solid fa-map-location-dot text-primary me-2"></i>Campus Zones ({tenantId})</h5>
                      <div className="table-responsive">
                        <table className="table align-middle">
                          <thead>
                            <tr>
                              <th>Zone Name</th>
                              <th>Type</th>
                              <th>Capacity</th>
                              <th>Active Vehicles</th>
                            </tr>
                          </thead>
                          <tbody>
                            {zones.map(z => (
                              <tr key={z.id}>
                                <td className="fw-bold">{z.zoneName}</td>
                                <td><span className="badge bg-light text-dark">{z.zoneType}</span></td>
                                <td>{z.capacity} Slots</td>
                                <td className="fw-bold text-success">{z.activeVehiclesCount} Active</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 12: PRICING POLICIES */}
              {activeTab === 'pricing' && (
                <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                  <h4 className="fw-bold mb-4"><i className="fa-solid fa-tags text-primary me-2"></i>Campus Specific Pricing Policies ({tenantId})</h4>
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>Vehicle Type</th>
                          <th>Hourly Rate</th>
                          <th>Daily Rate Cap</th>
                          <th>Security Deposit</th>
                          <th>Campus Coupon</th>
                          <th>Discount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pricing.map(p => (
                          <tr key={p.id}>
                            <td className="fw-bold text-uppercase">{p.vehicleType}</td>
                            <td className="fw-bold text-primary">₹{p.hourlyRate}/hr</td>
                            <td>₹{p.dailyRate}/day</td>
                            <td>₹{p.securityDeposit}</td>
                            <td><span className="badge bg-warning text-dark font-monospace">{p.couponCode}</span></td>
                            <td className="fw-bold text-success">{p.discountPercent}% OFF</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODULE 13: BROADCASTER */}
              {activeTab === 'notifications' && (
                <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                  <h4 className="fw-bold mb-4"><i className="fa-solid fa-bullhorn text-primary me-2"></i>Campus Notice Broadcaster ({tenantId})</h4>
                  <p className="text-muted">Broadcast emergency campus notices and student updates.</p>
                </div>
              )}

              {/* MODULE 14: MAINTENANCE */}
              {activeTab === 'maintenance' && (
                <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                  <h4 className="fw-bold mb-4"><i className="fa-solid fa-wrench text-dark me-2"></i>Vehicle Maintenance & Battery Service Logs ({tenantId})</h4>
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>Log #</th>
                          <th>Vehicle Model</th>
                          <th>Issue Category</th>
                          <th>Description</th>
                          <th>Service Cost</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maintenance.map(m => (
                          <tr key={m.id}>
                            <td className="fw-bold">#{m.id}</td>
                            <td className="fw-bold">{m.vehicleModel}</td>
                            <td><span className="badge bg-warning text-dark">{m.issueCategory}</span></td>
                            <td>{m.description}</td>
                            <td className="fw-bold">₹{m.cost}</td>
                            <td><span className="badge bg-info">{m.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODULE 15: EMERGENCY & SOS CONTROL */}
              {activeTab === 'emergency' && (
                <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                  <h4 className="fw-bold mb-4 text-danger"><i className="fa-solid fa-triangle-exclamation me-2"></i>Campus Emergency SOS Control Room ({tenantId})</h4>
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>Rider Name</th>
                          <th>Booking #</th>
                          <th>SOS Category</th>
                          <th>GPS Coords</th>
                          <th>Description</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emergencies.map(e => (
                          <tr key={e.id}>
                            <td className="fw-bold">{e.userFullName}</td>
                            <td className="font-monospace">#{e.bookingId}</td>
                            <td><span className="badge bg-danger">{e.sosType}</span></td>
                            <td className="small font-monospace">{e.lat}, {e.lng}</td>
                            <td>{e.description}</td>
                            <td>
                              <span className={`badge ${e.status === 'resolved' ? 'bg-success' : 'bg-danger'}`}>{e.status}</span>
                            </td>
                            <td>
                              {e.status !== 'resolved' && (
                                <button className="btn btn-sm btn-success rounded-pill px-3" onClick={() => handleResolveSOS(e.id)}>Resolve SOS</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODULE 16: TENANT AUDIT */}
              {activeTab === 'security' && (
                <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                  <h4 className="fw-bold mb-4"><i className="fa-solid fa-shield text-primary me-2"></i>Tenant Administrative Audit Trail ({tenantId})</h4>
                  <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <table className="table table-striped align-middle">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Actor</th>
                          <th>Role</th>
                          <th>Action</th>
                          <th>Module</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map(l => (
                          <tr key={l.id}>
                            <td className="small text-muted">{l.timestamp}</td>
                            <td className="fw-bold">{l.actorUsername}</td>
                            <td><span className="badge bg-info">{l.actorRole}</span></td>
                            <td><span className="badge bg-primary">{l.action}</span></td>
                            <td>{l.targetModule}</td>
                            <td className="small">{l.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODULE 17: CAMPUS CONFIG */}
              {activeTab === 'settings' && (
                <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                  <h4 className="fw-bold mb-4"><i className="fa-solid fa-gear text-primary me-2"></i>Campus Node Configurations ({tenantId})</h4>
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>Setting Key</th>
                          <th>Current Setting Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {settings.map(s => (
                          <tr key={s.id}>
                            <td className="fw-bold font-monospace">{s.settingKey}</td>
                            <td><span className="badge bg-light text-dark fs-6">{s.settingValue}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </>
          )}

        </div>
      </main>
    </div>
  );
};

export default InstitutionAdminPortal;
