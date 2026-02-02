'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Search, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    campaign: '',
    intakeYear: '',
    project: '',
    grade: '',
    payment: '',
    addedBy: '',
    stage: '',
    source: ''
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalChildCount, setTotalChildCount] = useState(0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Qualified':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Interested':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'New':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Fetch leads from API
  const fetchLeads = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
      });

      // Add filters
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      // Add search if exists
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await api.get(`/api/leads?${params.toString()}`);

      if (response.data.success) {
        // Transform API data to match your existing structure
        const transformedLeads = response.data.leads.map(lead => ({
          id: lead.id,
          applicationNo: lead.application_no || `APP${lead.id.toString().padStart(3, '0')}`,
          createdAt: new Date(lead.created_at).toISOString().split('T')[0],
          stage: lead.stage || '',
          noOfChildren: lead.children?.length || 0,
          campaign: lead.campaign || '',
          source: lead.source || '',
          subSource: lead.sub_source || '',
          fatherName: lead.father_name || '',
          fatherEmail: lead.father_email || '',
          fatherPhone: lead.father_phone || '',
          motherName: lead.mother_name || '',
          motherEmail: lead.mother_email || '',
          motherPhone: lead.mother_phone || '',
          payment: lead.payment_status || 'Pending',
          guardianName: lead.guardian_name || '',
          guardianPhone: lead.guardian_phone || '',
          guardianRelationship: lead.guardian_relationship || '',
          guardianEmail: lead.guardian_email || '',
          project: lead.project || '',
          addedBy: lead.added_by || '',
          whatsappNo: lead.whatsapp_no || lead.father_phone || '',
          status: lead.status || 'New'
        }));

        setLeads(transformedLeads);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalLeads(response.data.pagination?.total || 0);

        // Calculate total child count
        const childCount = response.data.leads.reduce((total, lead) => {
          return total + (lead.children?.length || 0);
        }, 0);
        setTotalChildCount(childCount);

      } else {
        toast.error('Failed to fetch leads');
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchLeads();
  };

  // Handle search
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      fetchLeads();
    }
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (e) => {
    const value = parseInt(e.target.value) || 10;
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Initial fetch and fetch when pagination/filters change
  useEffect(() => {
    fetchLeads();
  }, [currentPage, rowsPerPage]);

  // Handle adding new lead
  const handleAddLead = () => {
    router.push('/searchlead');
  };

  // Handle edit lead
  const handleEditLead = (leadId) => {
    router.push(`/leads/${leadId}/edit`);
  };

  // Format date for input fields
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <PageLayout title="Leads Management">
      {/* Top Section with Filters */}
      <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-6">
        {/* Title and Add Lead Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Leads by Source
          </h2>
          <button
            onClick={handleAddLead}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            disabled={loading}
          >
            <Plus size={18} />
            {loading ? 'Loading...' : 'Add Lead'}
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              max={filters.endDate || getTodayDate()}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              min={filters.startDate}
              max={getTodayDate()}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Campaign */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign
            </label>
            <select
              value={filters.campaign}
              onChange={(e) => handleFilterChange('campaign', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Campaigns</option>
              <option value="Sanjay">Sanjay</option>
              <option value="QMIS">QMIS</option>
              <option value="Vijayadhasami 2026">Vijayadhasami 2026</option>
              <option value="2026-2027 Admissions">2026-2027 Admissions</option>
            </select>
          </div>

          {/* Intake Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intake Year
            </label>
            <select
              value={filters.intakeYear}
              onChange={(e) => handleFilterChange('intakeYear', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Intake Year</option>
              <option value="2026-2027">2026-2027</option>
              <option value="2025-2026">2025-2026</option>
            </select>
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Project
            </label>
            <select
              value={filters.project}
              onChange={(e) => handleFilterChange('project', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Project</option>
              <option value="Vijayadhasami 2026">Vijayadhasami 2026</option>
              <option value="2026-2027 Admissions">2026-2027 Admissions</option>
            </select>
          </div>

          {/* Grade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Grade
            </label>
            <select
              value={filters.grade}
              onChange={(e) => handleFilterChange('grade', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Grade</option>
              <option value="Pre KG">Pre KG</option>
              <option value="KG 1">KG 1</option>
              <option value="KG 2">KG 2</option>
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 4">Grade 4</option>
              <option value="Grade 5">Grade 5</option>
              <option value="Grade 6">Grade 6</option>
              <option value="Grade 7">Grade 7</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>

          {/* All Payments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              All Payments
            </label>
            <select
              value={filters.payment}
              onChange={(e) => handleFilterChange('payment', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Added By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Added By
            </label>
            <select
              value={filters.addedBy}
              onChange={(e) => handleFilterChange('addedBy', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="PRM">PRM</option>
              <option value="Gayathri">Gayathri</option>
              <option value="Fathima">Fathima</option>
              <option value="Akhila">Akhila</option>
              <option value="Paulin Sharmila">Paulin Sharmila</option>
            </select>
          </div>

          {/* Stages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stages
            </label>
            <select
              value={filters.stage}
              onChange={(e) => handleFilterChange('stage', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="Enquiry">Enquiry</option>
              <option value="Application Purchased">Application Purchased</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Interview Conducted">Interview Conducted</option>
              <option value="Admitted">Admitted</option>
            </select>
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <select
              value={filters.source}
              onChange={(e) => handleFilterChange('source', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="Campaign">Campaign</option>
              <option value="Referral">Referral</option>
              <option value="Voucher">Voucher</option>
              <option value="Walk-in">Walk-in</option>
            </select>
          </div>

          {/* Total Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Count
            </label>
            <input
              type="text"
              value={totalLeads}
              disabled
              className="w-full rounded border border-gray-200 bg-gray-100 px-3 py-2 text-sm"
            />
          </div>

          {/* Child Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Child Count
            </label>
            <input
              type="text"
              value={totalChildCount}
              disabled
              className="w-full rounded border border-gray-200 bg-gray-100 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Apply Filters Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={applyFilters}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {loading ? 'Applying...' : 'Apply Filters'}
          </button>
        </div>
      </div>

      {/* Leads Table Section */}
      <div className="space-y-6">
        {/* Table Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 w-full">
          {/* Show count */}
          <div className="flex items-center space-x-2">
            <label
              htmlFor="showCount"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
            >
              Show:
            </label>
            <input
              id="showCount"
              type="number"
              min={1}
              max={100}
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              onKeyDown={(e) => e.key === 'Enter' && fetchLeads()}
              className="w-16 text-sm text-center
                 border border-gray-300 dark:border-gray-600
                 rounded-md bg-white dark:bg-gray-800
                 text-gray-700 dark:text-gray-200
                 focus:outline-none focus:ring-2 focus:ring-primary
                 py-1"
            />
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-auto">
            <Search
              className="absolute left-3 top-3 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-lg
                 border border-gray-200 dark:border-gray-600
                 dark:bg-gray-700 dark:text-white
                 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end">
            {["Copy", "Excel", "PDF", "Print", "Columns"].map((item) => (
              <button
                key={item}
                onClick={() => {
                  if (item === "Print") window.print();
                  // Add other export functionality here
                }}
                className="flex-1 lg:flex-none px-4 py-2 text-sm font-medium
                   bg-white dark:bg-gray-800
                   border border-gray-200 dark:border-gray-600
                   rounded-lg text-gray-700 dark:text-gray-200
                   hover:bg-gray-50 dark:hover:bg-gray-700
                   transition-colors min-w-[80px]"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Sno</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Application No</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Created At</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Stage</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">No of Children</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Campaign</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Source</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Sub Source</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Father Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Father Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Father Phone</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Mother Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Mother Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Mother Phone</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Payment</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Guardian Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Guardian Phone</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Guardian Relationship</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Guardian Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Project</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Added by</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Whatsapp No</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {leads.map((lead, idx) => (
                      <tr key={lead.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{(currentPage - 1) * rowsPerPage + idx + 1}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{lead.applicationNo}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.createdAt}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.stage}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.noOfChildren}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.campaign}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.source}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.subSource}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.fatherName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.fatherEmail}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.fatherPhone}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.motherName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.motherEmail}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.motherPhone}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.payment}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.guardianName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.guardianPhone}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.guardianRelationship}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.guardianEmail}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.project}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.addedBy}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.whatsappNo}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleEditLead(lead.id)}
                            className="text-accent hover:text-red-700 font-semibold text-sm"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1 || loading}
                  className={`px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition ${currentPage === 1 || loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages || loading}
                  className={`px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition ${currentPage === totalPages || loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
