import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, CloudSun, TrendingUp, Building2, Sprout, Bug, Users,
  Calendar, BookOpen, CheckCircle2, MapPin, UserPlus, Loader2, RefreshCw, Lock, KeyRound
} from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { profileAPI } from '../services/api';
// OpenAI-powered dashboard insights (weather, market, crops) via /api/dashboard/farmer-insights
// Gemini API remains untouched for all 8 feature cards below

interface HomeProps {
  email: string;
  onLogout: () => void;
  onServiceClick: (serviceId: number) => void;
  onAddConsultant?: () => void;
  onChatbot?: () => void;
}

// Agriculture gallery images
const galleryImages = [
  {
    url: 'https://images.unsplash.com/photo-1715194717972-bc42451ec72c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtJTIwZmllbGQlMjBhZ3JpY3VsdHVyZXxlbnwxfHx8fDE3NjE2MzM5NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Modern Agriculture - Embracing Technology for Better Yields'
  },
  {
    url: 'https://images.unsplash.com/photo-1571965403782-e130292dafd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtZXIlMjBoYXJ2ZXN0aW5nJTIwY3JvcHN8ZW58MXx8fHwxNzYxNTg3NzIwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Harvesting Success - Supporting Farmers Every Step of the Way'
  },
  {
    url: 'https://images.unsplash.com/photo-1757953824540-3f86cda1e656?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFjdG9yJTIwZmFybWluZ3xlbnwxfHx8fDE3NjE1ODU5NTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Precision Farming - Smart Solutions for Modern Agriculture'
  },
  {
    url: 'https://images.unsplash.com/photo-1655903724829-37b3cd3d4ab9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwcGFkZHklMjBmaWVsZHxlbnwxfHx8fDE3NjE1MjU5NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    caption: 'Sustainable Growth - Building a Better Future for Farming'
  }
];

const services = [
  {
    id: 1,
    title: 'Weather Forecasting',
    description: 'Make informed farming decisions with accurate, hyperlocal weather predictions.',
    icon: CloudSun,
    color: 'bg-blue-100',
    iconColor: 'text-blue-600',
    image: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWF0aGVyJTIwZm9yZWNhc3QlMjBza3klMjBjbG91ZHN8ZW58MXx8fHwxNzYxNjM0MjI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      '15-day detailed weather forecast',
      'Rainfall predictions with 95% accuracy',
      'Custom alerts for extreme weather',
      'Historical weather data analysis',
      'Best planting and harvesting dates'
    ],
    roadmap: [
      { phase: 'Phase 1', title: 'Basic Weather Data', description: 'Access current weather conditions and 7-day forecast for your location', status: 'Completed' },
      { phase: 'Phase 2', title: 'Advanced Predictions', description: 'Get 15-day detailed forecasts with rainfall predictions and temperature trends', status: 'In Progress' },
      { phase: 'Phase 3', title: 'Custom Alerts', description: 'Receive personalized alerts for extreme weather conditions affecting your crops', status: 'Upcoming' },
      { phase: 'Phase 4', title: 'AI-Powered Insights', description: 'Get smart recommendations based on weather patterns and historical data', status: 'Planned' }
    ]
  },
  {
    id: 2,
    title: 'Market Information',
    description: 'Stay ahead with real-time market prices and demand trends.',
    icon: TrendingUp,
    color: 'bg-green-100',
    iconColor: 'text-green-600',
    image: 'https://images.unsplash.com/photo-1748342319942-223b99937d4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJrZXQlMjB2ZWdldGFibGVzJTIwZnJlc2h8ZW58MXx8fHwxNzYxNjM0MjIyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      'Live mandi prices for 100+ crops',
      'Price trend analysis and predictions',
      'Best time to sell recommendations',
      'Compare prices across different markets',
      'Direct buyer connection platform'
    ],
    roadmap: [
      { phase: 'Phase 1', title: 'Daily Market Rates', description: 'View current market prices for major crops in your region', status: 'Completed' },
      { phase: 'Phase 2', title: 'Price Trends', description: 'Analyze price trends over weeks and months to identify best selling times', status: 'Completed' },
      { phase: 'Phase 3', title: 'Demand Forecasting', description: 'Predict future demand and prices using machine learning algorithms', status: 'In Progress' },
      { phase: 'Phase 4', title: 'Direct Buyer Connection', description: 'Connect directly with buyers and negotiate prices through the platform', status: 'Upcoming' }
    ]
  },
  {
    id: 3,
    title: 'Government Schemes Portal',
    description: 'Access and apply for government benefits easily.',
    icon: Building2,
    color: 'bg-purple-100',
    iconColor: 'text-purple-600',
    image: 'https://images.unsplash.com/photo-1666987571351-737b29874697?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3Zlcm5tZW50JTIwYWdyaWN1bHR1cmV8ZW58MXx8fHwxNzYxNjM0MjIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      'Complete database of 50+ schemes',
      'Instant eligibility checker',
      'Step-by-step application guidance',
      'Document preparation assistance',
      'Application status tracking'
    ],
    roadmap: [
      { phase: 'Phase 1', title: 'Scheme Database', description: 'Browse comprehensive list of central and state government schemes', status: 'Completed' },
      { phase: 'Phase 2', title: 'Eligibility Checker', description: 'Check your eligibility for various schemes based on your profile', status: 'In Progress' },
      { phase: 'Phase 3', title: 'Application Support', description: 'Get step-by-step guidance for applying to government schemes', status: 'Upcoming' },
      { phase: 'Phase 4', title: 'Status Tracking', description: 'Track your application status and receive updates on approvals', status: 'Planned' }
    ]
  },
  {
    id: 4,
    title: 'Crop Recommendation System',
    description: 'Get AI-powered recommendations for maximum profitability.',
    icon: Sprout,
    color: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    image: 'https://images.unsplash.com/photo-1620559290860-d1848adf78bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9wJTIwZmllbGQlMjBncmVlbnxlbnwxfHx8fDE3NjE1OTU4Njh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      'Soil test report analysis',
      'Climate-based recommendations',
      'Market demand consideration',
      'Crop rotation planning',
      'Yield optimization strategies'
    ],
    roadmap: [
      { phase: 'Phase 1', title: 'Basic Recommendations', description: 'Get crop suggestions based on your region and season', status: 'Completed' },
      { phase: 'Phase 2', title: 'Soil Analysis Integration', description: 'Upload soil test reports for personalized recommendations', status: 'In Progress' },
      { phase: 'Phase 3', title: 'Profit Optimization', description: 'Receive recommendations that balance yield potential with market prices', status: 'In Progress' },
      { phase: 'Phase 4', title: 'Rotation Planning', description: 'Get multi-season crop rotation plans for soil health and productivity', status: 'Upcoming' }
    ]
  },
  {
    id: 5,
    title: 'Disease Detection & Prediction',
    description: 'Protect your crops with early disease detection.',
    icon: Bug,
    color: 'bg-red-100',
    iconColor: 'text-red-600',
    image: 'https://images.unsplash.com/photo-1761338894194-1f3a9e73aecb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFudCUyMGRpc2Vhc2UlMjBsZWFmfGVufDF8fHx8MTc2MTYzNDIyM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      'AI image recognition (98% accuracy)',
      'Identifies 200+ diseases and pests',
      'Organic & chemical treatment options',
      'Regional disease outbreak alerts',
      'Preventive care recommendations'
    ],
    roadmap: [
      { phase: 'Phase 1', title: 'Image-Based Detection', description: 'Upload photos of affected crops for instant disease identification', status: 'Completed' },
      { phase: 'Phase 2', title: 'Treatment Recommendations', description: 'Get detailed treatment plans with organic and chemical options', status: 'Completed' },
      { phase: 'Phase 3', title: 'Early Warning System', description: 'Receive alerts about disease outbreaks in your area', status: 'In Progress' },
      { phase: 'Phase 4', title: 'Preventive Care', description: 'Get AI-powered prevention strategies based on weather and crop health', status: 'Upcoming' }
    ]
  },
  {
    id: 6,
    title: 'AI + Human Consultant',
    description: 'Get expert advice 24/7 from AI and real consultants.',
    icon: Users,
    color: 'bg-orange-100',
    iconColor: 'text-orange-600',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwbWVldGluZyUyMGNvbGxhYm9yYXRpb258ZW58MXx8fHwxNzYxNjM0MjI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      'Instant AI chatbot support',
      'Video consultations with experts',
      'Community forum access',
      'Personalized farming advice',
      'Free monthly expert sessions'
    ],
    roadmap: [
      { phase: 'Phase 1', title: 'AI Chatbot', description: 'Get instant answers to common farming questions 24/7', status: 'Completed' },
      { phase: 'Phase 2', title: 'Expert Consultation', description: 'Schedule video calls with certified agricultural experts', status: 'In Progress' },
      { phase: 'Phase 3', title: 'Community Forum', description: 'Connect with other farmers to share experiences and solutions', status: 'In Progress' },
      { phase: 'Phase 4', title: 'Personalized AI Advisor', description: 'Get a dedicated AI assistant trained on your farm\'s specific needs', status: 'Planned' }
    ]
  },
  {
    id: 8,
    title: 'AgriGyaan Knowledge Hub',
    description: 'Learn modern farming from experts and peers.',
    icon: BookOpen,
    color: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    image: 'https://images.unsplash.com/photo-1758582171503-ce7b5c28bb4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyZSUyMGxlYXJuaW5nJTIwZWR1Y2F0aW9ufGVufDF8fHx8MTc2MTYzNDIyNXww&ixlib=rb-4.1.0&q=80&w=1080',
    features: [
      '500+ video tutorials',
      'Real farmer success stories',
      'Interactive online courses',
      'Live expert training sessions',
      'Certificates upon completion'
    ],
    roadmap: [
      { phase: 'Phase 1', title: 'Video Tutorials', description: 'Access 500+ video tutorials on various farming techniques', status: 'Completed' },
      { phase: 'Phase 2', title: 'Success Stories', description: 'Learn from real farmers who have transformed their operations', status: 'Completed' },
      { phase: 'Phase 3', title: 'Interactive Courses', description: 'Enroll in structured courses with certificates and assessments', status: 'In Progress' },
      { phase: 'Phase 4', title: 'Virtual Training', description: 'Participate in live virtual training sessions with experts', status: 'Upcoming' }
    ]
  }
];

export function Home({ email, onLogout, onServiceClick, onAddConsultant, onChatbot }: HomeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const ADD_CONSULTANT_PASSWORD = "Keep Your Own Password";

  const handleAddConsultantClick = () => {
    const isVerified = localStorage.getItem('consultantPasswordVerified') === 'true';
    if (isVerified) {
      onAddConsultant?.();
    } else {
      setShowPasswordDialog(true);
      setPasswordInput('');
      setPasswordError('');
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === ADD_CONSULTANT_PASSWORD) {
      localStorage.setItem('consultantPasswordVerified', 'true');
      setShowPasswordDialog(false);
      setPasswordInput('');
      setPasswordError('');
      onAddConsultant?.();
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  // Farmer personalized dashboard state
  const [farmerProfile, setFarmerProfile] = useState<any>(null);
  const [marketData, setMarketData] = useState<any>(null);
  const [cropRecs, setCropRecs] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [dashLoading, setDashLoading] = useState(true);

  // Load farmer profile then fetch personalized dashboard data via Gemini (cached in DB for 6 months)
  useEffect(() => {
    profileAPI.getProfile().then(async (res) => {
      const user = res.user;
      setFarmerProfile(user);

      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const response = await fetch('/api/dashboard/farmer-insights', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.weather) setWeatherData(data.weather);
          if (data.market) setMarketData(data.market);
          if (data.crops && Array.isArray(data.crops)) setCropRecs(data.crops.slice(0, 3));
        }
      } catch {}
    }).catch(() => {}).finally(() => setDashLoading(false));
  }, []);

  // Auto-slide gallery every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleRoadmapClick = (service: typeof services[0]) => {
    setSelectedService(service);
    setShowRoadmap(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Upcoming':
        return 'bg-orange-100 text-orange-800';
      case 'Planned':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
        {/* Welcome Section */}


        
        <div className="mt-8 mb-8 text-center"> {/* mt-8 adds space from navbar */}
         <h2 className="text-4xl font-black mb-3" style={{ fontWeight: 900 }}>
  {/* Added span with 'text-slate-900' for a premium dark grey */}
  <span className="text-slate-100">Welcome to</span>{' '}
  <span className="text-green-600">SmartAgro</span>{' '}
  <span className="text-orange-500">Web</span>
</h2>

          <p className="text-xl md:text-xl text-gray-600">
            Your complete farming companion - everything you need in one place
          </p>
        </div>

        {/* Interactive Image Gallery */}
        <div className="mb-12 relative overflow-hidden rounded-2xl shadow-2xl bg-gray-900">
          <div className="relative h-96">
            {/* Slides */}
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <ImageWithFallback
                  src={image.url}
                  alt={image.caption}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="text-white text-xl md:text-2xl max-w-3xl">{image.caption}</p>
                </div>
              </div>
            ))}

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ===== PERSONALIZED FARMER DASHBOARD ===== */}
        {farmerProfile && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">
                🌾 Welcome back, <span className="text-green-600">{farmerProfile.name?.split(' ')[0]}</span>!
              </h3>
              <span className="text-sm text-gray-400">Personalized for your farm</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Weather Card */}
              <div className="bg-white rounded-2xl p-5 shadow-lg border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900 text-lg">☁️ Weather</h4>
                  <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-1 rounded-full">
                    {[farmerProfile.district, farmerProfile.state].filter(Boolean).join(', ') || 'Your Location'}
                  </span>
                </div>
                {dashLoading ? (
                  <div className="flex items-center gap-2 text-gray-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
                ) : weatherData ? (
                  <div>
                    <div className="text-4xl font-bold text-blue-600 mb-1">{weatherData.temperature}°C</div>
                    <div className="text-gray-700 font-medium capitalize mb-3">{weatherData.description}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <div className="font-bold text-gray-900">{weatherData.humidity}%</div>
                        <div className="text-gray-600 text-xs">Humidity</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <div className="font-bold text-gray-900">{weatherData.windSpeed} km/h</div>
                        <div className="text-gray-600 text-xs">Wind</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    {farmerProfile.state ? 'Weather data unavailable' : 'Add your location in profile to see weather'}
                  </div>
                )}
              </div>

              {/* Market Price Card */}
              <div className="bg-white rounded-2xl p-5 shadow-lg border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900 text-lg">📈 Market Price</h4>
                  <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-1 rounded-full">
                    {farmerProfile.mainCropType || 'Your Crop'}
                  </span>
                </div>
                {dashLoading ? (
                  <div className="flex items-center gap-2 text-gray-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
                ) : marketData ? (
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-1">₹{marketData.prices?.avg}<span className="text-lg font-normal text-gray-600">/q</span></div>
                    <div className="text-gray-700 font-medium text-sm mb-3">{marketData.trend}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-green-50 rounded-lg p-2 text-center">
                        <div className="font-bold text-gray-900">₹{marketData.prices?.min}</div>
                        <div className="text-gray-600 text-xs">Min</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 text-center">
                        <div className="font-bold text-gray-900">₹{marketData.prices?.max}</div>
                        <div className="text-gray-600 text-xs">Max</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    {farmerProfile.mainCropType ? 'Market data unavailable' : 'Add your crop in profile to see prices'}
                  </div>
                )}
              </div>

              {/* Crop Recommendation Card */}
              <div className="bg-white rounded-2xl p-5 shadow-lg border-l-4 border-orange-500">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900 text-lg">🌱 Recommended Crops</h4>
                  <span className="text-xs bg-orange-100 text-orange-700 font-medium px-2 py-1 rounded-full">
                    {farmerProfile.soilType || 'Your Soil'}
                  </span>
                </div>
                {dashLoading ? (
                  <div className="flex items-center gap-2 text-gray-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
                ) : cropRecs.length > 0 ? (
                  <div className="space-y-2">
                    {cropRecs.map((crop, i) => (
                      <div key={i} className="bg-orange-50 rounded-lg px-3 py-2 flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-sm">{crop.name}</span>
                        <span className="text-xs bg-orange-100 text-orange-700 font-medium px-2 py-0.5 rounded-full">{crop.market}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    {farmerProfile.soilType ? 'Recommendation unavailable' : 'Add soil type in profile to get recommendations'}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Services Introduction Section */}
        <div className="text-center py-16 relative">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                🌾 Our Comprehensive Services 🌾
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Discover powerful tools and expert guidance designed to transform your farming experience
              </p>
            </div>
            
            {/* Interactive Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="text-2xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform">8+</div>
                <div className="text-sm text-gray-600">Smart Services</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="text-2xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform">24/7</div>
                <div className="text-sm text-gray-600">AI Support</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="text-2xl font-bold text-orange-600 mb-2 group-hover:scale-110 transition-transform">100+</div>
                <div className="text-sm text-gray-600">Crop Types</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className="text-2xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform">95%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="space-y-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            const isEven = index % 2 === 0;
            const isAIConsultant = service.id === 6;
            
            return (
              <Card key={service.id} id={`service-${service.id}`} className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className={`grid md:grid-cols-2 gap-0 ${!isEven ? 'md:grid-flow-dense' : ''}`}>
                  {/* Image */}
                  <div className={`relative ${!isEven ? 'md:col-start-2' : ''} ${isAIConsultant ? 'overflow-hidden' : ''}`}>
                    <div className="h-64 md:h-64 relative">
                      <ImageWithFallback
                        src={service.image}
                        alt={service.title}
                        className={`w-full h-full object-cover ${isAIConsultant ? 'hover:scale-110 transition-transform duration-500' : ''}`}
                      />
                      <div className={`absolute inset-0 ${isAIConsultant ? 'bg-gradient-to-t from-orange-900/40 via-orange-600/20 to-transparent' : 'bg-gradient-to-t from-black/30 to-transparent'}`} />
                      {isAIConsultant && (
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-orange-600">
                          🤖 AI Powered
                        </div>
                      )}
                    </div>
                    
                    {/* Stylish Action Buttons Below Image */}
                    <div className="p-6 bg-gradient-to-r from-gray-50 to-white">
                      <div className="grid grid-cols-2 gap-3">
                        {isAIConsultant ? (
                          <>
                            <Button 
                              onClick={onChatbot}
                              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm"
                            >
                              🤖 Chatbot
                            </Button>
                            <Button 
                              onClick={() => onServiceClick(service.id)}
                              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm"
                            >
                              👨‍⚕️ Start Consultation
                            </Button>
                            <Button 
                              onClick={handleAddConsultantClick}
                              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm"
                            >
                              <Lock className="w-4 h-4" />
                              Add Consultant
                            </Button>
                            <button
                              onClick={() => handleRoadmapClick(service)}
                              className="py-3 px-4 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 hover:from-orange-200 hover:to-orange-300 border-orange-300 font-medium rounded-xl border-2 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-sm"
                            >
                              <MapPin className="w-4 h-4" />
                              <span>View Roadmap</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <Button 
                              onClick={() => onServiceClick(service.id)}
                              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm"
                            >
                              Learn More
                            </Button>
                            <button
                              onClick={() => handleRoadmapClick(service)}
                              className="py-3 px-4 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300 border-blue-300 font-medium rounded-xl border-2 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-sm"
                            >
                              <MapPin className="w-4 h-4" />
                              <span>View Roadmap</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                    <div className={`w-14 h-14 ${service.color} rounded-full flex items-center justify-center mb-4`}>
                      <Icon className={`w-7 h-7 ${service.iconColor}`} />
                    </div>
                    
                    <h3 className="text-gray-900 mb-3">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-600">
                          <CheckCircle2 className={`w-5 h-5 ${isAIConsultant ? 'text-orange-600' : 'text-green-600'} mr-2 flex-shrink-0 mt-0.5`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Bottom Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Empowering farmers with technology and knowledge
          </p>
          <div className="flex justify-center space-x-6 mt-4 text-xs text-gray-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Smart Farming
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Expert Guidance
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Better Yields
            </div>
          </div>
        </div>

      {/* Roadmap Dialog */}
      <Dialog open={showRoadmap} onOpenChange={setShowRoadmap}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedService && (
                <>
                  <selectedService.icon className="w-6 h-6 text-green-600" />
                  <span>{selectedService.title} - Roadmap</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Here's what we're building for this feature. Track our progress and see what's coming next!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {selectedService?.roadmap.map((item, index) => (
              <div key={index} className="border-l-4 border-green-500 pl-4 py-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs text-green-700 uppercase tracking-wide">{item.phase}</span>
                    <h4 className="text-gray-900 mt-1">{item.title}</h4>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-700">
              💡 <strong>Want to contribute?</strong> Share your feedback and feature requests with us to help shape the future of Agri Sarathi!
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Dialog for Add Consultant */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-orange-600" />
              Enter Password
            </DialogTitle>
            <DialogDescription>
              Please enter the password to access  form <br />
                 <p className="text-black-500 font-bold">
  <i>(This is only for Admins)</i>
</p>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="Enter password..."
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-gray-800"
              />
            </div>
            {passwordError && (
              <p className="text-sm text-red-600 font-medium">{passwordError}</p>
            )}
            <div className="flex gap-3">
              <Button
                onClick={() => setShowPasswordDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordSubmit}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Lock className="w-4 h-4 mr-1" />
                Unlock
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}








// import React, { useState, useEffect } from 'react';
// import { 
//   ChevronLeft,
//   ChevronRight,
//   CloudSun, 
//   TrendingUp, 
//   Building2, 
//   Sprout, 
//   Bug, 
//   Users, 
//   Calendar, 
//   BookOpen,
//   CheckCircle2,
//   MapPin,
//   UserPlus
// } from 'lucide-react';
// import { ImageWithFallback } from '../components/figma/ImageWithFallback';
// import { Card, CardContent } from '../components/ui/card';
// import { Button } from '../components/ui/button';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from '../components/ui/dialog';

// interface HomeProps {
//   email: string;
//   onLogout: () => void;
//   onServiceClick: (serviceId: number) => void;
//   onAddConsultant?: () => void;
// }

// // Agriculture gallery images
// const galleryImages = [
//   {
//     url: 'https://images.unsplash.com/photo-1715194717972-bc42451ec72c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtJTIwZmllbGQlMjBhZ3JpY3VsdHVyZXxlbnwxfHx8fDE3NjE2MzM5NTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
//     caption: 'Modern Agriculture - Embracing Technology for Better Yields'
//   },
//   {
//     url: 'https://images.unsplash.com/photo-1571965403782-e130292dafd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtZXIlMjBoYXJ2ZXN0aW5nJTIwY3JvcHN8ZW58MXx8fHwxNzYxNTg3NzIwfDA&ixlib=rb-4.1.0&q=80&w=1080',
//     caption: 'Harvesting Success - Supporting Farmers Every Step of the Way'
//   },
//   {
//     url: 'https://images.unsplash.com/photo-1757953824540-3f86cda1e656?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFjdG9yJTIwZmFybWluZ3xlbnwxfHx8fDE3NjE1ODU5NTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
//     caption: 'Precision Farming - Smart Solutions for Modern Agriculture'
//   },
//   {
//     url: 'https://images.unsplash.com/photo-1655903724829-37b3cd3d4ab9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwcGFkZHklMjBmaWVsZHxlbnwxfHx8fDE3NjE1MjU5NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
//     caption: 'Sustainable Growth - Building a Better Future for Farming'
//   }
// ];

// const services = [
//   {
//     id: 1,
//     title: 'Weather Forecasting',
//     description: 'Make informed farming decisions with accurate, hyperlocal weather predictions.',
//     icon: CloudSun,
//     color: 'bg-blue-100',
//     iconColor: 'text-blue-600',
//     image: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWF0aGVyJTIwZm9yZWNhc3QlMjBza3klMjBjbG91ZHN8ZW58MXx8fHwxNzYxNjM0MjI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
//     features: [
//       '15-day detailed weather forecast',
//       'Rainfall predictions with 95% accuracy',
//       'Custom alerts for extreme weather',
//       'Historical weather data analysis',
//       'Best planting and harvesting dates'
//     ],
//     roadmap: [
//       { phase: 'Phase 1', title: 'Basic Weather Data', description: 'Access current weather conditions and 7-day forecast for your location', status: 'Completed' },
//       { phase: 'Phase 2', title: 'Advanced Predictions', description: 'Get 15-day detailed forecasts with rainfall predictions and temperature trends', status: 'In Progress' },
//       { phase: 'Phase 3', title: 'Custom Alerts', description: 'Receive personalized alerts for extreme weather conditions affecting your crops', status: 'Upcoming' },
//       { phase: 'Phase 4', title: 'AI-Powered Insights', description: 'Get smart recommendations based on weather patterns and historical data', status: 'Planned' }
//     ]
//   },
//   {
//     id: 2,
//     title: 'Market Information',
//     description: 'Stay ahead with real-time market prices and demand trends.',
//     icon: TrendingUp,
//     color: 'bg-green-100',
//     iconColor: 'text-green-600',
//     image: 'https://images.unsplash.com/photo-1748342319942-223b99937d4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJrZXQlMjB2ZWdldGFibGVzJTIwZnJlc2h8ZW58MXx8fHwxNzYxNjM0MjIyfDA&ixlib=rb-4.1.0&q=80&w=1080',
//     features: [
//       'Live mandi prices for 100+ crops',
//       'Price trend analysis and predictions',
//       'Best time to sell recommendations',
//       'Compare prices across different markets',
//       'Direct buyer connection platform'
//     ],
//     roadmap: [
//       { phase: 'Phase 1', title: 'Daily Market Rates', description: 'View current market prices for major crops in your region', status: 'Completed' },
//       { phase: 'Phase 2', title: 'Price Trends', description: 'Analyze price trends over weeks and months to identify best selling times', status: 'Completed' },
//       { phase: 'Phase 3', title: 'Demand Forecasting', description: 'Predict future demand and prices using machine learning algorithms', status: 'In Progress' },
//       { phase: 'Phase 4', title: 'Direct Buyer Connection', description: 'Connect directly with buyers and negotiate prices through the platform', status: 'Upcoming' }
//     ]
//   },
//   {
//     id: 3,
//     title: 'Government Schemes Portal',
//     description: 'Access and apply for government benefits easily.',
//     icon: Building2,
//     color: 'bg-purple-100',
//     iconColor: 'text-purple-600',
//     image: 'https://images.unsplash.com/photo-1666987571351-737b29874697?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3Zlcm5tZW50JTIwYWdyaWN1bHR1cmV8ZW58MXx8fHwxNzYxNjM0MjIzfDA&ixlib=rb-4.1.0&q=80&w=1080',
//     features: [
//       'Complete database of 50+ schemes',
//       'Instant eligibility checker',
//       'Step-by-step application guidance',
//       'Document preparation assistance',
//       'Application status tracking'
//     ],
//     roadmap: [
//       { phase: 'Phase 1', title: 'Scheme Database', description: 'Browse comprehensive list of central and state government schemes', status: 'Completed' },
//       { phase: 'Phase 2', title: 'Eligibility Checker', description: 'Check your eligibility for various schemes based on your profile', status: 'In Progress' },
//       { phase: 'Phase 3', title: 'Application Support', description: 'Get step-by-step guidance for applying to government schemes', status: 'Upcoming' },
//       { phase: 'Phase 4', title: 'Status Tracking', description: 'Track your application status and receive updates on approvals', status: 'Planned' }
//     ]
//   },
//   {
//     id: 4,
//     title: 'Crop Recommendation System',
//     description: 'Get AI-powered recommendations for maximum profitability.',
//     icon: Sprout,
//     color: 'bg-emerald-100',
//     iconColor: 'text-emerald-600',
//     image: 'https://images.unsplash.com/photo-1620559290860-d1848adf78bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9wJTIwZmllbGQlMjBncmVlbnxlbnwxfHx8fDE3NjE1OTU4Njh8MA&ixlib=rb-4.1.0&q=80&w=1080',
//     features: [
//       'Soil test report analysis',
//       'Climate-based recommendations',
//       'Market demand consideration',
//       'Crop rotation planning',
//       'Yield optimization strategies'
//     ],
//     roadmap: [
//       { phase: 'Phase 1', title: 'Basic Recommendations', description: 'Get crop suggestions based on your region and season', status: 'Completed' },
//       { phase: 'Phase 2', title: 'Soil Analysis Integration', description: 'Upload soil test reports for personalized recommendations', status: 'In Progress' },
//       { phase: 'Phase 3', title: 'Profit Optimization', description: 'Receive recommendations that balance yield potential with market prices', status: 'In Progress' },
//       { phase: 'Phase 4', title: 'Rotation Planning', description: 'Get multi-season crop rotation plans for soil health and productivity', status: 'Upcoming' }
//     ]
//   },
//   {
//     id: 5,
//     title: 'Disease Detection & Prediction',
//     description: 'Protect your crops with early disease detection.',
//     icon: Bug,
//     color: 'bg-red-100',
//     iconColor: 'text-red-600',
//     image: 'https://images.unsplash.com/photo-1761338894194-1f3a9e73aecb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFudCUyMGRpc2Vhc2UlMjBsZWFmfGVufDF8fHx8MTc2MTYzNDIyM3ww&ixlib=rb-4.1.0&q=80&w=1080',
//     features: [
//       'AI image recognition (98% accuracy)',
//       'Identifies 200+ diseases and pests',
//       'Organic & chemical treatment options',
//       'Regional disease outbreak alerts',
//       'Preventive care recommendations'
//     ],
//     roadmap: [
//       { phase: 'Phase 1', title: 'Image-Based Detection', description: 'Upload photos of affected crops for instant disease identification', status: 'Completed' },
//       { phase: 'Phase 2', title: 'Treatment Recommendations', description: 'Get detailed treatment plans with organic and chemical options', status: 'Completed' },
//       { phase: 'Phase 3', title: 'Early Warning System', description: 'Receive alerts about disease outbreaks in your area', status: 'In Progress' },
//       { phase: 'Phase 4', title: 'Preventive Care', description: 'Get AI-powered prevention strategies based on weather and crop health', status: 'Upcoming' }
//     ]
//   },
//   {
//     id: 6,
//     title: 'AI + Human Consultant',
//     description: 'Get expert advice 24/7 from AI and real consultants.',
//     icon: Users,
//     color: 'bg-orange-100',
//     iconColor: 'text-orange-600',
//     image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwbWVldGluZyUyMGNvbGxhYm9yYXRpb258ZW58MXx8fHwxNzYxNjM0MjI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
//     features: [
//       'Instant AI chatbot support',
//       'Video consultations with experts',
//       'Community forum access',
//       'Personalized farming advice',
//       'Free monthly expert sessions'
//     ],
//     roadmap: [
//       { phase: 'Phase 1', title: 'AI Chatbot', description: 'Get instant answers to common farming questions 24/7', status: 'Completed' },
//       { phase: 'Phase 2', title: 'Expert Consultation', description: 'Schedule video calls with certified agricultural experts', status: 'In Progress' },
//       { phase: 'Phase 3', title: 'Community Forum', description: 'Connect with other farmers to share experiences and solutions', status: 'In Progress' },
//       { phase: 'Phase 4', title: 'Personalized AI Advisor', description: 'Get a dedicated AI assistant trained on your farm\'s specific needs', status: 'Planned' }
//     ]
//   },
//   {
//     id: 8,
//     title: 'AgriGyaan Knowledge Hub',
//     description: 'Learn modern farming from experts and peers.',
//     icon: BookOpen,
//     color: 'bg-indigo-100',
//     iconColor: 'text-indigo-600',
//     image: 'https://images.unsplash.com/photo-1758582171503-ce7b5c28bb4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyZSUyMGxlYXJuaW5nJTIwZWR1Y2F0aW9ufGVufDF8fHx8MTc2MTYzNDIyNXww&ixlib=rb-4.1.0&q=80&w=1080',
//     features: [
//       '500+ video tutorials',
//       'Real farmer success stories',
//       'Interactive online courses',
//       'Live expert training sessions',
//       'Certificates upon completion'
//     ],
//     roadmap: [
//       { phase: 'Phase 1', title: 'Video Tutorials', description: 'Access 500+ video tutorials on various farming techniques', status: 'Completed' },
//       { phase: 'Phase 2', title: 'Success Stories', description: 'Learn from real farmers who have transformed their operations', status: 'Completed' },
//       { phase: 'Phase 3', title: 'Interactive Courses', description: 'Enroll in structured courses with certificates and assessments', status: 'In Progress' },
//       { phase: 'Phase 4', title: 'Virtual Training', description: 'Participate in live virtual training sessions with experts', status: 'Upcoming' }
//     ]
//   }
// ];

// export function Home({ email, onLogout, onServiceClick, onAddConsultant }: HomeProps) {
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);
//   const [showRoadmap, setShowRoadmap] = useState(false);

//   // Auto-slide gallery every 5 seconds
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
//     }, 5000);
//     return () => clearInterval(timer);
//   }, []);



//   const nextSlide = () => {
//     setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
//   };

//   const prevSlide = () => {
//     setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
//   };

//   const handleRoadmapClick = (service: typeof services[0]) => {
//     setSelectedService(service);
//     setShowRoadmap(true);
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'Completed':
//         return 'bg-green-100 text-green-800';
//       case 'In Progress':
//         return 'bg-blue-100 text-blue-800';
//       case 'Upcoming':
//         return 'bg-orange-100 text-orange-800';
//       case 'Planned':
//         return 'bg-gray-100 text-gray-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };



//   return (
//     <div className="space-y-8">
//         {/* Welcome Section */}
//         <div className="mt-8 mb-8 text-center"> {/* mt-8 adds space from navbar */}
//   <h2 className="text-4xl font-black text-black mb-3" style={{ fontWeight: 900 }}>
//   Welcome to Agri Sarathi
// </h2>

//   <p className="text-xl md:text-xl text-gray-600">
//     Your complete farming companion - everything you need in one place
//   </p>
// </div>

//         {/* <div className="mb-8">
//           <h2 className="text-gray-900 mb-2">Welcome to Agri Sarathi</h2>
//           <p className="text-gray-600">Your complete farming companion - everything you need in one place</p>
//         </div> */}

//         {/* Interactive Image Gallery */}
//         <div className="mb-12 relative overflow-hidden rounded-2xl shadow-2xl bg-gray-900">
//           <div className="relative h-96">
//             {/* Slides */}
//             {galleryImages.map((image, index) => (
//               <div
//                 key={index}
//                 className={`absolute inset-0 transition-opacity duration-1000 ${
//                   index === currentSlide ? 'opacity-100' : 'opacity-0'
//                 }`}
//               >
//                 <ImageWithFallback
//                   src={image.url}
//                   alt={image.caption}
//                   className="w-full h-full object-cover"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
//                 <div className="absolute bottom-0 left-0 right-0 p-8">
//                   <p className="text-white text-xl md:text-2xl max-w-3xl">{image.caption}</p>
//                 </div>
//               </div>
//             ))}

//             {/* Navigation Arrows */}
//             <button
//               onClick={prevSlide}
//               className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
//             >
//               <ChevronLeft className="w-6 h-6 text-gray-800" />
//             </button>
//             <button
//               onClick={nextSlide}
//               className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
//             >
//               <ChevronRight className="w-6 h-6 text-gray-800" />
//             </button>

//             {/* Slide Indicators */}
//             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
//               {galleryImages.map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => setCurrentSlide(index)}
//                   className={`w-2 h-2 rounded-full transition-all ${
//                     index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
//                   }`}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Services Introduction Section */}
//         <div className="text-center py-16 relative">
//           <div className="max-w-4xl mx-auto">
//             <div className="mb-8">
//               <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//                 🌾 Our Comprehensive Services 🌾
//               </h3>
//               <p className="text-lg text-gray-600 leading-relaxed">
//                 Discover powerful tools and expert guidance designed to transform your farming experience
//               </p>
//             </div>
            
//             {/* Interactive Stats */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
//               <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
//                 <div className="text-2xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform">8+</div>
//                 <div className="text-sm text-gray-600">Smart Services</div>
//               </div>
//               <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
//                 <div className="text-2xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform">24/7</div>
//                 <div className="text-sm text-gray-600">AI Support</div>
//               </div>
//               <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
//                 <div className="text-2xl font-bold text-orange-600 mb-2 group-hover:scale-110 transition-transform">100+</div>
//                 <div className="text-sm text-gray-600">Crop Types</div>
//               </div>
//               <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
//                 <div className="text-2xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform">95%</div>
//                 <div className="text-sm text-gray-600">Accuracy</div>
//               </div>
//             </div>
            
//             {/* Call to Action */}
//             {/* <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
//               <p className="text-gray-700 text-lg mb-4">
//                 ✨ <strong>Ready to revolutionize your farming?</strong> ✨
//               </p>
//               <p className="text-gray-600">
//                 Explore our comprehensive suite of agricultural services below and take your farming to the next level
//               </p>
//               <div className="flex justify-center mt-6">
//                 <div className="flex space-x-2">
//                   <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
//                   <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
//                   <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
//                 </div>
//               </div>
//             </div> */}
//           </div>
//         </div>

//         {/* Services Grid */}
//         <div className="space-y-8">
//           {services.map((service, index) => {
//             const Icon = service.icon;
//             const isEven = index % 2 === 0;
//             const isAIConsultant = service.id === 6;
            
//             return (
//               <Card key={service.id} id={`service-${service.id}`} className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
//                 <div className={`grid md:grid-cols-2 gap-0 ${!isEven ? 'md:grid-flow-dense' : ''}`}>
//                   {/* Image */}
//                   <div className={`relative ${!isEven ? 'md:col-start-2' : ''} ${isAIConsultant ? 'overflow-hidden' : ''}`}>
//                     <div className="h-64 md:h-64 relative">
//                       <ImageWithFallback
//                         src={service.image}
//                         alt={service.title}
//                         className={`w-full h-full object-cover ${isAIConsultant ? 'hover:scale-110 transition-transform duration-500' : ''}`}
//                       />
//                       <div className={`absolute inset-0 ${isAIConsultant ? 'bg-gradient-to-t from-orange-900/40 via-orange-600/20 to-transparent' : 'bg-gradient-to-t from-black/30 to-transparent'}`} />
//                       {isAIConsultant && (
//                         <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-orange-600">
//                           🤖 AI Powered
//                         </div>
//                       )}
//                     </div>
                    
//                     {/* Stylish Action Buttons Below Image */}
//                     <div className="p-6 bg-gradient-to-r from-gray-50 to-white">
//                       <div className="grid grid-cols-2 gap-3">
//                         <Button 
//                           onClick={() => onServiceClick(service.id)}
//                           className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm"
//                         >
//                           {isAIConsultant ? '🚀 Start' : 'Learn More'}
//                         </Button>
                        
//                         {isAIConsultant && (
//                           <Button
//                             onClick={onAddConsultant}
//                             className="col-span-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm mt-3"
//                           >
//                             <UserPlus className="w-4 h-4 mr-1" />
//                             Add Consultant
//                           </Button>
//                         )}

//                         <button
//                           onClick={() => handleRoadmapClick(service)}
//                           className={`py-3 px-4 ${isAIConsultant ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 hover:from-orange-200 hover:to-orange-300 border-orange-300' : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 hover:from-blue-200 hover:to-blue-300 border-blue-300'} font-medium rounded-xl border-2 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-sm`}
//                         >
//                           <MapPin className="w-4 h-4" />
//                           <span>View Roadmap</span>
//                         </button>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Content */}
//                   <CardContent className="p-6 md:p-8 flex flex-col justify-center">
//                     <div className={`w-14 h-14 ${service.color} rounded-full flex items-center justify-center mb-4`}>
//                       <Icon className={`w-7 h-7 ${service.iconColor}`} />
//                     </div>
                    
//                     <h3 className="text-gray-900 mb-3">{service.title}</h3>
//                     <p className="text-gray-600 mb-4">{service.description}</p>
                    
//                     <ul className="space-y-2 mb-6">
//                       {service.features.map((feature, idx) => (
//                         <li key={idx} className="flex items-start text-sm text-gray-600">
//                           <CheckCircle2 className={`w-5 h-5 ${isAIConsultant ? 'text-orange-600' : 'text-green-600'} mr-2 flex-shrink-0 mt-0.5`} />
//                           <span>{feature}</span>
//                         </li>
//                       ))}
//                     </ul>
                    

//                   </CardContent>
//                 </div>
//               </Card>
//             );
//           })}
//         </div>

//         {/* Bottom Info */}
//         <div className="mt-12 text-center">
//           <p className="text-gray-600">
//             Empowering farmers with technology and knowledge
//           </p>
//           <div className="flex justify-center space-x-6 mt-4 text-xs text-gray-500">
//             <div className="flex items-center">
//               <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
//               Smart Farming
//             </div>
//             <div className="flex items-center">
//               <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
//               Expert Guidance
//             </div>
//             <div className="flex items-center">
//               <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
//               Better Yields
//             </div>
//           </div>
//         </div>

//       {/* Roadmap Dialog */}
//       <Dialog open={showRoadmap} onOpenChange={setShowRoadmap}>
//         <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle className="flex items-center space-x-2">
//               {selectedService && (
//                 <>
//                   <selectedService.icon className="w-6 h-6 text-green-600" />
//                   <span>{selectedService.title} - Roadmap</span>
//                 </>
//               )}
//             </DialogTitle>
//             <DialogDescription>
//               Here's what we're building for this feature. Track our progress and see what's coming next!
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-4 mt-4">
//             {selectedService?.roadmap.map((item, index) => (
//               <div key={index} className="border-l-4 border-green-500 pl-4 py-3">
//                 <div className="flex items-start justify-between mb-2">
//                   <div>
//                     <span className="text-xs text-green-700 uppercase tracking-wide">{item.phase}</span>
//                     <h4 className="text-gray-900 mt-1">{item.title}</h4>
//                   </div>
//                   <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
//                     {item.status}
//                   </span>
//                 </div>
//                 <p className="text-sm text-gray-600">{item.description}</p>
//               </div>
//             ))}
//           </div>

//           <div className="mt-6 p-4 bg-green-50 rounded-lg">
//             <p className="text-sm text-gray-700">
//               💡 <strong>Want to contribute?</strong> Share your feedback and feature requests with us to help shape the future of Agri Sarathi!
//             </p>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
