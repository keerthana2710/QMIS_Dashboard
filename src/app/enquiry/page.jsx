'use client';

import React, { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function EnquiryPage() {
  const [enquiries] = useState([
    { id: 1, name: 'Parent One', subject: 'Admission Query', date: '2024-01-25', status: 'Resolved' },
    { id: 2, name: 'Parent Two', subject: 'Fee Structure', date: '2024-01-24', status: 'Pending' },
    { id: 3, name: 'Parent Three', subject: 'Scholarship Info', date: '2024-01-23', status: 'In Progress' },
    { id: 4, name: 'Parent Four', subject: 'Admission Timeline', date: '2024-01-22', status: 'Resolved' },
    { id: 5, name: 'Parent Five', subject: 'Placements', date: '2024-01-21', status: 'Pending' },
  ]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'In Progress':
        return <Clock className="text-blue-500" size={20} />;
      case 'Pending':
        return <AlertCircle className="text-yellow-500" size={20} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageLayout title="Enquiries">
      <div className="space-y-6">
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition-colors">
            <Plus size={20} />
            New Enquiry
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Subject</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Action</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{enquiry.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{enquiry.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{enquiry.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(enquiry.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(enquiry.status)}`}>
                          {enquiry.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-primary hover:text-blue-700 font-semibold text-sm">
                        View
                      </button>
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
