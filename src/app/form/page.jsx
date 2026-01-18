import React from "react";
import PageLayout from '@/components/PageLayout';
const AddChild = () => {
  return (
     <PageLayout>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center ">
      <div className="w-full max-w-6xl bg-white border rounded-md shadow-sm">

        {/* Header */}
        <div className="border-b p-4">
          <h2 className="text-center font-semibold text-gray-700">
            Welcome to QMIS
          </h2>
        </div>

        {/* Form */}
        <form className="p-4 space-y-6">
          <h3 className="text-sm font-semibold text-gray-600">
            Child Details
          </h3>

          {/* Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <input
              type="text"
              placeholder="Child Name"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />

            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Intake Year</option>
              <option>2024</option>
              <option>2025</option>
            </select>

            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select Grade</option>
              <option>AI Grade</option>
              <option>Grade 1</option>
            </select>

            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />

            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>

            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Blood Group</option>
              <option>A+</option>
              <option>A-</option>
              <option>AB+</option>
                <option>AB-</option>
                <option>B+</option>
                <option>B-</option>
                <option>O-</option>     
              <option>O+</option>
            </select>

            <input
              type="text"
              placeholder="Previous School"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Full width fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea
              placeholder="Address"
              rows="2"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />

            <textarea
              placeholder="Reason for Quitting"
              rows="2"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              className="w-full bg-red-600 text-white py-2 rounded-md font-semibold hover:bg-red-700"
            >
              Add Child
            </button>

            <button
              type="submit"
              className="w-full bg-indigo-900 text-white py-2 rounded-md font-semibold hover:bg-indigo-800"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
    </PageLayout>
  );
};

export default AddChild;
