'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Search, Eye, Download, FileText, User, Mail, Phone, Briefcase, Calendar, GraduationCap, MapPin, Filter, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function CareersPage() {
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    position: '',
    gender: '',
    dateFilter: '',
    startDate: '',
    endDate: '',
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
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

      const response = await api.get(`/api/careers?${params.toString()}`);

      if (response.data.success) {
        setApplications(response.data.applications);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalApplications(response.data.pagination?.total || 0);
      } else {
        toast.error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    fetchApplications();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      position: '',
      gender: '',
      dateFilter: '',
      startDate: '',
      endDate: '',
    });
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      fetchApplications();
    }
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
    fetchApplications();
  };

  // Handle pagination
  const handlePrev = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // View application details
  const handleViewDetails = (app) => {
    setSelectedApp(app);
    setShowDetails(true);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get today's date for date inputs
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Check if filters are active
  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== '');
  };

  // Initial fetch
  useEffect(() => {
    fetchApplications();
  }, [currentPage]);

  // Get unique positions for filter
  const uniquePositions = [...new Set(applications.map(app => app.position))].filter(Boolean);

  return (
    <PageLayout title="Career Applications">
      {/* Filters Section */}
      <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Career Applications
          </h2>
          <div className="text-sm text-gray-600">
            Total: {totalApplications}
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Search by name, email, phone..."
                className="pl-8 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Position Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <select
              value={filters.position}
              onChange={(e) => handleFilterChange('position', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Positions</option>
              {uniquePositions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Filter
            </label>
            <select
              value={filters.dateFilter}
              onChange={(e) => handleFilterChange('dateFilter', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range */}
        {(filters.dateFilter === 'custom' || !filters.dateFilter) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                max={filters.endDate || getTodayDate()}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
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
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex justify-end space-x-4">
          {hasActiveFilters() && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center gap-2 text-sm"
            >
              <X size={16} />
              Reset Filters
            </button>
          )}
          <button
            onClick={applyFilters}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 text-sm"
          >
            <Filter size={16} />
            {loading ? 'Applying...' : 'Apply Filters'}
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Show:</label>
              <select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            <button
              onClick={fetchApplications}
              disabled={loading}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Showing {applications.length} of {totalApplications}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied On</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resume</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map((app, idx) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {(currentPage - 1) * rowsPerPage + idx + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="font-medium text-gray-900">{app.name}</div>
                            <div className="text-sm text-gray-500">{app.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{app.position}</span>
                        </div>
                        {app.education_qualification && (
                          <div className="text-xs text-gray-500 mt-1">{app.education_qualification}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            {app.phone}
                          </div>
                          <div className="text-xs text-gray-500">
                            {app.gender || 'Not specified'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {formatDate(app.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-900">{app.resume_file_name}</div>
                            <div className="text-xs text-gray-500">
                              {formatFileSize(app.resume_file_size)} • {app.resume_file_type?.split('/')[1]?.toUpperCase() || 'FILE'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(app.resume_url, '_blank')}
                            className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                            title="Download Resume"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => handleViewDetails(app)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {applications.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">No applications found</div>
                {hasActiveFilters() && (
                  <button
                    onClick={resetFilters}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Clear filters to see all applications
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {applications.length > 0 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1 || loading}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages} • {totalApplications} total applications
                </div>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages || loading}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                  <p className="text-gray-600">Applied on {formatDate(selectedApp.created_at)}</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500">Full Name</div>
                      <div className="flex items-center gap-2 mt-1">
                        <User size={18} className="text-gray-400" />
                        <div className="font-medium">{selectedApp.name}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail size={18} className="text-gray-400" />
                          <div>{selectedApp.email}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Phone</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Phone size={18} className="text-gray-400" />
                          <div>{selectedApp.phone}</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Gender</div>
                        <div className="mt-1">{selectedApp.gender || 'Not specified'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Application Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Application Details</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500">Position Applied</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Briefcase size={18} className="text-gray-400" />
                        <div className="font-medium">{selectedApp.position}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500">Education Qualification</div>
                      <div className="flex items-center gap-2 mt-1">
                        <GraduationCap size={18} className="text-gray-400" />
                        <div>{selectedApp.education_qualification || 'Not specified'}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500">Address</div>
                      <div className="flex items-start gap-2 mt-1">
                        <MapPin size={18} className="text-gray-400 mt-0.5" />
                        <div className="whitespace-pre-wrap">{selectedApp.address || 'Not specified'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resume Section */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Resume</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText size={24} className="text-gray-400 mr-3" />
                    <div>
                      <div className="font-medium">{selectedApp.resume_file_name}</div>
                      <div className="text-sm text-gray-500">
                        {formatFileSize(selectedApp.resume_file_size)} • {selectedApp.resume_file_type}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href={selectedApp.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      View Resume
                    </a>
                    <a
                      href={selectedApp.resume_url}
                      download
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
