import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { UserPlus, User, MapPin, Phone, FileText, Award, IndianRupee, Calendar, Sprout, ImagePlus, X, CheckCircle, AlertCircle, ChevronDown, Save } from "lucide-react";
import StateDropdown from "../components/StateDropdown";
import DistrictDropdown from "../components/DistrictDropdown";

interface AdminAddConsultantProps {
  onBack?: () => void;
  email?: string;
  onLogout?: () => void;
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

const AdminAddConsultant = ({ onBack }: AdminAddConsultantProps = {}) => {
  const location = useLocation();
  const consultantToEdit = (location.state as any)?.consultantToEdit;
  const isEditMode = !!consultantToEdit;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uiMessage, setUiMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isCropDropdownOpen, setIsCropDropdownOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'ArrowUp') {
        onBack?.();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onBack]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.crop-dropdown-container')) {
        setIsCropDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const [form, setForm] = useState({
    name: consultantToEdit?.name || "",
    phone: consultantToEdit?.phone || "",
    expertise: consultantToEdit?.expertise || "",
    experience: consultantToEdit?.experience ? String(consultantToEdit.experience) : "",
    state: consultantToEdit?.state || "",
    district: consultantToEdit?.district || "",
    profit: consultantToEdit?.profit ? String(consultantToEdit.profit) : "",
    about: consultantToEdit?.about || "",
    image: consultantToEdit?.image || "",
    cropSpecializations: consultantToEdit?.cropSpecializations || [] as string[],
  });

  const [previewImage, setPreviewImage] = useState<string | null>(consultantToEdit?.image || null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if(uiMessage) setUiMessage(null);
  };

  const handleStateChange = (state: string) => {
    setForm({ ...form, state, district: "" });
  };

  const handleDistrictChange = (district: string) => {
    setForm({ ...form, district });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUiMessage({ text: "Image size should be less than 5MB", type: 'error' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreviewImage(base64);
      setForm((prev) => ({ ...prev, image: base64 }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const toggleCropSpecialization = (crop: string) => {
    setForm((prev) => {
      const exists = prev.cropSpecializations.includes(crop);
      if (exists) {
        return { ...prev, cropSpecializations: prev.cropSpecializations.filter((c) => c !== crop) };
      }
      return { ...prev, cropSpecializations: [...prev.cropSpecializations, crop] };
    });
  };

  const handleSubmit = async () => {
    // Added strict check for exactly 10 digits
    if (!form.name || !form.expertise || !form.state || !form.district || !form.phone || form.phone.length !== 10 || !form.experience) {
      setUiMessage({ text: "Please fill all required fields and ensure phone number is exactly 10 digits!", type: 'error' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setUiMessage(null);

    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        expertise: form.expertise,
        experience: Number(form.experience),
        state: form.state,
        district: form.district,
        profit: form.profit ? Number(form.profit) : undefined,
        about: form.about,
        image: form.image,
        cropSpecializations: form.cropSpecializations,
      };

      let response;
      if (isEditMode && consultantToEdit._id) {
        response = await fetch(`/api/consultants/${consultantToEdit._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/consultants/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEditMode ? 'update' : 'add'} consultant`);
      }

      setUiMessage({ 
        text: isEditMode ? "Consultant updated successfully!" : "Consultant added successfully!", 
        type: 'success' 
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      if (!isEditMode) {
        setForm({
          name: "", phone: "", expertise: "", experience: "",
          state: "", district: "", profit: "", about: "",
          image: "", cropSpecializations: [],
        });
        setPreviewImage(null);
      }
    } catch (err: any) {
      setUiMessage({ text: err.message || "Something went wrong!", type: 'error' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideFromTop {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .slide-from-top {
          animation: slideFromTop 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        /* Custom Scrollbar for Crop Dropdown */
        .crop-dropdown-container .crop-list::-webkit-scrollbar {
          width: 8px;
        }
        .crop-dropdown-container .crop-list::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .crop-dropdown-container .crop-list::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .crop-dropdown-container .crop-list::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 slide-from-top">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 md:py-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              {isEditMode ? <Save className="w-8 h-8 text-white" /> : <UserPlus className="w-8 h-8 text-white" />}
            </div>
            <h1 className="text-4xl font-bold text-green-800 mb-2 text-center">
              {isEditMode ? 'Update Consultant' : 'Add New Consultant'}
            </h1> 
            <p className="text-gray-600 text-lg">
              {isEditMode ? 'Edit the consultant details below' : 'Expand your expert network by adding qualified agricultural consultants'}
            </p>
          </div>

          {uiMessage && (
            <div className={`mb-6 flex items-center justify-between p-4 rounded-xl border ${
              uiMessage.type === 'success' ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800'
            }`}>
              <div className="flex items-center gap-3">
                {uiMessage.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                <span className="font-medium text-sm">{uiMessage.text}</span>
              </div>
              <button onClick={() => setUiMessage(null)} className="hover:opacity-70 transition-opacity">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <Card className="border-0 bg-white shadow-none">
            <CardHeader className="bg-green-600 rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="w-5 h-5" />
                Consultant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name *
                </label>
                <input
                  name="name"
                  placeholder="Enter consultant's complete name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800"
                />
              </div>

              {/* Profile Image */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <ImagePlus className="w-4 h-4" />
                  Profile Image
                </label>
                <div className="flex items-center gap-4">
                  {previewImage ? (
                    <div className="relative">
                      <img src={previewImage} alt="Preview" className="w-20 h-20 rounded-xl object-cover border-2 border-green-200" />
                      <button
                        onClick={() => { setPreviewImage(null); setForm((prev) => ({ ...prev, image: "" })); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <label className="cursor-pointer bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200 hover:bg-green-100 transition font-medium text-sm">
                    {previewImage ? 'Change Photo' : 'Upload Photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              {/* Specialization */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Specialization (Main Expertise) *
                </label>
                <select
                  name="expertise"
                  value={form.expertise}
                  onChange={handleChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800 bg-white"
                >
                  <option value="">Select main crop expertise</option>
                  {INDIAN_CROPS.map((crop) => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </div>

              {/* Area / Region */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Area / Region *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StateDropdown
                    value={form.state}
                    onChange={handleStateChange}
                    placeholder="Select State"
                    className="p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800"
                  />
                  <DistrictDropdown
                    selectedState={form.state}
                    value={form.district}
                    onChange={handleDistrictChange}
                    placeholder="Select District"
                    className="p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800"
                  />
                </div>
              </div>

              {/* Crop Specializations */}
              <div className="space-y-2 crop-dropdown-container">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Sprout className="w-4 h-4" />
                  Crop Specializations (Types of crops handled)
                </label>
                <div
                  onClick={() => setIsCropDropdownOpen(!isCropDropdownOpen)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800 bg-white cursor-pointer flex justify-between items-center"
                >
                  <span className={form.cropSpecializations.length === 0 ? "text-gray-400" : "text-gray-800"}>
                    {form.cropSpecializations.length === 0
                      ? "Click to select crop specializations"
                      : form.cropSpecializations.length <= 2
                      ? form.cropSpecializations.join(", ")
                      : `${form.cropSpecializations.length} crops selected`}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isCropDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {isCropDropdownOpen && (
                  <div className="w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto crop-list">
                    <div className="p-3 space-y-1">
                      {INDIAN_CROPS.map((crop) => {
                        const isSelected = form.cropSpecializations.includes(crop);
                        return (
                          <label
                            key={crop}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                              isSelected ? 'bg-green-50 text-green-800' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleCropSpecialization(crop)}
                              className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                            />
                            <span className="text-sm font-medium">{crop}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Years of Experience */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Years of Experience *
                </label>
                <input
                  name="experience"
                  type="number"
                  min={0}
                  placeholder="Total years of farming/consulting experience"
                  value={form.experience}
                  onChange={handleChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800"
                />
              </div>

              {/* Profit */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" />
                  Profit (₹) - Last year profit or average earnings
                </label>
                <input
                  name="profit"
                  type="number"
                  min={0}
                  placeholder="Enter profit amount"
                  value={form.profit}
                  onChange={handleChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800"
                />
              </div>

              {/* About Consultant */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  About Consultant
                </label>
                <textarea
                  name="about"
                  placeholder="Brief description of expertise and achievements..."
                  value={form.about}
                  onChange={handleChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800 h-32 resize-none"
                />
              </div>

              {/* Phone Number - STRICT 10 DIGIT LOGIC */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number *
                </label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="Enter valid 10-digit number"
                  value={form.phone}
                  onChange={(e) => {
                    // Strip non-numbers and enforce max length of 10
                    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                    setForm({ ...form, phone: value });
                    if(uiMessage) setUiMessage(null);
                  }}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-center">
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-green-600 text-white font-bold py-4 px-12 rounded-lg hover:bg-green-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">{isEditMode ? 'Updating...' : 'Adding...'}</span>
                  ) : (
                    <>
                      {isEditMode ? <Save className="w-8 h-12 mr-2 inline" /> : <UserPlus className="w-8 h-12 mr-2 inline" />}
                      {isEditMode ? 'Update Consultant' : 'Add Consultant'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> All fields marked with * are required. Phone number must be exactly 10 digits. {isEditMode ? 'Updated' : 'Added'} consultants will be stored in the database and displayed on the Start Consultation and Find Consultant pages.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default AdminAddConsultant;
























// import { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
// import { Button } from "../components/ui/button";
// import { UserPlus, User, MapPin, Phone, FileText, Award, IndianRupee, Calendar, Sprout, ImagePlus, X, CheckCircle, AlertCircle, ChevronDown, Save } from "lucide-react";
// import StateDropdown from "../components/StateDropdown";
// import DistrictDropdown from "../components/DistrictDropdown";

// interface AdminAddConsultantProps {
//   onBack?: () => void;
//   email?: string;
//   onLogout?: () => void;
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

// const AdminAddConsultant = ({ onBack }: AdminAddConsultantProps = {}) => {
//   const location = useLocation();
//   const consultantToEdit = (location.state as any)?.consultantToEdit;
//   const isEditMode = !!consultantToEdit;

//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [uiMessage, setUiMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
//   const [isCropDropdownOpen, setIsCropDropdownOpen] = useState(false);

//   useEffect(() => {
//     window.scrollTo({ top: 0, behavior: 'instant' });
//   }, []);

//   useEffect(() => {
//     const handleKeyPress = (event: KeyboardEvent) => {
//       if (event.key === 'Escape' || event.key === 'ArrowUp') {
//         onBack?.();
//       }
//     };
//     window.addEventListener('keydown', handleKeyPress);
//     return () => window.removeEventListener('keydown', handleKeyPress);
//   }, [onBack]);

//   useEffect(() => {
//     const handler = (event: MouseEvent) => {
//       const target = event.target as HTMLElement;
//       if (!target.closest('.crop-dropdown-container')) {
//         setIsCropDropdownOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   const [form, setForm] = useState({
//     name: consultantToEdit?.name || "",
//     phone: consultantToEdit?.phone || "",
//     expertise: consultantToEdit?.expertise || "",
//     experience: consultantToEdit?.experience ? String(consultantToEdit.experience) : "",
//     state: consultantToEdit?.state || "",
//     district: consultantToEdit?.district || "",
//     profit: consultantToEdit?.profit ? String(consultantToEdit.profit) : "",
//     about: consultantToEdit?.about || "",
//     image: consultantToEdit?.image || "",
//     cropSpecializations: consultantToEdit?.cropSpecializations || [] as string[],
//   });

//   const [previewImage, setPreviewImage] = useState<string | null>(consultantToEdit?.image || null);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//     if(uiMessage) setUiMessage(null);
//   };

//   const handleStateChange = (state: string) => {
//     setForm({ ...form, state, district: "" });
//   };

//   const handleDistrictChange = (district: string) => {
//     setForm({ ...form, district });
//   };

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (file.size > 5 * 1024 * 1024) {
//       setUiMessage({ text: "Image size should be less than 5MB", type: 'error' });
//       return;
//     }
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       const base64 = reader.result as string;
//       setPreviewImage(base64);
//       setForm((prev) => ({ ...prev, image: base64 }));
//     };
//     reader.readAsDataURL(file);
//     // Clear input so same file can be selected again if needed
//     e.target.value = '';
//   };

//   const toggleCropSpecialization = (crop: string) => {
//     setForm((prev) => {
//       const exists = prev.cropSpecializations.includes(crop);
//       if (exists) {
//         return { ...prev, cropSpecializations: prev.cropSpecializations.filter((c) => c !== crop) };
//       }
//       return { ...prev, cropSpecializations: [...prev.cropSpecializations, crop] };
//     });
//   };

//   const handleSubmit = async () => {
//     if (!form.name || !form.expertise || !form.state || !form.district || !form.phone || !form.experience) {
//       setUiMessage({ text: "Please fill all required fields!", type: 'error' });
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//       return;
//     }

//     setIsSubmitting(true);
//     setUiMessage(null);

//     try {
//       const payload = {
//         name: form.name,
//         phone: form.phone,
//         expertise: form.expertise,
//         experience: Number(form.experience),
//         state: form.state,
//         district: form.district,
//         profit: form.profit ? Number(form.profit) : undefined,
//         about: form.about,
//         image: form.image,
//         cropSpecializations: form.cropSpecializations,
//       };

//       let response;
//       if (isEditMode && consultantToEdit._id) {
//         response = await fetch(`/api/consultants/${consultantToEdit._id}`, {
//           method: 'PUT',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(payload),
//         });
//       } else {
//         response = await fetch('/api/consultants/add', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(payload),
//         });
//       }

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.error || `Failed to ${isEditMode ? 'update' : 'add'} consultant`);
//       }

//       setUiMessage({ 
//         text: isEditMode ? "Consultant updated successfully!" : "Consultant added successfully!", 
//         type: 'success' 
//       });
//       window.scrollTo({ top: 0, behavior: 'smooth' });
      
//       if (!isEditMode) {
//         setForm({
//           name: "", phone: "", expertise: "", experience: "",
//           state: "", district: "", profit: "", about: "",
//           image: "", cropSpecializations: [],
//         });
//         setPreviewImage(null);
//       }
//     } catch (err: any) {
//       setUiMessage({ text: err.message || "Something went wrong!", type: 'error' });
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <>
//       <style>{`
//         @keyframes slideFromTop {
//           from { transform: translateY(-100%); opacity: 0; }
//           to { transform: translateY(0); opacity: 1; }
//         }
//         .slide-from-top {
//           animation: slideFromTop 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
//         }
//       `}</style>

//       <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 slide-from-top">
//         <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 md:py-4">
//           <div className="text-center mb-8">
//             <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
//               {isEditMode ? <Save className="w-8 h-8 text-white" /> : <UserPlus className="w-8 h-8 text-white" />}
//             </div>
//             <h1 className="text-4xl font-bold text-green-800 mb-2 text-center">
//               {isEditMode ? 'Update Consultant' : 'Add New Consultant'}
//             </h1> 
//             <p className="text-gray-600 text-lg">
//               {isEditMode ? 'Edit the consultant details below' : 'Expand your expert network by adding qualified agricultural consultants'}
//             </p>
//           </div>

//           {uiMessage && (
//             <div className={`mb-6 flex items-center justify-between p-4 rounded-xl border ${
//               uiMessage.type === 'success' ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800'
//             }`}>
//               <div className="flex items-center gap-3">
//                 {uiMessage.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
//                 <span className="font-medium text-sm">{uiMessage.text}</span>
//               </div>
//               <button onClick={() => setUiMessage(null)} className="hover:opacity-70 transition-opacity">
//                 <X className="w-4 h-4" />
//               </button>
//             </div>
//           )}

//           <Card className="border-0 bg-white shadow-none">
//             <CardHeader className="bg-green-600 rounded-t-xl">
//               <CardTitle className="flex items-center gap-2 text-white">
//                 <User className="w-5 h-5" />
//                 Consultant Information
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="p-8 space-y-6">
//               {/* Full Name */}
//               <div className="space-y-2">
//                 <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//                   <User className="w-4 h-4" />
//                   Full Name *
//                 </label>
//                 <input
//                   name="name"
//                   placeholder="Enter consultant's complete name"
//                   value={form.name}
//                   onChange={handleChange}
//                   className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800"
//                 />
//               </div>

//               {/* Profile Image */}
//               <div className="space-y-2">
//                 <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//                   <ImagePlus className="w-4 h-4" />
//                   Profile Image
//                 </label>
//                 <div className="flex items-center gap-4">
//                   {previewImage ? (
//                     <div className="relative">
//                       <img src={previewImage} alt="Preview" className="w-20 h-20 rounded-xl object-cover border-2 border-green-200" />
//                       <button
//                         onClick={() => { setPreviewImage(null); setForm((prev) => ({ ...prev, image: "" })); }}
//                         className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
//                       >
//                         <X className="w-3 h-3" />
//                       </button>
//                     </div>
//                   ) : (
//                     <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
//                       <User className="w-8 h-8 text-gray-400" />
//                     </div>
//                   )}
//                   <label className="cursor-pointer bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200 hover:bg-green-100 transition font-medium text-sm">
//                     {previewImage ? 'Change Photo' : 'Upload Photo'}
//                     <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
//                   </label>
//                 </div>
//               </div>

//               {/* Specialization */}
//               <div className="space-y-2">
//                 <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//                   <Award className="w-4 h-4" />
//                   Specialization (Main Expertise) *
//                 </label>
//                 <select
//                   name="expertise"
//                   value={form.expertise}
//                   onChange={handleChange}
//                   className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800 bg-white"
//                 >
//                   <option value="">Select main crop expertise</option>
//                   {INDIAN_CROPS.map((crop) => (
//                     <option key={crop} value={crop}>{crop}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Area / Region */}
//               <div className="space-y-2">
//                 <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//                   <MapPin className="w-4 h-4" />
//                   Area / Region *
//                 </label>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <StateDropdown
//                     value={form.state}
//                     onChange={handleStateChange}
//                     placeholder="Select State"
//                     className="p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800"
//                   />
//                   <DistrictDropdown
//                     selectedState={form.state}
//                     value={form.district}
//                     onChange={handleDistrictChange}
//                     placeholder="Select District"
//                     className="p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800"
//                   />
//               </div>
//                 </div>

//               {/* Crop Specializations */}
//               <div className="space-y-2 crop-dropdown-container">
//                 <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//                   <Sprout className="w-4 h-4" />
//                   Crop Specializations (Types of crops handled)
//                 </label>
//                 <div
//                   onClick={() => setIsCropDropdownOpen(!isCropDropdownOpen)}
//                   className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800 bg-white cursor-pointer flex justify-between items-center"
//                 >
//                   <span className={form.cropSpecializations.length === 0 ? "text-gray-400" : "text-gray-800"}>
//                     {form.cropSpecializations.length === 0
//                       ? "Click to select crop specializations"
//                       : form.cropSpecializations.length <= 2
//                       ? form.cropSpecializations.join(", ")
//                       : `${form.cropSpecializations.length} crops selected`}
//                   </span>
//                   <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isCropDropdownOpen ? 'rotate-180' : ''}`} />
//                 </div>
                
//                 {isCropDropdownOpen && (
//                   <div className="w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto crop-list">
//                     <div className="p-3 space-y-1">
//                       {INDIAN_CROPS.map((crop) => {
//                         const isSelected = form.cropSpecializations.includes(crop);
//                         return (
//                           <label
//                             key={crop}
//                             className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
//                               isSelected ? 'bg-green-50 text-green-800' : 'text-gray-700 hover:bg-gray-50'
//                             }`}
//                           >
//                             <input
//                               type="checkbox"
//                               checked={isSelected}
//                               onChange={() => toggleCropSpecialization(crop)}
//                               className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
//                             />
//                             <span className="text-sm font-medium">{crop}</span>
//                           </label>
//                         );
//                       })}
//                   </div>
//                     </div>
//                 )}
//               </div>

//               {/* Years of Experience */}
//               <div className="space-y-2">
//                 <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//                   <Calendar className="w-4 h-4" />
//                   Years of Experience *
//                 </label>
//                 <input
//                   name="experience"
//                   type="number"
//                   min={0}
//                   placeholder="Total years of farming/consulting experience"
//                   value={form.experience}
//                   onChange={handleChange}
//                   className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800"
//                 />
//               </div>

//               {/* Profit */}
//               <div className="space-y-2">
//                 <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//                   <IndianRupee className="w-4 h-4" />
//                   Profit (₹) - Last year profit or average earnings
//                 </label>
//                 <input
//                   name="profit"
//                   type="number"
//                   min={0}
//                   placeholder="Enter profit amount"
//                   value={form.profit}
//                   onChange={handleChange}
//                   className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800"
//                 />
//               </div>

//               {/* About Consultant */}
//               <div className="space-y-2">
//                 <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//                   <FileText className="w-4 h-4" />
//                   About Consultant
//                 </label>
//                 <textarea
//                   name="about"
//                   placeholder="Brief description of expertise and achievements..."
//                   value={form.about}
//                   onChange={handleChange}
//                   className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800 h-32 resize-none"
//                 />
//               </div>

//               {/* Phone Number */}
//               <div className="space-y-2">
//                 <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
//                   <Phone className="w-4 h-4" />
//                   Phone Number *
//                 </label>
//                 <input
//                   name="phone"
//                   type="tel"
//                   placeholder="Enter valid contact number"
//                   value={form.phone}
//                   onChange={handleChange}
//                   className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800"
//                 />
//               </div>

//               {/* Submit Button */}
//               <div className="pt-4 flex justify-center">
//                 <Button 
//                   onClick={handleSubmit}
//                   disabled={isSubmitting}
//                   className="bg-green-600 text-white font-bold py-4 px-12 rounded-lg hover:bg-green-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {isSubmitting ? (
//                     <span className="animate-pulse">{isEditMode ? 'Updating...' : 'Adding...'}</span>
//                   ) : (
//                     <>
//                       {isEditMode ? <Save className="w-8 h-12 mr-2 inline" /> : <UserPlus className="w-8 h-12 mr-2 inline" />}
//                       {isEditMode ? 'Update Consultant' : 'Add Consultant'}
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="mt-6 bg-blue-50 border-blue-200">
//             <CardContent className="p-4">
//               <p className="text-sm text-blue-800">
//                 <strong>Note:</strong> All fields marked with * are required. {isEditMode ? 'Updated' : 'Added'} consultants will be stored in the database and displayed on the Start Consultation and Find Consultant pages.
//               </p>
//             </CardContent>
//           </Card>
//         </main>
//       </div>
//     </>
//   );
// };

// export default AdminAddConsultant;
