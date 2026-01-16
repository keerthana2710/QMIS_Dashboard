import React from "react";
import PageLayout from '@/components/PageLayout';
const Input = ({ label, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
    />
  </div>
);

const PhoneInput = ({ label, code = "+91" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="flex">
      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-sm">
        {code}
      </span>
      <input
        type="tel"
        className="w-full rounded-r-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
      />
    </div>
  </div>
);

const Select = ({ label }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500">
      <option>Select</option>
      <option>Below 2 LPA</option>
      <option>2–5 LPA</option>
      <option>5–10 LPA</option>
      <option>Above 10 LPA</option>
    </select>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="mb-4 text-sm font-semibold text-gray-800 border-b pb-2">
      {title}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  </div>
);

export default function AdmissionForm() {
  return (
     <PageLayout>
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-8xl mx-auto bg-white rounded-lg shadow border">
        <div className="border-t-4 border-red-600 rounded-t-lg">
          <h2 className="text-center font-semibold text-gray-800 py-4">
            Sign Up for Admissions
          </h2>
        </div>

        <form className="p-6">
          <Section title="Father's Details">
            <Input label="Father's Name" />
            <PhoneInput label="Father's Phone Number" />
            <Input label="Father's Email" type="email" />
            <Input label="Father's Occupation" />
            <Select label="Select Annual Income" />
          </Section>

          <Section title="Mother's Details">
            <Input label="Mother's Name" />
            <PhoneInput label="Mother's Phone Number" />
            <Input label="Mother's Email" type="email" />
            <Input label="Mother's Occupation" />
            <Select label="Select Annual Income" />
          </Section>

          <Section title="Guardian Details">
            <Input label="Guardian Name" />
            <PhoneInput label="Guardian Phone Number" />
            <Input label="Guardian Relationship" />
            <Input label="Guardian Email" type="email" />
            <Input label="Guardian Occupation" />
            <Select label="Select Annual Income" />
          </Section>

          <Section title="Project Details">
            <Select label="Campaign" />
            <Input label="Source" />
            <Input label="Sub Source" />
          </Section>

          <div className="flex justify-center">
            <button
              type="submit"
              className="mt-4 bg-red-600 text-white px-10 py-2 rounded-md font-medium hover:bg-red-700 transition"
            >
              Submit →
            </button>
          </div>
        </form>
      </div>
    </div>
    </PageLayout>
  );
}
