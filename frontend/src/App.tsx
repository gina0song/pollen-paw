import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import LogSymptoms from './pages/LogSymptoms';
import Analysis from './pages/Analysis';
import AIInsights from './pages/AIInsights';
import PetProfile from './pages/PetProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import { authService } from './services/authService';
import './App.css';


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

/**
 * Main App Component
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes (wrapped in Layout) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/log-symptoms"
          element={
            <ProtectedRoute>
              <Layout>
                <LogSymptoms />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analysis"
          element={
            <ProtectedRoute>
              <Layout>
                <Analysis />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-insights"
          element={
            <ProtectedRoute>
              <Layout>
                <AIInsights />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pet-profile"
          element={
            <ProtectedRoute>
              <Layout>
                <PetProfile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
