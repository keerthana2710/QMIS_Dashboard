'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import PageLayout from '@/components/PageLayout';
import { Mail, Edit2, Save, User, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    id: '',
    username: '',
    email: '',
    role: '',
  });

  const [editData, setEditData] = useState({
    username: '',
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setProfile(parsedUser);
        setEditData({ username: parsedUser.username });
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      toast.error('Failed to load profile data');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    const trimmedUsername = editData.username.trim();

    if (!trimmedUsername) {
      toast.error('Username cannot be empty');
      return;
    }

    if (trimmedUsername.length < 3) {
      toast.error('Username must be at least 3 characters long');
      return;
    }

    if (trimmedUsername === profile.username) {
      setIsEditing(false);
      toast('No changes made', { icon: 'ℹ️' });
      return;
    }

    setIsLoading(true);

    const loadingToast = toast.loading('Updating username...');

    try {
      const response = await api.put('/api/profile', {
        username: trimmedUsername
      });

      const result = response.data;

      setProfile(result.user);

      localStorage.setItem('user', JSON.stringify(result.user));

      if (result.token) {
        localStorage.setItem('authToken', result.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${result.token}`;
      }

      toast.dismiss(loadingToast);
      toast.success(result.message || 'Username updated successfully!');

      setIsEditing(false);

    } catch (error) {
      console.error('Error updating username:', error);

      toast.dismiss(loadingToast);

      // Show error message
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.response?.status === 409) {
        toast.error('Username already taken. Please choose another.');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.error || 'Invalid username format');
      } else {
        toast.error('Failed to update username. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setEditData({ username: profile.username });
    setIsEditing(false);
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
                className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <Edit2 size={18} />
                Edit Username
              </button>
            )}
          </div>

          {/* Email Display - At the top */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Mail className="text-primary" size={24} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.email}</p>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Primary Email Address</p>
          </div>

          <div className="space-y-4">
            {/* Username - Now in the middle section */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <User className="text-gray-500 dark:text-gray-400" size={24} />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Username
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={editData.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter new username"
                    disabled={isLoading}
                    maxLength={30}
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile.username}</p>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || !editData.username.trim() || editData.username.trim() === profile.username}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors font-bold ${(!isLoading && editData.username.trim() && editData.username.trim() !== profile.username)
                  ? 'bg-accent text-white hover:bg-red-700'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                  }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Username
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
