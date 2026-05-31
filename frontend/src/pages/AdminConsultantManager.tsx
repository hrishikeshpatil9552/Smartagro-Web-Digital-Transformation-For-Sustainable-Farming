import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Trash2, 
  Edit2, 
  Plus, 
  X, 
  Save, 
  User, 
  Phone, 
  MapPin, 
  Award, 
  Briefcase,
  Globe,
  IndianRupee,
  Search,
  ChevronLeft,
  ChevronRight,
  List,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ShieldCheck
} from 'lucide-react';

const AdminConsultantManager = () => {
  const [consultants, setConsultants] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  // Interaction State
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // View State
  const [viewMode, setViewMode] = useState<'form' | 'list'>('form'); // 'form' shows Add/Edit + recent list, 'list' shows full table
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Form State
  const [formData, setFormData] = useState({
    name: '', phone: '', expertise: 'General', 
    experience: '', state: '', district: '', 
    language: '', fee: ''
  });

  // Load all consultants initially
  const fetchConsultants = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/consultants');
      setConsultants(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConsultants();
  }, []);

  // Filter Logic
  const filteredConsultants = consultants.filter((c: any) => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.expertise.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredConsultants.length / itemsPerPage);
  const paginatedConsultants = filteredConsultants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle Input Change
  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Create or Update
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (isEditing && currentId) {
        // UPDATE API
        await axios.put(`http://localhost:5000/api/consultants/${currentId}`, formData);
        alert('Consultant Updated Successfully!');
      } else {
        // ADD API
        await axios.post('http://localhost:5000/api/consultants/add', formData);
        alert('Consultant Added Successfully!');
      }
      
      // Reset Form & Refresh List
      handleCancel();
      fetchConsultants();
      setViewMode('form'); 
    } catch (err) {
      alert('Operation Failed');
    }
  };

  // Handle Edit Click
  const handleEdit = (consultant: any) => {
    setFormData(consultant);
    setIsEditing(true);
    setCurrentId(consultant._id);
    setViewMode('form'); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Delete Click
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling expand
    if (window.confirm('Are you sure you want to delete this consultant? This action cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:5000/api/consultants/${id}`);
        fetchConsultants(); 
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ name: '', phone: '', expertise: 'General', experience: '', state: '', district: '', language: '', fee: '' });
    setCurrentId(null);
  };

  const switchToListView = () => {
    setViewMode('list');
    setSearchQuery('');
    setCurrentPage(1);
    handleCancel(); 
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  // Helper Component for List Item
  const ConsultantCard = ({ c }: { c: any }) => {
    const isExpanded = expandedId === c._id;
    
    return (
      <div 
        className={`bg-white rounded-xl shadow-sm border transition-all duration-300 overflow-hidden cursor-pointer
          ${isExpanded ? 'border-green-500 ring-1 ring-green-500 shadow-md' : 'border-gray-200 hover:border-green-300 hover:shadow'}
        `}
        onClick={() => toggleExpand(c._id)}
      >
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-5">
             <div className={`h-14 w-14 rounded-full flex items-center justify-center text-xl font-bold shadow-inner
                ${isExpanded ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}
             `}>
               {c.name.charAt(0)}
             </div>
             <div>
               <h3 className="text-xl font-bold text-gray-800">{c.name}</h3>
               <div className="flex items-center gap-2 mt-1">
                 <span className="bg-green-50 text-green-700 text-sm font-semibold px-3 py-1 rounded-full border border-green-100">
                   {c.expertise}
                 </span>
                 {!isExpanded && (
                   <span className="text-gray-400 text-sm flex items-center">
                     <MapPin className="h-3 w-3 mr-1" /> {c.district}
                   </span>
                 )}
               </div>
             </div>
          </div>
          <div className="text-gray-400">
             {isExpanded ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
          </div>
        </div>

        {/* Expanded Details Section */}
        {isExpanded && (
          <div className="bg-gray-50 border-t border-gray-100 p-6 animation-fade-in">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
               <div className="space-y-3">
                 <div className="flex items-center gap-3 text-gray-700">
                   <Phone className="h-5 w-5 text-blue-500" />
                   <span className="font-medium text-lg">{c.phone}</span>
                 </div>
                 <div className="flex items-center gap-3 text-gray-700">
                   <MapPin className="h-5 w-5 text-red-500" />
                   <span className="font-medium">{c.district}, {c.state}</span>
                 </div>
                 <div className="flex items-center gap-3 text-gray-700">
                   <Globe className="h-5 w-5 text-purple-500" />
                   <span>{c.language}</span>
                 </div>
               </div>
               <div className="space-y-3">
                 <div className="flex items-center gap-3 text-gray-700">
                   <Briefcase className="h-5 w-5 text-orange-500" />
                   <span className="font-medium">{c.experience} Years Experience</span>
                 </div>
                 <div className="flex items-center gap-3 text-gray-700">
                   <IndianRupee className="h-5 w-5 text-green-600" />
                   <span className="font-bold text-lg">{c.fee ? `₹${c.fee} Consultation Fee` : 'Free Consultation'}</span>
                 </div>
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
               <button 
                  onClick={(e) => { e.stopPropagation(); handleEdit(c); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-sm"
               >
                 <Edit2 className="h-4 w-4" /> Edit Profile
               </button>
               <button 
                  onClick={(e) => handleDelete(c._id, e)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 font-medium transition shadow-sm"
               >
                 <Trash2 className="h-4 w-4" /> Delete
               </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10 font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-green-100 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Manage Experts</h1>
          <p className="text-lg text-gray-500 mt-2 font-light">Curate the list of agricultural consultants available to farmers.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-800 px-5 py-2 rounded-full text-base font-medium border border-green-200 shadow-sm">
          <ShieldCheck className="h-5 w-5" />
          <span>{consultants.length} Active Experts</span>
        </div>
      </div>

      {/* ================= MODE: ADD/EDIT FORM & RECENT LIST ================= */}
      {viewMode === 'form' && (
        <div className="space-y-12">
          
          {/* --- TOP SECTION: FORM --- */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className={`px-8 py-5 border-b ${isEditing ? 'bg-blue-50 border-blue-100' : 'bg-gradient-to-r from-green-50 to-white border-green-100'}`}>
              <h2 className={`text-2xl font-bold flex items-center gap-3 ${isEditing ? 'text-blue-800' : 'text-green-800'}`}>
                {isEditing ? <Edit2 className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                {isEditing ? 'Edit Expert Profile' : 'Add New Consultant'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Personal Info */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">Personal Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input name="name" value={formData.name} placeholder="e.g. Dr. Rajesh Kumar" onChange={handleChange} className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition text-lg" required />
                      </div>
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                       <div className="relative">
                        <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input name="phone" value={formData.phone} placeholder="+91 98765 43210" onChange={handleChange} className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition text-lg" required />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Info */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">Professional Expertise</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                      <div className="relative">
                        <Award className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <select name="expertise" value={formData.expertise} onChange={handleChange} className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition text-lg appearance-none">
                          <option value="General">General Agronomist</option>
                          <option value="Pest Control">Pest Control Expert</option>
                          <option value="Soil Health">Soil Health Specialist</option>
                          <option value="Organic">Organic Farming</option>
                          <option value="Horticulture">Horticulture</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Yrs)</label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          <input name="experience" value={formData.experience} type="number" placeholder="0" onChange={handleChange} className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition text-lg" required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fee (₹)</label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                          <input name="fee" value={formData.fee} type="number" placeholder="0" onChange={handleChange} className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition text-lg" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Info - Full Width */}
                <div className="md:col-span-2 space-y-6">
                   <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">Location & Language</h3>
                   <div className="grid md:grid-cols-3 gap-4">
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input name="state" value={formData.state} placeholder="State" onChange={handleChange} className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition text-base" required />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input name="district" value={formData.district} placeholder="District" onChange={handleChange} className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition text-base" required />
                      </div>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input name="language" value={formData.language} placeholder="Languages" onChange={handleChange} className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition text-base" />
                      </div>
                   </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button type="submit" className={`flex-1 flex items-center justify-center gap-3 py-4 text-white rounded-xl font-bold text-lg shadow-lg transform transition active:scale-95 ${isEditing ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'}`}>
                  {isEditing ? <Save className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                  {isEditing ? 'Save Changes' : 'Add Expert to Directory'}
                </button>
                
                {isEditing && (
                  <button type="button" onClick={handleCancel} className="px-6 py-4 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-bold text-lg transition">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* --- BOTTOM SECTION: LIST --- */}
          <div>
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold text-gray-800">Recently Added Consultants</h2>
               <button 
                onClick={switchToListView}
                className="text-green-700 font-bold hover:text-green-800 flex items-center gap-2 bg-green-50 border border-green-200 px-5 py-2.5 rounded-xl hover:bg-green-100 transition shadow-sm"
               >
                 <List className="h-5 w-5" /> View All & Search
               </button>
             </div>
             
             <div className="space-y-4">
                {consultants.slice(0, 5).map((c: any) => (
                   <ConsultantCard key={c._id} c={c} />
                ))}
                {consultants.length === 0 && (
                  <div className="bg-gray-50 rounded-xl p-10 text-center border-2 border-dashed border-gray-200">
                    <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-500 font-medium">No consultants added yet.</p>
                    <p className="text-gray-400 mt-2">Use the form above to add your first expert.</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* ================= MODE: FULL SEARCHABLE LIST ================= */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden min-h-[80vh] flex flex-col">
           
           {/* Toolbar */}
           <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => setViewMode('form')}
                  className="flex items-center gap-2 text-gray-500 hover:text-green-700 font-bold transition p-2 hover:bg-green-50 rounded-lg"
                >
                  <ArrowLeft className="h-6 w-6" /> Back
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Expert Directory</h2>
             </div>
             
             <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
               <div className="relative flex-grow">
                 <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                 <input 
                    type="text" 
                    placeholder="Search by name, role, city..." 
                    className="pl-12 pr-4 py-3 w-full sm:w-80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-base shadow-sm"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); 
                    }}
                 />
               </div>
               <button 
                  onClick={() => setViewMode('form')}
                  className="hidden sm:flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-base font-bold transition shadow-md"
               >
                 <Plus className="h-5 w-5" /> Add New
               </button>
             </div>
           </div>

           {/* Full List Items */}
           <div className="p-6 flex-grow space-y-4 bg-gray-50/50">
              {paginatedConsultants.map((c: any) => (
                <ConsultantCard key={c._id} c={c} />
              ))}
              
              {paginatedConsultants.length === 0 && (
                <div className="py-20 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="h-20 w-20 text-gray-200 mb-4" />
                    <p className="text-xl font-medium text-gray-400">No consultants found matching "{searchQuery}".</p>
                  </div>
                </div>
              )}
           </div>

           {/* Pagination */}
           {filteredConsultants.length > 0 && (
             <div className="px-8 py-5 border-t border-gray-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-base text-gray-500 font-medium">
                  Showing <span className="font-bold text-gray-800">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-gray-800">{Math.min(currentPage * itemsPerPage, filteredConsultants.length)}</span> of <span className="font-bold text-gray-800">{filteredConsultants.length}</span>
                </div>
                <div className="flex gap-3">
                   <button
                     onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                     disabled={currentPage === 1}
                     className="px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
                   >
                     <ChevronLeft className="h-5 w-5" /> Prev
                   </button>
                   <button
                     onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                     disabled={currentPage === totalPages}
                     className="px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
                   >
                     Next <ChevronRight className="h-5 w-5" />
                   </button>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default AdminConsultantManager;