'use client';

import React, { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function PsychometricPage() {
   const [leads] = useState([
      { id: 1, applicationNo: "APP001", createdAt: "2026-01-16", stage: "Pre KG", noOfChildren: 1, campaign: "Campaign A", source: "Campaign", subSource: "Online", fatherName: "John Doe Sr", fatherEmail: "john.sr@example.com", fatherPhone: "+1234567890", motherName: "Jane Doe", motherEmail: "jane.doe@example.com", motherPhone: "+1234567899", payment: "Paid", guardianName: "Uncle Bob", guardianPhone: "+1234567800", guardianRelationship: "Uncle", guardianEmail: "bob@example.com", project: "Project X", addedBy: "Admin", whatsappNo: "+1234567890", status: "Qualified" },
      { id: 2, applicationNo: "APP002", createdAt: "2026-01-15", stage: "KG 1", noOfChildren: 2, campaign: "Campaign B", source: "Referral", subSource: "Friend", fatherName: "Mark Smith", fatherEmail: "mark@example.com", fatherPhone: "+1234567891", motherName: "Anna Smith", motherEmail: "anna@example.com", motherPhone: "+1234567898", payment: "Pending", guardianName: "Grandpa Joe", guardianPhone: "+1234567801", guardianRelationship: "Grandfather", guardianEmail: "joe@example.com", project: "Project Y", addedBy: "Admin", whatsappNo: "+1234567891", status: "Interested" },
      { id: 3, applicationNo: "APP003", createdAt: "2026-01-14", stage: "Grade 1", noOfChildren: 1, campaign: "Campaign C", source: "Campaign", subSource: "Online", fatherName: "Mike Johnson", fatherEmail: "mike.j@example.com", fatherPhone: "+1234567892", motherName: "Emily Johnson", motherEmail: "emily.j@example.com", motherPhone: "+1234567897", payment: "Paid", guardianName: "Aunt Mary", guardianPhone: "+1234567802", guardianRelationship: "Aunt", guardianEmail: "mary@example.com", project: "Project Z", addedBy: "Admin", whatsappNo: "+1234567892", status: "Qualified" },
      { id: 4, applicationNo: "APP004", createdAt: "2026-01-13", stage: "Grade 2", noOfChildren: 3, campaign: "Campaign D", source: "Voucher", subSource: "Offline", fatherName: "Sarah Williams Sr", fatherEmail: "sarah.sr@example.com", fatherPhone: "+1234567893", motherName: "Laura Williams", motherEmail: "laura.w@example.com", motherPhone: "+1234567896", payment: "Pending", guardianName: "Uncle Tim", guardianPhone: "+1234567803", guardianRelationship: "Uncle", guardianEmail: "tim@example.com", project: "Project X", addedBy: "Admin", whatsappNo: "+1234567893", status: "New" },
      { id: 5, applicationNo: "APP005", createdAt: "2026-01-12", stage: "KG 2", noOfChildren: 2, campaign: "Campaign E", source: "Campaign", subSource: "Online", fatherName: "Tom Brown", fatherEmail: "tom@example.com", fatherPhone: "+1234567894", motherName: "Linda Brown", motherEmail: "linda@example.com", motherPhone: "+1234567895", payment: "Paid", guardianName: "Grandma Sue", guardianPhone: "+1234567804", guardianRelationship: "Grandmother", guardianEmail: "sue@example.com", project: "Project Y", addedBy: "Admin", whatsappNo: "+1234567894", status: "Qualified" },
    ]);
  
    const getStatusColor = (status) => {
      switch (status) {
        case 'Qualified':
          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'Interested':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'New':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      }
    };
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10; // Changeable via “Show” input if needed
  
    const totalPages = Math.ceil(leads.length / rowsPerPage);
  
    // Slice leads for current page
    const currentLeads = leads.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  
    const handlePrev = () => {
      setCurrentPage((prev) => Math.max(prev - 1, 1));
    };
  
    const handleNext = () => {
      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

  return (
    <PageLayout title="Psychometric Tests">

      <div className="space-y-6">
         <div className="w-full bg-white rounded-lg shadow-sm p-4">
      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Leads by Source
      </h2>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

       

        {/* Project */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Conducted
          </label>
          <select className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
            <option>All</option>
            
          </select>
        </div>

        {/* Grade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Grade
          </label>
          <select className="w-full rounded border border-gray-300 px-3 py-2 text-sm">
            <option>All Grade</option>
            <option value="Pre KG">Pre KG</option>
            <option value="KG 1">KG 1</option>
            <option value="KG 2">KG 2</option>
            <option value="Grade 1">Grade 1</option>
            <option value="Grade 2">Grade 2</option>
            <option value="Grade 3">Grade 3</option>
            <option value="Grade 4">Grade 4</option>
            <option value="Grade 5">Grade 5</option>
            <option value="Grade 6">Grade 6</option>
            <option value="Grade 7">Grade 7</option>
            <option value="Grade 8">Grade 8</option>
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
          </select>
        </div>

        {/* Total Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Count
          </label>
          <input
            type="text"
            disabled
            className="w-full rounded border border-gray-200 bg-gray-100 px-3 py-2 text-sm"
          />
        </div>

        {/* Child Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Child Count
          </label>
          <input
            type="text"
            disabled
            className="w-full rounded border border-gray-200 bg-gray-100 px-3 py-2 text-sm"
          />
        </div>
      </div>

    </div>
         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Sno</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Application No</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Grade</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200"> Name</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200"> Email</th>
               <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Whatsapp No</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Stage</th>
           
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200"> Test Conducted</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Councilor name</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">To Counduct Test</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Result</th>
            </tr>
          </thead>

          <tbody>
            {currentLeads.map((lead, idx) => (
              <tr key={lead.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{(currentPage-1)*rowsPerPage + idx + 1}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{lead.applicationNo}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.createdAt}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.stage}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.noOfChildren}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.campaign}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.source}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.subSource}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.fatherName}</td>
                
               
              
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{lead.whatsappNo}</td>
                <td className="px-6 py-4">
                  <button className="text-accent hover:text-red-700 font-semibold text-sm">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition ${
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Previous
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition ${
            currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Next
        </button>
      </div>
    </div>
      </div>
    </PageLayout>
  );
}
