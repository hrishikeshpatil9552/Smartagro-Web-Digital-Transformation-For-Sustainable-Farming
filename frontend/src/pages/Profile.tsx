import React, { useState, useEffect, useRef } from 'react';
import { profileAPI } from '../services/api';
import { Camera, Edit2, Save, X, Lock, Download, LogOut, ChevronDown, ChevronUp, User, MapPin, Sprout, Bell, Bot, BarChart3, Settings, Phone } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import StateDropdown from '../components/StateDropdown';
import DistrictDropdown from '../components/DistrictDropdown';

interface ProfileProps {
  onLogout: () => void;
}

const FARM_SIZES = ['Small (Below 2 Acres)', 'Medium (2–5 Acres)', 'Large (More than 5 Acres)'];
const CROP_TYPES = ['Kharif (Rainy Season Crops)', 'Rabi (Winter Season Crops)', 'Zaid (Summer Season Crops)', 'Mixed Cropping', 'Horticulture (Fruits & Vegetables)'];
const SOIL_TYPES = ['Black', 'Red', 'Alluvial', 'Laterite', 'Sandy', 'Clay', 'Loam'];
const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Punjabi', 'Other'];
const EXPERIENCE = ['< 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'];
const IRRIGATION = ['Drip', 'Sprinkler', 'Flood', 'Canal', 'Well', 'Rain-fed'];
const WATER_SOURCES = ['Borewell', 'Canal', 'River', 'Tank', 'Well', 'Check Dam'];
const SEASON_CROPS = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits'];
const FERTILIZERS = ['Organic', 'Chemical', 'Bio-fertilizers', 'Mixed'];
const MACHINERY = ['Tractor', 'Tiller', 'Thresher', 'Harvester', 'Sprayer', 'Plough', 'None'];
const NOTIFICATION_METHODS = ['SMS', 'WhatsApp', 'Email', 'Voice Call', 'App Notification'];

function Section({ title, icon, children, defaultOpen = true, color = "green" }: { 
  title: string; 
  icon: React.ReactNode;
  children: React.ReactNode; 
  defaultOpen?: boolean;
  color?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const colorClasses = {
    green: 'bg-gradient-to-r from-green-500 to-emerald-600',
    blue: 'bg-gradient-to-r from-blue-500 to-cyan-600',
    purple: 'bg-gradient-to-r from-purple-500 to-pink-600',
    orange: 'bg-gradient-to-r from-orange-500 to-red-600',
    teal: 'bg-gradient-to-r from-teal-500 to-green-600'
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
      <button 
        className="w-full flex items-center justify-between px-6 py-4 text-left bg-white border-l-4 border-green-500 hover:bg-green-50 transition-all duration-300"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg text-green-600">{icon}</div>
          <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-green-600" /> : <ChevronDown className="w-5 h-5 text-green-600" />}
      </button>
      {open && <div className="px-6 pb-6 bg-gradient-to-b from-gray-50 to-white">{children}</div>}
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-3 -mx-3 rounded-lg transition-colors">
      <div className="flex items-center gap-2 sm:w-48 shrink-0">
        {icon}
      <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-medium text-gray-800">{value || <span className="text-gray-400 italic">Not set</span>}</span>
    </div>
  );
}

function EditField({ label, value, onChange, type = 'text', icon }: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <Input 
        type={type} 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className="text-sm border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 rounded-lg" 
      />
    </div>
  );
}

function EditSelect({ label, options, value, onChange, icon }: { 
  label: string; 
  options: string[]; 
  value: string; 
  onChange: (v: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <select 
        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200" 
        value={value} 
        onChange={e => onChange(e.target.value)}
      >
        <option value="">Select...</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function EditCheckbox({ label, options, value, onChange, icon }: { 
  label: string; 
  options: string[]; 
  value: string[]; 
  onChange: (v: string[]) => void;
  icon?: React.ReactNode;
}) {
  const toggle = (opt: string) => onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
  return (
    <div className="space-y-3">
      <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <div className="grid grid-cols-2 gap-3">
        {options.map(opt => (
          <label 
            key={opt} 
            className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer text-sm transition-all duration-200 ${
              value.includes(opt) 
                ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 shadow-sm' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <input 
              type="checkbox" 
              className="w-4 h-4 accent-green-600" 
              checked={value.includes(opt)} 
              onChange={() => toggle(opt)} 
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function Profile({ onLogout }: ProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwData, setPwData] = useState({ current: '', newPw: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const photoRef = useRef<HTMLInputElement>(null);
  const soilPhotoRef = useRef<HTMLInputElement>(null);

  const handleSoilPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await profileAPI.updateProfile({ soilImage: reader.result as string });
        setProfile(res.user);
        setEditData(res.user);
        setSaveMsg('Soil photo updated successfully!');
        setTimeout(() => setSaveMsg(''), 3000);
      } catch (err) {
        setSaveMsg('Failed to update soil photo');
        setTimeout(() => setSaveMsg(''), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    profileAPI.getProfile().then(res => {
      setProfile(res.user);
      setEditData(res.user);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const setE = (field: string, value: any) => setEditData((d: any) => ({ ...d, [field]: value }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setE('profilePhoto', reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await profileAPI.updateProfile(editData);
      setProfile(res.user);
      setEditData(res.user);
      setIsEditing(false);
      setSaveMsg('Profile updated successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPwError(''); setPwSuccess('');
    if (!pwData.current || !pwData.newPw || !pwData.confirm) { setPwError('All fields required'); return; }
    if (pwData.newPw !== pwData.confirm) { setPwError('New passwords do not match'); return; }
    if (pwData.newPw.length < 6) { setPwError('Password must be at least 6 characters'); return; }
    try {
      await profileAPI.changePassword(pwData.current, pwData.newPw);
      setPwSuccess('Password changed successfully!');
      setPwData({ current: '', newPw: '', confirm: '' });
      setTimeout(() => { setShowPasswordModal(false); setPwSuccess(''); }, 2000);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Failed');
    }
  };

  const farmerId = profile?._id ? `AGS-${String(profile._id).slice(-6).toUpperCase()}` : '—';

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent"></div>
        <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 border-4 border-green-200 border-t-transparent"></div>
      </div>
    </div>
  );

  if (!profile) return <div className="text-center py-16 text-gray-500">Failed to load profile.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-2xl p-8 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <User className="w-8 h-8" />
                </div>
                My Profile
              </h1>
              <p className="text-green-100">Manage your farming profile and preferences</p>
            </div>
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => { setIsEditing(false); setEditData(profile); }}
                    className="!bg-black !border-gray-700 !text-white hover:!bg-gray-900 font-medium transition-all duration-200"
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-white text-green-600 hover:bg-green-50 font-bold shadow-lg" 
                    onClick={handleSave} 
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button 
                  size="sm" 
                  className="bg-white text-green-600 hover:bg-green-50 font-bold shadow-lg transform transition-all duration-200 hover:scale-105" 
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {saveMsg && (
          <div className={`px-6 py-4 rounded-xl text-sm font-medium shadow-lg transform transition-all duration-300 ${
            saveMsg.includes('success') 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
              : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
          }`}>
            {saveMsg}
          </div>
        )}

        {/* Enhanced Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-0">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center border-4 border-white shadow-xl group-hover:shadow-2xl transition-all duration-300">
                {(isEditing ? editData?.profilePhoto : profile?.profilePhoto)
                  ? <img src={isEditing ? editData.profilePhoto : profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  : <span className="text-4xl font-bold text-green-600">{profile.name?.[0]?.toUpperCase() || '?'}</span>
                }
              </div>
              {isEditing && (
                <button 
                  onClick={() => photoRef.current?.click()} 
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform duration-200 shadow-lg"
                >
                  <Camera className="w-5 h-5" />
                </button>
              )}
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{profile.name}</h2>
              <p className="text-gray-600 mb-3">{profile.email}</p>
              {/* <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1 text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-bold shadow-md border-2 border-green-600">
                  <User className="w-4 h-4" />
                  Farmer ID: {farmerId}
                </span>
                {profile.phone && (
                  <span className="inline-flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium">
                    📱 {profile.phone}
                  </span>
                )}
              </div> */}

<div className="flex flex-wrap gap-6 justify-center sm:justify-start">
  
  {/* Farmer ID Box */}
  <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-md hover:shadow-lg transition-shadow duration-300">
    <div className="p-2 bg-gray-100 rounded-lg">
      <User className="w-5 h-5 text-gray-700" />
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Farmer ID</p>
      <p className="text-lg font-bold text-black">{farmerId}</p>
    </div>
  </div>

  {/* Phone Number Box */}
  {profile.phone && (
    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="p-2 bg-gray-100 rounded-lg">
        <Phone className="w-5 h-5 text-gray-700" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</p>
        <p className="text-lg font-bold text-black">{profile.phone}</p>
      </div>
    </div>
  )}

</div>


            </div>
          </div>
        </div>

        {/* ===== SECTION 1: Personal Info ===== */}
        <Section title="Personal Information" icon={<User className="w-5 h-5" />} color="green">
          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <EditField label="Full Name" value={editData.name || ''} onChange={v => setE('name', v)} icon={<User className="w-4 h-4 text-gray-400" />} />
              <EditField label="Phone Number" value={editData.phone || ''} onChange={v => setE('phone', v)} icon={<span className="text-gray-400">📱</span>} />
              <EditField label="Date of Birth" value={editData.dateOfBirth || ''} onChange={v => setE('dateOfBirth', v)} type="date" icon={<span className="text-gray-400">📅</span>} />
              {/* <EditSelect label="Gender" options={['Male', 'Female', 'Other']} value={editData.gender || ''} onChange={v => setE('gender', v)} icon={<span className="text-gray-400">⚧</span>} /> */}
            </div>
          ) : (
            <div className="pt-4">
              <InfoRow label="Full Name" value={profile.name} icon={<User className="w-4 h-4 text-gray-400" />} />
              <InfoRow label="Farmer ID" value={farmerId} icon={<span className="text-gray-400">🆔</span>} />
              <InfoRow label="Email Address" value={profile.email} icon={<span className="text-gray-400">✉️</span>} />
              <InfoRow label="Phone Number" value={profile.phone} icon={<span className="text-gray-400">📱</span>} />
              {/* <InfoRow label="Gender" value={profile.gender} icon={<span className="text-gray-400">⚧</span>} /> */}
              <InfoRow label="Date of Birth" value={profile.dateOfBirth} icon={<span className="text-gray-400">📅</span>} />
            </div>
          )}
        </Section>

        {/* ===== SECTION 2: Address ===== */}
        <Section title="Address Details" icon={<MapPin className="w-5 h-5" />} color="blue">
          {isEditing ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-gray-400">🏛️</span> State
                </Label>
                <StateDropdown
                  value={editData.state || ''}
                  onChange={v => { setE('state', v); setE('district', ''); }}
                  className="border-2 border-gray-200 rounded-lg text-sm focus:border-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-gray-400">🏘️</span> District
                </Label>
                <DistrictDropdown
                  selectedState={editData.state || ''}
                  value={editData.district || ''}
                  onChange={v => setE('district', v)}
                  className="border-2 border-gray-200 rounded-lg text-sm focus:border-green-500"
                />
              </div>
              <EditField label="Taluka" value={editData.taluka || ''} onChange={v => setE('taluka', v)} icon={<span className="text-gray-400">📍</span>} />
              <EditField label="Village" value={editData.village || ''} onChange={v => setE('village', v)} icon={<span className="text-gray-400">🏡</span>} />
              <EditField label="Pincode" value={editData.pincode || ''} onChange={v => setE('pincode', v)} icon={<span className="text-gray-400">📮</span>} />
              <div className="col-span-2 sm:col-span-3 space-y-2">
                {/* <Label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-gray-400">📝</span>
                  Address Description
                </Label> */}
                {/* <textarea 
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200" 
                  rows={2} 
                  value={editData.addressDescription || ''} 
                  onChange={e => setE('addressDescription', e.target.value)} 
                /> */}
              </div>
            </div>
          ) : (
            <div className="pt-4">
              <InfoRow label="State" value={profile.state} icon={<span className="text-gray-400">🏛️</span>} />
              <InfoRow label="District" value={profile.district} icon={<span className="text-gray-400">🏘️</span>} />
              <InfoRow label="Taluka" value={profile.taluka} icon={<span className="text-gray-400">📍</span>} />
              <InfoRow label="Village" value={profile.village} icon={<span className="text-gray-400">🏡</span>} />
              <InfoRow label="Pincode" value={profile.pincode} icon={<span className="text-gray-400">📮</span>} />
              {/* <InfoRow label="Full Address" value={profile.addressDescription} icon={<span className="text-gray-400">📝</span>} /> */}
            </div>
          )}
        </Section>

        {/* ===== SECTION 3: Farming Details ===== */}
        <Section title="Farming Details" icon={<Sprout className="w-5 h-5" />} color="green">
          {isEditing ? (
            <div className="space-y-4 pt-4">
              <EditSelect label="Farm Size" options={FARM_SIZES} value={editData.farmSize || ''} onChange={v => setE('farmSize', v)} icon={<span className="text-gray-400">📏</span>} />
              <EditSelect label="Main Crop Type" options={CROP_TYPES} value={editData.mainCropType || ''} onChange={v => setE('mainCropType', v)} icon={<span className="text-gray-400">🌾</span>} />
              <EditSelect label="Current Season Crop" options={SEASON_CROPS} value={editData.currentSeasonCrop || ''} onChange={v => setE('currentSeasonCrop', v)} icon={<span className="text-gray-400">🌱</span>} />
              <EditSelect label="Soil Type" options={SOIL_TYPES} value={editData.soilType || ''} onChange={v => setE('soilType', v)} icon={<span className="text-gray-400">🪨</span>} />
              <EditSelect label="Farming Experience" options={EXPERIENCE} value={editData.farmingExperience || ''} onChange={v => setE('farmingExperience', v)} icon={<span className="text-gray-400">⏰</span>} />
              <EditSelect label="Irrigation Type" options={IRRIGATION} value={editData.irrigationType || ''} onChange={v => setE('irrigationType', v)} icon={<span className="text-gray-400">💧</span>} />
              <EditSelect label="Water Source" options={WATER_SOURCES} value={editData.waterSource || ''} onChange={v => setE('waterSource', v)} icon={<span className="text-gray-400">🌊</span>} />
              <EditSelect label="Fertilizer Usage" options={FERTILIZERS} value={editData.fertilizerUsage || ''} onChange={v => setE('fertilizerUsage', v)} icon={<span className="text-gray-400">🧪</span>} />
              <EditSelect label="Preferred Language" options={LANGUAGES} value={editData.preferredLanguage || ''} onChange={v => setE('preferredLanguage', v)} icon={<span className="text-gray-400">🗣️</span>} />
              <EditCheckbox label="Farm Machinery Available" options={MACHINERY} value={editData.farmMachinery || []} onChange={v => setE('farmMachinery', v)} icon={<span className="text-gray-400">🚜</span>} />
            </div>
          ) : (
            <div className="pt-4">
              <InfoRow label="Farm Size" value={profile.farmSize} icon={<span className="text-gray-400">📏</span>} />
              <InfoRow label="Main Crop Type" value={profile.mainCropType} icon={<span className="text-gray-400">🌾</span>} />
              <InfoRow label="Current Season Crop" value={profile.currentSeasonCrop} icon={<span className="text-gray-400">🌱</span>} />
              <InfoRow label="Soil Type" value={profile.soilType} icon={<span className="text-gray-400">🪨</span>} />
              <InfoRow label="Farming Experience" value={profile.farmingExperience} icon={<span className="text-gray-400">⏰</span>} />
              <InfoRow label="Irrigation Type" value={profile.irrigationType} icon={<span className="text-gray-400">💧</span>} />
              <InfoRow label="Water Source" value={profile.waterSource} icon={<span className="text-gray-400">🌊</span>} />
              <InfoRow label="Fertilizer Usage" value={profile.fertilizerUsage} icon={<span className="text-gray-400">🧪</span>} />
              <InfoRow label="Preferred Language" value={profile.preferredLanguage} icon={<span className="text-gray-400">🗣️</span>} />
              <InfoRow label="Farm Machinery" value={profile.farmMachinery?.join(', ')} icon={<span className="text-gray-400">🚜</span>} />
            </div>
          )}
        </Section>

        {/* ===== SECTION: Soil Photo ===== */}
        <Section title="Soil Photo" icon={<span className="text-xl">🪨</span>} color="teal" defaultOpen={false}>
          <div className="pt-4">
            {profile.soilImage ? (
              <div className="relative group">
                <img
                  src={profile.soilImage}
                  alt="Soil"
                  className="w-full max-w-sm mx-auto h-48 object-cover rounded-xl border-2 border-green-200 shadow-md"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all" />
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <span className="text-4xl mb-2 block">🪨</span>
                <p className="text-gray-500 text-sm">No soil photo uploaded yet</p>
              </div>
            )}
          </div>
        </Section>

        {/* ===== SECTION 4: Notifications ===== */}
        <Section title="Notification & Communication" icon={<Bell className="w-5 h-5" />} color="purple">
          {isEditing ? (
            <div className="space-y-4 pt-4">
              <EditCheckbox label="Preferred Notification Method" options={NOTIFICATION_METHODS} value={editData.notificationMethod || []} onChange={v => setE('notificationMethod', v)} icon={<span className="text-gray-400">📢</span>} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { field: 'smsAlerts', label: 'SMS Alerts', icon: '📱' },
                  { field: 'whatsappAlerts', label: 'WhatsApp Alerts', icon: '💬' },
                  { field: 'emailAlerts', label: 'Email Alerts', icon: '📧' },
                ].map(({ field, label, icon }) => (
                  <label 
                    key={field} 
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer text-sm transition-all duration-200 ${
                      editData[field] 
                        ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{icon}</span>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-purple-600" 
                      checked={!!editData[field]} 
                      onChange={e => setE(field, e.target.checked)} 
                    />
                    <span className="font-medium">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="pt-4">
              <InfoRow label="Notification Methods" value={profile.notificationMethod?.join(', ')} icon={<span className="text-gray-400">📢</span>} />
              <InfoRow label="SMS Alerts" value={profile.smsAlerts ? '✅ Enabled' : '❌ Disabled'} icon={<span className="text-gray-400">📱</span>} />
              <InfoRow label="WhatsApp Alerts" value={profile.whatsappAlerts ? '✅ Enabled' : '❌ Disabled'} icon={<span className="text-gray-400">💬</span>} />
              <InfoRow label="Email Alerts" value={profile.emailAlerts ? '✅ Enabled' : '❌ Disabled'} icon={<span className="text-gray-400">📧</span>} />
            </div>
          )}
        </Section>

        {/* ===== SECTION 5: AI & Advisory ===== */}
        <Section title="AI & Advisory Information" icon={<Bot className="w-5 h-5" />} color="teal" defaultOpen={false}>
          <div className="pt-4">
            <InfoRow label="Last Crop Recommendation" value={profile.lastCropRecommendation} icon={<span className="text-gray-400">🌾</span>} />
            <InfoRow label="Last Disease Detection" value={profile.lastDiseaseDetection} icon={<span className="text-gray-400">🔬</span>} />
            <InfoRow label="Last Market Price Prediction" value={profile.lastMarketPricePrediction} icon={<span className="text-gray-400">📈</span>} />
            <InfoRow label="Govt. Scheme Suggestions" value={profile.governmentSchemeSuggestions} icon={<span className="text-gray-400">🏛️</span>} />
            <InfoRow label="Expert Consultation Status" value={profile.expertConsultationStatus} icon={<span className="text-gray-400">👨‍🌾</span>} />
          </div>
        </Section>

        {/* ===== SECTION 6: Activity ===== */}
        <Section title="Activity Dashboard" icon={<BarChart3 className="w-5 h-5" />} color="orange" defaultOpen={false}>
          <div className="pt-4">
            <InfoRow label="Total Queries Submitted" value={String(profile.totalQueries ?? 0)} icon={<span className="text-gray-400">❓</span>} />
            <InfoRow label="Total Expert Consultations" value={String(profile.totalConsultations ?? 0)} icon={<span className="text-gray-400">👨‍🏫</span>} />
            <InfoRow label="Last Login" value={profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : undefined} icon={<span className="text-gray-400">🔑</span>} />
            <InfoRow label="Account Created" value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : undefined} icon={<span className="text-gray-400">📅</span>} />
          </div>
        </Section>

        {/* ===== SECTION 7: Actions ===== */}
        <Section title="Quick Actions" icon={<Settings className="w-5 h-5" />} color="orange" defaultOpen={false}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            <Button 
              variant="outline" 
              className="text-sm p-4 h-auto flex flex-col items-center gap-2 border-2 hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Edit Profile</span>
            </Button>
            <Button 
              variant="outline" 
              className="text-sm p-4 h-auto flex flex-col items-center gap-2 border-2 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
              onClick={() => setShowPasswordModal(true)}
            >
              <Lock className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Change Password</span>
            </Button>
            <Button 
              variant="outline" 
              className="text-sm p-4 h-auto flex flex-col items-center gap-2 border-2 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group"
              onClick={() => photoRef.current?.click()}
            >
              <Camera className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Update Photo</span>
            </Button>
            <Button 
              variant="outline" 
              className="text-sm p-4 h-auto flex flex-col items-center gap-2 border-2 hover:border-yellow-500 hover:bg-yellow-50 transition-all duration-200 group"
              onClick={() => soilPhotoRef.current?.click()}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">🪨</span>
              <span className="font-medium">Update Soil Photo</span>
            </Button>
            <input ref={soilPhotoRef} type="file" accept="image/*" className="hidden" onChange={handleSoilPhotoChange} />
            <Button 
              variant="outline" 
              className="text-sm p-4 h-auto flex flex-col items-center gap-2 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-200 group sm:col-span-2 lg:col-span-1" 
              onClick={onLogout}
            >
              <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </Section>

        {/* ===== CHANGE PASSWORD MODAL ===== */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-6 transform transition-all duration-300 scale-100">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Lock className="w-6 h-6 text-blue-600" />
                  </div>
                  Change Password
                </h3>
                <button 
                  onClick={() => { 
                    setShowPasswordModal(false); 
                    setPwError(''); 
                    setPwSuccess(''); 
                    setPwData({ current: '', newPw: '', confirm: '' }); 
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              {pwError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div className="text-sm text-green-600 bg-green-50 border border-green-200 px-4 py-3 rounded-lg flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  {pwSuccess}
                </div>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Current Password</Label>
                  <Input 
                    type="password" 
                    value={pwData.current} 
                    onChange={e => setPwData(p => ({ ...p, current: e.target.value }))} 
                    className="border-2 focus:border-blue-500 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">New Password</Label>
                  <Input 
                    type="password" 
                    value={pwData.newPw} 
                    onChange={e => setPwData(p => ({ ...p, newPw: e.target.value }))} 
                    className="border-2 focus:border-blue-500 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Confirm New Password</Label>
                  <Input 
                    type="password" 
                    value={pwData.confirm} 
                    onChange={e => setPwData(p => ({ ...p, confirm: e.target.value }))} 
                    className="border-2 focus:border-blue-500 focus:ring-blue-200"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 border-2 hover:bg-gray-50" 
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 !bg-gradient-to-r !from-blue-700 !to-cyan-700 text-white font-semibold shadow-lg" 
                  onClick={handlePasswordChange}
                >
                  Update Password
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}










// import React, { useState, useEffect, useRef } from 'react';
// import { profileAPI } from '../services/api';
// import { Camera, Edit2, Save, X, Lock, Download, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
// import { Button } from '../components/ui/button';
// import { Input } from '../components/ui/input';
// import { Label } from '../components/ui/label';

// interface ProfileProps {
//   onLogout: () => void;
// }

// const FARM_SIZES = ['Small (Below 2 Acres)', 'Medium (2–5 Acres)', 'Large (More than 5 Acres)'];
// const CROP_TYPES = ['Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Maize', 'Vegetables', 'Fruits'];
// const SOIL_TYPES = ['Black Soil', 'Red Soil', 'Sandy Soil', 'Clay Soil', 'Loamy Soil'];
// const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada'];
// const EXPERIENCE = ['Less than 1 Year', '1–3 Years', '3–5 Years', 'More than 5 Years'];
// const IRRIGATION = ['Drip Irrigation', 'Canal Irrigation', 'Sprinkler Irrigation', 'Borewell Irrigation', 'Rain-fed Farming'];
// const WATER_SOURCES = ['River', 'Well', 'Borewell', 'Pond', 'Rainwater'];
// const SEASON_CROPS = ['Wheat', 'Rice', 'Cotton', 'Soybean', 'Sugarcane', 'Vegetables'];
// const FERTILIZERS = ['Organic Fertilizer', 'Chemical Fertilizer', 'Mixed Fertilizer', 'No Fertilizer'];
// const MACHINERY = ['Tractor', 'Water Pump', 'Sprayer', 'Harvester', 'Plough', 'None'];
// const NOTIFICATION_METHODS = ['SMS', 'WhatsApp', 'Email', 'Mobile App Notification'];

// function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
//   const [open, setOpen] = useState(defaultOpen);
//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//       <button className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors" onClick={() => setOpen(o => !o)}>
//         <h3 className="font-bold text-gray-800">{title}</h3>
//         {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
//       </button>
//       {open && <div className="px-6 pb-5">{children}</div>}
//     </div>
//   );
// }

// function InfoRow({ label, value }: { label: string; value?: string }) {
//   return (
//     <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-2 border-b border-gray-50 last:border-0">
//       <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide sm:w-48 shrink-0">{label}</span>
//       <span className="text-sm text-gray-800">{value || <span className="text-gray-300 italic">Not set</span>}</span>
//     </div>
//   );
// }

// function EditField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
//   return (
//     <div className="space-y-1">
//       <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</Label>
//       <Input type={type} value={value} onChange={e => onChange(e.target.value)} className="text-sm" />
//     </div>
//   );
// }

// function EditSelect({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
//   return (
//     <div className="space-y-1">
//       <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</Label>
//       <select className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" value={value} onChange={e => onChange(e.target.value)}>
//         <option value="">Select...</option>
//         {options.map(o => <option key={o}>{o}</option>)}
//       </select>
//     </div>
//   );
// }

// function EditCheckbox({ label, options, value, onChange }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void }) {
//   const toggle = (opt: string) => onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
//   return (
//     <div className="space-y-2">
//       <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</Label>
//       <div className="grid grid-cols-2 gap-2">
//         {options.map(opt => (
//           <label key={opt} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm ${value.includes(opt) ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200'}`}>
//             <input type="checkbox" className="accent-green-600" checked={value.includes(opt)} onChange={() => toggle(opt)} />
//             {opt}
//           </label>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default function Profile({ onLogout }: ProfileProps) {
//   const [profile, setProfile] = useState<any>(null);
//   const [editData, setEditData] = useState<any>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [showPasswordModal, setShowPasswordModal] = useState(false);
//   const [pwData, setPwData] = useState({ current: '', newPw: '', confirm: '' });
//   const [pwError, setPwError] = useState('');
//   const [pwSuccess, setPwSuccess] = useState('');
//   const [saveMsg, setSaveMsg] = useState('');
//   const [loading, setLoading] = useState(true);
//   const photoRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     profileAPI.getProfile().then(res => {
//       setProfile(res.user);
//       setEditData(res.user);
//     }).catch(() => {}).finally(() => setLoading(false));
//   }, []);

//   const setE = (field: string, value: any) => setEditData((d: any) => ({ ...d, [field]: value }));

//   const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onloadend = () => setE('profilePhoto', reader.result as string);
//     reader.readAsDataURL(file);
//   };

//   const handleSave = async () => {
//     setIsSaving(true);
//     try {
//       const res = await profileAPI.updateProfile(editData);
//       setProfile(res.user);
//       setEditData(res.user);
//       setIsEditing(false);
//       setSaveMsg('Profile updated successfully!');
//       setTimeout(() => setSaveMsg(''), 3000);
//     } catch (err) {
//       setSaveMsg(err instanceof Error ? err.message : 'Update failed');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handlePasswordChange = async () => {
//     setPwError(''); setPwSuccess('');
//     if (!pwData.current || !pwData.newPw || !pwData.confirm) { setPwError('All fields required'); return; }
//     if (pwData.newPw !== pwData.confirm) { setPwError('New passwords do not match'); return; }
//     if (pwData.newPw.length < 6) { setPwError('Password must be at least 6 characters'); return; }
//     try {
//       await profileAPI.changePassword(pwData.current, pwData.newPw);
//       setPwSuccess('Password changed successfully!');
//       setPwData({ current: '', newPw: '', confirm: '' });
//       setTimeout(() => { setShowPasswordModal(false); setPwSuccess(''); }, 2000);
//     } catch (err) {
//       setPwError(err instanceof Error ? err.message : 'Failed');
//     }
//   };

//   const farmerId = profile?._id ? `AGS-${String(profile._id).slice(-6).toUpperCase()}` : '—';

//   if (loading) return (
//     <div className="flex items-center justify-center py-24">
//       <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent" />
//     </div>
//   );

//   if (!profile) return <div className="text-center py-16 text-gray-500">Failed to load profile.</div>;

//   return (
//     <div className="max-w-3xl mx-auto py-6 px-4 space-y-4 pb-16">

//       {/* Top bar */}
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
//         <div className="flex gap-2">
//           {isEditing ? (
//             <>
//               <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setEditData(profile); }}>
//                 <X className="w-4 h-4 mr-1" /> Cancel
//               </Button>
//               <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSave} disabled={isSaving}>
//                 <Save className="w-4 h-4 mr-1" /> {isSaving ? 'Saving...' : 'Save Changes'}
//               </Button>
//             </>
//           ) : (
//             <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setIsEditing(true)}>
//               <Edit2 className="w-4 h-4 mr-1" /> Edit Profile
//             </Button>
//           )}
//         </div>
//       </div>

//       {saveMsg && <div className={`px-4 py-2 rounded text-sm ${saveMsg.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{saveMsg}</div>}

//       {/* Profile Photo + Name Card */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
//         <div className="relative">
//           <div className="w-20 h-20 rounded-full overflow-hidden bg-green-100 flex items-center justify-center border-2 border-green-200">
//             {(isEditing ? editData?.profilePhoto : profile?.profilePhoto)
//               ? <img src={isEditing ? editData.profilePhoto : profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
//               : <span className="text-2xl font-bold text-green-600">{profile.name?.[0]?.toUpperCase() || '?'}</span>
//             }
//           </div>
//           {isEditing && (
//             <button onClick={() => photoRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700">
//               <Camera className="w-3.5 h-3.5" />
//             </button>
//           )}
//           <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
//         </div>
//         <div>
//           <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
//           <p className="text-sm text-gray-500">{profile.email}</p>
//           <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Farmer ID: {farmerId}</span>
//         </div>
//       </div>

//       {/* ===== SECTION 1: Personal Info ===== */}
//       <Section title="👤 Personal Information">
//         {isEditing ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
//             <EditField label="Full Name" value={editData.name || ''} onChange={v => setE('name', v)} />
//             <EditField label="Phone Number" value={editData.phone || ''} onChange={v => setE('phone', v)} />
//             <EditField label="Date of Birth" value={editData.dateOfBirth || ''} onChange={v => setE('dateOfBirth', v)} type="date" />
//             <EditSelect label="Gender" options={['Male', 'Female', 'Other']} value={editData.gender || ''} onChange={v => setE('gender', v)} />
//           </div>
//         ) : (
//           <div className="pt-2">
//             <InfoRow label="Full Name" value={profile.name} />
//             <InfoRow label="Farmer ID" value={farmerId} />
//             <InfoRow label="Email Address" value={profile.email} />
//             <InfoRow label="Phone Number" value={profile.phone} />
//             {/* <InfoRow label="Gender" value={profile.gender} /> */}
//             <InfoRow label="Date of Birth" value={profile.dateOfBirth} />
//           </div>
//         )}
//       </Section>

//       {/* ===== SECTION 2: Address ===== */}
//       <Section title="📍 Address Details">
//         {isEditing ? (
//           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
//             <EditField label="State" value={editData.state || ''} onChange={v => setE('state', v)} />
//             <EditField label="District" value={editData.district || ''} onChange={v => setE('district', v)} />
//             <EditField label="Taluka" value={editData.taluka || ''} onChange={v => setE('taluka', v)} />
//             <EditField label="Village" value={editData.village || ''} onChange={v => setE('village', v)} />
//             <EditField label="Pincode" value={editData.pincode || ''} onChange={v => setE('pincode', v)} />
//             <div className="col-span-2 sm:col-span-3 space-y-1">
//               <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address Description</Label>
//               <textarea className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" rows={2} value={editData.addressDescription || ''} onChange={e => setE('addressDescription', e.target.value)} />
//             </div>
//           </div>
//         ) : (
//           <div className="pt-2">
//             <InfoRow label="State" value={profile.state} />
//             <InfoRow label="District" value={profile.district} />
//             <InfoRow label="Taluka" value={profile.taluka} />
//             <InfoRow label="Village" value={profile.village} />
//             <InfoRow label="Pincode" value={profile.pincode} />
//             <InfoRow label="Full Address" value={profile.addressDescription} />
//           </div>
//         )}
//       </Section>

//       {/* ===== SECTION 3: Farming Details ===== */}
//       <Section title="🌾 Farming Details">
//         {isEditing ? (
//           <div className="space-y-4 pt-2">
//             <EditSelect label="Farm Size" options={FARM_SIZES} value={editData.farmSize || ''} onChange={v => setE('farmSize', v)} />
//             <EditSelect label="Main Crop Type" options={CROP_TYPES} value={editData.mainCropType || ''} onChange={v => setE('mainCropType', v)} />
//             <EditSelect label="Current Season Crop" options={SEASON_CROPS} value={editData.currentSeasonCrop || ''} onChange={v => setE('currentSeasonCrop', v)} />
//             <EditSelect label="Soil Type" options={SOIL_TYPES} value={editData.soilType || ''} onChange={v => setE('soilType', v)} />
//             <EditSelect label="Farming Experience" options={EXPERIENCE} value={editData.farmingExperience || ''} onChange={v => setE('farmingExperience', v)} />
//             <EditSelect label="Irrigation Type" options={IRRIGATION} value={editData.irrigationType || ''} onChange={v => setE('irrigationType', v)} />
//             <EditSelect label="Water Source" options={WATER_SOURCES} value={editData.waterSource || ''} onChange={v => setE('waterSource', v)} />
//             <EditSelect label="Fertilizer Usage" options={FERTILIZERS} value={editData.fertilizerUsage || ''} onChange={v => setE('fertilizerUsage', v)} />
//             <EditSelect label="Preferred Language" options={LANGUAGES} value={editData.preferredLanguage || ''} onChange={v => setE('preferredLanguage', v)} />
//             <EditCheckbox label="Farm Machinery Available" options={MACHINERY} value={editData.farmMachinery || []} onChange={v => setE('farmMachinery', v)} />
//           </div>
//         ) : (
//           <div className="pt-2">
//             <InfoRow label="Farm Size" value={profile.farmSize} />
//             <InfoRow label="Main Crop Type" value={profile.mainCropType} />
//             <InfoRow label="Current Season Crop" value={profile.currentSeasonCrop} />
//             <InfoRow label="Soil Type" value={profile.soilType} />
//             <InfoRow label="Farming Experience" value={profile.farmingExperience} />
//             <InfoRow label="Irrigation Type" value={profile.irrigationType} />
//             <InfoRow label="Water Source" value={profile.waterSource} />
//             <InfoRow label="Fertilizer Usage" value={profile.fertilizerUsage} />
//             <InfoRow label="Preferred Language" value={profile.preferredLanguage} />
//             <InfoRow label="Farm Machinery" value={profile.farmMachinery?.join(', ')} />
//           </div>
//         )}
//       </Section>

//       {/* ===== SECTION 4: Notifications ===== */}
//       <Section title="🔔 Notification & Communication">
//         {isEditing ? (
//           <div className="space-y-4 pt-2">
//             <EditCheckbox label="Preferred Notification Method" options={NOTIFICATION_METHODS} value={editData.notificationMethod || []} onChange={v => setE('notificationMethod', v)} />
//             <div className="grid grid-cols-3 gap-3">
//               {[
//                 { field: 'smsAlerts', label: 'SMS Alerts' },
//                 { field: 'whatsappAlerts', label: 'WhatsApp Alerts' },
//                 { field: 'emailAlerts', label: 'Email Alerts' },
//               ].map(({ field, label }) => (
//                 <label key={field} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer text-sm ${editData[field] ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200'}`}>
//                   <input type="checkbox" className="accent-green-600" checked={!!editData[field]} onChange={e => setE(field, e.target.checked)} />
//                   {label}
//                 </label>
//               ))}
//             </div>
//           </div>
//         ) : (
//           <div className="pt-2">
//             <InfoRow label="Notification Methods" value={profile.notificationMethod?.join(', ')} />
//             <InfoRow label="SMS Alerts" value={profile.smsAlerts ? 'Enabled' : 'Disabled'} />
//             <InfoRow label="WhatsApp Alerts" value={profile.whatsappAlerts ? 'Enabled' : 'Disabled'} />
//             <InfoRow label="Email Alerts" value={profile.emailAlerts ? 'Enabled' : 'Disabled'} />
//           </div>
//         )}
//       </Section>

//       {/* ===== SECTION 5: AI & Advisory ===== */}
//       <Section title="🤖 AI & Advisory Information" defaultOpen={false}>
//         <div className="pt-2">
//           <InfoRow label="Last Crop Recommendation" value={profile.lastCropRecommendation} />
//           <InfoRow label="Last Disease Detection" value={profile.lastDiseaseDetection} />
//           <InfoRow label="Last Market Price Prediction" value={profile.lastMarketPricePrediction} />
//           <InfoRow label="Govt. Scheme Suggestions" value={profile.governmentSchemeSuggestions} />
//           <InfoRow label="Expert Consultation Status" value={profile.expertConsultationStatus} />
//         </div>
//       </Section>

//       {/* ===== SECTION 6: Activity ===== */}
//       <Section title="📊 Activity" defaultOpen={false}>
//         <div className="pt-2">
//           <InfoRow label="Total Queries Submitted" value={String(profile.totalQueries ?? 0)} />
//           <InfoRow label="Total Expert Consultations" value={String(profile.totalConsultations ?? 0)} />
//           <InfoRow label="Last Login" value={profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : undefined} />
//           <InfoRow label="Account Created" value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : undefined} />
//         </div>
//       </Section>

//       {/* ===== SECTION 7: Actions ===== */}
//       <Section title="⚙️ Actions" defaultOpen={false}>
//         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
//           <Button variant="outline" className="text-sm" onClick={() => setIsEditing(true)}>
//             <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
//           </Button>
//           <Button variant="outline" className="text-sm" onClick={() => setShowPasswordModal(true)}>
//             <Lock className="w-4 h-4 mr-2" /> Change Password
//           </Button>
//           <Button variant="outline" className="text-sm" onClick={() => photoRef.current?.click()}>
//             <Camera className="w-4 h-4 mr-2" /> Update Photo
//           </Button>
//           <Button variant="outline" className="text-sm text-red-600 hover:bg-red-50 hover:text-red-700 col-span-2 sm:col-span-1" onClick={onLogout}>
//             <LogOut className="w-4 h-4 mr-2" /> Logout
//           </Button>
//         </div>
//       </Section>

//       {/* ===== CHANGE PASSWORD MODAL ===== */}
//       {showPasswordModal && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
//             <div className="flex items-center justify-between">
//               <h3 className="font-bold text-gray-800">Change Password</h3>
//               <button onClick={() => { setShowPasswordModal(false); setPwError(''); setPwSuccess(''); setPwData({ current: '', newPw: '', confirm: '' }); }}>
//                 <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
//               </button>
//             </div>
//             {pwError && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{pwError}</div>}
//             {pwSuccess && <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded">{pwSuccess}</div>}
//             <div className="space-y-3">
//               <div className="space-y-1">
//                 <Label>Current Password</Label>
//                 <Input type="password" value={pwData.current} onChange={e => setPwData(p => ({ ...p, current: e.target.value }))} />
//               </div>
//               <div className="space-y-1">
//                 <Label>New Password</Label>
//                 <Input type="password" value={pwData.newPw} onChange={e => setPwData(p => ({ ...p, newPw: e.target.value }))} />
//               </div>
//               <div className="space-y-1">
//                 <Label>Confirm New Password</Label>
//                 <Input type="password" value={pwData.confirm} onChange={e => setPwData(p => ({ ...p, confirm: e.target.value }))} />
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <Button variant="outline" className="flex-1" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
//               <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handlePasswordChange}>Update Password</Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
