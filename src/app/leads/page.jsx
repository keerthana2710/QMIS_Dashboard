'use client';

'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import TableToolbar from '@/components/TableToolbar';
import { Search, Plus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const ALL_COLS = [
  { key: 'sno', label: 'Sno' },
  { key: 'applicationNo', label: 'Application No' },
  { key: 'createdAt', label: 'Created At' },
  { key: 'stage', label: 'Stage' },
  { key: 'noOfChildren', label: 'No of Children' },
  { key: 'campaign', label: 'Campaign' },
  { key: 'source', label: 'Source' },
  { key: 'subSource', label: 'Sub Source' },
  { key: 'fatherName', label: 'Father Name' },
  { key: 'fatherEmail', label: 'Father Email' },
  { key: 'fatherPhone', label: 'Father Phone' },
  { key: 'motherName', label: 'Mother Name' },
  { key: 'motherEmail', label: 'Mother Email' },
  { key: 'motherPhone', label: 'Mother Phone' },
  { key: 'guardianName', label: 'Guardian Name' },
  { key: 'guardianPhone', label: 'Guardian Phone' },
  { key: 'guardianRelationship', label: 'Guardian Relationship' },
  { key: 'guardianEmail', label: 'Guardian Email' },
  { key: 'project', label: 'Project' },
  { key: 'addedBy', label: 'Added By' },
  { key: 'whatsappNo', label: 'Whatsapp No' },
  { key: 'status', label: 'Status' },
];

export default function LeadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleCols, setVisibleCols] = useState(ALL_COLS.map((c) => c.key));

  const EMPTY_FILTERS = {
    startDate: '', endDate: '', campaign: '', intakeYear: '',
    project: '', grade: '', addedBy: '', status: '', source: '',
  };

  // Pre-populate filters from URL params (e.g. navigated from Dashboard)
  const [filters, setFilters] = useState(() => ({
    ...EMPTY_FILTERS,
    campaign: searchParams.get('campaign') || '',
    status: searchParams.get('status') || '',
    grade: searchParams.get('grade') || '',
  }));
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalChildCount, setTotalChildCount] = useState(0);

  const getStatusColor = (status) => {
    const map = {
      Admitted: 'bg-green-100 text-green-800',
      'Application Purchased': 'bg-blue-100 text-blue-800',
      Enquiry: 'bg-yellow-100 text-yellow-800',
      'Interview Scheduled': 'bg-indigo-100 text-indigo-800',
      'Interview Conducted': 'bg-purple-100 text-purple-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
      });
      Object.entries(filters).forEach(([k, v]) => v && params.append(k, v));
      if (searchQuery) params.append('search', searchQuery);

      const response = await api.get(`/api/leads?${params}`);
      if (response.data.success) {
        const transformed = response.data.leads.map((lead) => ({
          id: lead.id,
          applicationNo: lead.application_no || '',
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
          guardianName: lead.guardian_name || '',
          guardianPhone: lead.guardian_phone || '',
          guardianRelationship: lead.guardian_relationship || '',
          guardianEmail: lead.guardian_email || '',
          project: lead.project || '',
          addedBy: lead.added_by || '',
          whatsappNo: lead.whatsapp_no || lead.father_phone || '',
          status: lead.status || 'New',
        }));
        setLeads(transformed);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalLeads(response.data.pagination?.total || 0);
        setTotalChildCount(
          response.data.leads.reduce((t, l) => t + (l.children?.length || 0), 0)
        );
      } else {
        toast.error('Failed to fetch leads');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, val) => setFilters((f) => ({ ...f, [key]: val }));
  const applyFilters = () => { setCurrentPage(1); setFetchTrigger((t) => t + 1); };
  const clearFilters = () => { setFilters(EMPTY_FILTERS); setSearchQuery(''); setCurrentPage(1); setFetchTrigger((t) => t + 1); };
  const handleSearch = (e) => { if (e.key === 'Enter') { setCurrentPage(1); setFetchTrigger((t) => t + 1); } };
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  useEffect(() => { fetchLeads(); }, [currentPage, rowsPerPage]); // eslint-disable-line
  useEffect(() => { if (fetchTrigger > 0) fetchLeads(); }, [fetchTrigger]); // eslint-disable-line

  const getData = () =>
    leads.map((lead, idx) => ({
      ...lead,
      sno: (currentPage - 1) * rowsPerPage + idx + 1,
    }));

  const vis = (key) => visibleCols.includes(key);

  return (
    <PageLayout title="Leads Management">
      {/* Filters */}
      <div className="w-full bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Leads by Source</h2>
          <button onClick={() => router.push('/searchlead')}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition-colors font-medium" disabled={loading}>
            <Plus size={18} />
            {loading ? 'Loading...' : 'Add Lead'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="date" value={filters.startDate} max={filters.endDate || getTodayDate()}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input type="date" value={filters.endDate} min={filters.startDate} max={getTodayDate()}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign</label>
            <select value={filters.campaign} onChange={(e) => handleFilterChange('campaign', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
              <option value="">All Campaigns</option>
              <option>Sanjay</option><option>QMIS</option>
              <option>Vijayadhasami 2026</option><option>2026-2027 Admissions</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Intake Year</label>
            <select value={filters.intakeYear} onChange={(e) => handleFilterChange('intakeYear', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
              <option value="">Intake Year</option><option>2026-2027</option><option>2025-2026</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
            <select value={filters.project} onChange={(e) => handleFilterChange('project', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
              <option value="">Project</option>
              <option>Vijayadhasami 2026</option><option>2026-2027 Admissions</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Grade</label>
            <select value={filters.grade} onChange={(e) => handleFilterChange('grade', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
              <option value="">All Grade</option>
              {['Pre KG','KG 1','KG 2','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5',
                'Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Added By</label>
            <select value={filters.addedBy} onChange={(e) => handleFilterChange('addedBy', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
              <option value="">All</option>
              {['PRM','Gayathri','Fathima','Akhila','Paulin Sharmila'].map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
              <option value="">All</option>
              {['Enquiry','Application Purchased','Interview Scheduled','Interview Conducted','Admitted'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select value={filters.source} onChange={(e) => handleFilterChange('source', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
              <option value="">All</option>
              {['Campaign','Referral','Voucher','Walk-in'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Count</label>
            <input type="text" value={totalLeads} disabled className="w-full rounded border border-gray-200 bg-gray-100 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Child Count</label>
            <input type="text" value={totalChildCount} disabled className="w-full rounded border border-gray-200 bg-gray-100 px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={clearFilters} disabled={loading}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            Clear Filters
          </button>
          <button onClick={applyFilters} disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            {loading ? 'Applying...' : 'Apply Filters'}
          </button>
        </div>
      </div>

      {/* Table section */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 w-full">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Show:</label>
            <input type="number" min={1} max={100} value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(parseInt(e.target.value) || 10); setCurrentPage(1); }}
              className="w-16 text-sm text-center border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary py-1" />
          </div>
          <div className="relative w-full lg:w-auto">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input type="text" placeholder="Search leads..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <TableToolbar
            title="Leads"
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
                        <th key={c.key} className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {c.label}
                        </th>
                      ))}
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan={ALL_COLS.filter((c) => vis(c.key)).length + 1}
                          className="px-6 py-10 text-center text-sm text-gray-400">No leads found.</td>
                      </tr>
                    ) : (
                      leads.map((lead, idx) => (
                        <tr key={lead.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          {vis('sno') && <td className="px-6 py-4 text-sm text-gray-600">{(currentPage - 1) * rowsPerPage + idx + 1}</td>}
                          {vis('applicationNo') && <td className="px-6 py-4 text-sm font-medium text-gray-900">{lead.applicationNo}</td>}
                          {vis('createdAt') && <td className="px-6 py-4 text-sm text-gray-600">{lead.createdAt}</td>}
                          {vis('stage') && <td className="px-6 py-4 text-sm text-gray-600">{lead.stage || '—'}</td>}
                          {vis('noOfChildren') && <td className="px-6 py-4 text-sm text-gray-600">{lead.noOfChildren}</td>}
                          {vis('campaign') && <td className="px-6 py-4 text-sm text-gray-600">{lead.campaign || '—'}</td>}
                          {vis('source') && <td className="px-6 py-4 text-sm text-gray-600">{lead.source || '—'}</td>}
                          {vis('subSource') && <td className="px-6 py-4 text-sm text-gray-600">{lead.subSource || '—'}</td>}
                          {vis('fatherName') && <td className="px-6 py-4 text-sm text-gray-600">{lead.fatherName || '—'}</td>}
                          {vis('fatherEmail') && <td className="px-6 py-4 text-sm text-gray-600">{lead.fatherEmail || '—'}</td>}
                          {vis('fatherPhone') && <td className="px-6 py-4 text-sm text-gray-600">{lead.fatherPhone || '—'}</td>}
                          {vis('motherName') && <td className="px-6 py-4 text-sm text-gray-600">{lead.motherName || '—'}</td>}
                          {vis('motherEmail') && <td className="px-6 py-4 text-sm text-gray-600">{lead.motherEmail || '—'}</td>}
                          {vis('motherPhone') && <td className="px-6 py-4 text-sm text-gray-600">{lead.motherPhone || '—'}</td>}
                          {vis('guardianName') && <td className="px-6 py-4 text-sm text-gray-600">{lead.guardianName || '—'}</td>}
                          {vis('guardianPhone') && <td className="px-6 py-4 text-sm text-gray-600">{lead.guardianPhone || '—'}</td>}
                          {vis('guardianRelationship') && <td className="px-6 py-4 text-sm text-gray-600">{lead.guardianRelationship || '—'}</td>}
                          {vis('guardianEmail') && <td className="px-6 py-4 text-sm text-gray-600">{lead.guardianEmail || '—'}</td>}
                          {vis('project') && <td className="px-6 py-4 text-sm text-gray-600">{lead.project || '—'}</td>}
                          {vis('addedBy') && <td className="px-6 py-4 text-sm text-gray-600">{lead.addedBy || '—'}</td>}
                          {vis('whatsappNo') && <td className="px-6 py-4 text-sm text-gray-600">{lead.whatsappNo || '—'}</td>}
                          {vis('status') && (
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                                {lead.status}
                              </span>
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <button onClick={() => router.push(`/leads/${lead.id}`)}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-sm">View</button>
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
                <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
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
