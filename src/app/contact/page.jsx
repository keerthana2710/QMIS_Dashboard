'use client';

import React, { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent successfully!');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <PageLayout title="Contact Us">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-accent bg-opacity-20 rounded-lg">
                  <Phone className="text-accent" size={20} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Phone</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">+1 (800) 123-4567</p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary bg-opacity-20 rounded-lg">
                  <Mail className="text-primary" size={20} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Email</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">support@qmis.com</p>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500 bg-opacity-20 rounded-lg">
                  <MapPin className="text-green-500" size={20} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Address</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                123 School Avenue<br />
                Education City, EC 12345
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a Message</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Message subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your message..."
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
            >
              <Send size={20} />
              Send Message
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
