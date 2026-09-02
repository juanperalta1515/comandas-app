import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DbProvider } from './context/DbContext';
import LandingPage from './pages/LandingPage';
import ClientMenu from './pages/ClientMenu';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdmin from './pages/SuperAdmin';

function App() {
  return (
    <DbProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/menu" element={<Navigate to="/menu/quincho" replace />} />
          <Route path="/menu/:restaurantId" element={<ClientMenu />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/master-control" element={<SuperAdmin />} />
          <Route path="/superadmin" element={<Navigate to="/master-control" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </DbProvider>
  );
}

export default App;
