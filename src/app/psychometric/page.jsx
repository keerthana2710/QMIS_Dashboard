'use client';

import React, { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function PsychometricPage() {
  const [tests] = useState([
    { id: 1, name: 'IQ Assessment', category: 'Intelligence', date: '2024-01-15', students: 45 },
    { id: 2, name: 'Aptitude Test', category: 'Career', date: '2024-01-20', students: 32 },
    { id: 3, name: 'Personality Profile', category: 'Personality', date: '2024-02-01', students: 28 },
    { id: 4, name: 'Leadership Evaluation', category: 'Leadership', date: '2024-02-10', students: 18 },
  ]);

  return (
    <PageLayout title="Psychometric Tests">
      <div className="space-y-6">
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition-colors">
            <Plus size={20} />
            Add New Test
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tests.map((test) => (
            <div
              key={test.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{test.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{test.category}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900 hover:text-accent rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Date:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{test.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Students:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{test.students}</span>
                </div>
              </div>

              <button className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-800 transition-colors font-medium">
                View Results
              </button>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
