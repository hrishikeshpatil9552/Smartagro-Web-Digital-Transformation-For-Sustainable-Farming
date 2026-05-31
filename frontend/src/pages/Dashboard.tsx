import React, { useState } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { Leaf, LogOut, Menu, User, Bell } from 'lucide-react';
import Profile from './Profile';

// Import Pages
import { Home } from './Home';
import { About } from './About';
import { Blog } from './Blog';
import { Contact } from './Contact';
import { WeatherSimple } from '../features/WeatherSimple';
import { MarketInformation } from '../features/MarketInformation';
import { DiseaseDetection } from '../features/DiseaseDetection';
import { Services } from '../features/Services';
import { Crops } from '../features/Crops';
import { CropRecommendation } from '../features/CropRecommendation';
import { AgriGyaan } from '../features/AgriGyaan';
import UserConsultants from './UserConsultants';
import AdminAddConsultant from './adminConsultant';
import Chatbot from './Chatbot';
import GovernmentSchemeFormMerged from "./SchemeForm";
import ExplanationPage from "./ExplainationPage";

interface DashboardProps {
  email: string;
  onLogout: () => void;
}

export function Dashboard({ email, onLogout }: DashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleBackToDashboard = (serviceId?: number) => {
    navigate('/');
    if (serviceId) {
      setTimeout(() => {
        const element = document.getElementById(`service-${serviceId}`);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleServiceNavigation = (serviceId: number) => {
    const servicePages: Record<number, string> = {
      1: '/weather',
      2: '/market',
      3: '/government',
      4: '/crop-recommendation',
      5: '/disease-detection',
      6: '/ai-consultant',
      7: '/crop-info',
      8: '/agrigyaan'
    };
    navigate(servicePages[serviceId] || '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChatbot = () => {
    navigate('/chatbot');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getInitials = (email: string) => {
    const name = email.split('@')[0];
    const parts = name.split(/[._-]/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };
  const initials = getInitials(email);

  const navItems = [
    { path: '/', label: '🏠 Home' },
    { path: '/about', label: '🌿 About' },
    { path: '/crops', label: '🌾 Crops' },
    { path: '/blog', label: '📘 Blog' },
    { path: '/contact', label: '📞 Contact' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">

      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* Left: Mobile menu + Logo */}
            <div className="flex items-center space-x-3">
              {/* Mobile Menu */}
              <div
                className="relative md:hidden"
                onMouseEnter={() => setShowMobileMenu(true)}
                onMouseLeave={() => setShowMobileMenu(false)}
              >
                <button className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors">
                  <Menu className="w-5 h-5" />
                </button>
                {showMobileMenu && (
                  <div className="absolute left-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    {navItems.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => { navigate(item.path); setShowMobileMenu(false); window.scrollTo(0, 0); }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${isActive(item.path) ? 'text-green-600 font-medium' : 'text-gray-700'}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Logo */}
              <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                <h1 className="text-2xl font-bold tracking-tight">
                  <span className="text-green-600">SmartAgro</span> <span className="text-orange-500">Web</span>
                  <span className="relative inline-block text-orange-500">
                    <span className="relative">
                      <Leaf className="w-2 h-2 text-green-600 absolute -top-0.5 left-1/2 -translate-x-1/2" style={{ strokeWidth: 2.5 }} />
                      <span className="opacity-0">i</span>
                    </span>
                    <span className="absolute left-0 top-0"></span>
                  </span>
                </h1>
              </div>
            </div>

            {/* Center: Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); window.scrollTo(0, 0); }}
                  className={`transition-colors ${isActive(item.path) ? 'text-green-600 font-bold' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right: Bell + Profile */}
            <div className="flex items-center gap-3">

              {/* Notification Bell */}
              <div className="relative">
                <button className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              </div>

              {/* Profile Avatar + Dropdown */}
              <div className="relative" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
                <button className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors">
                  {initials}
                </button>
                {showDropdown && (
                  <div className="absolute right-0 top-10 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{email}</p>
                    </div>
                    <button
                      onClick={() => { setShowDropdown(false); navigate('/profile'); window.scrollTo(0, 0); }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <User className="w-4 h-4" />
                      <span>View Profile</span>
                    </button>
                    <button
                      onClick={() => { setShowDropdown(false); onLogout(); }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Routes>
          <Route path="/" element={<Home email={email} onLogout={onLogout} onServiceClick={handleServiceNavigation} onAddConsultant={() => navigate('/add-consultant')} onChatbot={handleChatbot} />} />
          <Route path="/about" element={<About />} />
          <Route path="/crops" element={<Crops />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services onServiceClick={handleServiceNavigation} onAddConsultant={() => navigate('/add-consultant')} />} />
          <Route path="/weather" element={<WeatherSimple onBack={() => handleBackToDashboard(1)} />} />
          <Route path="/market" element={<MarketInformation onBack={() => handleBackToDashboard(2)} />} />
          <Route path="/government" element={<GovernmentSchemeFormMerged onBack={() => handleBackToDashboard(3)} />} />
          <Route path="/explain/:matchId" element={<ExplanationPage />} />
          <Route path="/crop-recommendation" element={<CropRecommendation onBack={() => handleBackToDashboard(4)} />} />
          <Route path="/disease-detection" element={<DiseaseDetection onBack={() => handleBackToDashboard(5)} />} />
          <Route path="/ai-consultant" element={<UserConsultants onBack={() => handleBackToDashboard(6)} />} />
          <Route path="/add-consultant" element={<AdminAddConsultant onBack={() => handleBackToDashboard(6)} />} />
          <Route path="/agrigyaan" element={<AgriGyaan onBack={() => handleBackToDashboard(8)} />} />
          <Route path="/chatbot" element={<Chatbot onBack={() => handleBackToDashboard(6)} />} />
          <Route path="/profile" element={<Profile onLogout={onLogout} />} />
          <Route path="/crop-info" element={
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon!</h2>
              <button onClick={() => navigate('/')} className="text-green-600 underline">Back to Home</button>
            </div>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">© 2025 SmartAgro Web. All rights reserved.</p>
            <p className="text-sm text-gray-500">Empowering farmers with technology and knowledge</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
