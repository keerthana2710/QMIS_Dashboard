'use client';

import React from 'react';
import PageLayout from '@/components/PageLayout';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Eye, Share2 } from 'lucide-react';

const pageViewsData = [
  { date: 'Mon', views: 4000, users: 2400 },
  { date: 'Tue', views: 3000, users: 1398 },
  { date: 'Wed', views: 2000, users: 9800 },
  { date: 'Thu', views: 2780, users: 3908 },
  { date: 'Fri', views: 1890, users: 4800 },
  { date: 'Sat', views: 2390, users: 3800 },
  { date: 'Sun', views: 3490, users: 4300 },
];

const devicesData = [
  { name: 'Mobile', value: 45 },
  { name: 'Desktop', value: 35 },
  { name: 'Tablet', value: 20 },
];

const COLORS = ['#0A0F3D', '#af2025', '#3b82f6'];

export default function AnalyticsPage() {
  const stats = [
    { label: 'Page Views', value: '28,546', icon: Eye, color: 'from-blue-500 to-blue-600' },
    { label: 'Users', value: '12,234', icon: Users, color: 'from-primary to-blue-600' },
    { label: 'Bounce Rate', value: '32.5%', icon: TrendingUp, color: 'from-accent to-red-700' },
    { label: 'Avg. Duration', value: '3m 24s', icon: Share2, color: 'from-green-500 to-green-600' },
  ];

  return (
    <PageLayout title="Google Analytics">
      <div className="space-y-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Page Views & Users</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={pageViewsData}>
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
                  dataKey="views"
                  stroke="#0A0F3D"
                  strokeWidth={2}
                  dot={{ fill: '#0A0F3D', r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#af2025"
                  strokeWidth={2}
                  dot={{ fill: '#af2025', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Device Usage</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={devicesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {devicesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Traffic Sources</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pageViewsData}>
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
              <Bar dataKey="views" fill="#0A0F3D" radius={[8, 8, 0, 0]} />
              <Bar dataKey="users" fill="#af2025" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PageLayout>
  );
}
