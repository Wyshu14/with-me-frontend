import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import FamilyMembers from './pages/FamilyMembers';
import GuardianDashboard from './pages/GuardianDashboard';
import DoctorRecords from './pages/DoctorRecords';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/members" element={<FamilyMembers />} />
        <Route path="/dashboard" element={<GuardianDashboard />} />
        <Route path="/doctor/:id" element={<DoctorRecords />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;