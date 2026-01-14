'use client';

import React from 'react';
import PageLayout from '@/components/PageLayout';
import { Briefcase, Award, ArrowRight } from 'lucide-react';

export default function CareerPage() {
  const careers = [
    {
      id: 1,
      title: 'Software Engineer',
      description: 'Build scalable applications and systems',
      skills: ['Programming', 'Problem Solving', 'System Design'],
      salary: '$80k - $120k',
    },
    {
      id: 2,
      title: 'Data Scientist',
      description: 'Analyze data and drive business insights',
      skills: ['Statistics', 'Python', 'ML', 'Data Visualization'],
      salary: '$90k - $130k',
    },
    {
      id: 3,
      title: 'Product Manager',
      description: 'Lead product strategy and development',
      skills: ['Leadership', 'Strategy', 'Analytics', 'Communication'],
      salary: '$100k - $150k',
    },
    {
      id: 4,
      title: 'UI/UX Designer',
      description: 'Create beautiful and usable interfaces',
      skills: ['Design', 'User Research', 'Prototyping', 'Figma'],
      salary: '$70k - $110k',
    },
  ];

  return (
    <PageLayout title="Career Guidance">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary to-blue-800 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-3">Discover Your Career Path</h2>
          <p className="text-blue-100">
            Explore various career options and find the right fit for your skills and interests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {careers.map((career) => (
            <div
              key={career.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-accent bg-opacity-20 rounded-lg">
                  <Briefcase className="text-accent" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{career.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{career.description}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Required Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {career.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="font-semibold text-primary dark:text-blue-400">{career.salary}</span>
                <button className="flex items-center gap-2 text-accent hover:text-red-700 transition-colors">
                  Learn More <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
