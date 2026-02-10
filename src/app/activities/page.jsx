'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import {
  Search,
  Eye,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  Filter,
  X,
  Activity,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// Confirmation Dialog Component
function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all'>
        <div className='p-6'>
          {/* Icon */}
          <div className='flex justify-center mb-4'>
            <div className='h-16 w-16 bg-red-100 rounded-full flex items-center justify-center'>
              <AlertTriangle className='h-8 w-8 text-red-600' />
            </div>
          </div>

          {/* Title */}
          <h2 className='text-xl font-bold text-gray-900 text-center mb-2'>
            {title || 'Confirm Delete'}
          </h2>

          {/* Message */}
          <p className='text-gray-600 text-center mb-6'>
            {message ||
              'Are you sure you want to delete this item? This action cannot be undone.'}
          </p>

          {/* Action Buttons */}
          <div className='flex gap-3'>
            <button
              onClick={onClose}
              className='flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors'
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className='flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center justify-center gap-2'
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AfterSchoolActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    activity_type: '',
    message: '',
    status: '',
  });

  // Delete confirmation states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    activityType: '',
    status: '',
    dateFilter: '',
    startDate: '',
    endDate: '',
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch activities
  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
      });

      // Add filters
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(
        `/api/after-school-activity?${params.toString()}`,
      );

      if (response.data.success) {
        setActivities(response.data.activities);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalActivities(response.data.pagination?.total || 0);
      } else {
        toast.error('Failed to fetch activities');
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
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    fetchActivities();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      activityType: '',
      status: '',
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
      fetchActivities();
    }
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
    fetchActivities();
  };

  // Handle pagination
  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // View activity details
  const handleViewDetails = (activity) => {
    setSelectedActivity(activity);
    setShowDetails(true);
  };

  // Edit activity
  const handleEdit = (activity) => {
    setSelectedActivity(activity);
    setEditForm({
      name: activity.name,
      email: activity.email,
      phone: activity.phone,
      activity_type: activity.activity_type,
      message: activity.message || '',
      status: activity.status,
    });
    setShowEditModal(true);
  };

  // Update activity
  const handleUpdate = async () => {
    try {
      const response = await api.put(
        `/api/after-school-activity/${selectedActivity.id}`,
        editForm,
      );

      if (response.data.success) {
        toast.success('Activity updated successfully');
        setShowEditModal(false);
        fetchActivities();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update');
    }
  };

  // Show delete confirmation dialog
  const handleDeleteClick = (activity) => {
    setItemToDelete(activity);
    setShowDeleteDialog(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setDeleting(true);
    try {
      const response = await api.delete(
        `/api/after-school-activity/${itemToDelete.id}`,
      );

      if (response.data.success) {
        toast.success('Activity deleted successfully');
        setShowDeleteDialog(false);
        setItemToDelete(null);
        fetchActivities();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get today's date for date inputs
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get activity type badge color
  const getActivityTypeColor = (type) => {
    switch (type) {
      case 'badminton':
        return 'bg-red-100 text-red-800';
      case 'kidz-gym':
        return 'bg-purple-100 text-purple-800';
      case 'school-activities':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if filters are active
  const hasActiveFilters = () => {
    return Object.values(filters).some((value) => value !== '');
  };

  // Get activity type display name
  const getActivityTypeDisplay = (type) => {
    switch (type) {
      case 'badminton':
        return 'Badminton';
      case 'kidz-gym':
        return 'Kidz Gym';
      case 'school-activities':
        return 'School Activities';
      default:
        return type;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchActivities();
  }, [currentPage]);

  // Get unique activity types for filter
  const uniqueActivityTypes = [
    ...new Set(activities.map((act) => act.activity_type)),
  ].filter(Boolean);

  return (
    <PageLayout title='After School Activities Enquiries'>
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title='Delete Activity Enquiry'
        message={`Are you sure you want to delete the enquiry from "${itemToDelete?.name}"? This action cannot be undone and all associated data will be permanently removed.`}
      />

      {/* Filters Section */}
      <div className='w-full bg-white rounded-lg shadow-sm p-4 mb-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold text-gray-800'>
            After School Activities Enquiries
          </h2>
          <div className='text-sm text-gray-600'>Total: {totalActivities}</div>
        </div>

        {/* Filters Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
          {/* Search */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Search
            </label>
            <div className='relative'>
              <Search
                className='absolute left-2 top-2.5 text-gray-400'
                size={18}
              />
              <input
                type='text'
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyDown={handleSearch}
                placeholder='Search by name, email, phone...'
                className='pl-8 w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500'
              />
            </div>
          </div>

          {/* Activity Type Filter */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Activity Type
            </label>
            <select
              value={filters.activityType}
              onChange={(e) =>
                handleFilterChange('activityType', e.target.value)
              }
              className='w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500'
            >
              <option value=''>All Activities</option>
              {uniqueActivityTypes.map((type) => (
                <option key={type} value={type}>
                  {getActivityTypeDisplay(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className='w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500'
            >
              <option value=''>All Status</option>
              <option value='new'>New</option>
              <option value='in_progress'>In Progress</option>
              <option value='resolved'>Resolved</option>
              <option value='closed'>Closed</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Date Filter
            </label>
            <select
              value={filters.dateFilter}
              onChange={(e) => handleFilterChange('dateFilter', e.target.value)}
              className='w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500'
            >
              <option value=''>All Time</option>
              <option value='today'>Today</option>
              <option value='last7days'>Last 7 Days</option>
              <option value='last30days'>Last 30 Days</option>
              <option value='custom'>Custom Range</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range */}
        {(filters.dateFilter === 'custom' || !filters.dateFilter) && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Start Date
              </label>
              <input
                type='date'
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange('startDate', e.target.value)
                }
                max={filters.endDate || getTodayDate()}
                className='w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                End Date
              </label>
              <input
                type='date'
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                min={filters.startDate}
                max={getTodayDate()}
                className='w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500'
              />
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className='flex justify-end space-x-4'>
          {hasActiveFilters() && (
            <button
              onClick={resetFilters}
              className='px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center gap-2 text-sm'
            >
              <X size={16} />
              Reset Filters
            </button>
          )}
          <button
            onClick={applyFilters}
            disabled={loading}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 text-sm'
          >
            <Filter size={16} />
            {loading ? 'Applying...' : 'Apply Filters'}
          </button>
        </div>
      </div>

      {/* Activities Table */}
      <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
        {/* Table Controls */}
        <div className='p-4 border-b flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <label className='text-sm text-gray-700'>Show:</label>
              <select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className='border rounded px-2 py-1 text-sm'
              >
                <option value='10'>10</option>
                <option value='25'>25</option>
                <option value='50'>50</option>
                <option value='100'>100</option>
              </select>
            </div>
            <button
              onClick={fetchActivities}
              disabled={loading}
              className='px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 disabled:opacity-50'
            >
              Refresh
            </button>
          </div>
          <div className='text-sm text-gray-600'>
            Showing {activities.length} of {totalActivities}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className='flex justify-center p-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500'></div>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      #
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Enquirer
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Activity
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Contact
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Submitted On
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {activities.map((activity, idx) => (
                    <tr key={activity.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 text-sm text-gray-900'>
                        {(currentPage - 1) * rowsPerPage + idx + 1}
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center'>
                          <User className='h-5 w-5 text-gray-400 mr-3' />
                          <div>
                            <div className='font-medium text-gray-900'>
                              {activity.name}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {activity.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center'>
                          <Activity className='h-5 w-5 text-gray-400 mr-2' />
                          <span
                            className={`px-2 py-1 rounded text-xs ${getActivityTypeColor(activity.activity_type)}`}
                          >
                            {getActivityTypeDisplay(activity.activity_type)}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='space-y-1'>
                          <div className='flex items-center text-sm'>
                            <Phone className='h-4 w-4 text-gray-400 mr-2' />
                            {activity.phone}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {activity.email}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-500'>
                        <div className='flex items-center'>
                          <Calendar className='h-4 w-4 text-gray-400 mr-2' />
                          {formatDate(activity.created_at)}
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <span
                          className={`px-2 py-1 rounded text-xs ${getStatusColor(activity.status)}`}
                        >
                          {activity.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex space-x-2'>
                          <button
                            onClick={() => handleViewDetails(activity)}
                            className='p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors'
                            title='View Details'
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(activity)}
                            className='p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors'
                            title='Edit'
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(activity)}
                            className='p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                            title='Delete'
                            disabled={deleting}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {activities.length === 0 && !loading && (
              <div className='text-center py-12'>
                <div className='text-gray-400 mb-2'>
                  No activity enquiries found
                </div>
                {hasActiveFilters() && (
                  <button
                    onClick={resetFilters}
                    className='text-blue-600 hover:text-blue-800 text-sm'
                  >
                    Clear filters to see all enquiries
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {activities.length > 0 && (
              <div className='px-6 py-4 border-t flex items-center justify-between'>
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1 || loading}
                  className='px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors'
                >
                  Previous
                </button>
                <div className='text-sm text-gray-700'>
                  Page {currentPage} of {totalPages} • {totalActivities} total
                  enquiries
                </div>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages || loading}
                  className='px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors'
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedActivity && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              {/* Header */}
              <div className='flex justify-between items-start mb-6'>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900'>
                    Enquiry Details
                  </h2>
                  <p className='text-gray-600'>
                    Submitted on {formatDate(selectedActivity.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className='text-gray-400 hover:text-gray-600 transition-colors'
                >
                  <X size={24} />
                </button>
              </div>

              <div className='space-y-6'>
                {/* Personal Info */}
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold text-gray-800 border-b pb-2'>
                    Enquirer Information
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <div className='text-sm text-gray-500'>Full Name</div>
                      <div className='flex items-center gap-2 mt-1'>
                        <User size={18} className='text-gray-400' />
                        <div className='font-medium'>
                          {selectedActivity.name}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className='text-sm text-gray-500'>Activity Type</div>
                      <div className='flex items-center gap-2 mt-1'>
                        <Activity size={18} className='text-gray-400' />
                        <span
                          className={`px-2 py-1 rounded text-xs ${getActivityTypeColor(selectedActivity.activity_type)}`}
                        >
                          {getActivityTypeDisplay(
                            selectedActivity.activity_type,
                          )}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className='text-sm text-gray-500'>Email</div>
                      <div className='flex items-center gap-2 mt-1'>
                        <Mail size={18} className='text-gray-400' />
                        <div>{selectedActivity.email}</div>
                      </div>
                    </div>

                    <div>
                      <div className='text-sm text-gray-500'>Phone</div>
                      <div className='flex items-center gap-2 mt-1'>
                        <Phone size={18} className='text-gray-400' />
                        <div>{selectedActivity.phone}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className='text-sm text-gray-500'>Status</div>
                    <div className='mt-1'>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedActivity.status)}`}
                      >
                        {selectedActivity.status
                          .replace('_', ' ')
                          .toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message */}
                {selectedActivity.message && (
                  <div className='space-y-4'>
                    <h3 className='text-lg font-semibold text-gray-800 border-b pb-2'>
                      Message
                    </h3>
                    <div className='flex items-start gap-2'>
                      <MessageSquare size={18} className='text-gray-400 mt-1' />
                      <div className='bg-gray-50 p-4 rounded-lg whitespace-pre-wrap'>
                        {selectedActivity.message}
                      </div>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className='space-y-4 pt-4 border-t'>
                  <h3 className='text-lg font-semibold text-gray-800'>
                    Timestamps
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <div className='text-sm text-gray-500'>Created</div>
                      <div className='flex items-center gap-2 mt-1'>
                        <Calendar size={18} className='text-gray-400' />
                        <div>{formatDate(selectedActivity.created_at)}</div>
                      </div>
                    </div>
                    <div>
                      <div className='text-sm text-gray-500'>Last Updated</div>
                      <div className='flex items-center gap-2 mt-1'>
                        <Calendar size={18} className='text-gray-400' />
                        <div>{formatDate(selectedActivity.updated_at)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className='mt-6 pt-6 border-t flex justify-end'>
                <button
                  onClick={() => setShowDetails(false)}
                  className='px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors'
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedActivity && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-xl shadow-2xl max-w-md w-full'>
            <div className='p-6'>
              {/* Header */}
              <div className='flex justify-between items-start mb-6'>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900'>
                    Edit Enquiry
                  </h2>
                  <p className='text-gray-600'>ID: {selectedActivity.id}</p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className='text-gray-400 hover:text-gray-600 transition-colors'
                >
                  <X size={24} />
                </button>
              </div>

              {/* Edit Form */}
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Name
                  </label>
                  <input
                    type='text'
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className='w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500'
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Email
                    </label>
                    <input
                      type='email'
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className='w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Phone
                    </label>
                    <input
                      type='tel'
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className='w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Activity Type
                    </label>
                    <select
                      value={editForm.activity_type}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          activity_type: e.target.value,
                        }))
                      }
                      className='w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500'
                    >
                      <option value='badminton'>Badminton</option>
                      <option value='kidz-gym'>Kidz Gym</option>
                      <option value='school-activities'>
                        School Activities
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Status
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className='w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500'
                    >
                      <option value='new'>New</option>
                      <option value='in_progress'>In Progress</option>
                      <option value='resolved'>Resolved</option>
                      <option value='closed'>Closed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Message
                  </label>
                  <textarea
                    value={editForm.message}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    rows='4'
                    className='w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500'
                  />
                </div>
              </div>

              {/* Footer */}
              <div className='mt-6 pt-6 border-t flex justify-end gap-3'>
                <button
                  onClick={() => setShowEditModal(false)}
                  className='px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className='px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
