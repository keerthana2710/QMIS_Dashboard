import PageLayout from '@/components/PageLayout';
import React from "react";

const viewbutton = () => {
  return (
     <PageLayout title="Emotional Analysis">
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl rounded-lg bg-white shadow-md">

        {/* Body */}
        <div className="px-6 py-6 space-y-6">

          {/* Student Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
            <p><strong>Name:</strong> krishev Y</p>
            <p><strong>DOB:</strong> 2022-03-21</p>
            <p><strong>Gender:</strong> Male</p>
            <p><strong>Old School:</strong> SBOA</p>
            <p className="sm:col-span-2">
              <strong>Reason For Quit:</strong> Quality education
            </p>
          </div>

          {/* Comfort & Security */}
          <div className="space-y-1">
            <label className="font-medium text-gray-700">
              Comfort & Security <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value="3"
              readOnly
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              Specific observations from drawing, e.g., comfort with familiar settings<br />
              3: Feels secure and comfortable<br />
              2: Moderate security<br />
              1: Feels insecure in new environments
            </p>
          </div>

          {/* Expressiveness */}
          <div className="space-y-1">
            <label className="font-medium text-gray-700">
              Expressiveness <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value="3"
              readOnly
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              E.g., difficulty in conveying feelings or expressing freely<br />
              3: Highly expressive<br />
              2: Moderate expressiveness<br />
              1: Difficulty in expressing thoughts/emotions
            </p>
          </div>

          {/* Happiness */}
          <div className="space-y-1">
            <label className="font-medium text-gray-700">
              Happiness <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value="3"
              readOnly
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              E.g., evidence of sadness or stress<br />
              3: Exhibits positive emotions<br />
              2: Neutral emotional tone<br />
              1: Negative emotions
            </p>
          </div>

          {/* Social Interaction */}
          <div className="space-y-1">
            <label className="font-medium text-gray-700">
              Social Interaction <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value="3"
              readOnly
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              E.g., ability to interact with others comfortably freely<br />
              3: Enjoys socializing<br />
              2: Moderate<br />
              1: Prefers solitude
            </p>
          </div>

          {/* Adaptability */}
          <div className="space-y-1">
            <label className="font-medium text-gray-700">
              Adaptability <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value="3"
              readOnly
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              Specific observations from the activity<br />
              3: Easily adapts to new environments<br />
              2: Gradual adaptability<br />
              1: Struggles with change
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button className="rounded-md bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700 transition">
              Save
            </button>
          </div>

        </div>
      </div>
    </div>
    </PageLayout>
  );
};

export default viewbutton;
