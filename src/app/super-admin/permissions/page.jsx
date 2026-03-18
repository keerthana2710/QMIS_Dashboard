'use client';

import { useState, useEffect, useCallback } from 'react';
import PageLayout from '@/components/PageLayout';
import { PAGES, ROLES, SUPER_ADMIN_ROLE } from '@/config/pages';
import { ShieldCheck, Save, RefreshCw, CheckSquare, Square, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

/**
 * Super Admin Permissions Panel
 * Route: /super-admin/permissions
 * Access: SUPER_ADMIN only (enforced server-side in API + client-side redirect)
 */
export default function PermissionsPage() {
  const router = useRouter();

  // Check SUPER_ADMIN on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) { router.replace('/login'); return; }
    const user = JSON.parse(userStr);
    if (user?.role !== SUPER_ADMIN_ROLE) {
      toast.error('Access denied. Super Admin only.');
      router.replace('/dashboard');
    }
  }, [router]);

  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [permMatrix, setPermMatrix]     = useState({}); // { [page]: { can_read, can_write, can_delete } }
  const [loading, setLoading]           = useState(false);
  const [saving, setSaving]             = useState(false);
  const [dirty, setDirty]               = useState(false);

  // Load permissions for the selected role
  const loadPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await api.get(`/api/permissions/${selectedRole}`);
      const rows = res.data.permissions ?? [];

      // Build matrix — default all pages to false if not found in DB
      const matrix = {};
      PAGES.forEach((pg) => {
        const row = rows.find((r) => r.page === pg.key) ?? {};
        matrix[pg.key] = {
          can_read:   row.can_read   ?? false,
          can_write:  row.can_write  ?? false,
          can_delete: row.can_delete ?? false,
        };
      });
      setPermMatrix(matrix);
      setDirty(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  }, [selectedRole]);

  useEffect(() => { loadPermissions(); }, [loadPermissions]);

  // Toggle a single checkbox
  const toggle = (pageKey, field) => {
    setPermMatrix((prev) => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        [field]: !prev[pageKey]?.[field],
      },
    }));
    setDirty(true);
  };

  // Toggle "Full Access" for a page (all three perms)
  const toggleFullAccess = (pageKey) => {
    const current = permMatrix[pageKey] ?? {};
    const allOn = current.can_read && current.can_write && current.can_delete;
    setPermMatrix((prev) => ({
      ...prev,
      [pageKey]: { can_read: !allOn, can_write: !allOn, can_delete: !allOn },
    }));
    setDirty(true);
  };

  // Select/deselect an entire column
  const toggleColumn = (field) => {
    const allOn = PAGES.every((pg) => permMatrix[pg.key]?.[field]);
    const updated = { ...permMatrix };
    PAGES.forEach((pg) => {
      updated[pg.key] = { ...updated[pg.key], [field]: !allOn };
    });
    setPermMatrix(updated);
    setDirty(true);
  };

  // Save all permissions for the selected role
  const handleSave = async () => {
    setSaving(true);
    try {
      const permissions = PAGES.map((pg) => ({
        page:       pg.key,
        can_read:   permMatrix[pg.key]?.can_read   ?? false,
        can_write:  permMatrix[pg.key]?.can_write  ?? false,
        can_delete: permMatrix[pg.key]?.can_delete ?? false,
      }));

      await api.put(`/api/permissions/${selectedRole}`, { permissions });


      toast.success(`Permissions saved for "${selectedRole}"`);
      setDirty(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const allReadOn    = PAGES.every((pg) => permMatrix[pg.key]?.can_read);
  const allWriteOn   = PAGES.every((pg) => permMatrix[pg.key]?.can_write);
  const allDeleteOn  = PAGES.every((pg) => permMatrix[pg.key]?.can_delete);

  return (
    <PageLayout title="Permissions Manager" page="super-admin">
      <div className="max-w-5xl mx-auto">
        {/* Header card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Role Permissions</h2>
              <p className="text-sm text-gray-500">
                Control what each role can see and do
              </p>
            </div>
          </div>

          {/* Role selector */}
          <div className="sm:ml-auto flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Editing role:
            </label>
            <select
              value={selectedRole}
              onChange={(e) => { setSelectedRole(e.target.value); setDirty(false); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <button
              onClick={loadPermissions}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* SUPER_ADMIN info banner */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 text-sm text-indigo-800">
          <strong>SUPER_ADMIN</strong> always has full access to everything and cannot be restricted.
          Use the table below to configure permissions for other roles.
        </div>

        {/* Permissions table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="animate-spin h-8 w-8 text-indigo-500" />
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">
                      Page / Module
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col items-center gap-1">
                        <span>READ</span>
                        <button
                          onClick={() => toggleColumn('can_read')}
                          className="text-gray-400 hover:text-indigo-600"
                          title={allReadOn ? 'Deselect all' : 'Select all'}
                        >
                          {allReadOn ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col items-center gap-1">
                        <span>WRITE</span>
                        <button
                          onClick={() => toggleColumn('can_write')}
                          className="text-gray-400 hover:text-indigo-600"
                          title={allWriteOn ? 'Deselect all' : 'Select all'}
                        >
                          {allWriteOn ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col items-center gap-1">
                        <span>DELETE</span>
                        <button
                          onClick={() => toggleColumn('can_delete')}
                          className="text-gray-400 hover:text-indigo-600"
                          title={allDeleteOn ? 'Deselect all' : 'Select all'}
                        >
                          {allDeleteOn ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      FULL ACCESS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {PAGES.map((pg) => {
                    const p      = permMatrix[pg.key] ?? {};
                    const fullOn = p.can_read && p.can_write && p.can_delete;

                    return (
                      <tr key={pg.key} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{pg.label}</div>
                          <div className="text-xs text-gray-400">{pg.path}</div>
                        </td>

                        {/* READ */}
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={p.can_read ?? false}
                            onChange={() => toggle(pg.key, 'can_read')}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>

                        {/* WRITE */}
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={p.can_write ?? false}
                            onChange={() => toggle(pg.key, 'can_write')}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>

                        {/* DELETE */}
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={p.can_delete ?? false}
                            onChange={() => toggle(pg.key, 'can_delete')}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>

                        {/* FULL ACCESS toggle */}
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => toggleFullAccess(pg.key)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              fullOn
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {fullOn ? <CheckSquare size={12} /> : <Square size={12} />}
                            {fullOn ? 'Full' : 'None'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Footer bar */}
              <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {dirty ? (
                    <span className="text-amber-600 font-medium">Unsaved changes</span>
                  ) : (
                    'All changes saved'
                  )}
                </p>
                <button
                  onClick={handleSave}
                  disabled={saving || !dirty}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                >
                  {saving ? (
                    <><Loader size={16} className="animate-spin" /> Saving…</>
                  ) : (
                    <><Save size={16} /> Save Permissions</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
