import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Consultant } from "../types/Consultatnt";
import { MapPin, User, Award, Phone, IndianRupee, Briefcase, Loader2, Search, MoreVertical, Pencil, Trash2, AlertTriangle } from "lucide-react";
import StateDropdown from "../components/StateDropdown";
import DistrictDropdown from "../components/DistrictDropdown";

interface UserConsultantsProps {
  onBack?: () => void;
}

const INDIAN_CROPS = [
  'Rice', 'Wheat', 'Maize', 'Barley', 'Millet', 'Sorghum',
  'Chickpea', 'Lentil', 'Black Gram', 'Green Gram', 'Pigeon Pea',
  'Cotton', 'Sugarcane', 'Jute', 'Tea', 'Coffee', 'Rubber',
  'Groundnut', 'Mustard', 'Sesame', 'Sunflower', 'Safflower',
  'Turmeric', 'Coriander', 'Cumin', 'Fenugreek', 'Black Pepper',
  'Mango', 'Banana', 'Apple', 'Orange', 'Grapes', 'Pomegranate',
  'Tomato', 'Onion', 'Potato', 'Cabbage', 'Cauliflower', 'Brinjal'
].sort();

const UserConsultants = ({ onBack }: UserConsultantsProps = {}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'ArrowUp') {
        onBack?.();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onBack]);

  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCrop, setUserCrop] = useState("");
  const [searchState, setSearchState] = useState("");
  const [searchDistrict, setSearchDistrict] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [consultantToDelete, setConsultantToDelete] = useState<Consultant | null>(null);

  const isPasswordVerified = localStorage.getItem('consultantPasswordVerified') === 'true';

  const handleDeleteClick = (consultant: Consultant) => {
    setOpenMenuId(null);
    setConsultantToDelete(consultant);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!consultantToDelete) return;
    try {
      const id = consultantToDelete._id || consultantToDelete.id;
      const res = await fetch(`/api/consultants/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setConsultants(prev => prev.filter(c => (c._id || c.id) !== id));
    } catch (err) {
      alert('Failed to delete consultant. Please try again.');
    } finally {
      setDeleteModalOpen(false);
      setConsultantToDelete(null);
    }
  };

  const handleUpdate = (consultant: Consultant) => {
    setOpenMenuId(null);
    navigate('/add-consultant', { state: { consultantToEdit: consultant } });
  };

  const fetchConsultants = async (params?: Record<string, string>) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (params?.state) query.append('state', params.state);
      if (params?.district) query.append('district', params.district);
      if (params?.crop) query.append('crop', params.crop);

      const res = await fetch(`/api/consultants?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setConsultants(data);
    } catch (err) {
      console.error("Error fetching consultants", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultants();
  }, []);

  const handleSearch = () => {
    fetchConsultants({
      state: searchState,
      district: searchDistrict,
      crop: userCrop,
    });
  };

  const handleClear = () => {
    setUserCrop("");
    setSearchState("");
    setSearchDistrict("");
    fetchConsultants();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col">
      <div className="flex-grow max-w-7xl mx-auto p-6 w-full">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            Find Recommended Consultants
          </h1>
          <p className="text-xl text-gray-600">Search for agricultural experts in your area and crop specialization</p>
        </div>

        {/* Find Consultant Form */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Find Agricultural Consultants</h3>
              <p className="text-gray-600">Search for experts in your area and crop specialization</p>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    State
                  </label>
                  <StateDropdown
                    value={searchState}
                    onChange={(val) => { setSearchState(val); setSearchDistrict(""); }}
                    placeholder="Select State"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    District
                  </label>
                  <DistrictDropdown
                    selectedState={searchState}
                    value={searchDistrict}
                    onChange={setSearchDistrict}
                    placeholder="Select District"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-gray-800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Award className="w-4 h-4 text-orange-600" />
                  Crop Specialization
                </label>
                <select
                  value={userCrop}
                  onChange={(e) => setUserCrop(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-gray-800 bg-white"
                >
                  <option value="">All Crops</option>
                  {INDIAN_CROPS.map((crop) => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center gap-4">
                <button 
                  onClick={handleSearch}
                  className="w-64 h-14 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Search className="w-5 h-5" />
                  Find Consultants
                </button>

                <button 
                  onClick={handleClear}
                  className="w-64 h-14 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Consultants from Backend */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Our Consultant Network</h3>
            <p className="text-gray-500 max-w-xl mx-auto mb-4">Verified agricultural experts from across the country ready to help you succeed.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-green-600" />
            </div>
          ) : consultants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {consultants.map((consultant) => {
                const maxCropsToShow = 3;
                const visibleCrops = consultant.cropSpecializations?.slice(0, maxCropsToShow) || [];
                const remainingCrops = (consultant.cropSpecializations?.length || 0) - maxCropsToShow;
                const hasCrops = consultant.cropSpecializations && consultant.cropSpecializations.length > 0;

                return (
                  <div 
                    key={consultant._id || consultant.id} 
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden cursor-pointer group flex flex-col h-full border border-gray-100 relative"
                  >
                    {/* Three-dots menu */}
                    {isPasswordVerified && (
                      <div className="absolute top-4 right-4 z-20">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === (consultant._id || consultant.id) ? null : (consultant._id || consultant.id || '')); }}
                          className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                        {openMenuId === (consultant._id || consultant.id) && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 top-10 w-44 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                              <button
                                onClick={() => handleUpdate(consultant)}
                                className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-all duration-200 group/item"
                              >
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-600 group-hover/item:bg-green-200 transition-colors">
                                  <Pencil className="w-4 h-4" />
                                </span>
                                Update
                              </button>
                              <div className="border-t border-gray-100 mx-3"></div>
                              <button
                                onClick={() => handleDeleteClick(consultant)}
                                className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-3 transition-all duration-200 group/item"
                              >
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 group-hover/item:bg-red-200 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </span>
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Increased overall padding from p-5 to p-6 */}
                    <div className="p-6 flex flex-col flex-grow">
                      
                      {/* Header - Spaced out horizontal layout */}
                      <div className="flex items-center gap-4 mb-5">
                        {/* Increased image size from w-14 h-14 to w-16 h-16 */}
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-50 flex-shrink-0 flex items-center justify-center border-2 border-green-100 shadow-sm">
                          {consultant.image ? (
                            <img src={consultant.image} alt={consultant.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          {/* Increased font from text-base to text-lg */}
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors truncate">{consultant.name}</h3>
                          {/* Increased font from text-xs to text-sm */}
                          <p className="text-green-600 font-semibold text-sm">{consultant.expertise} Specialist</p>
                        </div>
                      </div>
                      
                      {/* Details - Increased spacing from space-y-1.5 to space-y-3 */}
                      <div className="space-y-3 text-sm flex-grow">
                        
                        {/* Location Box - Increased padding to p-3 */}
                        <div className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-lg">
                          <MapPin className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
                          <span className="font-medium text-sm truncate">{consultant.district}, {consultant.state}</span>
                        </div>
                        
                        {/* Experience - Increased icon/text size */}
                        <div className="flex items-center text-gray-600">
                          <Briefcase className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                          <span className="text-sm">{consultant.experience} Years Experience</span>
                        </div>
                        
                        {/* Profit - Increased padding to p-3 */}
                        <div className={`p-3 rounded-lg border ${consultant.profit ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                          {consultant.profit ? (
                            <>
                              <p className="text-green-700 text-xs font-semibold flex items-center gap-1">
                                <IndianRupee className="w-3 h-3" /> Estimated Profit
                              </p>
                              <p className="text-green-800 text-lg font-bold">₹{consultant.profit.toLocaleString()}</p>
                            </>
                          ) : (
                            <>
                              <p className="text-gray-400 text-xs font-semibold">Estimated Profit</p>
                              <p className="text-gray-400 text-lg font-bold">—</p>
                            </>
                          )}
                        </div>
                        
                        {/* About - Increased min height and font size */}
                        <div className="min-h-[3rem] py-1">
                          {consultant.about ? (
                            <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{consultant.about}</p>
                          ) : (
                            <p className="text-gray-300 text-sm italic">No description available</p>
                          )}
                        </div>
                        
                        {/* Crop tags - Increased tag size and spacing */}
                        <div className="min-h-[2rem] pt-1">
                          {hasCrops ? (
                            <div className="flex flex-wrap gap-1.5">
                              {visibleCrops.map((crop) => (
                                <span key={crop} className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full border border-orange-200 font-medium">
                                  {crop}
                                </span>
                              ))}
                              {remainingCrops > 0 && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                                  +{remainingCrops} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs bg-gray-100 text-gray-400 px-2.5 py-1 rounded-full font-medium">No crops listed</span>
                          )}
                        </div>
                      </div>

                      {/* Footer - Increased spacing and button size */}
                      <div className="mt-auto pt-5 border-t border-gray-100 flex flex-col gap-3">
                        <p className="text-gray-500 text-sm flex items-center gap-2">
                          <Phone className="w-4 h-4 text-green-500" /> 
                          <span className="font-mono tracking-wide text-xs">{consultant.phone}</span>
                        </p>
                        <a 
                          href={`tel:${consultant.phone}`}
                          className="w-full block text-center bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-colors text-sm font-bold shadow-sm hover:shadow-md"
                        >
                          Contact Consultant
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="bg-gray-50 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">No consultants found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters or add a new consultant.</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteModalOpen && consultantToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-80 p-6 transform transition-all mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Consultant?</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-800">{consultantToDelete.name}</span>? This action cannot be undone.
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 px-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserConsultants;




















// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Consultant } from "../types/Consultatnt";
// import { MapPin, User, Award, Phone, IndianRupee, Briefcase, Loader2, Search, MoreVertical, Pencil, Trash2, AlertTriangle } from "lucide-react";
// import StateDropdown from "../components/StateDropdown";
// import DistrictDropdown from "../components/DistrictDropdown";

// interface UserConsultantsProps {
//   onBack?: () => void;
// }

// const INDIAN_CROPS = [
//   'Rice', 'Wheat', 'Maize', 'Barley', 'Millet', 'Sorghum',
//   'Chickpea', 'Lentil', 'Black Gram', 'Green Gram', 'Pigeon Pea',
//   'Cotton', 'Sugarcane', 'Jute', 'Tea', 'Coffee', 'Rubber',
//   'Groundnut', 'Mustard', 'Sesame', 'Sunflower', 'Safflower',
//   'Turmeric', 'Coriander', 'Cumin', 'Fenugreek', 'Black Pepper',
//   'Mango', 'Banana', 'Apple', 'Orange', 'Grapes', 'Pomegranate',
//   'Tomato', 'Onion', 'Potato', 'Cabbage', 'Cauliflower', 'Brinjal'
// ].sort();

// const UserConsultants = ({ onBack }: UserConsultantsProps = {}) => {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const handleKeyPress = (event: KeyboardEvent) => {
//       if (event.key === 'Escape' || event.key === 'ArrowUp') {
//         onBack?.();
//       }
//     };
//     window.addEventListener('keydown', handleKeyPress);
//     return () => window.removeEventListener('keydown', handleKeyPress);
//   }, [onBack]);

//   const [consultants, setConsultants] = useState<Consultant[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [userCrop, setUserCrop] = useState("");
//   const [searchState, setSearchState] = useState("");
//   const [searchDistrict, setSearchDistrict] = useState("");
//   const [openMenuId, setOpenMenuId] = useState<string | null>(null);
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [consultantToDelete, setConsultantToDelete] = useState<Consultant | null>(null);

//   const isPasswordVerified = localStorage.getItem('consultantPasswordVerified') === 'true';

//   const handleDeleteClick = (consultant: Consultant) => {
//     setOpenMenuId(null);
//     setConsultantToDelete(consultant);
//     setDeleteModalOpen(true);
//   };

//   const confirmDelete = async () => {
//     if (!consultantToDelete) return;
//     try {
//       const id = consultantToDelete._id || consultantToDelete.id;
//       const res = await fetch(`/api/consultants/${id}`, { method: 'DELETE' });
//       if (!res.ok) throw new Error('Failed to delete');
//       setConsultants(prev => prev.filter(c => (c._id || c.id) !== id));
//     } catch (err) {
//       alert('Failed to delete consultant. Please try again.');
//     } finally {
//       setDeleteModalOpen(false);
//       setConsultantToDelete(null);
//     }
//   };

//   const handleUpdate = (consultant: Consultant) => {
//     setOpenMenuId(null);
//     navigate('/add-consultant', { state: { consultantToEdit: consultant } });
//   };

//   const fetchConsultants = async (params?: Record<string, string>) => {
//     setLoading(true);
//     try {
//       const query = new URLSearchParams();
//       if (params?.state) query.append('state', params.state);
//       if (params?.district) query.append('district', params.district);
//       if (params?.crop) query.append('crop', params.crop);

//       const res = await fetch(`/api/consultants?${query.toString()}`);
//       if (!res.ok) throw new Error('Failed to fetch');
//       const data = await res.json();
//       setConsultants(data);
//     } catch (err) {
//       console.error("Error fetching consultants", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchConsultants();
//   }, []);

//   const handleSearch = () => {
//     fetchConsultants({
//       state: searchState,
//       district: searchDistrict,
//       crop: userCrop,
//     });
//   };

//   const handleClear = () => {
//     setUserCrop("");
//     setSearchState("");
//     setSearchDistrict("");
//     fetchConsultants();
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col">
//       <div className="flex-grow max-w-7xl mx-auto p-6 w-full">
//         {/* Header */}
//         <div className="text-center mb-8 pt-8">
//           <h1 className="text-4xl font-bold text-green-800 mb-4">
//             Find Recommended Consultants
//           </h1>
//           <p className="text-xl text-gray-600">Search for agricultural experts in your area and crop specialization</p>
//         </div>

//         {/* Find Consultant Form */}
//         <div className="max-w-3xl mx-auto mb-12">
//           <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-8">
//             <div className="text-center mb-6">
//               <h3 className="text-2xl font-bold text-gray-900 mb-2">Find Agricultural Consultants</h3>
//               <p className="text-gray-600">Search for experts in your area and crop specialization</p>
//             </div>
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//                     <MapPin className="w-4 h-4 text-orange-600" />
//                     State
//                   </label>
//                   <StateDropdown
//                     value={searchState}
//                     onChange={(val) => { setSearchState(val); setSearchDistrict(""); }}
//                     placeholder="Select State"
//                     className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-gray-800"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//                     <MapPin className="w-4 h-4 text-orange-600" />
//                     District
//                   </label>
//                   <DistrictDropdown
//                     selectedState={searchState}
//                     value={searchDistrict}
//                     onChange={setSearchDistrict}
//                     placeholder="Select District"
//                     className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-gray-800"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//                   <Award className="w-4 h-4 text-orange-600" />
//                   Crop Specialization
//                 </label>
//                 <select
//                   value={userCrop}
//                   onChange={(e) => setUserCrop(e.target.value)}
//                   className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-gray-800 bg-white"
//                 >
//                   <option value="">All Crops</option>
//                   {INDIAN_CROPS.map((crop) => (
//                     <option key={crop} value={crop}>{crop}</option>
//                   ))}
//                 </select>
//               </div>

//               <div className="flex justify-center gap-4">
//                 <button 
//                   onClick={handleSearch}
//                   className="w-64 h-14 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
//                 >
//                   <Search className="w-5 h-5" />
//                   Find Consultants
//                 </button>

//                 <button 
//                   onClick={handleClear}
//                   className="w-64 h-14 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
//                 >
//                   Clear
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Dynamic Consultants from Backend */}
//         <div className="mb-16">
//           <div className="text-center mb-10">
//             <h3 className="text-3xl font-bold text-gray-900 mb-2">Our Consultant Network</h3>
//             <p className="text-gray-500 max-w-xl mx-auto mb-4">Verified agricultural experts from across the country ready to help you succeed.</p>
//           </div>

//           {loading ? (
//             <div className="flex justify-center py-16">
//               <Loader2 className="w-10 h-10 animate-spin text-green-600" />
//             </div>
//           ) : consultants.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
//               {consultants.map((consultant) => {
//                 const maxCropsToShow = 3;
//                 const visibleCrops = consultant.cropSpecializations?.slice(0, maxCropsToShow) || [];
//                 const remainingCrops = (consultant.cropSpecializations?.length || 0) - maxCropsToShow;
//                 const hasCrops = consultant.cropSpecializations && consultant.cropSpecializations.length > 0;

//                 return (
//                   <div 
//                     key={consultant._id || consultant.id} 
//                     className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300 overflow-hidden cursor-pointer group flex flex-col h-full border border-gray-100 relative"
//                   >
//                     {/* Three-dots menu */}
//                     {isPasswordVerified && (
//                       <div className="absolute top-3 right-3 z-20">
//                         <button
//                           onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === (consultant._id || consultant.id) ? null : (consultant._id || consultant.id || '')); }}
//                           className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100 transition-colors"
//                         >
//                           <MoreVertical className="w-4 h-4 text-gray-600" />
//                         </button>
//                         {openMenuId === (consultant._id || consultant.id) && (
//                           <>
//                             <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
//                             <div className="absolute right-0 top-10 w-44 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
//                               <button
//                                 onClick={() => handleUpdate(consultant)}
//                                 className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-all duration-200 group/item"
//                               >
//                                 <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-600 group-hover/item:bg-green-200 transition-colors">
//                                   <Pencil className="w-4 h-4" />
//                                 </span>
//                                 Update
//                               </button>
//                               <div className="border-t border-gray-100 mx-3"></div>
//                               <button
//                                 onClick={() => handleDeleteClick(consultant)}
//                                 className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-3 transition-all duration-200 group/item"
//                               >
//                                 <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 group-hover/item:bg-red-200 transition-colors">
//                                   <Trash2 className="w-4 h-4" />
//                                 </span>
//                                 Delete
//                               </button>
//                             </div>
//                           </>
//                         )}
//                       </div>
//                     )}

//                     <div className="p-5 flex flex-col flex-grow">
//                       {/* Header - Compact horizontal layout */}
//                       <div className="flex items-center gap-3 mb-4">
//                         <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-50 flex-shrink-0 flex items-center justify-center border-2 border-green-100 shadow-sm">
//                           {consultant.image ? (
//                             <img src={consultant.image} alt={consultant.name} className="w-full h-full object-cover" />
//                           ) : (
//                             <User className="w-6 h-6 text-gray-300" />
//                           )}
//                         </div>
//                         <div className="min-w-0">
//                           <h3 className="text-base font-bold text-gray-900 group-hover:text-green-700 transition-colors truncate">{consultant.name}</h3>
//                           <p className="text-green-600 font-semibold text-xs">{consultant.expertise} Specialist</p>
//                         </div>
//                       </div>
                      
//                       {/* Details - Fixed height sections for consistency */}
//                       <div className="space-y-1.5 text-sm flex-grow">
//                         <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded-lg">
//                           <MapPin className="w-3.5 h-3.5 mr-2 text-green-500 flex-shrink-0" />
//                           <span className="font-medium text-xs truncate">{consultant.district}, {consultant.state}</span>
//                         </div>
                        
//                         <div className="flex items-center text-gray-600 p-1">
//                           <Briefcase className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" />
//                           <span className="text-xs">{consultant.experience} Years Experience</span>
//                         </div>
                        
//                         {/* Profit - always takes same space */}
//                         <div className={`p-2 rounded-lg border ${consultant.profit ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
//                           {consultant.profit ? (
//                             <>
//                               <p className="text-green-700 text-[10px] font-semibold flex items-center gap-1">
//                                 <IndianRupee className="w-3 h-3" /> Estimated Profit
//                               </p>
//                               <p className="text-green-800 text-sm font-bold">₹{consultant.profit.toLocaleString()}</p>
//                             </>
//                           ) : (
//                             <>
//                               <p className="text-gray-400 text-[10px] font-semibold">Estimated Profit</p>
//                               <p className="text-gray-400 text-sm font-bold">—</p>
//                             </>
//                           )}
//                         </div>
                        
//                         {/* About - fixed 2-line height */}
//                         <div className="min-h-[2.5rem] py-1">
//                           {consultant.about ? (
//                             <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{consultant.about}</p>
//                           ) : (
//                             <p className="text-gray-300 text-xs italic">No description available</p>
//                           )}
//                         </div>
                        
//                         {/* Crop tags - fixed height area */}
//                         <div className="min-h-[1.75rem] py-0.5">
//                           {hasCrops ? (
//                             <div className="flex flex-wrap gap-1">
//                               {visibleCrops.map((crop) => (
//                                 <span key={crop} className="text-[10px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200 font-medium">
//                                   {crop}
//                                 </span>
//                               ))}
//                               {remainingCrops > 0 && (
//                                 <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
//                                   +{remainingCrops} more
//                                 </span>
//                               )}
//                             </div>
//                           ) : (
//                             <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-medium">No crops listed</span>
//                           )}
//                         </div>
//                       </div>

//                       {/* Footer - Always at bottom */}
//                       <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-2">
//                         <p className="text-gray-500 text-xs flex items-center gap-2">
//                           <Phone className="w-3 h-3 text-green-500" /> 
//                           <span className="font-mono tracking-wide text-[11px]">{consultant.phone}</span>
//                         </p>
//                         <a 
//                           href={`tel:${consultant.phone}`}
//                           className="w-full block text-center bg-green-600 text-white py-2.5 px-4 rounded-xl hover:bg-green-700 transition-colors text-xs font-bold shadow-sm hover:shadow-md"
//                         >
//                           Contact Consultant
//                         </a>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           ) : (
//             <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
//               <div className="bg-gray-50 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4">
//                 <Search className="h-10 w-10 text-gray-300" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-800">No consultants found</h3>
//               <p className="text-gray-500 mt-2">Try adjusting your filters or add a new consultant.</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Custom Delete Confirmation Modal */}
//       {deleteModalOpen && consultantToDelete && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-80 p-6 transform transition-all mx-auto">
//             <div className="flex flex-col items-center text-center">
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
//                 <AlertTriangle className="w-8 h-8 text-red-600" />
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Consultant?</h3>
//               <p className="text-gray-500 mb-6">
//                 Are you sure you want to delete <span className="font-semibold text-gray-800">{consultantToDelete.name}</span>? This action cannot be undone.
//               </p>
//               <div className="flex w-full gap-3">
//                 <button
//                   onClick={() => setDeleteModalOpen(false)}
//                   className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={confirmDelete}
//                   className="flex-1 py-3 px-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
//                 >
//                   Yes, Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserConsultants;
