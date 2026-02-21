'use client';

import { useState, useEffect, useRef } from 'react';
import PageLayout from '@/components/PageLayout';
import { Search, Plus, Calendar, User, Mail, Phone, Briefcase, DollarSign, Users, School, BookOpen, MapPin, Droplets, X, Edit2, Save, ArrowLeft, AlertCircle, MessageCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function CreateLead() {
  // Step management
  const [step, setStep] = useState(1); // 1: Search, 2: Parent Details, 3: OTP, 4: Child Details
  const [phoneNumber, setPhoneNumber] = useState('');
  const [existingLead, setExistingLead] = useState(null);
  const [leadId, setLeadId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verificationToken, setVerificationToken] = useState(null);
  const [children, setChildren] = useState([]);
  const [showChildForm, setShowChildForm] = useState(false);
  const [editingChildId, setEditingChildId] = useState(null);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpSentTime, setOtpSentTime] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    father: {
      name: '',
      phone: '',
      email: '',
      occupation: '',
      annualIncome: ''
    },
    mother: {
      name: '',
      phone: '',
      email: '',
      occupation: '',
      annualIncome: ''
    },
    guardian: {
      name: '',
      phone: '',
      email: '',
      relationship: '',
      occupation: '',
      annualIncome: ''
    },
    project: {
      campaign: '',
      source: '',
      subSource: ''
    }
  });

  const [childForm, setChildForm] = useState({
    name: '',
    intakeYear: '2026-2027',
    grade: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    bloodGroup: '',
    previousSchool: '',
    reasonForQuitting: ''
  });

  // Refs
  const otpRefs = useRef([]);

  // Options
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
  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  // Countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Auto-focus first OTP input
  useEffect(() => {
    if (step === 3 && otpRefs.current[0]) {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // Check lead existence
  const handleSearch = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/api/leads/check', { phoneNumber });

      if (response.data.exists) {
        setExistingLead(response.data.lead);
        toast.info('Existing lead found');
      } else {
        setExistingLead(null);
        setLeadId(null);
        setStep(2);
        // Pre-fill phone number
        setFormData(prev => ({
          ...prev,
          father: { ...prev.father, phone: phoneNumber }
        }));
      }
    } catch (error) {
      console.error('Error checking lead:', error);
      toast.error(error.response?.data?.error || 'Failed to check lead');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Update Existing
  const handleUpdateExisting = async () => {
    if (!existingLead) return;

    setIsLoading(true);
    try {
      const response = await api.get(`/api/leads/${existingLead.id}`);
      if (response.data.success) {
        const fullLead = response.data.lead;
        
        // Map backend data back to form structure
        setFormData({
          father: {
            name: fullLead.father_name || '',
            phone: fullLead.father_phone || '',
            email: fullLead.father_email || '',
            occupation: fullLead.father_occupation || '',
            annualIncome: fullLead.father_annual_income || ''
          },
          mother: {
            name: fullLead.mother_name || '',
            phone: fullLead.mother_phone || '',
            email: fullLead.mother_email || '',
            occupation: fullLead.mother_occupation || '',
            annualIncome: fullLead.mother_annual_income || ''
          },
          guardian: {
            name: fullLead.guardian_name || '',
            phone: fullLead.guardian_phone || '',
            email: fullLead.guardian_email || '',
            relationship: fullLead.guardian_relationship || '',
            occupation: fullLead.guardian_occupation || '',
            annualIncome: fullLead.guardian_annual_income || ''
          },
          project: {
            campaign: fullLead.campaign || '',
            source: fullLead.source || '',
            subSource: fullLead.sub_source || ''
          }
        });

        // Map children
        if (fullLead.children && fullLead.children.length > 0) {
          setChildren(fullLead.children.map(child => ({
            id: child.id,
            name: child.name || '',
            intakeYear: child.intake_year || '2026-2027',
            grade: child.grade || '',
            dateOfBirth: child.date_of_birth || '',
            gender: child.gender || '',
            address: child.address || '',
            bloodGroup: child.blood_group || '',
            previousSchool: child.previous_school || '',
            reasonForQuitting: child.reason_for_quitting || ''
          })));
        }

        setLeadId(fullLead.id);
        setStep(2);
      }
    } catch (error) {
      console.error('Error fetching full lead details:', error);
      toast.error('Failed to load lead details');
    } finally {
      setIsLoading(false);
    }
  };

  // Send WhatsApp OTP
  const handleSendOTP = async () => {
    if (!formData.father.name || !formData.father.phone) {
      toast.error('Father\'s name and phone are required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/api/leads/send-otp', {
        phoneNumber: formData.father.phone
      });

      if (response.data.success) {
        toast.success('WhatsApp OTP sent successfully!');
        setOtpSentTime(new Date());
        setOtpCountdown(30); // 30 seconds countdown
        setStep(3);

        // Log OTP for development
        if (response.data.demoOtp) {
          console.log('Development OTP:', response.data.demoOtp);
          toast.success(`Dev OTP: ${response.data.demoOtp}`, { duration: 10000 });
        }
      } else {
        toast.error(response.data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        setTimeout(() => otpRefs.current[index + 1]?.focus(), 10);
      }
    }
  };

  // Handle OTP key down
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        setTimeout(() => otpRefs.current[index - 1]?.focus(), 10);
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/api/leads/verify-otp', {
        phoneNumber: formData.father.phone,
        otp: enteredOtp
      });

      if (response.data.success) {
        setVerificationToken(response.data.token);
        toast.success('Phone number verified via WhatsApp!');
        setStep(4);
      } else {
        toast.error(response.data.error || 'Invalid OTP');
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        if (otpRefs.current[0]) otpRefs.current[0].focus();
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(error.response?.data?.error || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (otpCountdown > 0) {
      toast.error(`Please wait ${otpCountdown} seconds before resending`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/api/leads/resend-otp', {
        phoneNumber: formData.father.phone
      });

      if (response.data.success) {
        toast.success('OTP resent successfully!');
        setOtp(['', '', '', '', '', '']);
        setOtpCountdown(30);
        setOtpSentTime(new Date());

        if (otpRefs.current[0]) {
          otpRefs.current[0].focus();
        }

        // Log OTP for development
        if (response.data.demoOtp) {
          console.log('Development OTP (Resent):', response.data.demoOtp);
          toast.success(`Dev OTP: ${response.data.demoOtp}`, { duration: 10000 });
        }
      } else {
        toast.error(response.data.error || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Add/Edit child
  const handleAddChild = () => {
    if (childForm.name.trim() === '') {
      toast.error('Please enter child name');
      return;
    }

    if (editingChildId) {
      setChildren(children.map(child =>
        child.id === editingChildId ? { ...childForm, id: editingChildId } : child
      ));
      setEditingChildId(null);
      toast.success('Child updated successfully');
    } else {
      setChildren([...children, { ...childForm, id: Date.now() }]);
      toast.success('Child added successfully');
    }

    resetChildForm();
  };

  // Edit child
  const handleEditChild = (child) => {
    setChildForm(child);
    setEditingChildId(child.id);
    setShowChildForm(true);
  };

  // Remove child
  const handleRemoveChild = (id) => {
    setChildren(children.filter(child => child.id !== id));
    toast.success('Child removed');
  };

  // Reset child form
  const resetChildForm = () => {
    setChildForm({
      name: '',
      intakeYear: '2026-2027',
      grade: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      bloodGroup: '',
      previousSchool: '',
      reasonForQuitting: ''
    });
    setShowChildForm(false);
    setEditingChildId(null);
  };

  // Create lead
  const handleCreateLead = async () => {
    if (children.length === 0) {
      toast.error('Please add at least one child');
      return;
    }

    if (!verificationToken) {
      toast.error('Phone verification required');
      return;
    }

    setIsLoading(true);
    try {
      // Get user info
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      const response = await api.post('/api/leads/create', {
        verificationToken,
        leadData: formData,
        children: children,
        userId: user?.id || null,
        addedBy: user?.username || 'Guest',
        leadId: leadId // Send leadId if updating
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Lead processed successfully!', { duration: 10000 });

        // Reset form
        setStep(1);
        setPhoneNumber('');
        setFormData({
          father: { name: '', phone: '', email: '', occupation: '', annualIncome: '' },
          mother: { name: '', phone: '', email: '', occupation: '', annualIncome: '' },
          guardian: { name: '', phone: '', email: '', relationship: '', occupation: '', annualIncome: '' },
          project: { campaign: '', source: '', subSource: '' }
        });
        setChildren([]);
        resetChildForm();
        setVerificationToken(null);
        setOtp(['', '', '', '', '', '']);
        setOtpCountdown(0);
        setOtpSentTime(null);
        setExistingLead(null);
      } else if (response.data.existingLead) {
        toast.error('Lead already exists');
        setExistingLead(response.data.existingLead);
        setStep(1);
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      toast.error(error.response?.data?.error || 'Failed to create lead');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle phone input formatting
  const handlePhoneChange = (value) => {
    const numericValue = value.replace(/\D/g, '');
    let formatted = numericValue;
    if (numericValue.length > 5) {
      formatted = numericValue.slice(0, 5) + ' ' + numericValue.slice(5, 10);
    }
    setPhoneNumber(formatted);
  };

  // Handle form input changes
  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Handle child form input changes
  const handleChildInputChange = (field, value) => {
    setChildForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Step 1: Search
  const renderSearchStep = () => (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 sm:p-6 md:p-8 shadow-sm">
        <h2 className="text-center text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
          Create Lead
        </h2>

        <div className="flex items-center rounded-lg border border-gray-300 bg-gray-50 px-3 py-3 mb-4 sm:mb-6">
          <span className="mr-1 sm:mr-2 text-xs sm:text-sm">🇮🇳</span>
          <span className="mr-1 sm:mr-2 text-xs sm:text-sm text-gray-600">+91</span>
          <span className="mr-1 sm:mr-2 h-4 sm:h-5 w-px bg-gray-300" />
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="81234 56789"
            className="w-full bg-transparent text-gray-700 outline-none placeholder-gray-400 text-sm sm:text-base"
            maxLength={11}
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="w-full rounded-lg bg-accent py-2 sm:py-3 text-sm sm:text-base font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>

        {existingLead && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm sm:text-base font-semibold text-blue-800 mb-2 flex items-center">
              <AlertCircle className="mr-1 sm:mr-2" size={14} />
              Existing Lead Found
            </h3>
            <div className="space-y-1 sm:space-y-2">
              <p className="text-xs sm:text-sm text-blue-700">
                <span className="font-medium">Application #:</span> {existingLead.application_no}
              </p>
              <p className="text-xs sm:text-sm text-blue-700">
                <span className="font-medium">Father:</span> {existingLead.father_name}
              </p>
              <p className="text-xs sm:text-sm text-blue-700">
                <span className="font-medium">Phone:</span> {existingLead.father_phone}
              </p>
              <p className="text-xs sm:text-sm text-blue-700">
                <span className="font-medium">Stage:</span> {existingLead.stage}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-4">
              <button
                onClick={() => window.location.href = `/leads/${existingLead.id}`}
                className="flex-1 rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 transition text-sm sm:text-base"
              >
                View Lead
              </button>
              <button
                onClick={handleUpdateExisting}
                className="flex-1 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition text-sm sm:text-base"
              >
                Update Existing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Step 2: Parent Details
  const renderParentDetails = () => (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-lg p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            {leadId ? 'Update Admissions Lead' : 'Sign Up for Admissions'}
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Step 2 of 4 - Parent Details</p>
        </div>
        <button
          onClick={() => setStep(1)}
          className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 text-sm sm:text-base w-full sm:w-auto"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSendOTP(); }}>
        {/* WhatsApp Verification Status */}
        {verificationToken && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 sm:gap-3">
              <CheckCircle className="text-green-600" size={18} />
              <div>
                <p className="font-medium text-green-800 text-sm sm:text-base">WhatsApp Verified</p>
                <p className="text-xs sm:text-sm text-green-600">
                  Phone number verified via WhatsApp
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Father's Details */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
            <User className="mr-2" size={18} />
            Father's Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name *</label>
              <input
                type="text"
                value={formData.father.name}
                onChange={(e) => handleInputChange('father', 'name', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Father's Phone Number *</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3">
                <span className="text-gray-600 text-sm">+91 •</span>
                <input
                  type="text"
                  value={formData.father.phone}
                  onChange={(e) => handleInputChange('father', 'phone', e.target.value)}
                  className="w-full px-3 py-2 border-0 focus:ring-0 text-sm sm:text-base"
                  placeholder="81234 56789"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Mail className="mr-2" size={14} />
                Father's Email
              </label>
              <input
                type="email"
                value={formData.father.email}
                onChange={(e) => handleInputChange('father', 'email', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Briefcase className="mr-2" size={14} />
                Father's Occupation
              </label>
              <input
                type="text"
                value={formData.father.occupation}
                onChange={(e) => handleInputChange('father', 'occupation', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <DollarSign className="mr-2" size={14} />
                Select Annual Income
              </label>
              <select
                value={formData.father.annualIncome}
                onChange={(e) => handleInputChange('father', 'annualIncome', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
              >
                <option value="">Select</option>
                {incomeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mother's Details */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
            <User className="mr-2" size={18} />
            Mother's Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
              <input
                type="text"
                value={formData.mother.name}
                onChange={(e) => handleInputChange('mother', 'name', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Phone Number</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3">
                <span className="text-gray-600 text-sm">+91 •</span>
                <input
                  type="text"
                  value={formData.mother.phone}
                  onChange={(e) => handleInputChange('mother', 'phone', e.target.value)}
                  className="w-full px-3 py-2 border-0 focus:ring-0 text-sm sm:text-base"
                  placeholder="81234 56789"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Mail className="mr-2" size={14} />
                Mother's Email
              </label>
              <input
                type="email"
                value={formData.mother.email}
                onChange={(e) => handleInputChange('mother', 'email', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Briefcase className="mr-2" size={14} />
                Mother's Occupation
              </label>
              <input
                type="text"
                value={formData.mother.occupation}
                onChange={(e) => handleInputChange('mother', 'occupation', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <DollarSign className="mr-2" size={14} />
                Select Annual Income
              </label>
              <select
                value={formData.mother.annualIncome}
                onChange={(e) => handleInputChange('mother', 'annualIncome', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
              >
                <option value="">Select</option>
                {incomeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Guardian Details */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
            <Users className="mr-2" size={18} />
            Guardian Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Name</label>
              <input
                type="text"
                value={formData.guardian.name}
                onChange={(e) => handleInputChange('guardian', 'name', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Phone Number</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3">
                <span className="text-gray-600 text-sm">+91 •</span>
                <input
                  type="text"
                  value={formData.guardian.phone}
                  onChange={(e) => handleInputChange('guardian', 'phone', e.target.value)}
                  className="w-full px-3 py-2 border-0 focus:ring-0 text-sm sm:text-base"
                  placeholder="81234 56789"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Relationship</label>
              <input
                type="text"
                value={formData.guardian.relationship}
                onChange={(e) => handleInputChange('guardian', 'relationship', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
                placeholder="Father, Mother, Uncle, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Mail className="mr-2" size={14} />
                Guardian Email
              </label>
              <input
                type="email"
                value={formData.guardian.email}
                onChange={(e) => handleInputChange('guardian', 'email', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Briefcase className="mr-2" size={14} />
                Guardian Occupation
              </label>
              <input
                type="text"
                value={formData.guardian.occupation}
                onChange={(e) => handleInputChange('guardian', 'occupation', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <DollarSign className="mr-2" size={14} />
                Select Annual Income
              </label>
              <select
                value={formData.guardian.annualIncome}
                onChange={(e) => handleInputChange('guardian', 'annualIncome', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
              >
                <option value="">Select</option>
                {incomeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
            <BookOpen className="mr-2" size={18} />
            Project Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Campaign</label>
              <select
                value={formData.project.campaign}
                onChange={(e) => handleInputChange('project', 'campaign', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
              >
                <option value="">Select Campaign</option>
                <option value="Sanjay">Sanjay</option>
                <option value="QMIS">QMIS</option>
                <option value="Vijayadhasami 2026">Vijayadhasami 2026</option>
                <option value="2026-2027 Admissions">2026-2027 Admissions</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
              <input
                type="text"
                value={formData.project.source}
                onChange={(e) => handleInputChange('project', 'source', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
                placeholder="Campaign, Referral, Voucher, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sub Source</label>
              <input
                type="text"
                value={formData.project.subSource}
                onChange={(e) => handleInputChange('project', 'subSource', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
                placeholder="Online, Friend, Offline, etc."
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6 bg-blue-50 rounded-lg border border-blue-200 mb-6 sm:mb-8">
          <div className="flex items-start sm:items-center gap-3">
            <MessageCircle className="text-blue-600 mt-1 sm:mt-0" size={20} />
            <div>
              <p className="font-medium text-blue-800 text-sm sm:text-base">WhatsApp Verification Required</p>
              <p className="text-xs sm:text-sm text-blue-600">
                We'll send a 6-digit OTP to {formData.father.phone} via WhatsApp
              </p>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-accent text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 text-sm sm:text-base"
          >
            {isLoading ? 'Sending OTP...' : 'Send WhatsApp OTP'}
          </button>
        </div>
      </form>
    </div>
  );

  // Step 3: OTP Verification
  const renderOTPVerification = () => (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 sm:p-6 md:p-8 shadow-sm">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-3 sm:mb-4">
            <MessageCircle className="text-green-600" size={20} />
          </div>
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2">
            WhatsApp Verification
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm">
            Enter the 6-digit OTP sent to your WhatsApp
          </p>
          <p className="font-medium text-gray-800 text-sm sm:text-base mt-1">
            {formData.father.phone}
          </p>
          {otpSentTime && (
            <p className="text-xs text-gray-500 mt-1">
              Sent at {otpSentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        <div className="flex justify-center gap-1 sm:gap-2 mb-6 sm:mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => otpRefs.current[index] = el}
              type="text"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              maxLength={1}
              className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl border-2 border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          ))}
        </div>

        <button
          onClick={handleVerifyOTP}
          disabled={isLoading || otp.join('').length !== 6}
          className="w-full rounded-lg bg-accent py-2 sm:py-3 text-sm sm:text-base font-semibold text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-3 sm:mb-4"
        >
          {isLoading ? 'Verifying...' : 'Verify OTP & Continue'}
        </button>

        <div className="text-center space-y-2 sm:space-y-3">
          <p className="text-gray-500 text-xs sm:text-sm">
            Didn't receive OTP?{' '}
            <button
              onClick={handleResendOTP}
              disabled={isLoading || otpCountdown > 0}
              className="text-accent hover:underline font-medium disabled:opacity-50"
            >
              {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend OTP'}
            </button>
          </p>
          <button
            onClick={() => setStep(2)}
            className="text-gray-600 hover:text-gray-800 text-xs sm:text-sm flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeft size={12} />
            Back to edit details
          </button>
        </div>
      </div>
    </div>
  );

  // Step 4: Child Details
  const renderChildDetails = () => (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-lg p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Welcome to QMIS</h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Step 4 of 4 - Child Details</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
            <CheckCircle size={10} />
            Verified
          </div>
          <button
            onClick={() => setStep(3)}
            className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 text-sm sm:text-base w-full sm:w-auto"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </div>

      {/* Existing Children */}
      {children.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Added Children</h3>
          <div className="space-y-2 sm:space-y-3">
            {children.map((child, index) => (
              <div key={child.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
                <div className="mb-2 sm:mb-0">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">{index + 1}. {child.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {child.grade} • {child.gender} • {child.dateOfBirth}
                  </p>
                </div>
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <button
                    onClick={() => handleEditChild(child)}
                    className="px-3 sm:px-4 py-1 sm:py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex items-center gap-1 text-xs sm:text-sm"
                  >
                    <Edit2 size={12} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemoveChild(child.id)}
                    className="px-3 sm:px-4 py-1 sm:py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition flex items-center gap-1 text-xs sm:text-sm"
                  >
                    <X size={12} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Child Form */}
      {showChildForm ? (
        <div className="border border-gray-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center">
            {editingChildId ? 'Edit Child Details' : 'Add Child Details'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Child Name *</label>
              <input
                type="text"
                value={childForm.name}
                onChange={(e) => handleChildInputChange('name', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Intake Year</label>
              <select
                value={childForm.intakeYear}
                onChange={(e) => handleChildInputChange('intakeYear', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
              >
                <option value="2026-2027">2026-2027</option>
                <option value="2025-2026">2025-2026</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Grade</label>
              <select
                value={childForm.grade}
                onChange={(e) => handleChildInputChange('grade', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
              >
                <option value="">Select Grade</option>
                {gradeOptions.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="mr-2" size={14} />
                Date of Birth
              </label>
              <input
                type="date"
                value={childForm.dateOfBirth}
                onChange={(e) => handleChildInputChange('dateOfBirth', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={childForm.gender}
                onChange={(e) => handleChildInputChange('gender', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
              >
                <option value="">Select Gender</option>
                {genderOptions.map(gender => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MapPin className="mr-2" size={14} />
                Address
              </label>
              <textarea
                value={childForm.address}
                onChange={(e) => handleChildInputChange('address', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Droplets className="mr-2" size={14} />
                Blood Group
              </label>
              <select
                value={childForm.bloodGroup}
                onChange={(e) => handleChildInputChange('bloodGroup', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
              >
                <option value="">Select Blood Group</option>
                {bloodGroupOptions.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <School className="mr-2" size={14} />
                Previous School
              </label>
              <input
                type="text"
                value={childForm.previousSchool}
                onChange={(e) => handleChildInputChange('previousSchool', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Quitting</label>
              <textarea
                value={childForm.reasonForQuitting}
                onChange={(e) => handleChildInputChange('reasonForQuitting', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
                rows="3"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
            <button
              onClick={handleAddChild}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-accent text-white rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
            >
              {editingChildId ? <Save size={14} /> : <Plus size={14} />}
              {editingChildId ? 'Update Child' : 'Add Child'}
            </button>
            <button
              onClick={resetChildForm}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowChildForm(true)}
          className="w-full py-3 sm:py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-accent hover:text-accent transition mb-6 sm:mb-8 flex items-center justify-center text-sm sm:text-base"
        >
          <Plus className="mr-2" size={16} />
          Add Child
        </button>
      )}

      {/* Save Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-xs sm:text-sm text-gray-600">
          {children.length} child{children.length !== 1 ? 'ren' : ''} added • Phone verified
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => setStep(3)}
            className="px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
          >
            Back
          </button>
          <button
            onClick={handleCreateLead}
            disabled={isLoading || children.length === 0}
            className="px-6 sm:px-8 py-2 sm:py-3 bg-accent text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 text-sm sm:text-base"
          >
            {isLoading ? (leadId ? 'Updating Lead...' : 'Creating Lead...') : (leadId ? 'Update Lead' : 'Create Lead')}
          </button>
        </div>
      </div>
    </div>
  );

  // Progress Steps
  const renderProgressSteps = () => (
    <div className="flex items-center justify-center mb-4 sm:mb-6 md:mb-8 overflow-x-auto px-2">
      <div className="flex items-center min-w-max">
        {['Search', 'Parent Details', 'OTP', 'Child Details'].map((label, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 ${step > index + 1 ? 'bg-accent border-accent text-white' : step === index + 1 ? 'border-accent bg-white text-accent' : 'border-gray-300 text-gray-400'} text-sm sm:text-base`}>
              {step > index + 1 ? <CheckCircle size={14} /> : index + 1}
            </div>
            <div className={`ml-1 sm:ml-2 text-xs sm:text-sm font-medium ${step >= index + 1 ? 'text-gray-900' : 'text-gray-400'} hidden xs:block`}>
              {label}
            </div>
            {index < 3 && (
              <div className={`mx-2 sm:mx-4 w-6 sm:w-12 h-0.5 ${step > index + 1 ? 'bg-accent' : 'bg-gray-300'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <PageLayout title="Create Lead">
      <div className="max-w-6xl mx-auto py-3 sm:py-4 md:py-6 lg:py-8 px-2 sm:px-3 md:px-4">
        {renderProgressSteps()}

        {step === 1 && renderSearchStep()}
        {step === 2 && renderParentDetails()}
        {step === 3 && renderOTPVerification()}
        {step === 4 && renderChildDetails()}
      </div>
    </PageLayout>
  );
}
