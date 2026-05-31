 import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  MapPin, 
  Phone, 
  User, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Award, 
  Globe, 
  Briefcase, 
  IndianRupee,
  Sprout,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import StateDropdown from "../components/StateDropdown";
import DistrictDropdown from "../components/DistrictDropdown";

const INDIAN_CROPS = [
  'Rice', 'Wheat', 'Maize', 'Barley', 'Millet', 'Sorghum',
  'Chickpea', 'Lentil', 'Black Gram', 'Green Gram', 'Pigeon Pea',
  'Cotton', 'Sugarcane', 'Jute', 'Tea', 'Coffee', 'Rubber',
  'Groundnut', 'Mustard', 'Sesame', 'Sunflower', 'Safflower',
  'Turmeric', 'Coriander', 'Cumin', 'Fenugreek', 'Black Pepper',
  'Mango', 'Banana', 'Apple', 'Orange', 'Grapes', 'Pomegranate',
  'Tomato', 'Onion', 'Potato', 'Cabbage', 'Cauliflower', 'Brinjal'
].sort();

const FindConsultant = () => {
  const [consultants, setConsultants] = useState([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    state: '',
    district: '',
    expertise: ''
  });

  const fetchConsultants = async () => {
    setLoading(true);
    try {
      const cleanFilters: any = {};
      if (filters.state) cleanFilters.state = filters.state;
      if (filters.district) cleanFilters.district = filters.district;
      if (filters.expertise && filters.expertise !== 'All') cleanFilters.expertise = filters.expertise;

      const params = new URLSearchParams(cleanFilters).toString();
      
      const res = await axios.get(`http://localhost:5000/api/consultants?${params}`);
      setConsultants(res.data);
    } catch (err) {
      console.error("Error fetching consultants", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultants();
  }, [filters]); 

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* --- HERO HEADER --- */}
      <div className="bg-green-900 text-white pb-20 pt-10 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
           <Sprout className="h-64 w-64 -mr-10 -mt-10" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Find Your <span className="text-green-300">Agriculture Expert</span>
          </h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto font-light">
            Connect with certified agronomists, soil scientists, and pest control specialists in your region for personalized farming advice.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10 pb-20">
        
        {/* --- FILTER BAR --- */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-10 border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-green-800 font-semibold border-b border-gray-100 pb-2">
            <Filter className="h-5 w-5" />
            <span>Refine Search</span>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Crop Specialization Dropdown */}
            <div className="relative">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Crop Specialization</label>
              <div className="relative">
                <Award className="absolute left-3 top-4 h-5 w-5 text-gray-400 pointer-events-none" />
                <select 
                  value={filters.expertise}
                  onChange={(e) => handleFilterChange('expertise', e.target.value)}
                  className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition appearance-none text-gray-700 font-medium"
                >
                  <option value="">All Crops</option>
                  {INDIAN_CROPS.map((crop) => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-4 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* State Dropdown */}
            <div className="relative">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">State</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                <StateDropdown
                  value={filters.state}
                  onChange={(val) => handleFilterChange('state', val)}
                  placeholder="Select State"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition appearance-none text-gray-700 font-medium"
                />
                <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            {/* District Dropdown */}
            <div className="relative">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">District</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                <DistrictDropdown
                  selectedState={filters.state}
                  value={filters.district}
                  onChange={(val) => handleFilterChange('district', val)}
                  placeholder="Select District"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition appearance-none text-gray-700 font-medium disabled:bg-gray-100"
                />
                <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* --- RESULTS GRID --- */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-green-600" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consultants.length > 0 ? (
              consultants.map((c: any) => {
                const isExpanded = expandedId === c._id;
                
                return (
                  <div 
                    key={c._id} 
                    className={`bg-white rounded-2xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between
                      ${isExpanded ? 'shadow-2xl ring-2 ring-green-500 transform scale-[1.02] z-10' : 'shadow-md hover:shadow-xl border border-gray-100'}
                    `}
                    onClick={() => toggleExpand(c._id)}
                  >
                    <div className="p-6">
                      {/* Header: Name & Rating */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center overflow-hidden text-green-700 font-bold text-xl shadow-inner">
                            {c.image ? (
                              <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
                            ) : (
                              c.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">{c.name}</h3>
                            <div className="flex items-center gap-1 mt-1">
                               <ShieldCheck className="h-3 w-3 text-blue-500" />
                               <span className="text-xs text-gray-500 font-medium">Verified Expert</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1 border border-yellow-100">
                            <Star className="h-3 w-3 fill-current" /> {c.rating || '4.8'}
                          </div>
                        </div>
                      </div>

                      {/* Expertise Tag */}
                      <div className="mb-3 flex flex-wrap gap-1">
                        <span className="inline-block bg-green-50 text-green-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide border border-green-100">
                          {c.expertise}
                        </span>
                        {c.cropSpecializations && c.cropSpecializations.map((crop: string) => (
                          <span key={crop} className="inline-block bg-orange-50 text-orange-700 text-xs font-medium px-2 py-1 rounded-full border border-orange-100">
                            {crop}
                          </span>
                        ))}
                      </div>
                      
                      {/* Quick Info */}
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" /> 
                          <span className="font-medium">{c.district}, {c.state}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-gray-400" /> 
                          <span>{c.experience} Years Experience</span>
                        </div>
                        {c.profit ? (
                          <div className="flex items-center gap-2">
                            <IndianRupee className="h-4 w-4 text-green-500" /> 
                            <span className="font-medium text-green-700">₹{c.profit} Profit</span>
                          </div>
                        ) : null}
                      </div>

                      {/* EXPANDABLE DETAILS */}
                      <div className={`space-y-3 overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-80 opacity-100 mt-4 pt-4 border-t border-dashed border-gray-200' : 'max-h-0 opacity-0'}`}>
                         {c.about ? (
                           <p className="text-sm text-gray-600 italic">{c.about}</p>
                         ) : null}
                         <div className="grid grid-cols-2 gap-2">
                           <div className="bg-gray-50 p-2 rounded-lg">
                             <p className="text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><Globe className="h-3 w-3" /> Languages</p>
                             <p className="text-sm font-medium text-gray-800">{c.language || 'Hindi, English'}</p>
                           </div>
                           <div className="bg-gray-50 p-2 rounded-lg">
                             <p className="text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><IndianRupee className="h-3 w-3" /> Fees</p>
                             <p className="text-sm font-medium text-green-700">{c.fee === 0 ? "Free Service" : `₹${c.fee} / visit`}</p>
                           </div>
                         </div>
                         <p className="text-xs text-gray-400 italic text-center pt-2">
                           Click "Call Now" to connect directly with {c.name.split(' ')[0]}.
                         </p>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-50 p-4 border-t border-gray-100">
                       <a 
                        href={`tel:${c.phone}`} 
                        onClick={(e) => e.stopPropagation()}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition shadow-lg hover:shadow-green-200 font-bold"
                      >
                        <Phone className="h-5 w-5" /> Call Expert
                      </a>
                      
                      <button 
                        className="w-full text-center text-xs text-gray-400 mt-2 hover:text-green-600 transition flex items-center justify-center gap-1"
                      >
                        {isExpanded ? (
                          <>Show Less <ChevronUp className="h-3 w-3" /></>
                        ) : (
                          <>View Full Details <ChevronDown className="h-3 w-3" /></>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-16 text-center">
                <div className="bg-white rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                   <Search className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">No experts found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your location or specialization filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindConsultant;

