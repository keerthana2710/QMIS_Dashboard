import React from "react";
import PageLayout from '@/components/PageLayout';
export default function CreateLead() {
  return (
    <PageLayout>
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* Card */}
      <div className="w-full max-w-sm rounded-md border border-red-500 bg-white p-6 shadow-sm">
        
        {/* Title */}
        <h2 className="text-center text-sm font-semibold text-gray-800 mb-4">
          Create Lead
        </h2>

        {/* Input */}
        <div className="flex items-center rounded border border-gray-300 bg-gray-50 px-3 py-2 mb-4">
          {/* Flag */}
          <span className="mr-2 text-sm">🇮🇳</span>

          {/* Country Code */}
          <span className="mr-2 text-sm text-gray-600">+91</span>

          {/* Divider */}
          <span className="mr-2 h-4 w-px bg-gray-300" />

          {/* Phone Input */}
          <input
            type="text"
            placeholder="81234 56789"
            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400"
          />
        </div>

        {/* Button */}
        <button className="w-full rounded bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 transition">
          Search
        </button>
      </div>
    </div>
    </PageLayout>
  );
}
