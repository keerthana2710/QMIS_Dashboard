'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import TableToolbar from '@/components/TableToolbar';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';

const PSY_COLS = [
  { key: 'sno', label: 'Sno' },
  { key: 'application_no', label: 'Application No' },
  { key: 'grade', label: 'Grade' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'whatsapp_no', label: 'Whatsapp No' },
  { key: 'stage', label: 'Stage' },
  { key: 'test_conducted', label: 'Test Conducted' },
  { key: 'counselor_name', label: 'Counselor Name' },
];

// Get-or-create the psychometric test record, then navigate to the stepper
async function getOrCreateAndNavigate(row, router, setNavigatingId) {
  setNavigatingId(row.lead_id + (row.child_id || ''));
  try {
    // If test_id already exists, navigate directly
    if (row.test_id) {
      router.push(`/psychometric/${row.test_id}`);
      return;
    }
    // Otherwise create the record first
    const res = await api.post('/api/psychometric', {
      lead_id: row.lead_id,
      child_id: row.child_id || null,
      application_no: row.application_no,
      grade: row.grade || null,
      name: row.name,
      email: row.email || null,
      whatsapp_no: row.whatsapp_no || null,
    });
    if (res.data.success && res.data.test?.id) {
      router.push(`/psychometric/${res.data.test.id}`);
    } else {
      toast.error('Could not create test record');
    }
  } catch (err) {
    toast.error(err.response?.data?.error || 'Failed to open test');
  } finally {
    setNavigatingId(null);
  }
}

export default function PsychometricPage() {
  const { canDelete } = usePermission('psychometric');
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [navigatingId, setNavigatingId] = useState(null);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, test: null });
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick  = (test) => setDeleteDialog({ open: true, test });
  const handleDeleteCancel = () => setDeleteDialog({ open: false, test: null });
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.test) return;
    setDeleting(true);
    try {
      await api.delete(`/api/psychometric/${deleteDialog.test.test_id}`);
      toast.success('Psychometric test deleted successfully');
      setDeleteDialog({ open: false, test: null });
      fetchTests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete test');
    } finally {
      setDeleting(false);
    }
  };
  const [visibleCols, setVisibleCols] = useState(PSY_COLS.map((c) => c.key));

  // Filters
  const EMPTY_FILTERS = { startDate: '', endDate: '', grade: '', testConducted: '' };
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchTests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
      });
      if (filters.grade) params.append('grade', filters.grade);
      if (filters.testConducted) params.append('testConducted', filters.testConducted);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await api.get(`/api/psychometric?${params.toString()}`);
      if (res.data.success) {
        setTests(res.data.tests || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalCount(res.data.pagination?.total || 0);
      }
    } catch (err) {
      toast.error('Failed to fetch psychometric tests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTests(); }, [currentPage, rowsPerPage]);
  useEffect(() => { if (fetchTrigger > 0) fetchTests(); }, [fetchTrigger]);

  const applyFilters = () => { setCurrentPage(1); setFetchTrigger(t => t + 1); };
  const clearFilters = () => { setFilters(EMPTY_FILTERS); setCurrentPage(1); setFetchTrigger(t => t + 1); };

  const getData = () =>
    tests.map((t, idx) => ({
      sno: (currentPage - 1) * rowsPerPage + idx + 1,
      application_no: t.application_no || '—',
      grade: t.grade || '—',
      name: t.name || '—',
      email: t.email || '—',
      whatsapp_no: t.whatsapp_no || '—',
      stage: t.stage || '—',
      test_conducted: t.test_conducted ? 'Yes' : 'No',
      counselor_name: t.counselor_name || '—',
    }));

  const handleFilterChange = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  function getTestConductedBadge(conducted) {
    return conducted
      ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Yes</span>
      : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">No</span>;
  }

  function getStageBadge(stage) {
    const map = {
      'Test Pending': 'bg-yellow-100 text-yellow-800',
      'Test Conducted': 'bg-green-100 text-green-800',
      'Emotional Done': 'bg-blue-100 text-blue-800',
      'Cognitive Done': 'bg-indigo-100 text-indigo-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[stage] || 'bg-gray-100 text-gray-700'}`}>
        {stage || '—'}
      </span>
    );
  }

  return (
    <PageLayout title="Psychometric Tests" page="psychometric">
      <DeleteConfirmationDialog
        isOpen={deleteDialog.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Psychometric Test"
        message={`Are you sure you want to delete the test for "${deleteDialog.test?.name}"? All assessment data will be permanently removed.`}
      />
      <div className="space-y-6">

        {/* Filters Card */}
        <div className="w-full bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Psychometric Tests</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 xl:grid-cols-8 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" value={filters.startDate}
                onChange={e => handleFilterChange('startDate', e.target.value)}
                max={filters.endDate || getTodayDate()}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" value={filters.endDate}
                onChange={e => handleFilterChange('endDate', e.target.value)}
                min={filters.startDate} max={getTodayDate()}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Conducted</label>
              <select value={filters.testConducted}
                onChange={e => handleFilterChange('testConducted', e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
                <option value="">All</option>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Grade</label>
              <select value={filters.grade}
                onChange={e => handleFilterChange('grade', e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
                <option value="">All Grade</option>
                {['Pre KG','KG 1','KG 2','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5',
                  'Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Count</label>
              <input type="text" value={totalCount} disabled
                className="w-full rounded border border-gray-200 bg-gray-100 px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button onClick={clearFilters} disabled={loading}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
              Clear Filters
            </button>
            <button onClick={applyFilters} disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
              {loading ? 'Applying...' : 'Apply Filters'}
            </button>
          </div>
        </div>

        {/* Table Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 w-full">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Show:</label>
            <input type="number" min={1} max={100} value={rowsPerPage}
              onChange={e => { setRowsPerPage(parseInt(e.target.value) || 10); setCurrentPage(1); }}
              className="w-16 text-sm text-center border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary py-1" />
          </div>
          <TableToolbar
            title="Psychometric Tests"
            columns={PSY_COLS}
            visibleCols={visibleCols}
            onColsChange={setVisibleCols}
            getData={getData}
          />
        </div>

        {/* Table */}
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
                      {PSY_COLS.filter((c) => visibleCols.includes(c.key)).map((c) => (
                        <th key={c.key} className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {c.label}
                        </th>
                      ))}
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.length === 0 ? (
                      <tr>
                        <td colSpan={PSY_COLS.filter((c) => visibleCols.includes(c.key)).length + 1}
                          className="px-6 py-10 text-center text-sm text-gray-400">
                          No psychometric tests found.
                        </td>
                      </tr>
                    ) : (
                      tests.map((t, idx) => (
                        <tr key={t.test_id || idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          {visibleCols.includes('sno') && <td className="px-6 py-4 text-sm text-gray-600">{(currentPage - 1) * rowsPerPage + idx + 1}</td>}
                          {visibleCols.includes('application_no') && <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.application_no}</td>}
                          {visibleCols.includes('grade') && <td className="px-6 py-4 text-sm text-gray-600">{t.grade || '—'}</td>}
                          {visibleCols.includes('name') && <td className="px-6 py-4 text-sm text-gray-600">{t.name}</td>}
                          {visibleCols.includes('email') && <td className="px-6 py-4 text-sm text-gray-600">{t.email || '—'}</td>}
                          {visibleCols.includes('whatsapp_no') && <td className="px-6 py-4 text-sm text-gray-600">{t.whatsapp_no || '—'}</td>}
                          {visibleCols.includes('stage') && <td className="px-6 py-4 text-sm text-gray-600">{getStageBadge(t.stage)}</td>}
                          {visibleCols.includes('test_conducted') && <td className="px-6 py-4">{getTestConductedBadge(t.test_conducted)}</td>}
                          {visibleCols.includes('counselor_name') && <td className="px-6 py-4 text-sm text-gray-600">{t.counselor_name || '—'}</td>}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => getOrCreateAndNavigate(t, router, setNavigatingId)}
                                disabled={navigatingId === (t.lead_id + (t.child_id || ''))}
                                className="text-accent hover:text-red-700 font-semibold text-sm disabled:opacity-50"
                              >
                                {navigatingId === (t.lead_id + (t.child_id || '')) ? 'Opening...' : 'View'}
                              </button>
                              {canDelete && t.test_id && (
                                <button
                                  onClick={() => handleDeleteClick(t)}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                  title="Delete test"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className={`px-4 py-2 rounded bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition ${currentPage === 1 || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >Previous</button>
                <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                  className={`px-4 py-2 rounded bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition ${currentPage === totalPages || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >Next</button>
              </div>
            </>
          )}
        </div>

      </div>
    </PageLayout>
  );
}