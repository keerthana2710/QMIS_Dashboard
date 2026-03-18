'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { ArrowLeft, Clock, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { usePermission } from '@/hooks/usePermission';

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

const statusOptions = ['Enquiry', 'Application Purchased', 'Interview Scheduled', 'Interview Conducted', 'Admitted'];
const genderOptions = ['Male', 'Female', 'Other'];
const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const statusColors = {
  'Admitted': 'bg-green-100 text-green-800 border border-green-200',
  'Application Purchased': 'bg-blue-100 text-blue-800 border border-blue-200',
  'Enquiry': 'bg-amber-100 text-amber-800 border border-amber-200',
  'Interview Scheduled': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  'Interview Conducted': 'bg-purple-100 text-purple-800 border border-purple-200',
};

// Reusable field components
function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-gray-900">{value || <span className="text-gray-300">—</span>}</p>
    </div>
  );
}

function InputField({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition bg-white"
      >
        <option value="">{placeholder || 'Select...'}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function SubSection({ title, children }) {
  return (
    <div>
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 pb-2 border-b border-gray-100">{title}</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
        {children}
      </div>
    </div>
  );
}

export default function ViewLeadPage() {
  const { canWrite } = usePermission('leads');
  const { id } = useParams();
  const router = useRouter();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchLeadDetails();
  }, [id]);

  const fetchLeadDetails = async () => {
    try {
      const response = await api.get(`/api/leads/${id}`);
      if (response.data.success) {
        setLead(response.data.lead);
        setEditForm(JSON.parse(JSON.stringify(response.data.lead)));
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
      setEditForm(JSON.parse(JSON.stringify(lead)));
    }
    setIsEditing(!isEditing);
  };

  const set = (field) => (value) => setEditForm(prev => ({ ...prev, [field]: value }));

  const handleChildChange = (index, field, value) => {
    const updated = [...editForm.children];
    updated[index] = { ...updated[index], [field]: value };
    setEditForm(prev => ({ ...prev, children: updated }));
  };

  const childSet = (index, field) => (value) => handleChildChange(index, field, value);

  const handleAddChild = () => {
    setEditForm(prev => ({
      ...prev,
      children: [...(prev.children || []), {
        id: Date.now(),
        name: '', grade: '', intake_year: '2026-2027', gender: '',
        date_of_birth: '', address: '', blood_group: '',
        previous_school: '', reason_for_quitting: ''
      }]
    }));
  };

  const handleRemoveChild = (index) => {
    setEditForm(prev => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index)
    }));
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
        setIsEditing(false);
        fetchLeadDetails();
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error(error.response?.data?.error || 'Failed to update lead');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div>
        </div>
      </PageLayout>
    );
  }

  if (!lead) {
    return (
      <PageLayout>
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-3">Lead Not Found</h2>
          <button onClick={() => { window.location.href = '/leads'; }} className="text-blue-500 hover:underline text-sm">
            Back to Leads
          </button>
        </div>
      </PageLayout>
    );
  }

  const d = isEditing ? editForm : lead;

  return (
    <PageLayout title="Lead Details" page="leads">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => { window.location.href = '/leads'; }}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Leads
        </button>

        {canWrite && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleEditToggle}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={15} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
              >
                <Edit2 size={15} /> Edit Lead
              </button>
            )}
          </div>
        )}
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Primary Contact</p>
            <h1 className="text-xl font-bold text-gray-900">{lead.father_name || 'Lead Details'}</h1>
            <p className="text-sm text-gray-500 mt-0.5">App No: <span className="font-medium text-gray-700">{lead.application_no || '—'}</span></p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-3">
            {isEditing ? (
              <SelectField
                label="Status"
                value={editForm.status}
                onChange={set('status')}
                options={statusOptions}
              />
            ) : (
              <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${statusColors[lead.status] || 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                {lead.status}
              </span>
            )}
            <div className="text-xs text-gray-400 text-right space-y-0.5">
              <p>Created: {new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              {lead.updated_at && <p>Updated: {new Date(lead.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Parent Information */}
          <SectionCard title="Parent Information">
            <div className="space-y-8">
              <SubSection title="Father">
                {isEditing ? (
                  <>
                    <InputField label="Name" value={editForm.father_name} onChange={set('father_name')} />
                    <InputField label="Phone" value={editForm.father_phone} onChange={set('father_phone')} />
                    <InputField label="Email" type="email" value={editForm.father_email} onChange={set('father_email')} />
                    <InputField label="Occupation" value={editForm.father_occupation} onChange={set('father_occupation')} />
                    <SelectField label="Annual Income" value={editForm.father_annual_income} onChange={set('father_annual_income')} options={incomeOptions} />
                  </>
                ) : (
                  <>
                    <Field label="Name" value={lead.father_name} />
                    <Field label="Phone" value={lead.father_phone} />
                    <Field label="Email" value={lead.father_email} />
                    <Field label="Occupation" value={lead.father_occupation} />
                    <Field label="Annual Income" value={lead.father_annual_income} />
                  </>
                )}
              </SubSection>

              <SubSection title="Mother">
                {isEditing ? (
                  <>
                    <InputField label="Name" value={editForm.mother_name} onChange={set('mother_name')} />
                    <InputField label="Phone" value={editForm.mother_phone} onChange={set('mother_phone')} />
                    <InputField label="Email" type="email" value={editForm.mother_email} onChange={set('mother_email')} />
                    <InputField label="Occupation" value={editForm.mother_occupation} onChange={set('mother_occupation')} />
                    <SelectField label="Annual Income" value={editForm.mother_annual_income} onChange={set('mother_annual_income')} options={incomeOptions} />
                  </>
                ) : (
                  <>
                    <Field label="Name" value={lead.mother_name} />
                    <Field label="Phone" value={lead.mother_phone} />
                    <Field label="Email" value={lead.mother_email} />
                    <Field label="Occupation" value={lead.mother_occupation} />
                    <Field label="Annual Income" value={lead.mother_annual_income} />
                  </>
                )}
              </SubSection>

              <SubSection title="Guardian">
                {isEditing ? (
                  <>
                    <InputField label="Name" value={editForm.guardian_name} onChange={set('guardian_name')} />
                    <InputField label="Phone" value={editForm.guardian_phone} onChange={set('guardian_phone')} />
                    <InputField label="Email" type="email" value={editForm.guardian_email} onChange={set('guardian_email')} />
                    <InputField label="Relationship" value={editForm.guardian_relationship} onChange={set('guardian_relationship')} />
                    <InputField label="Occupation" value={editForm.guardian_occupation} onChange={set('guardian_occupation')} />
                    <SelectField label="Annual Income" value={editForm.guardian_annual_income} onChange={set('guardian_annual_income')} options={incomeOptions} />
                  </>
                ) : (
                  <>
                    <Field label="Name" value={lead.guardian_name} />
                    <Field label="Phone" value={lead.guardian_phone} />
                    <Field label="Email" value={lead.guardian_email} />
                    <Field label="Relationship" value={lead.guardian_relationship} />
                    <Field label="Occupation" value={lead.guardian_occupation} />
                    <Field label="Annual Income" value={lead.guardian_annual_income} />
                  </>
                )}
              </SubSection>
            </div>
          </SectionCard>

          {/* Lead Source */}
          <SectionCard title="Lead Source">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
              {isEditing ? (
                <>
                  <SelectField
                    label="Campaign"
                    value={editForm.campaign}
                    onChange={set('campaign')}
                    options={['Sanjay', 'QMIS', 'Vijayadhasami 2026', '2026-2027 Admissions']}
                  />
                  <InputField label="Source" value={editForm.source} onChange={set('source')} />
                  <InputField label="Sub Source" value={editForm.sub_source} onChange={set('sub_source')} />
                  <InputField label="Project" value={editForm.project} onChange={set('project')} />
                  <InputField label="Stage" value={editForm.stage} onChange={set('stage')} />
                </>
              ) : (
                <>
                  <Field label="Campaign" value={lead.campaign} />
                  <Field label="Source" value={lead.source} />
                  <Field label="Sub Source" value={lead.sub_source} />
                  <Field label="Project" value={lead.project} />
                  <Field label="Stage" value={lead.stage} />
                  <Field label="Added By" value={lead.added_by} />
                </>
              )}
            </div>
          </SectionCard>

          {/* Children */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Children</h3>
              {isEditing && (
                <button
                  onClick={handleAddChild}
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md border border-blue-200 transition"
                >
                  <Plus size={13} /> Add Child
                </button>
              )}
            </div>

            <div className="p-6 space-y-4">
              {d.children && d.children.length > 0 ? (
                d.children.map((child, index) => (
                  <div key={child.id || index} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Child Card Header */}
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">
                        {child.name || <span className="text-gray-400 font-normal">Unnamed Child</span>}
                        {child.grade && <span className="ml-2 text-xs font-normal text-gray-500">· {child.grade}</span>}
                        {child.intake_year && <span className="ml-1 text-xs font-normal text-gray-500">· {child.intake_year}</span>}
                      </p>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveChild(index)}
                          className="text-red-400 hover:text-red-600 transition p-1 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {/* Child Card Body */}
                    <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                      {isEditing ? (
                        <>
                          <InputField label="Name" value={child.name} onChange={childSet(index, 'name')} />
                          <SelectField label="Grade" value={child.grade} onChange={childSet(index, 'grade')} options={gradeOptions} placeholder="Select grade" />
                          <SelectField label="Intake Year" value={child.intake_year} onChange={childSet(index, 'intake_year')} options={['2026-2027', '2025-2026']} />
                          <SelectField label="Gender" value={child.gender} onChange={childSet(index, 'gender')} options={genderOptions} placeholder="Select gender" />
                          <InputField label="Date of Birth" type="date" value={child.date_of_birth} onChange={childSet(index, 'date_of_birth')} />
                          <SelectField label="Blood Group" value={child.blood_group} onChange={childSet(index, 'blood_group')} options={bloodGroupOptions} placeholder="Select" />
                          <InputField label="Previous School" value={child.previous_school} onChange={childSet(index, 'previous_school')} />
                          <InputField label="Reason for Quitting" value={child.reason_for_quitting} onChange={childSet(index, 'reason_for_quitting')} />
                          <div className="md:col-span-2">
                            <InputField label="Address" value={child.address} onChange={childSet(index, 'address')} />
                          </div>
                        </>
                      ) : (
                        <>
                          <Field label="Name" value={child.name} />
                          <Field label="Grade" value={child.grade} />
                          <Field label="Intake Year" value={child.intake_year} />
                          <Field label="Gender" value={child.gender} />
                          <Field label="Date of Birth" value={child.date_of_birth} />
                          <Field label="Blood Group" value={child.blood_group} />
                          <Field label="Previous School" value={child.previous_school} />
                          <Field label="Reason for Quitting" value={child.reason_for_quitting} />
                          <div className="md:col-span-2">
                            <Field label="Address" value={child.address} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No children added</p>
                  {isEditing && (
                    <button onClick={handleAddChild} className="mt-3 text-blue-600 text-sm hover:underline">
                      + Add a child
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Sidebar - Timeline */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Clock size={15} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Status History</h3>
            </div>
            <div className="p-5 max-h-[500px] overflow-y-auto">
              {lead.lead_status_history && lead.lead_status_history.length > 0 ? (
                <ol className="relative border-l border-gray-200 space-y-5 ml-1">
                  {lead.lead_status_history.map((history) => (
                    <li key={history.id} className="ml-5">
                      <div className="absolute -left-1.5 mt-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white ring-1 ring-blue-200"></div>
                      <p className="text-sm font-semibold text-gray-800">{history.new_status}</p>
                      {history.notes && (
                        <p className="text-xs text-gray-500 mt-0.5">{history.notes}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400">
                        <span>{new Date(history.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span>·</span>
                        <span>{history.changed_by || 'System'}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No history available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
