'use client';

import React, { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Send, MessageCircle } from 'lucide-react';

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hello! How can I help you today?' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([
        ...messages,
        { id: messages.length + 1, type: 'user', text: input },
        {
          id: messages.length + 2,
          type: 'bot',
          text: 'Thank you for your message. Our team will respond shortly.',
        },
      ]);
      setInput('');
    }
  };

  return (
    <PageLayout title="AI Chatbot">
      <div className="max-w-2xl mx-auto h-[600px] flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-700">
          <MessageCircle className="text-primary" size={24} />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Support Assistant</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
