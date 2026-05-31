import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard'; // Farmer Dashboard
import AdminConsultantManager from './pages/AdminConsultantManager'; // Admin Content

// Layouts & Components
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { getAuthToken, removeAuthToken } from './services/api';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || '');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth State
  useEffect(() => {
    const token = getAuthToken();
    const storedRole = localStorage.getItem('role');
    const storedEmail = localStorage.getItem('userEmail');
    
    if (token) {
      setIsLoggedIn(true);
      setRole(storedRole);
      if (storedEmail) setUserEmail(storedEmail);
    }
    setIsLoading(false);
  }, []);

  // --- Handlers ---
  const handleLogin = (email: string) => { 
    const userRole = localStorage.getItem('role');
    localStorage.setItem('userEmail', email);
    
    setRole(userRole);
    setUserEmail(email);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    removeAuthToken();
    localStorage.clear();
    setIsLoggedIn(false);
    setRole(null);
    setUserEmail('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        
        {/* --- PUBLIC ROUTES --- */}
        <Route 
          path="/login" 
          element={
            isLoggedIn ? (
              // If logged in, redirect based on role
              role === 'admin' ? <Navigate to="/admin/consultants" replace /> : <Navigate to="/" replace />
            ) : (
              <Login onLogin={handleLogin} onShowRegister={() => window.location.href = '/register'} />
            )
          } 
        />
        
        <Route 
          path="/register" 
          element={
            isLoggedIn ? <Navigate to="/" replace /> : (
              <Register onRegister={handleLogin} onBackToLogin={() => window.location.href = '/login'} />
            )
          } 
        />

        {/* --- 🛡️ ADMIN PANEL (Strictly Isolated) --- */}
        <Route 
          path="/admin/consultants" 
          element={
            isLoggedIn && role === 'admin' ? (
              <AdminLayout onLogout={handleLogout}>
                <AdminConsultantManager />
              </AdminLayout>
            ) : (
              // If not admin, kick them out
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* --- 🚜 FARMER DASHBOARD --- */}
        <Route 
          path="/*" 
          element={
            isLoggedIn ? (
              role === 'admin' ? (
                // If Admin tries to access Farmer Dashboard, force them back to Admin Panel
                <Navigate to="/admin/consultants" replace />
              ) : (
                // If Farmer, show Dashboard
                <ProtectedRoute onUnauthorized={handleLogout}>
                  <Dashboard email={userEmail} onLogout={handleLogout} />
                </ProtectedRoute>
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

      </Routes>
    </Router>
  );
}