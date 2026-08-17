import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SuperAdminPortal = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem('vrx_user') || '{}');

  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Core Data States
  const [kpis, setKpis] = useState({});
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [finance, setFinance] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [cmsList, setCmsList] = useState([]);
  const [settings, setSettings] = useState([]);
  const [aiData, setAiData] = useState({ fraudFlags: [] });
  const [backups, setBackups] = useState([]);
  const [serverHealth, setServerHealth] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [roleMatrix, setRoleMatrix] = useState([]);
  const [tenants, setTenants] = useState([]);

  // UI Control & Filter States
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal / Selected Item States
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedKycUser, setSelectedKycUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newNotice, setNewNotice] = useState({ title: '', message: '', targetType: 'broadcast', targetValue: 'all', channel: 'in_app' });
  const [selectedCms, setSelectedCms] = useState(null);
  const [newAdmin, setNewAdmin] = useState({ fullName: '', username: '', email: '', password: '', role: 'admin', institutionId: 'IGNTU' });
  const [newVehicle, setNewVehicle] = useState({ institutionId: 'IGNTU', model: '', type: 'scooter', plateNumber: '', pricePerHour: 30 });

  // Bulk Selection
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  useEffect(() => {
    if (!storedUser._id || storedUser.role !== 'super_admin') {
      alert('Access Denied: Exclusive Global Super Admin privileges required.');
      navigate(storedUser.role === 'admin' ? '/campus-admin' : '/dashboard');
    } else {
      loadAllPortalData();
    }
  }, [activeTab]);

  useEffect(() => {
    let timer;
    if (autoRefresh) {
      timer = setInterval(() => {
        loadKpisAndHealth();
      }, 15000);
    }
    return () => clearInterval(timer);
  }, [autoRefresh]);

  const loadAllPortalData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadKpisAndHealth(),
        fetchUsers(),
        fetchVehicles(),
        fetchBookings(),
        fetchFinance(),
        fetchTickets(),
        fetchNotifications(),
        fetchCms(),
        fetchSettings(),
        fetchAi(),
        fetchBackups(),
        fetchAuditLogs(),
        fetchRoleMatrix(),
        fetchTenants()
      ]);
    } catch (err) {
      console.error('Error loading admin portal data:', err);
    }
    setLoading(false);
  };

  const loadKpisAndHealth = async () => {
    try {
      const [kpiRes, healthRes] = await Promise.all([
        axios.get('http://localhost:5000/api/superadmin/kpis'),
        axios.get('http://localhost:5000/api/superadmin/system/health')
      ]);
      setKpis(kpiRes.data);
      setServerHealth(healthRes.data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    const res = await axios.get('http://localhost:5000/api/superadmin/users');
    setUsers(res.data);
  };

  const fetchVehicles = async () => {
    const res = await axios.get('http://localhost:5000/api/vehicles');
    setVehicles(res.data);
  };

  const fetchBookings = async () => {
    const res = await axios.get('http://localhost:5000/api/admin/bookings');
    setBookings(res.data);
  };

  const fetchFinance = async () => {
    const res = await axios.get('http://localhost:5000/api/admin/finance');
    setFinance(res.data);
  };

  const fetchTickets = async () => {
    const res = await axios.get('http://localhost:5000/api/superadmin/tickets');
    setTickets(res.data);
  };

  const fetchNotifications = async () => {
    const res = await axios.get('http://localhost:5000/api/superadmin/notifications');
    setNotifications(res.data);
  };

  const fetchCms = async () => {
    const res = await axios.get('http://localhost:5000/api/superadmin/cms');
    setCmsList(res.data);
  };

  const fetchSettings = async () => {
    const res = await axios.get('http://localhost:5000/api/superadmin/settings');
    setSettings(res.data);
  };

  const fetchAi = async () => {
    const res = await axios.get('http://localhost:5000/api/superadmin/ai');
    setAiData(res.data);
  };

  const fetchBackups = async () => {
    const res = await axios.get('http://localhost:5000/api/superadmin/database/backups');
    setBackups(res.data);
  };

  const fetchAuditLogs = async () => {
    const res = await axios.get('http://localhost:5000/api/superadmin/audit-logs');
    setAuditLogs(res.data);
  };

  const fetchRoleMatrix = async () => {
    const res = await axios.get('http://localhost:5000/api/superadmin/roles/matrix');
    setRoleMatrix(res.data);
  };

  const fetchTenants = async () => {
    const res = await axios.get('http://localhost:5000/api/auth/institutions');
    setTenants(res.data);
  };

  // Actions
  const handleUserStatus = async (userId, status, reason = '') => {
    try {
      await axios.put(`http://localhost:5000/api/superadmin/users/${userId}/status`, { status, reason });
      alert(`User account status set to ${status}.`);
      fetchUsers();
    } catch (err) { alert('Failed to update user status.'); }
  };

  const handleResetPassword = async (userId) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/superadmin/users/${userId}/reset-password`, {});
      alert(res.data.message);
    } catch (err) { alert('Failed to reset password.'); }
  };

  const handleBulkUserAction = async (action, value) => {
    if (selectedUserIds.length === 0) return alert('Select users first.');
    try {
      await axios.post('http://localhost:5000/api/superadmin/users/bulk', { userIds: selectedUserIds, action, value });
      alert('Bulk action completed.');
      setSelectedUserIds([]);
      fetchUsers();
    } catch (err) { alert('Failed bulk operation.'); }
  };

  const handleVerifyKyc = async (userId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/kyc`, { status, rejectedReason: rejectionReason });
      alert(`KYC set to ${status}`);
      setSelectedKycUser(null);
      fetchUsers();
    } catch (err) { alert('KYC update failed.'); }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/superadmin/admins/create', newAdmin);
      alert(res.data.message || 'Admin account created successfully!');
      setNewAdmin({ fullName: '', username: '', email: '', password: '', role: 'admin', institutionId: 'IGNTU' });
      fetchUsers();
    } catch (err) { alert(err.response?.data?.error || 'Failed to create admin.'); }
  };

  const handleDeleteAdmin = async (userId, adminName) => {
    if (!window.confirm(`Are you sure you want to delete administrative account "${adminName}"?`)) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/superadmin/admins/${userId}`);
      alert(res.data.message || 'Admin account deleted.');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete admin account.');
    }
  };

  const handleBroadcastNotice = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/superadmin/notifications', newNotice);
      alert('Broadcast notification sent successfully!');
      setNewNotice({ title: '', message: '', targetType: 'broadcast', targetValue: 'all', channel: 'in_app' });
      fetchNotifications();
    } catch (err) { alert('Failed to send notification.'); }
  };

  const handleSaveCms = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/superadmin/cms', selectedCms);
      alert('CMS content updated!');
      setSelectedCms(null);
      fetchCms();
    } catch (err) { alert('Failed to save CMS content.'); }
  };

  const handleUpdateSetting = async (key, value) => {
    try {
      await axios.post('http://localhost:5000/api/superadmin/settings', { key, value });
      alert(`Setting ${key} updated.`);
      fetchSettings();
    } catch (err) { alert('Failed setting update.'); }
  };

  const handleCreateBackup = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/superadmin/database/backup');
      alert(res.data.message);
      fetchBackups();
    } catch (err) { alert('Backup generation failed.'); }
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

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchSearch = (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (u.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus = statusFilter === 'ALL' || (u.accountStatus || 'active') === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const bgStyle = darkMode ? '#0F172A' : '#F8FAFC';
  const textStyle = darkMode ? '#F8FAFC' : '#0F172A';
  const cardBg = darkMode ? '#1E293B' : '#FFFFFF';
  const cardBorder = darkMode ? '1px solid #334155' : '1px solid #E2E8F0';

  return (
    <div style={{ backgroundColor: bgStyle, color: textStyle, minHeight: '100vh' }}>
      
      {/* Upper Navigation Header Bar */}
      <div style={{ backgroundColor: '#0F172A', color: 'white', padding: '14px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          
          {/* Brand Logo & Title */}
          <div className="d-flex align-items-center gap-2">
            <i className="fa-solid fa-crown text-warning fs-3"></i>
            <div className="d-flex flex-column text-start me-3">
              <span style={{ fontSize: '1.1rem', lineHeight: '1.2', color: 'white', fontWeight: '900', letterSpacing: '0.5px' }}>Super Admin Control Portal</span>
              <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: '600' }}>VehicleRentX Enterprise Multi-Tenant Engine</span>
            </div>
          </div>

          {/* Quick Search & Auto Refresh */}
          <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: '350px' }}>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-dark border-secondary text-white-50"><i className="fa-solid fa-search"></i></span>
              <input type="text" className="form-control bg-dark text-white border-secondary" placeholder="Global search users, bookings, VINs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>

          {/* Controls & Nav Actions */}
          <div className="d-flex align-items-center gap-2">
            <button className={`btn btn-sm ${autoRefresh ? 'btn-success' : 'btn-outline-secondary'} rounded-pill px-3`} onClick={() => setAutoRefresh(!autoRefresh)}>
              <i className="fa-solid fa-sync me-1"></i> Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}
            </button>
            <button className="btn btn-sm btn-outline-light rounded-circle p-2" onClick={() => setDarkMode(!darkMode)} title="Toggle Dark Mode">
              <i className={`fa-solid ${darkMode ? 'fa-sun text-warning' : 'fa-moon'}`}></i>
            </button>
            <button className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold" onClick={() => navigate('/dashboard')}>
              <i className="fa-solid fa-arrow-left me-1"></i> Exit Portal
            </button>
          </div>

        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="d-flex align-items-center gap-1 flex-wrap mt-3 pt-2 border-top border-secondary border-opacity-25">
          {[
            { id: 'overview', icon: 'fa-gauge-high', label: 'Overview KPIs' },
            { id: 'users', icon: 'fa-users-gear', label: 'User Administration' },
            { id: 'roles', icon: 'fa-shield-halved', label: 'Role & Permissions' },
            { id: 'admins', icon: 'fa-user-tie', label: 'Admin Accounts' },
            { id: 'fleet', icon: 'fa-motorcycle', label: 'Fleet & Approvals' },
            { id: 'bookings', icon: 'fa-calendar-check', label: 'Booking Operations' },
            { id: 'tickets', icon: 'fa-headset', label: 'Support & Tickets' },
            { id: 'notifications', icon: 'fa-bullhorn', label: 'Notifications' },
            { id: 'settings', icon: 'fa-sliders', label: 'System Config' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`btn btn-sm px-3 py-1 rounded-pill d-flex align-items-center gap-2 transition-all fw-semibold ${activeTab === tab.id ? 'btn-primary text-white shadow' : 'btn-outline-light border-0 text-white-50'}`}
              onClick={() => setActiveTab(tab.id)}>
              <i className={`fa-solid ${tab.icon}`} style={{ fontSize: '0.85rem' }}></i>
              <span style={{ fontSize: '0.8rem' }}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="p-4">
        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="mt-3 fw-bold text-muted">Auditing VehicleRentX Enterprise Database...</p>
          </div>
        ) : (
          <>

            {/* TAB 1: EXECUTIVE KPI OVERVIEW */}
            {activeTab === 'overview' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold m-0"><i className="fa-solid fa-chart-line text-primary me-2"></i>Executive Platform KPIs</h4>
                  <button className="btn btn-sm btn-outline-dark rounded-pill px-3" onClick={loadAllPortalData}>
                    <i className="fa-solid fa-rotate me-1"></i> Refresh Live Feed
                  </button>
                </div>

                <div className="row g-3 mb-4">
                  {[
                    { title: 'Total Registered Users', val: kpis.totalUsers || 0, icon: 'fa-users', color: 'primary' },
                    { title: 'Active Accounts', val: kpis.activeUsers || 0, icon: 'fa-user-check', color: 'success' },
                    { title: 'Suspended / Banned', val: kpis.suspendedUsers || 0, icon: 'fa-user-slash', color: 'danger' },
                    { title: 'Vehicle Owners / Partners', val: kpis.totalOwners || 0, icon: 'fa-handshake', color: 'info' },
                    { title: 'Total Fleet Vehicles', val: kpis.totalVehicles || 0, icon: 'fa-motorcycle', color: 'dark' },
                    { title: 'Available Fleet', val: kpis.availableVehicles || 0, icon: 'fa-circle-check', color: 'success' },
                    { title: 'Active Booking Rides', val: kpis.activeBookings || 0, icon: 'fa-key', color: 'warning' },
                    { title: 'Completed Trips', val: kpis.completedBookings || 0, icon: 'fa-flag-checkered', color: 'primary' },
                    { title: "Today's Total Revenue", val: `₹${kpis.todayRevenue || 0}`, icon: 'fa-money-bill-wave', color: 'success' },
                    { title: 'Monthly Revenue', val: `₹${kpis.monthlyRevenue || 0}`, icon: 'fa-chart-simple', color: 'info' },
                    { title: 'Platform Wallet Balance', val: `₹${(kpis.platformWalletBalance || 0).toLocaleString()}`, icon: 'fa-wallet', color: 'purple' },
                    { title: 'Pending KYC Requests', val: kpis.pendingKycRequests || 0, icon: 'fa-id-card', color: 'warning' }
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

                {/* System Status Banner */}
                <div className="p-4 rounded-4 shadow-sm bg-primary bg-opacity-10 border border-primary border-opacity-25 d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <i className="fa-solid fa-server fs-1 text-primary"></i>
                    <div>
                      <h5 className="fw-bold m-0 text-primary">System Operations: {kpis.systemHealth}</h5>
                      <span className="small text-muted">Tomcat 10.1.34 / MySQL 8.0 (Port 3307) / HikariCP Pool Active</span>
                    </div>
                  </div>
                  <button className="btn btn-primary rounded-pill px-4 fw-bold" onClick={() => setActiveTab('health')}>View Full Server Telemetry</button>
                </div>
              </div>
            )}

            {/* TAB 2: USER ADMINISTRATION */}
            {activeTab === 'users' && (
              <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                  <div>
                    <h4 className="fw-bold m-0"><i className="fa-solid fa-users-gear text-primary me-2"></i>User Administration & Accounts</h4>
                    <span className="small text-muted">Manage roles, KYC status, suspensions, and password resets</span>
                  </div>
                  
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <select className="form-select form-select-sm" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                      <option value="ALL">All Roles</option>
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>

                    <select className="form-select form-select-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                      <option value="ALL">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>

                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleBulkUserAction('status', 'suspended')}>Bulk Suspend</button>
                    <button className="btn btn-sm btn-outline-success" onClick={() => handleBulkUserAction('status', 'active')}>Bulk Activate</button>
                    <button className="btn btn-sm btn-success" onClick={() => exportToCsv('users_export.csv', filteredUsers)}>Export CSV</button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>
                          <input type="checkbox" onChange={e => setSelectedUserIds(e.target.checked ? filteredUsers.map(u => u._id) : [])} />
                        </th>
                        <th>User Profile</th>
                        <th>Institution</th>
                        <th>Role</th>
                        <th>Wallet</th>
                        <th>Trust</th>
                        <th>KYC</th>
                        <th>Account Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u._id}>
                          <td>
                            <input type="checkbox" checked={selectedUserIds.includes(u._id)} onChange={e => setSelectedUserIds(e.target.checked ? [...selectedUserIds, u._id] : selectedUserIds.filter(id => id !== u._id))} />
                          </td>
                          <td>
                            <div className="fw-bold">{u.fullName}</div>
                            <small className="text-muted">{u.email} | {u.mobile}</small>
                          </td>
                          <td><span className="badge bg-light text-dark">{u.institutionId}</span></td>
                          <td><span className="badge bg-primary bg-opacity-10 text-primary fw-bold">{u.role}</span></td>
                          <td className="fw-bold">₹{u.walletBalance}</td>
                          <td className="fw-bold text-info">{u.trustScore}</td>
                          <td>
                            <span className={`badge ${u.kycStatus === 'approved' ? 'bg-success' : u.kycStatus === 'pending' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                              {u.kycStatus}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${u.accountStatus === 'suspended' ? 'bg-danger' : 'bg-success'}`}>
                              {u.accountStatus || 'active'}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              {u.accountStatus === 'suspended' ? (
                                <button className="btn btn-outline-success" title="Reactivate" onClick={() => handleUserStatus(u._id, 'active')}>Reactivate</button>
                              ) : (
                                <button className="btn btn-outline-warning" title="Suspend" onClick={() => handleUserStatus(u._id, 'suspended', 'Admin Action')}>Suspend</button>
                              )}
                              <button className="btn btn-outline-dark" title="Reset Password" onClick={() => handleResetPassword(u._id)}>Key</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: ROLE & PERMISSION MATRIX */}
            {activeTab === 'roles' && (
              <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                <h4 className="fw-bold mb-3"><i className="fa-solid fa-shield-halved text-success me-2"></i>Role-Based Access Control (RBAC) Permission Matrix</h4>
                <p className="text-muted small">Permissions are strictly enforced across backend API annotations and frontend router guards.</p>

                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>System Module</th>
                        <th className="text-center">Super Admin</th>
                        <th className="text-center">Campus Admin</th>
                        <th className="text-center">Vehicle Owner</th>
                        <th className="text-center">Student / User</th>
                        <th className="text-center">Support Staff</th>
                        <th className="text-center">Finance Staff</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roleMatrix.map((row, idx) => (
                        <tr key={idx}>
                          <td className="fw-bold">{row.module}</td>
                          <td className="text-center">{row.super_admin ? <i className="fa-solid fa-check text-success fs-5"></i> : <i className="fa-solid fa-xmark text-danger"></i>}</td>
                          <td className="text-center">{row.admin ? <i className="fa-solid fa-check text-success fs-5"></i> : <i className="fa-solid fa-xmark text-danger"></i>}</td>
                          <td className="text-center">{row.owner ? <i className="fa-solid fa-check text-success fs-5"></i> : <i className="fa-solid fa-xmark text-danger"></i>}</td>
                          <td className="text-center">{row.student ? <i className="fa-solid fa-check text-success fs-5"></i> : <i className="fa-solid fa-xmark text-danger"></i>}</td>
                          <td className="text-center">{row.support ? <i className="fa-solid fa-check text-success fs-5"></i> : <i className="fa-solid fa-xmark text-danger"></i>}</td>
                          <td className="text-center">{row.finance ? <i className="fa-solid fa-check text-success fs-5"></i> : <i className="fa-solid fa-xmark text-danger"></i>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: ADMIN MANAGEMENT */}
            {activeTab === 'admins' && (
              <div className="row g-4">
                <div className="col-md-5">
                  <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                    <h5 className="fw-bold mb-3"><i className="fa-solid fa-user-plus text-primary me-2"></i>Deploy New Admin Account</h5>
                    <form onSubmit={handleCreateAdmin}>
                      <div className="mb-2">
                        <label className="form-label small fw-bold">FULL NAME</label>
                        <input type="text" required className="form-control" placeholder="Dr. Admin Name" value={newAdmin.fullName} onChange={e => setNewAdmin({...newAdmin, fullName: e.target.value})} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small fw-bold">USERNAME</label>
                        <input type="text" required className="form-control" placeholder="admin_igntu" value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small fw-bold">EMAIL ADDRESS (ANY NORMAL EMAIL)</label>
                        <input type="email" required className="form-control" placeholder="e.g. admin@gmail.com or name@yahoo.com" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small fw-bold">PASSWORD</label>
                        <input type="password" required className="form-control" placeholder="••••••••" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-bold">ASSIGN INSTITUTION</label>
                        <select className="form-select" value={newAdmin.institutionId} onChange={e => setNewAdmin({...newAdmin, institutionId: e.target.value})}>
                          {tenants.map(t => <option key={t.code} value={t.code}>{t.name} ({t.code})</option>)}
                        </select>
                      </div>
                      <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold">Deploy Admin Account</button>
                    </form>
                  </div>
                </div>

                <div className="col-md-7">
                  <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                    <h5 className="fw-bold mb-3"><i className="fa-solid fa-user-shield me-2 text-primary"></i>Active Administrative Officers</h5>
                    <div className="table-responsive">
                      <table className="table align-middle">
                        <thead>
                          <tr>
                            <th>Admin Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Campus</th>
                            <th className="text-end">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.filter(u => u.role === 'admin' || u.role === 'super_admin').map(a => (
                            <tr key={a._id}>
                              <td className="fw-bold">{a.fullName}</td>
                              <td>{a.email}</td>
                              <td><span className="badge bg-warning text-dark">{a.role}</span></td>
                              <td><span className="badge bg-light text-dark">{a.institutionId}</span></td>
                              <td className="text-end">
                                {a.role !== 'super_admin' && (
                                  <button
                                    className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                    onClick={() => handleDeleteAdmin(a._id, a.fullName)}>
                                    <i className="fa-solid fa-trash me-1"></i> Delete
                                  </button>
                                )}
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

            {/* TAB 8: SUPPORT & COMPLAINTS */}
            {activeTab === 'tickets' && (
              <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                <h4 className="fw-bold mb-4"><i className="fa-solid fa-headset text-primary me-2"></i>Support Tickets & Complaint Resolution</h4>
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
                        <th>Actions</th>
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
                            <button className="btn btn-sm btn-outline-success" onClick={() => {
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

            {/* TAB 10: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="row g-4">
                <div className="col-md-5">
                  <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                    <h5 className="fw-bold mb-3"><i className="fa-solid fa-bullhorn me-2 text-primary"></i>Broadcast Platform Notification</h5>
                    <form onSubmit={handleBroadcastNotice}>
                      <div className="mb-2">
                        <label className="form-label small fw-bold">TITLE</label>
                        <input type="text" required className="form-control" placeholder="Emergency Notice" value={newNotice.title} onChange={e => setNewNotice({...newNotice, title: e.target.value})} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label small fw-bold">MESSAGE</label>
                        <textarea required className="form-control" rows="3" placeholder="Message content..." value={newNotice.message} onChange={e => setNewNotice({...newNotice, message: e.target.value})}></textarea>
                      </div>
                      <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold">Send Notification</button>
                    </form>
                  </div>
                </div>

                <div className="col-md-7">
                  <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                    <h5 className="fw-bold mb-3"><i className="fa-solid fa-clock-rotate-left me-2 text-primary"></i>Notification Delivery History</h5>
                    <div className="table-responsive">
                      <table className="table align-middle">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Message</th>
                            <th>Sent At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {notifications.map(n => (
                            <tr key={n.id}>
                              <td className="fw-bold">{n.title}</td>
                              <td>{n.message}</td>
                              <td className="small text-muted">{n.sentAt}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 12: CMS MANAGER */}
            {activeTab === 'cms' && (
              <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                <h4 className="fw-bold mb-4"><i className="fa-solid fa-file-lines text-primary me-2"></i>Content Management System (CMS)</h4>
                <div className="row g-4">
                  <div className="col-md-4">
                    <div className="list-group">
                      {cmsList.map(c => (
                        <button key={c.id} className={`list-group-item list-group-item-action ${selectedCms?.id === c.id ? 'active' : ''}`} onClick={() => setSelectedCms(c)}>
                          <div className="fw-bold">{c.title}</div>
                          <small>/{c.slug} (v{c.version})</small>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="col-md-8">
                    {selectedCms ? (
                      <form onSubmit={handleSaveCms}>
                        <h5 className="fw-bold mb-3">Editing {selectedCms.title} (/{selectedCms.slug})</h5>
                        <div className="mb-3">
                          <label className="form-label small fw-bold">HTML CONTENT</label>
                          <textarea className="form-control font-monospace" rows="10" value={selectedCms.contentHtml} onChange={e => setSelectedCms({...selectedCms, contentHtml: e.target.value})}></textarea>
                        </div>
                        <button type="submit" className="btn btn-success rounded-pill px-4 fw-bold">Save & Publish Version {selectedCms.version + 1}</button>
                      </form>
                    ) : <p className="text-muted">Select a page from the left list to edit content.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 13: SYSTEM CONFIG */}
            {activeTab === 'settings' && (
              <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                <h4 className="fw-bold mb-4"><i className="fa-solid fa-sliders text-primary me-2"></i>Centralized System Configurations</h4>
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Setting Key</th>
                        <th>Category</th>
                        <th>Current Value</th>
                        <th>Description</th>
                        <th>Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settings.map(s => (
                        <tr key={s.id}>
                          <td className="fw-bold font-monospace">{s.settingKey}</td>
                          <td><span className="badge bg-light text-dark">{s.category}</span></td>
                          <td>
                            <input type="text" className="form-control form-control-sm" defaultValue={s.settingValue} id={`setting_${s.id}`} />
                          </td>
                          <td className="small text-muted">{s.description}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => {
                              const val = document.getElementById(`setting_${s.id}`).value;
                              handleUpdateSetting(s.settingKey, val);
                            }}>Save</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 15: AI FRAUD MONITORING */}
            {activeTab === 'ai' && (
              <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                <h4 className="fw-bold mb-4"><i className="fa-solid fa-brain text-purple me-2"></i>AI Fraud Detection & Demand Predictor</h4>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="p-3 bg-danger bg-opacity-10 border border-danger border-opacity-25 rounded-4">
                      <h6 className="fw-bold text-danger"><i className="fa-solid fa-triangle-exclamation me-2"></i>AI Flagged Suspicious Accounts ({aiData.fraudFlags.length})</h6>
                      {aiData.fraudFlags.map(f => (
                        <div key={f.id} className="p-3 bg-white rounded-3 shadow-sm mb-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold text-dark">{f.entityId} ({f.riskCategory})</span>
                            <span className="badge bg-danger">Risk Score: {f.riskScore}%</span>
                          </div>
                          <p className="small text-muted mb-0 mt-1">{f.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-4">
                      <h6 className="fw-bold text-primary"><i className="fa-solid fa-wand-magic-sparkles me-2"></i>Demand Forecasting Insights</h6>
                      {aiData.demandForecast && (
                        <ul className="list-unstyled mb-0">
                          <li className="mb-2"><strong>Peak Booking Hours:</strong> {aiData.demandForecast.peakHours}</li>
                          <li className="mb-2"><strong>Demand Increase:</strong> {aiData.demandForecast.predictedDemandIncrease}</li>
                          <li className="mb-2"><strong>Fleet Recommendation:</strong> {aiData.demandForecast.recommendedFleetRebalance}</li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 16: DATABASE & BACKUPS */}
            {activeTab === 'database' && (
              <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold m-0"><i className="fa-solid fa-database text-primary me-2"></i>MySQL Database Backups & Maintenance</h4>
                  <button className="btn btn-success rounded-pill px-4 fw-bold text-white" onClick={handleCreateBackup}>
                    <i className="fa-solid fa-download me-1"></i> Generate Manual Backup
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Backup File</th>
                        <th>Size (Bytes)</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Generated At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backups.map(b => (
                        <tr key={b.id}>
                          <td className="fw-bold font-monospace">{b.backupFileName}</td>
                          <td>{b.fileSizeBytes} B</td>
                          <td><span className="badge bg-info">{b.backupType}</span></td>
                          <td><span className="badge bg-success">{b.status}</span></td>
                          <td>{b.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 17: SERVER HEALTH */}
            {activeTab === 'health' && (
              <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                <h4 className="fw-bold mb-4"><i className="fa-solid fa-server text-primary me-2"></i>Real-Time Server Health & System Metrics</h4>
                <div className="row g-4">
                  <div className="col-md-3">
                    <div className="p-3 bg-light rounded-4 border text-center">
                      <span className="small text-muted fw-bold d-block">SERVER STATUS</span>
                      <h3 className="fw-bold text-success mt-1">{serverHealth.status}</h3>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 bg-light rounded-4 border text-center">
                      <span className="small text-muted fw-bold d-block">JVM UPTIME</span>
                      <h3 className="fw-bold text-primary mt-1">{serverHealth.jvmUptimeMinutes} Mins</h3>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 bg-light rounded-4 border text-center">
                      <span className="small text-muted fw-bold d-block">MEMORY USED</span>
                      <h3 className="fw-bold text-info mt-1">{serverHealth.memoryUsedMb} MB</h3>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="p-3 bg-light rounded-4 border text-center">
                      <span className="small text-muted fw-bold d-block">API LATENCY</span>
                      <h3 className="fw-bold text-warning mt-1">{serverHealth.apiLatencyMs} ms</h3>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 14: SECURITY & AUDIT TRAIL */}
            {activeTab === 'security' && (
              <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: cardBg, border: cardBorder }}>
                <h4 className="fw-bold mb-4"><i className="fa-solid fa-user-shield text-danger me-2"></i>Audit Logs & Security Trail</h4>
                <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  <table className="table table-striped align-middle">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Actor Username</th>
                        <th>Role</th>
                        <th>Action</th>
                        <th>Target Module</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map(l => (
                        <tr key={l.id}>
                          <td className="small text-muted">{l.timestamp}</td>
                          <td className="fw-bold">{l.actorUsername}</td>
                          <td><span className="badge bg-warning text-dark">{l.actorRole}</span></td>
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

          </>
        )}

      </div>
    </div>
  );
};

export default SuperAdminPortal;
