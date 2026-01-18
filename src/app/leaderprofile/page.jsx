import React from "react";
import PageLayout from '@/components/PageLayout';
const LeadProfile = () => {
  return (
    <PageLayout>
    <div className="min-h-screen bg-gray-100 p-3">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-gray-700">Lead Profile</h2>
        <button className="text-sm border px-3 py-1 rounded bg-white hover:bg-gray-50">
          ← Back to List
        </button>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">

        {/* LEFT PANEL */}
        <div className="bg-white border rounded p-3 space-y-4 lg:col-span-1 text-xs">

          <div>
            <p className="font-semibold border-b pb-1 mb-2">Application</p>
            <p>Application Number</p>
            <p>Created At</p>
            <p>Application Purchase</p>
          </div>

          <div>
            <p className="font-semibold border-b pb-1 mb-2">Father Details</p>
            <p>Name</p>
            <p>Email</p>
            <p>Phone</p>
            <p>Occupation</p>
            <p>Income</p>
          </div>

          <div>
            <p className="font-semibold border-b pb-1 mb-2">Mother Details</p>
            <p>Name</p>
            <p>Email</p>
            <p>Phone</p>
            <p>Occupation</p>
            <p>Income</p>
          </div>

          <div>
            <p className="font-semibold border-b pb-1 mb-2">Guardian Details</p>
            <p>Name</p>
            <p>Email</p>
            <p>Phone</p>
            <p>Occupation</p>
            <p>Income</p>
          </div>

          <div>
            <p className="font-semibold border-b pb-1 mb-2">Child Details</p>
            <p>Name</p>
            <p>Date of Birth</p>
            <p>Grade</p>
            <p>Intake Year</p>
            <p>Old School</p>
            <p>Reason for Quitting</p>
            <p>Address</p><span>  <textarea
             
              rows="2"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
            /></span>
          </div>

          <div>
            <p className="font-semibold border-b pb-1 mb-2">Project Details</p>
            <p>Campaign</p>
            <p>Source</p>
            <p>Sub Source</p>
            <p>Stage : <span className="font-semibold"><select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All</option>
              <option>Male</option>
              <option>Female</option>
            </select></span></p>
            <p>Added By</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="bg-white border rounded p-3 lg:col-span-3">

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b pb-2 mb-4">
            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
              Activity Log
            </button>
            <button className="bg-gray-100 px-3 py-1 rounded text-sm">
              Site Visit
            </button>
            <button className="bg-gray-100 px-3 py-1 rounded text-sm">
              Notes
            </button>
            <button className="bg-gray-100 px-3 py-1 rounded text-sm">
              Razor Log
            </button>
          </div>

          {/* Timeline */}
          <div className="space-y-4">

            {/* Item */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="flex-1 w-px bg-gray-300"></span>
              </div>
              <div className="bg-gray-50 border rounded p-3 w-full text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold">Lead created</span>
                  <span>Jan 12 2026 10:38 PM</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="flex-1 w-px bg-gray-300"></span>
              </div>
              <div className="bg-gray-50 border rounded p-3 w-full text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold">OTP flow</span>
                  <span>Jan 12 2026 10:38 PM</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="flex-1 w-px bg-gray-300"></span>
              </div>
              <div className="bg-gray-50 border rounded p-3 w-full text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold">Enquiry Flow</span>
                  <span>Jan 12 2026 10:38 PM</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="flex-1 w-px bg-gray-300"></span>
              </div>
              <div className="bg-gray-50 border rounded p-3 w-full text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold">Stage Changed</span>
                  <span>Jan 12 2026 10:42 PM</span>
                </div>
                <p className="mt-1">Stage was updated to qualified</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span className="flex-1 w-px bg-gray-300"></span>
              </div>
              <div className="bg-gray-50 border rounded p-3 w-full text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold">Site Visit created</span>
                  <span>Jan 08 2026 10:49 AM</span>
                </div>
                <p className="mt-1">Stage Changed By: Vijayalakshmi</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span className="flex-1 w-px bg-gray-300"></span>
              </div>
              <div className="bg-gray-50 border rounded p-3 w-full text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold">Note added</span>
                  <span>Jan 08 2026 05:43 PM</span>
                </div>
                <p className="mt-1">
                  Parent purchased application form and will revert back tomorrow.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              </div>
              <div className="bg-gray-50 border rounded p-3 w-full text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold">Stage Changed</span>
                  <span>Jan 09 2026 04:51 PM</span>
                </div>
                <p className="mt-1">Stage was updated to Admitted</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    </PageLayout>
  );
};

export default LeadProfile;
