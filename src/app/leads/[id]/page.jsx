'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { ArrowLeft, CreditCard, Clock, CheckCircle, AlertCircle, Calendar, User, Phone, Mail, Briefcase, FileText, Edit2, Save, X, Plus, DollarSign } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ViewLeadPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const gradeOptions = [
    'Pre KG', 'KG 1', 'KG 2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4',
    'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12'
  ];

  const incomeOptions = [
    'Less than ₹5 Lakhs',
    '₹5 - ₹10 Lakhs',
    '₹10 - ₹20 Lakhs',
    '₹20 - ₹50 Lakhs',
    '₹50 Lakhs - ₹1 Crore',
    'Above ₹1 Crore'
  ];

  const genderOptions = ['Male', 'Female', 'Other'];

  useEffect(() => {
    fetchLeadDetails();
  }, [id]);

  const fetchLeadDetails = async () => {
    try {
      const response = await api.get(`/api/leads/${id}`);
      if (response.data.success) {
        setLead(response.data.lead);
        setEditForm(JSON.parse(JSON.stringify(response.data.lead))); // Deep clone for editing
      } else {
        toast.error('Failed to fetch lead details');
      }
    } catch (error) {
      console.error('Error details:', error);
      toast.error('Error fetching lead details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Revert changes
      setEditForm(JSON.parse(JSON.stringify(lead)));
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleChildChange = (index, field, value) => {
    const updatedChildren = [...editForm.children];
    updatedChildren[index] = { ...updatedChildren[index], [field]: value };
    setEditForm(prev => ({ ...prev, children: updatedChildren }));
  };

  const handleAddChild = () => {
    const newChild = {
      id: Date.now(), // Temporary ID
      name: '',
      grade: '',
      intake_year: '2026-2027',
      gender: '',
      date_of_birth: ''
    };
    setEditForm(prev => ({
      ...prev,
      children: [...(prev.children || []), newChild]
    }));
  };

  const handleRemoveChild = (index) => {
    const updatedChildren = editForm.children.filter((_, i) => i !== index);
    setEditForm(prev => ({ ...prev, children: updatedChildren }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      const response = await api.patch(`/api/leads/${id}`, {
        leadData: editForm,
        children: editForm.children,
        addedBy: user?.username || 'System'
      });

      if (response.data.success) {
        toast.success('Lead updated successfully');
        setLead(response.data.lead);
        setIsEditing(false);
        fetchLeadDetails(); // Refresh to get relations correctly
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error(error.response?.data?.error || 'Failed to update lead');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Qualified': return 'bg-green-100 text-green-800';
      case 'Interested': return 'bg-blue-100 text-blue-800';
      case 'New': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      </PageLayout>
    );
  }

  if (!lead) {
    return (
      <PageLayout>
        <div className="p-6 text-center">
           <h2 className="text-2xl font-semibold mb-4">Lead Not Found</h2>
           <button onClick={() => router.back()} className="text-blue-500 hover:underline">Go Back</button>
        </div>
      </PageLayout>
    );
  }

  const currentData = isEditing ? editForm : lead;

  return (
    <PageLayout title="Lead Details">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" /> Back to Leads
          </button>
          
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleEditToggle}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                </button>
              </>
            ) : (
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Edit2 size={18} /> Edit Lead
              </button>
            )}
          </div>
        </div>

        {/* Header Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div>
             <div className="flex items-center gap-4 mb-2">
               {isEditing ? (
                 <input
                   type="text"
                   value={editForm.father_name || ''}
                   onChange={(e) => handleInputChange('father_name', e.target.value)}
                   className="text-2xl font-bold text-gray-900 border-b border-gray-300 focus:border-accent outline-none"
                   placeholder="Name"
                 />
               ) : (
                 <h1 className="text-2xl font-bold text-gray-900">
                   {lead.father_name || "Lead Details"}
                 </h1>
               )}
               <div className="flex items-center gap-2">
                 {isEditing ? (
                   <select
                     value={editForm.status}
                     onChange={(e) => handleInputChange('status', e.target.value)}
                     className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(editForm.status)} outline-none border-none`}
                   >
                     <option value="New">New</option>
                     <option value="Interested">Interested</option>
                     <option value="Qualified">Qualified</option>
                     <option value="Active">Active</option>
                   </select>
                 ) : (
                   <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(lead.status)}`}>
                     {lead.status}
                   </span>
                 )}
                 <span className="text-sm text-gray-500">App No: {lead.application_no}</span>
               </div>
             </div>
             <p className="text-gray-500 text-sm">Created on {new Date(lead.created_at).toLocaleDateString()}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Parent Details */}
           <div className="bg-white rounded-lg shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
               <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                 <User size={18} /> Parent Information
               </h3>
             </div>
             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Father */}
                <div className="space-y-3">
                   <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Father</h4>
                   <div className="flex items-start gap-3">
                      <User size={16} className="mt-1 text-gray-400" />
                      <div className="flex-1">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.father_name || ''}
                            onChange={(e) => handleInputChange('father_name', e.target.value)}
                            className="w-full text-sm font-medium border-b border-gray-200 focus:border-accent outline-none"
                          />
                        ) : (
                          <p className="font-medium">{lead.father_name || "-"}</p>
                        )}
                        <p className="text-sm text-gray-500">Name</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3">
                      <Phone size={16} className="mt-1 text-gray-400" />
                      <div className="flex-1">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.father_phone || ''}
                            onChange={(e) => handleInputChange('father_phone', e.target.value)}
                            className="w-full text-sm font-medium border-b border-gray-200 focus:border-accent outline-none"
                          />
                        ) : (
                          <p className="font-medium">{lead.father_phone || "-"}</p>
                        )}
                        <p className="text-sm text-gray-500">Phone</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3">
                      <Mail size={16} className="mt-1 text-gray-400" />
                      <div className="flex-1">
                        {isEditing ? (
                          <input
                            type="email"
                            value={editForm.father_email || ''}
                            onChange={(e) => handleInputChange('father_email', e.target.value)}
                            className="w-full text-sm font-medium border-b border-gray-200 focus:border-accent outline-none"
                          />
                        ) : (
                          <p className="font-medium break-all">{lead.father_email || "-"}</p>
                        )}
                        <p className="text-sm text-gray-500">Email</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3">
                       <Briefcase size={16} className="mt-1 text-gray-400" />
                       <div className="flex-1">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.father_occupation || ''}
                            onChange={(e) => handleInputChange('father_occupation', e.target.value)}
                            className="w-full text-sm font-medium border-b border-gray-200 focus:border-accent outline-none"
                          />
                        ) : (
                          <p className="font-medium">{lead.father_occupation || "-"}</p>
                        )}
                        <p className="text-sm text-gray-500">Occupation</p>
                       </div>
                   </div>
                   <div className="flex items-start gap-3">
                       <DollarSign size={16} className="mt-1 text-gray-400" />
                       <div className="flex-1">
                        {isEditing ? (
                          <select
                            value={editForm.father_annual_income || ''}
                            onChange={(e) => handleInputChange('father_annual_income', e.target.value)}
                            className="w-full text-sm font-medium border-b border-gray-200 focus:border-accent outline-none bg-transparent"
                          >
                            <option value="">Select</option>
                            {incomeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <p className="font-medium">{lead.father_annual_income || "-"}</p>
                        )}
                        <p className="text-sm text-gray-500">Annual Income</p>
                       </div>
                   </div>
                </div>

                {/* Mother */}
                <div className="space-y-3">
                   <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Mother</h4>
                   <div className="flex items-start gap-3">
                      <User size={16} className="mt-1 text-gray-400" />
                      <div className="flex-1">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.mother_name || ''}
                            onChange={(e) => handleInputChange('mother_name', e.target.value)}
                            className="w-full text-sm font-medium border-b border-gray-200 focus:border-accent outline-none"
                          />
                        ) : (
                          <p className="font-medium">{lead.mother_name || "-"}</p>
                        )}
                        <p className="text-sm text-gray-500">Name</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3">
                      <Phone size={16} className="mt-1 text-gray-400" />
                      <div className="flex-1">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.mother_phone || ''}
                            onChange={(e) => handleInputChange('mother_phone', e.target.value)}
                            className="w-full text-sm font-medium border-b border-gray-200 focus:border-accent outline-none"
                          />
                        ) : (
                          <p className="font-medium">{lead.mother_phone || "-"}</p>
                        )}
                        <p className="text-sm text-gray-500">Phone</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3">
                      <Mail size={16} className="mt-1 text-gray-400" />
                      <div className="flex-1">
                        {isEditing ? (
                          <input
                            type="email"
                            value={editForm.mother_email || ''}
                            onChange={(e) => handleInputChange('mother_email', e.target.value)}
                            className="w-full text-sm font-medium border-b border-gray-200 focus:border-accent outline-none"
                          />
                        ) : (
                          <p className="font-medium break-all">{lead.mother_email || "-"}</p>
                        )}
                        <p className="text-sm text-gray-500">Email</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3">
                       <Briefcase size={16} className="mt-1 text-gray-400" />
                       <div className="flex-1">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.mother_occupation || ''}
                            onChange={(e) => handleInputChange('mother_occupation', e.target.value)}
                            className="w-full text-sm font-medium border-b border-gray-200 focus:border-accent outline-none"
                          />
                        ) : (
                          <p className="font-medium">{lead.mother_occupation || "-"}</p>
                        )}
                        <p className="text-sm text-gray-500">Occupation</p>
                       </div>
                   </div>
                   <div className="flex items-start gap-3">
                       <DollarSign size={16} className="mt-1 text-gray-400" />
                       <div className="flex-1">
                        {isEditing ? (
                          <select
                            value={editForm.mother_annual_income || ''}
                            onChange={(e) => handleInputChange('mother_annual_income', e.target.value)}
                            className="w-full text-sm font-medium border-b border-gray-200 focus:border-accent outline-none bg-transparent"
                          >
                            <option value="">Select</option>
                            {incomeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <p className="font-medium">{lead.mother_annual_income || "-"}</p>
                        )}
                        <p className="text-sm text-gray-500">Annual Income</p>
                       </div>
                   </div>
                </div>
             </div>
           </div>

           {/* Lead Info */}
           <div className="bg-white rounded-lg shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
               <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                 <FileText size={18} /> Lead Source Info
               </h3>
             </div>
             <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                   <p className="text-sm text-gray-500">Campaign</p>
                   {isEditing ? (
                     <select
                        value={editForm.campaign || ''}
                        onChange={(e) => handleInputChange('campaign', e.target.value)}
                        className="w-full text-sm font-medium border-b border-gray-200 focus:border-accent outline-none bg-transparent"
                     >
                        <option value="">Select Campaign</option>
                        <option value="Sanjay">Sanjay</option>
                        <option value="QMIS">QMIS</option>
                        <option value="Vijayadhasami 2026">Vijayadhasami 2026</option>
                        <option value="2026-2027 Admissions">2026-2027 Admissions</option>
                     </select>
                   ) : (
                     <p className="font-medium">{lead.campaign || "-"}</p>
                   )}
                </div>
                <div>
                   <p className="text-sm text-gray-500">Source</p>
                   {isEditing ? (
                     <input
                        type="text"
                        value={editForm.source || ''}
                        onChange={(e) => handleInputChange('source', e.target.value)}
                        className="w-full text-sm font-medium border-b border-gray-200 focus:border-accent outline-none"
                     />
                   ) : (
                     <p className="font-medium">{lead.source || "-"}</p>
                   )}
                </div>
                <div>
                   <p className="text-sm text-gray-500">Sub Source</p>
                   {isEditing ? (
                     <input
                        type="text"
                        value={editForm.sub_source || ''}
                        onChange={(e) => handleInputChange('sub_source', e.target.value)}
                        className="w-full text-sm font-medium border-b border-gray-200 focus:border-accent outline-none"
                     />
                   ) : (
                     <p className="font-medium">{lead.sub_source || "-"}</p>
                   )}
                </div>
                <div>
                   <p className="text-sm text-gray-500">Added By</p>
                   <p className="font-medium">{lead.added_by || "-"}</p>
                </div>
             </div>
           </div>

           <div className="bg-white rounded-lg shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
               <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                 <User size={18} /> Children
               </h3>
               {isEditing && (
                 <button
                    onClick={handleAddChild}
                    className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 transition flex items-center gap-1"
                 >
                   <Plus size={14} /> Add Child
                 </button>
               )}
             </div>
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intake Year</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOB</th>
                     {isEditing && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {currentData.children && currentData.children.length > 0 ? (
                     currentData.children.map((child, index) => (
                       <tr key={child.id || index}>
                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                           {isEditing ? (
                             <input
                               type="text"
                               value={child.name || ''}
                               onChange={(e) => handleChildChange(index, 'name', e.target.value)}
                               className="w-full border-b border-gray-200 focus:border-accent outline-none"
                             />
                           ) : (
                             child.name
                           )}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           {isEditing ? (
                             <select
                               value={child.grade || ''}
                               onChange={(e) => handleChildChange(index, 'grade', e.target.value)}
                               className="w-full border-b border-gray-200 focus:border-accent outline-none bg-transparent"
                             >
                               <option value="">Grade</option>
                               {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                             </select>
                           ) : (
                             child.grade
                           )}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           {isEditing ? (
                             <select
                               value={child.intake_year || ''}
                               onChange={(e) => handleChildChange(index, 'intake_year', e.target.value)}
                               className="w-full border-b border-gray-200 focus:border-accent outline-none bg-transparent"
                             >
                               <option value="2026-2027">2026-2027</option>
                               <option value="2025-2026">2025-2026</option>
                             </select>
                           ) : (
                             child.intake_year
                           )}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           {isEditing ? (
                             <select
                               value={child.gender || ''}
                               onChange={(e) => handleChildChange(index, 'gender', e.target.value)}
                               className="w-full border-b border-gray-200 focus:border-accent outline-none bg-transparent"
                             >
                               <option value="">Gender</option>
                               {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
                             </select>
                           ) : (
                             child.gender
                           )}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           {isEditing ? (
                             <input
                               type="date"
                               value={child.date_of_birth || ''}
                               onChange={(e) => handleChildChange(index, 'date_of_birth', e.target.value)}
                               className="w-full border-b border-gray-200 focus:border-accent outline-none"
                             />
                           ) : (
                             child.date_of_birth
                           )}
                         </td>
                         {isEditing && (
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                             <button
                               onClick={() => handleRemoveChild(index)}
                               className="text-red-500 hover:text-red-700 transition"
                             >
                               <X size={16} />
                             </button>
                           </td>
                         )}
                       </tr>
                     ))
                   ) : (
                     <tr>
                       <td colSpan={isEditing ? 6 : 5} className="px-6 py-4 text-center text-sm text-gray-500">
                         No children details found
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
           </div>

        </div>

        {/* Right Column - Timeline & Payments */}
        <div className="space-y-6">
           
           {/* Timeline */}
           <div className="bg-white rounded-lg shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
               <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                 <Clock size={18} /> Timeline
               </h3>
             </div>
             <div className="p-6 max-h-[400px] overflow-y-auto">
                <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
                  {lead.lead_status_history && lead.lead_status_history.length > 0 ? (
                    lead.lead_status_history.map((history, idx) => (
                      <div key={history.id} className="ml-6 relative">
                         <div className="absolute -left-[31px] bg-white border-2 border-blue-500 rounded-full w-4 h-4"></div>
                         <div>
                            <p className="font-semibold text-gray-800">{history.new_status}</p>
                            <p className="text-sm text-gray-500 mt-1">{history.notes}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                               <span>{new Date(history.created_at).toLocaleString()}</span>
                               <span>•</span>
                               <span>{history.changed_by || 'System'}</span>
                            </div>
                         </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 ml-6">No history available</p>
                  )}
                </div>
             </div>
           </div>

        </div>
      </div>
    </PageLayout>
  );
}
