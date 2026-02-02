'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { ArrowLeft, Mail, Phone, Calendar, Tag, MessageSquare } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContact();
  }, [params.id]);

  const fetchContact = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/contacts/${params.id}`);

      if (response.data.success) {
        setContact(response.data.contact);
      } else {
        toast.error('Failed to fetch contact details');
        router.push('/contacts');
      }
    } catch (error) {
      console.error('Error fetching contact:', error);
      toast.error('Failed to fetch contact details');
      router.push('/contacts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <PageLayout title="Contact Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      </PageLayout>
    );
  }

  if (!contact) {
    return (
      <PageLayout title="Contact Not Found">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-700">Contact not found</h2>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Contact Details">
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push('/contacts')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Contacts
        </button>

        {/* Contact Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{contact.name}</h1>
              <p className="text-gray-500 mt-1">
                Created on {formatDate(contact.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <Calendar size={14} className="mr-1" />
                {formatDate(contact.created_at).split(',')[0]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Contact Information
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{contact.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{contact.phone}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {contact.tags && contact.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Tag size={16} />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {contact.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Message Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Message Details
              </h2>

              <div className="space-y-3">
                {contact.subject && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Subject</p>
                    <p className="font-medium text-gray-900">{contact.subject}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                    <MessageSquare size={16} />
                    Message
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{contact.message}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
