'use client';

import React, { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { User, Mail, Phone, MapPin, Edit2, Save } from 'lucide-react';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@qmis.com',
    phone: '+1 (800) 123-4567',
    role: 'Administrator',
    location: 'Education City',
    department: 'Management',
  });

  const [editData, setEditData] = useState(profile);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfile(editData);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <PageLayout title="Profile">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h2>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                <Edit2 size={18} />
                Edit Profile
              </button>
            )}
          </div>

          <div className="mb-8 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
              AU
            </div>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleChange}
                className="block mx-auto mb-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ) : (
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
            )}
            <p className="text-gray-600 dark:text-gray-400">{profile.role}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Mail className="text-primary" size={24} />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-1 rounded border border-gray-200 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Phone className="text-accent" size={24} />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-1 rounded border border-gray-200 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile.phone}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <MapPin className="text-green-500" size={24} />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400">Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={editData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-1 rounded border border-gray-200 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile.location}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <User className="text-primary" size={24} />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400">Department</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="department"
                    value={editData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-1 rounded border border-gray-200 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile.department}</p>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
              >
                <Save size={20} />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditData(profile);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-bold"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
