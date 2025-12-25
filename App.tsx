
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Finance from './components/Finance';
import Inventory from './components/Inventory';
import WorkCalendar from './components/WorkCalendar';
import JobIntake from './components/JobIntake';
import Login from './components/Login';
import Settings from './components/Settings';
import CompanyProfilePage from './components/CompanyProfile';
import PricingCalculator from './components/PricingCalculator';

const AppContent = () => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/calculator" element={<PricingCalculator />} />
          <Route path="/calendar" element={<WorkCalendar />} />
          <Route path="/intake" element={<JobIntake />} />
          <Route path="/company" element={<CompanyProfilePage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
