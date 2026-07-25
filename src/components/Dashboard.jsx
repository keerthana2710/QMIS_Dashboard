'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, FileText, BarChart3, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import TableToolbar from '@/components/TableToolbar';
import { exportCSV, openPrintWindow } from '@/lib/tableExport';
import toast from 'react-hot-toast';

// ── Column definitions for campaign & grade tables ─────────────────────────────
const CAMPAIGN_COLS = [
  { key: 'stage', label: 'Stage' },
  { key: 'count', label: 'Count' },
];

const GRADE_COLS = [
  { key: 'grade', label: 'Grade' },
  { key: 'count', label: 'Child Count' },
];

// ── Campaign table ─────────────────────────────────────────────────────────────
function CampaignTable({ name, statuses }) {
  const router = useRouter();
  const [visibleCols, setVisibleCols] = useState(CAMPAIGN_COLS.map((c) => c.key));
  const getData = () => statuses.map((r) => ({ stage: r.stage, count: r.count }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-primary dark:bg-gray-900 px-6 py-4 text-white">
        <h2 className="text-lg font-bold">{name} — Leads</h2>
      </div>
      <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <TableToolbar
          title={`${name} Leads`}
          columns={CAMPAIGN_COLS}
          visibleCols={visibleCols}
          onColsChange={setVisibleCols}
          getData={getData}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              {CAMPAIGN_COLS.filter((c) => visibleCols.includes(c.key)).map((c) => (
                <th key={c.key} className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                  {c.label}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Action</th>
            </tr>
          </thead>
          <tbody>
            {statuses.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                {visibleCols.includes('stage') && (
                  <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">{item.stage}</td>
                )}
                {visibleCols.includes('count') && (
                  <td className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">{item.count}</td>
                )}
                <td className="px-6 py-3">
                  <button
                    onClick={() => {
                      const params = new URLSearchParams({ campaign: name, status: item.stage });
                      router.push(`/leads?${params}`);
                    }}
                    className="px-3 py-1 bg-accent text-white text-xs font-bold rounded hover:bg-red-700 transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const EMPTY_FILTERS = {
    startDate: '', endDate: '', campaign: '', intakeYear: '', project: '', grade: '',
  };
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [gradeVisibleCols, setGradeVisibleCols] = useState(GRADE_COLS.map((c) => c.key));

  const fetchData = useCallback(async (f = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.startDate) params.set('startDate', f.startDate);
      if (f.endDate) params.set('endDate', f.endDate);
      if (f.campaign) params.set('campaign', f.campaign);
      if (f.project) params.set('project', f.project);
      if (f.intakeYear) params.set('intakeYear', f.intakeYear);
      if (f.grade) params.set('grade', f.grade);

      const res = await api.get(`/api/dashboard?${params}`);
      if (res.data.success) setData(res.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { fetchData(EMPTY_FILTERS); }, []); // eslint-disable-line

  const handleFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));
  const applyFilters = () => fetchData(filters);
  const clearFilters = () => { setFilters(EMPTY_FILTERS); fetchData(EMPTY_FILTERS); };

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  // ── Export all leads (Excel / PDF) ──────────────────────────────────────────
  const handleExportExcel = () => {
    if (!data) return;
    const cols = [{ key: 'stage', label: 'Status' }, { key: 'count', label: 'Count' }];
    exportCSV('Dashboard - Leads by Status', cols, data.statusCounts);
    toast.success('CSV download started');
  };
  const handleExportPDF = () => {
    if (!data) return;
    const cols = [{ key: 'stage', label: 'Status' }, { key: 'count', label: 'Count' }];
    openPrintWindow('Dashboard — Leads by Status', cols, data.statusCounts);
  };

  const stats = data
    ? [
        { label: 'Total Leads', value: data.stats.totalLeads.toLocaleString(), icon: Users, color: 'from-blue-500 to-blue-600' },
        { label: 'Admitted', value: data.stats.admitted.toLocaleString(), icon: CheckCircle, color: 'from-green-500 to-green-600' },
        { label: 'Tests Completed', value: data.stats.testsCompleted.toLocaleString(), icon: FileText, color: 'from-accent to-red-700' },
        { label: 'Contacts', value: data.stats.contacts.toLocaleString(), icon: BarChart3, color: 'from-purple-500 to-purple-600' },
      ]
    : [
        { label: 'Total Leads', value: '—', icon: Users, color: 'from-blue-500 to-blue-600' },
        { label: 'Admitted', value: '—', icon: CheckCircle, color: 'from-green-500 to-green-600' },
        { label: 'Tests Completed', value: '—', icon: FileText, color: 'from-accent to-red-700' },
        { label: 'Contacts', value: '—', icon: BarChart3, color: 'from-purple-500 to-purple-600' },
      ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      </div>

      {/* ── Filters ── */}
      <div className="w-full bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Leads by Source</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="date" value={filters.startDate} max={filters.endDate || getTodayDate()}
              onChange={(e) => handleFilter('startDate', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input type="date" value={filters.endDate} min={filters.startDate} max={getTodayDate()}
              onChange={(e) => handleFilter('endDate', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign</label>
            <select value={filters.campaign} onChange={(e) => handleFilter('campaign', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
              <option value="">All Campaigns</option>
              <option>Sanjay</option><option>QMIS</option>
              <option>Vijayadhasami 2026</option><option>2026-2027 Admissions</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Intake Year</label>
            <select value={filters.intakeYear} onChange={(e) => handleFilter('intakeYear', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
              <option value="">Intake Year</option>
              <option>2026-2027</option><option>2025-2026</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
            <select value={filters.project} onChange={(e) => handleFilter('project', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
              <option value="">Project</option>
              <option>Vijayadhasami 2026</option><option>2026-2027 Admissions</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Grade</label>
            <select value={filters.grade} onChange={(e) => handleFilter('grade', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
              <option value="">All Grade</option>
              {['Pre KG','KG 1','KG 2','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5',
                'Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Count</label>
            <input type="text" value={data ? data.totalCount : '—'} disabled
              className="w-full rounded border border-gray-200 bg-gray-100 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Child Count</label>
            <input type="text" value={data ? data.childCount : '—'} disabled
              className="w-full rounded border border-gray-200 bg-gray-100 px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <button onClick={handleExportExcel} disabled={loading || !data}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded">
            Export to Excel
          </button>
          <button onClick={handleExportPDF} disabled={loading || !data}
            className="bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded">
            Export to PDF
          </button>
          <button onClick={clearFilters} disabled={loading}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium px-5 py-2 rounded">
            Clear
          </button>
          <button onClick={applyFilters} disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded">
            {loading ? 'Loading...' : 'Apply Filters'}
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`bg-gradient-to-br ${stat.color} rounded-xl shadow-lg p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">
                    {loading ? <span className="opacity-60 text-xl">Loading…</span> : stat.value}
                  </p>
                </div>
                <Icon size={32} className="opacity-50" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={24} className="text-primary" />
            Monthly Leads
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.monthlyData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Legend />
              <Line type="monotone" dataKey="leads" stroke="#0A0F3D" strokeWidth={2} dot={{ fill: '#0A0F3D', r: 5 }} />
              <Line type="monotone" dataKey="admitted" stroke="#af2025" strokeWidth={2} dot={{ fill: '#af2025', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Leads by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.statusCounts || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="stage" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="count" fill="#0A0F3D" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Campaign Tables ── */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(data?.campaigns || []).slice(0, 2).map((c) => (
              <CampaignTable key={c.name} name={c.name} statuses={c.statuses} />
            ))}
          </div>
          {(data?.campaigns || []).length > 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(data?.campaigns || []).slice(2).map((c) => (
                <CampaignTable key={c.name} name={c.name} statuses={c.statuses} />
              ))}
            </div>
          )}

          {/* ── Grade / Student Count Table ── */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-primary dark:bg-gray-900 px-6 py-4 text-white">
              <h2 className="text-lg font-bold">Based On Student Count</h2>
            </div>
            <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <TableToolbar
                title="Student Count by Grade"
                columns={GRADE_COLS}
                visibleCols={gradeVisibleCols}
                onColsChange={setGradeVisibleCols}
                getData={() => data?.gradeCounts || []}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    {GRADE_COLS.filter((c) => gradeVisibleCols.includes(c.key)).map((c) => (
                      <th key={c.key} className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                        {c.label}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.gradeCounts || []).length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-400">No grade data found.</td>
                    </tr>
                  ) : (
                    (data?.gradeCounts || []).map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        {gradeVisibleCols.includes('grade') && (
                          <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">{item.grade}</td>
                        )}
                        {gradeVisibleCols.includes('count') && (
                          <td className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">{item.count}</td>
                        )}
                        <td className="px-6 py-3">
                          <button
                            onClick={() => router.push(`/leads?grade=${encodeURIComponent(item.grade)}`)}
                            className="px-3 py-1 bg-accent text-white text-xs font-bold rounded hover:bg-red-700 transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
