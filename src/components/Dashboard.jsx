'use client';

import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, FileText, BarChart3 } from 'lucide-react';

const leadsData = [
  { month: 'Jan', leads: 400, conversion: 240 },
  { month: 'Feb', leads: 500, conversion: 300 },
  { month: 'Mar', leads: 450, conversion: 280 },
  { month: 'Apr', leads: 600, conversion: 350 },
  { month: 'May', leads: 750, conversion: 420 },
  { month: 'Jun', leads: 850, conversion: 500 },
];

const stageData = [
  { stage: 'No. of Enquiries', count: 11 },
  { stage: 'Qualified', count: 22 },
  { stage: 'Application Purchased', count: 33 },
  { stage: 'Interview Conducted', count: 44 },
  { stage: 'Interview Scheduled', count: 55 },
  { stage: 'Admitted', count: 66 },
  { stage: 'Withdrawn', count: 77 },
];

export default function Dashboard() {
  const stats = [
    { label: 'Total Leads', value: '2,345', icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Active Events', value: '12', icon: FileText, color: 'from-accent to-red-700' },
    { label: 'Volunteers', value: '456', icon: Users, color: 'from-green-500 to-green-600' },
    { label: 'Analytics', value: '89%', icon: BarChart3, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`bg-gradient-to-br ${stat.color} rounded-xl shadow-lg p-6 text-white`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon size={32} className="opacity-50" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={24} className="text-primary" />
            Leads by Source
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={leadsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="#0A0F3D"
                strokeWidth={2}
                dot={{ fill: '#0A0F3D', r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="conversion"
                stroke="#af2025"
                strokeWidth={2}
                dot={{ fill: '#af2025', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Number of Leads</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stageData.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="count" fill="#0A0F3D" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-primary dark:bg-gray-900 px-6 py-4 text-white">
            <h2 className="text-lg font-bold">Sanjay Campaign Leads</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Count</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Action</th>
                </tr>
              </thead>
              <tbody>
                {stageData.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">{item.stage}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">{item.count}</td>
                    <td className="px-6 py-3">
                      <button className="px-3 py-1 bg-accent text-white text-xs font-bold rounded hover:bg-red-700 transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-primary dark:bg-gray-900 px-6 py-4 text-white">
            <h2 className="text-lg font-bold">QMIS Campaign Leads</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Count</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Action</th>
                </tr>
              </thead>
              <tbody>
                {stageData.slice(0, 5).map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">{item.stage}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">{item.count}</td>
                    <td className="px-6 py-3">
                      <button className="px-3 py-1 bg-accent text-white text-xs font-bold rounded hover:bg-red-700 transition-colors">
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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-primary dark:bg-gray-900 px-6 py-4 text-white">
          <h2 className="text-lg font-bold">Based On Student Count</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Child Count</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Action</th>
              </tr>
            </thead>
            <tbody>
              {['Pre KG', 'Pre KD', 'KG 1', 'KG 2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'].map((grade, idx) => (
                <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">{grade}</td>
                  <td className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">{Math.floor(Math.random() * 100)}</td>
                  <td className="px-6 py-3">
                    <button className="px-3 py-1 bg-accent text-white text-xs font-bold rounded hover:bg-red-700 transition-colors">
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
  );
}
