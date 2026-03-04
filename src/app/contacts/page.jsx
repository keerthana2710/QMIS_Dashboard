'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import TableToolbar from '@/components/TableToolbar';
import { Search, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const ALL_COLS = [
  { key: 'sno', label: 'Sno' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'subject', label: 'Subject' },
  { key: 'message', label: 'Message' },
  { key: 'createdAt', label: 'Created Date' },
];

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleCols, setVisibleCols] = useState(ALL_COLS.map((c) => c.key));

  const [filters, setFilters] = useState({ startDate: '', endDate: '', dateFilter: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage.toString(), limit: rowsPerPage.toString() });
      Object.entries(filters).forEach(([k, v]) => v && params.append(k, v));
      if (searchQuery) params.append('search', searchQuery);

      const response = await api.get(`/api/contacts?${params}`);
      if (response.data.success) {
        setContacts(response.data.contacts);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalContacts(response.data.pagination?.total || 0);
      } else {
        toast.error('Failed to fetch contacts');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, val) => setFilters((f) => ({ ...f, [key]: val }));
  const applyFilters = () => { setCurrentPage(1); fetchContacts(); };
  const resetFilters = () => {
    setFilters({ startDate: '', endDate: '', dateFilter: '' });
    setSearchQuery('');
    setCurrentPage(1);
  };
  const handleSearch = (e) => { if (e.key === 'Enter') { setCurrentPage(1); fetchContacts(); } };
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  useEffect(() => { fetchContacts(); }, [currentPage, rowsPerPage]); // eslint-disable-line

  const getData = () =>
    contacts.map((c, idx) => ({
      sno: (currentPage - 1) * rowsPerPage + idx + 1,
      name: c.name,
      email: c.email,
      phone: c.phone,
      subject: c.subject || '—',
      message: c.message,
      createdAt: formatDate(c.created_at),
    }));

  const vis = (key) => visibleCols.includes(key);

  return (
    <PageLayout title="Contacts Management">
      {/* Filters */}
      <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Contacts Management</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Filter</label>
            <select value={filters.dateFilter} onChange={(e) => handleFilterChange('dateFilter', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          {(filters.dateFilter === 'custom' || !filters.dateFilter) && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input type="date" value={filters.startDate} max={filters.endDate || getTodayDate()}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input type="date" value={filters.endDate} min={filters.startDate} max={getTodayDate()}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Contacts</label>
            <input type="text" value={totalContacts} disabled className="w-full rounded border border-gray-200 bg-gray-100 px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={resetFilters} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">Reset</button>
          <button onClick={applyFilters} disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            {loading ? 'Applying...' : 'Apply Filters'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 w-full">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Show:</label>
            <input type="number" min={1} max={100} value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(parseInt(e.target.value) || 10); setCurrentPage(1); }}
              className="w-16 text-sm text-center border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none py-1" />
          </div>
          <div className="relative w-full lg:w-auto">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input type="text" placeholder="Search contacts..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <TableToolbar
            title="Contacts"
            columns={ALL_COLS}
            visibleCols={visibleCols}
            onColsChange={setVisibleCols}
            getData={getData}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      {ALL_COLS.filter((c) => vis(c.key)).map((c) => (
                        <th key={c.key} className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">{c.label}</th>
                      ))}
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.length === 0 ? (
                      <tr>
                        <td colSpan={ALL_COLS.filter((c) => vis(c.key)).length + 1}
                          className="px-6 py-12 text-center text-sm text-gray-500">
                          No contacts found. Try adjusting your filters.
                        </td>
                      </tr>
                    ) : (
                      contacts.map((contact, idx) => (
                        <tr key={contact.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          {vis('sno') && <td className="px-6 py-4 text-sm text-gray-600">{(currentPage - 1) * rowsPerPage + idx + 1}</td>}
                          {vis('name') && <td className="px-6 py-4 text-sm font-medium text-gray-900">{contact.name}</td>}
                          {vis('email') && <td className="px-6 py-4 text-sm text-gray-600">{contact.email}</td>}
                          {vis('phone') && <td className="px-6 py-4 text-sm text-gray-600">{contact.phone}</td>}
                          {vis('subject') && <td className="px-6 py-4 text-sm text-gray-600">{contact.subject || '—'}</td>}
                          {vis('message') && <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{contact.message}</td>}
                          {vis('createdAt') && <td className="px-6 py-4 text-sm text-gray-600">{formatDate(contact.created_at)}</td>}
                          <td className="px-6 py-4">
                            <button onClick={() => router.push(`/contacts/${contact.id}`)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm">
                              <Eye size={16} /> View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition disabled:opacity-50">Previous</button>
                <span className="text-sm text-gray-600">Page {currentPage} of {totalPages} (Total: {totalContacts})</span>
                <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                  className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition disabled:opacity-50">Next</button>
              </div>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
