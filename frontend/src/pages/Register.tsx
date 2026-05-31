import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Lock, Leaf, Upload, ChevronDown, X, Check, ArrowLeft, ArrowRight, UserCheck } from 'lucide-react';

// Basic UI Components (replacing shadcn/ui)
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'default', size = 'default', className = '', children, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    default: 'bg-green-600 text-white hover:bg-green-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    ghost: 'hover:bg-gray-100'
  };
  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3',
    lg: 'h-11 px-8'
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({ className = '', children, ...props }) => {
  return (
    <label
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ className = '', children, ...props }) => {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ className = '', children }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

import { authAPI, setAuthToken } from '../services/api';
import StateDropdown from '../components/StateDropdown';
import DistrictDropdown from '../components/DistrictDropdown';

// Types
interface RegisterProps {
  onRegister: (email: string) => void;
  onBackToLogin: () => void;
}

// Constants
const CROP_TYPES = [ 'Kharif (Rainy Season Crops)',
  'Rabi (Winter Season Crops)',
  'Zaid (Summer Season Crops)',
  'Mixed Cropping',
  'Horticulture (Fruits & Vegetables)'];
const SOIL_TYPES = ['Black', 'Red', 'Alluvial', 'Laterite', 'Sandy', 'Clay', 'Loam'];
const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Punjabi', 'Other'];
const EXPERIENCE = ['< 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'];
const IRRIGATION = ['Drip', 'Sprinkler', 'Flood', 'Canal', 'Well', 'Rain-fed'];
const WATER_SOURCES = ['Borewell', 'Canal', 'River', 'Tank', 'Well', 'Check Dam'];
const SEASON_CROPS = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits'];
const FERTILIZERS = ['Organic', 'Chemical', 'Bio-fertilizers', 'Mixed'];
const MACHINERY = ['Tractor', 'Tiller', 'Thresher', 'Harvester', 'Sprayer', 'Plough', 'None'];
const NOTIFICATION_METHODS = ['SMS', 'WhatsApp', 'Email', 'Voice Call', 'App Notification'];

// Number Input Component
function NumberInput({ label, value, onChange, min = 0, max = 100 }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  const increment = () => {
    if (value < max) onChange(value + 1);
  };
  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={decrement}
            className="absolute left-2 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <div className="w-4 h-0.5 bg-gray-600" />
          </button>
          <input
            type="number"
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(Math.min(max, Math.max(min, parseInt(e.target.value) || 0)))}
            className="w-24 h-10 text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            min={min}
            max={max}
          />
          <button
            type="button"
            onClick={increment}
            className="absolute right-2 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <div className="w-4 h-0.5 bg-gray-600" />
            <div className="w-4 h-0.5 bg-gray-600 rotate-90 absolute top-1/2 -translate-y-1/2" />
          </button>
        </div>
        <span className="text-sm text-gray-600">acres</span>
      </div>
    </div>
  );
}

// Custom Select Dropdown Component
function CustomSelect({ label, options, value, onChange, icon, placeholder = "Select option" }: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {icon}
          {label}
        </Label>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full px-4 py-3 text-left bg-white border-2 border-gray-300 rounded-lg hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all flex items-center justify-between"
        >
          <span className={value ? "text-gray-900" : "text-gray-500"}>
            {value || placeholder}
          </span>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div ref={dropdownRef} className="relative bg-white rounded-xl shadow-2xl w-11/12 max-w-md max-h-[70vh] overflow-hidden">
            <div className="sticky top-0 bg-green-600 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{label}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-green-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4">
              <div className="space-y-2">
                {options.map((option: string) => (
                  <button
                    key={option}
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between group hover:bg-green-50 ${
                      value === option ? 'bg-green-100 text-green-700 border-2 border-green-500' : 'border-2 border-transparent'
                    }`}
                  >
                    <span className="font-medium">{option}</span>
                    {value === option && <Check className="w-5 h-5 text-green-600" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Multi-Select Dropdown Component
function MultiSelectDropdown({ label, options, value, onChange, icon, placeholder = "Select options" }: {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  icon?: React.ReactNode;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter(v => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {icon}
          {label}
        </Label>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full px-4 py-3 text-left bg-white border-2 border-gray-300 rounded-lg hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
        >
          <div className="flex items-center justify-between">
            <span className={value.length > 0 ? "text-gray-900" : "text-gray-500"}>
              {value.length > 0 ? `${value.length} selected` : placeholder}
            </span>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
          {value.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {value.slice(0, 3).map((v: string) => (
                <span key={v} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  {v}
                </span>
              ))}
              {value.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{value.length - 3} more
                </span>
              )}
            </div>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div ref={dropdownRef} className="relative bg-white rounded-xl shadow-2xl w-11/12 max-w-md max-h-[70vh] overflow-hidden">
            <div className="sticky top-0 bg-green-600 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{label}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-green-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4">
              <div className="space-y-2">
                {options.map((option: string) => (
                  <button
                    key={option}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); handleToggle(option); }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between group hover:bg-green-50 ${
                      value.includes(option) ? 'bg-green-100 text-green-700 border-2 border-green-500' : 'border-2 border-transparent'
                    }`}
                  >
                    <span className="font-medium">{option}</span>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      value.includes(option) ? 'bg-green-600 border-green-600' : 'border-gray-300'
                    }`}>
                      {value.includes(option) && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 px-6 py-3 border-t">
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); setIsOpen(false); }}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Done ({value.length} selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Register({ onRegister, onBackToLogin }: RegisterProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const photoRef = useRef<HTMLInputElement>(null);
  const soilImageRef = useRef<HTMLInputElement>(null);

  const [personal, setPersonal] = useState({
    name: '', email: '', phone: '', dateOfBirth: '',
    state: '', district: '', taluka: '', village: '', pincode: '', addressDescription: '',
    password: '', confirmPassword: '', profilePhoto: '',
  });

  const [farming, setFarming] = useState({
    farmSize: 0, mainCropType: '', soilType: '', preferredLanguage: '',
    farmingExperience: '', irrigationType: '', waterSource: '', currentSeasonCrop: [] as string[],
    fertilizerUsage: '', farmMachinery: [] as string[], notificationMethod: [] as string[],
    soilImage: '',
  });

  const setP = (field: string, value: string) => setPersonal(p => ({ ...p, [field]: value }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setP('profilePhoto', reader.result as string);
    reader.readAsDataURL(file);
  };

  const validateStep1 = () => {
    if (!personal.name || !personal.email || !personal.phone || !personal.password || !personal.confirmPassword)
      return 'Please fill all required fields';
    if (!/^[0-9]{10}$/.test(personal.phone)) return 'Phone must be 10 digits';
    if (personal.password.length < 6) return 'Password must be at least 6 characters';
    if (personal.password !== personal.confirmPassword) return 'Passwords do not match';
    return '';
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      // Convert farmSize to string for API compatibility
      const submitData = {
        ...personal,
        ...farming,
        farmSize: farming.farmSize.toString(),
        soilImage: farming.soilImage
      };
      const response = await authAPI.register(submitData);
      setAuthToken(response.token);
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.user.role);
      localStorage.setItem('user', JSON.stringify(response.user));
      onRegister(personal.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-green-600">Join SmartAgro</span>
            <span className="text-orange-500"> Web</span>
          </h1>
          <p className="text-gray-600 mt-1">Create your farmer account</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-green-600 text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>
                {s === 1 ? <User className="w-5 h-5" /> : <Leaf className="w-5 h-5" />}
              </div>
              <span className={`text-sm font-medium ${step >= s ? 'text-green-700' : 'text-gray-400'}`}>{s === 1 ? 'Personal Details' : 'Farming Details'}</span>
              {s < 2 && <div className={`w-16 h-0.5 ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <Card className="shadow-lg border-0 overflow-hidden">
          <CardContent className="pt-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

            {/* ===== STEP 1: PERSONAL DETAILS ===== */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-green-100">
                  <User className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-bold text-green-700">Personal Details</h2>
                </div>

                {/* Profile Photo */}
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="relative w-32 h-32 rounded-full border-4 border-dashed border-green-400 flex items-center justify-center cursor-pointer overflow-hidden bg-green-50 hover:bg-green-100 transition-all shadow-md"
                    onClick={() => photoRef.current?.click()}
                  >
                    {personal.profilePhoto ? (
                      <img src={personal.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-green-500">
                        <Upload className="w-8 h-8" />
                        <span className="text-xs mt-1">Upload Photo</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-1.5 shadow-md">
                      <Upload className="w-4 h-4" />
                    </div>
                  </div>
                  <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  <span className="text-xs text-gray-500">Click to upload profile photo (optional)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-sm font-medium">
                      <User className="w-4 h-4 text-green-600" />
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input placeholder="Enter full name" value={personal.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setP('name', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-sm font-medium">
                      <Mail className="w-4 h-4 text-green-600" />
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input type="email" placeholder="farmer@example.com" value={personal.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setP('email', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-sm font-medium">
                      <Phone className="w-4 h-4 text-green-600" />
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input placeholder="10-digit mobile number" value={personal.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setP('phone', e.target.value)} maxLength={10} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-sm font-medium">
                      <Calendar className="w-4 h-4 text-green-600" />
                      Date of Birth
                    </Label>
                    <Input type="date" value={personal.dateOfBirth} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setP('dateOfBirth', e.target.value)} />
                  </div>
                </div>

                <div className="flex items-center gap-2 pb-2 pt-2 border-b border-green-100">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-bold text-green-700">Address</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">State</Label>
                    <StateDropdown
                      value={personal.state}
                      onChange={v => { setP('state', v); setP('district', ''); }}
                      className="border-gray-300 h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">District</Label>
                    <DistrictDropdown
                      selectedState={personal.state}
                      value={personal.district}
                      onChange={v => setP('district', v)}
                      className="border-gray-300 h-10 text-sm"
                    />
                  </div>
                  {[
                    { field: 'taluka', label: 'Taluka', placeholder: 'e.g. Haveli' },
                    { field: 'village', label: 'Village', placeholder: 'e.g. Wagholi' },
                    { field: 'pincode', label: 'Pincode', placeholder: '6-digit pincode' },
                  ].map(({ field, label, placeholder }) => (
                    <div key={field} className="space-y-2">
                      <Label className="text-sm font-medium">{label}</Label>
                      <Input placeholder={placeholder} value={(personal as any)[field]} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setP(field, e.target.value)} maxLength={field === 'pincode' ? 6 : undefined} />
                    </div>
                  ))}
                </div>
                {/* <div className="space-y-2">
                  <Label className="text-sm font-medium">Address Description</Label>
                  <textarea
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    rows={2} placeholder="Full address / landmark details"
                    value={personal.addressDescription} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setP('addressDescription', e.target.value)}
                  />
                </div> */}

                <div className="flex items-center gap-2 pb-2 pt-2 border-b border-green-100">
                  <Lock className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-bold text-green-700">Security</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Password <span className="text-red-500">*</span></Label>
                    <Input type="password" placeholder="Min 6 characters" value={personal.password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setP('password', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Confirm Password <span className="text-red-500">*</span></Label>
                    <Input type="password" placeholder="Re-enter password" value={personal.confirmPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setP('confirmPassword', e.target.value)} />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={onBackToLogin}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                  </Button>
                  <Button type="button" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handleNext}>
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* ===== STEP 2: FARMING DETAILS ===== */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-green-100">
                  <Leaf className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-bold text-green-700">Farming Details</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Farm Size with Number Input */}
                  <NumberInput
                    label="Farm Size"
                    value={farming.farmSize}
                    onChange={(v: number) => setFarming(f => ({ ...f, farmSize: v }))}
                    min={0}
                    max={1000}
                  />

                  {/* All other fields as dropdowns */}
                  <CustomSelect 
                    label="Main Crop Type" 
                    options={CROP_TYPES} 
                    value={farming.mainCropType} 
                    onChange={(v: string) => setFarming(f => ({ ...f, mainCropType: v }))}
                    icon={<Leaf className="w-4 h-4" />}
                  />
                  <CustomSelect 
                    label="Soil Type" 
                    options={SOIL_TYPES} 
                    value={farming.soilType} 
                    onChange={(v: string) => setFarming(f => ({ ...f, soilType: v }))}
                    icon={<Leaf className="w-4 h-4" />}
                  />
                  <CustomSelect 
                    label="Preferred Language" 
                    options={LANGUAGES} 
                    value={farming.preferredLanguage} 
                    onChange={(v: string) => setFarming(f => ({ ...f, preferredLanguage: v }))}
                    icon={<User className="w-4 h-4" />}
                  />
                  <CustomSelect 
                    label="Farming Experience" 
                    options={EXPERIENCE} 
                    value={farming.farmingExperience} 
                    onChange={(v: string) => setFarming(f => ({ ...f, farmingExperience: v }))}
                    icon={<UserCheck className="w-4 h-4" />}
                  />
                  <CustomSelect 
                    label="Irrigation Type" 
                    options={IRRIGATION} 
                    value={farming.irrigationType} 
                    onChange={(v: string) => setFarming(f => ({ ...f, irrigationType: v }))}
                    icon={<Leaf className="w-4 h-4" />}
                  />
                  <CustomSelect 
                    label="Water Source" 
                    options={WATER_SOURCES} 
                    value={farming.waterSource} 
                    onChange={(v: string) => setFarming(f => ({ ...f, waterSource: v }))}
                    icon={<Leaf className="w-4 h-4" />}
                  />
                  <CustomSelect 
                    label="Fertilizer Usage" 
                    options={FERTILIZERS} 
                    value={farming.fertilizerUsage} 
                    onChange={(v: string) => setFarming(f => ({ ...f, fertilizerUsage: v }))}
                    icon={<Leaf className="w-4 h-4" />}
                  />
                  
                  {/* Multi-select for Current Season Crop */}
                  <MultiSelectDropdown 
                    label="Current Season Crops" 
                    options={SEASON_CROPS} 
                    value={farming.currentSeasonCrop} 
                    onChange={(v: string[]) => setFarming(f => ({ ...f, currentSeasonCrop: v }))}
                    icon={<Leaf className="w-4 h-4" />}
                    placeholder="Select crops (multiple)"
                  />
                  
                  {/* Multi-select for Farm Machinery */}
                  <MultiSelectDropdown 
                    label="Farm Machinery Available" 
                    options={MACHINERY} 
                    value={farming.farmMachinery} 
                    onChange={(v: string[]) => setFarming(f => ({ ...f, farmMachinery: v }))}
                    icon={<Leaf className="w-4 h-4" />}
                    placeholder="Select machinery (multiple)"
                  />
                  
                  {/* Multi-select for Notification Methods */}
                  <MultiSelectDropdown 
                    label="Preferred Notification Method" 
                    options={NOTIFICATION_METHODS} 
                    value={farming.notificationMethod} 
                    onChange={(v: string[]) => setFarming(f => ({ ...f, notificationMethod: v }))}
                    icon={<User className="w-4 h-4" />}
                    placeholder="Select methods (multiple)"
                  />
                </div>

                {/* Soil Image Upload */}
                <div className="space-y-3 border-2 border-dashed border-green-300 rounded-xl p-4 bg-green-50">
                  <Label className="text-sm font-semibold text-green-700 flex items-center gap-2">
                    <Leaf className="w-4 h-4" />
                    Soil Photo (optional)
                  </Label>
                  <p className="text-xs text-gray-500">Upload a photo of your soil to help with better crop recommendations</p>
                  <div
                    className="flex flex-col items-center gap-3 cursor-pointer"
                    onClick={() => soilImageRef.current?.click()}
                  >
                    {farming.soilImage ? (
                      <div className="relative w-full">
                        <img
                          src={farming.soilImage}
                          alt="Soil"
                          className="w-full h-40 object-cover rounded-lg border-2 border-green-400"
                        />
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setFarming(f => ({ ...f, soilImage: '' })); }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-32 border-2 border-dashed border-green-400 rounded-lg flex flex-col items-center justify-center bg-white hover:bg-green-50 transition-colors">
                        <Upload className="w-8 h-8 text-green-500 mb-2" />
                        <span className="text-sm text-green-600 font-medium">Click to upload soil photo</span>
                        <span className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={soilImageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => setFarming(f => ({ ...f, soilImage: reader.result as string }));
                      reader.readAsDataURL(file);
                    }}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => { setStep(1); setError(''); }}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : '✅ Create Account'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}