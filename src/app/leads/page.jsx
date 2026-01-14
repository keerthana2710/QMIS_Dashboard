'use client';

import React, { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Search, Filter, Download, Plus } from 'lucide-react';

export default function LeadsPage() {
  const [leads] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1234567890', source: 'Campaign', status: 'Qualified' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891', source: 'Referral', status: 'Interested' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '+1234567892', source: 'Campaign', status: 'Qualified' },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', phone: '+1234567893', source: 'Voucher', status: 'New' },
    { id: 5, name: 'Tom Brown', email: 'tom@example.com', phone: '+1234567894', source: 'Campaign', status: 'Qualified' },
  ]);

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

  return (
    <PageLayout title="Leads Management">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search leads..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Filter size={18} />
              <span className="hidden md:inline">Filter</span>
            </button>
            <button className="flex-1 md:flex-none flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Download size={18} />
              <span className="hidden md:inline">Export</span>
            </button>
            <button className="flex-1 md:flex-none flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition-colors">
              <Plus size={18} />
              <span className="hidden md:inline">Add Lead</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Source</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{lead.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.source}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-accent hover:text-red-700 font-semibold text-sm">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
