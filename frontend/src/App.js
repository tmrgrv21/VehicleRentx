import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import SuperAdminPortal from './components/SuperAdminPortal';
import InstitutionAdminPortal from './components/InstitutionAdminPortal';
import Login from './components/Login';
import Register from './components/Register';
import ProfilePage from './components/ProfilePage';
import MyRides from './components/MyRides';
import WalletPage from './components/WalletPage';
import LegalPolicyPage from './components/LegalPolicyPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/profile" element={<ProfilePage />} />
          <Route path="/dashboard/rides" element={<MyRides />} />
          <Route path="/dashboard/wallet" element={<WalletPage />} />
          <Route path="/admin" element={<SuperAdminPortal />} />
          <Route path="/campus-admin" element={<InstitutionAdminPortal />} />
          <Route path="/institution-admin" element={<InstitutionAdminPortal />} />
          
          <Route path="/privacy" element={<LegalPolicyPage defaultTab="privacy" />} />
          <Route path="/terms" element={<LegalPolicyPage defaultTab="terms" />} />
          <Route path="/cookies" element={<LegalPolicyPage defaultTab="cookies" />} />
          <Route path="/refund" element={<LegalPolicyPage defaultTab="refund" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;