'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { Search, Plus, Eye, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    dateFilter: '',
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch contacts from API
  const fetchContacts = async () => {
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

      const response = await api.get(`/api/contacts?${params.toString()}`);

      if (response.data.success) {
        setContacts(response.data.contacts);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalContacts(response.data.pagination?.total || 0);
      } else {
        toast.error('Failed to fetch contacts');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch contacts');
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
    fetchContacts();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      dateFilter: '',
    });
    setSearchQuery('');
    setCurrentPage(1);
    fetchContacts();
  };

  // Handle search
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      fetchContacts();
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

  // Handle view contact details
  const handleViewContact = (contactId) => {
    router.push(`/contacts/${contactId}`);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format date for input fields
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Initial fetch and fetch when pagination/filters change
  useEffect(() => {
    fetchContacts();
  }, [currentPage, rowsPerPage]);

  return (
    <PageLayout title="Contacts Management">
      {/* Top Section with Filters */}
      <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-6">
        {/* Title and Add Contact Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Contacts Management
          </h2>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Filter Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Filter
            </label>
            <select
              value={filters.dateFilter}
              onChange={(e) => handleFilterChange('dateFilter', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range - Only show when custom is selected */}
          {(filters.dateFilter === 'custom' || !filters.dateFilter) && (
            <>
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
            </>
          )}

          {/* Total Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Contacts
            </label>
            <input
              type="text"
              value={totalContacts}
              disabled
              className="w-full rounded border border-gray-200 bg-gray-100 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={resetFilters}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Reset
          </button>
          <button
            onClick={applyFilters}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {loading ? 'Applying...' : 'Apply Filters'}
          </button>
        </div>
      </div>

      {/* Contacts Table Section */}
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
              onKeyDown={(e) => e.key === 'Enter' && fetchContacts()}
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
              placeholder="Search contacts by name, email, or phone..."
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
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Phone</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Subject</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Message</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Created Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {contacts.map((contact, idx) => (
                      <tr key={contact.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {(currentPage - 1) * rowsPerPage + idx + 1}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {contact.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {contact.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {contact.phone}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {contact.subject || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                          {contact.message}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(contact.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewContact(contact.id)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}

                    {contacts.length === 0 && !loading && (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center">
                          <div className="text-gray-500 dark:text-gray-400">
                            No contacts found. Try adjusting your filters or add a new contact.
                          </div>
                        </td>
                      </tr>
                    )}
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
                  Page {currentPage} of {totalPages} (Total: {totalContacts})
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
