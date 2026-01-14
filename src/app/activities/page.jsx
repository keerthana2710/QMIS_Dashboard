'use client';

import React, { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Plus, Calendar, Users } from 'lucide-react';

export default function ActivitiesPage() {
  const [activities] = useState([
    { id: 1, name: 'Sports Tournament', date: '2024-02-20', participants: 150, category: 'Sports' },
    { id: 2, name: 'Science Exhibition', date: '2024-02-25', participants: 80, category: 'Academics' },
    { id: 3, name: 'Cultural Festival', date: '2024-03-05', participants: 300, category: 'Cultural' },
    { id: 4, name: 'Coding Hackathon', date: '2024-03-12', participants: 120, category: 'Tech' },
    { id: 5, name: 'Debate Competition', date: '2024-02-28', participants: 60, category: 'Academics' },
    { id: 6, name: 'Music Concert', date: '2024-03-20', participants: 200, category: 'Cultural' },
  ]);

  const getCategoryColor = (category) => {
    const colors = {
      Sports: 'from-green-500 to-green-600',
      Academics: 'from-blue-500 to-blue-600',
      Cultural: 'from-purple-500 to-purple-600',
      Tech: 'from-primary to-blue-700',
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  return (
    <PageLayout title="School Activities">
      <div className="space-y-6">
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition-colors">
            <Plus size={20} />
            Add Activity
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`bg-gradient-to-br ${getCategoryColor(
                activity.category
              )} rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow`}
            >
              <h3 className="text-lg font-bold mb-2">{activity.name}</h3>
              <p className="text-sm opacity-90 mb-4">{activity.category}</p>

              <div className="space-y-3 mb-4 pb-4 border-b border-white border-opacity-20">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={18} />
                  {activity.date}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users size={18} />
                  {activity.participants} participants
                </div>
              </div>

              <button className="w-full px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors font-medium text-sm">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
