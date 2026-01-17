"use client";

import React, { useRef } from "react";
import PageLayout from '@/components/PageLayout';
export default function WhatsappOtp() {
  const inputsRef = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^[0-9]?$/.test(value)) return;

    if (value && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  return (
<PageLayout>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow border">
        <div className="border-t-4 border-red-600 rounded-t-lg">
          <h2 className="text-center text-gray-800 font-semibold py-4">
            Enter Whatsapp OTP
          </h2>
        </div>

        <div className="p-6">
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map((_, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                maxLength="1"
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 text-center text-lg border rounded-md focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            ))}
          </div>

          <button
            className="w-full bg-red-600 text-white py-2 rounded-md font-medium hover:bg-red-700 transition"
          >
            Verify Otp & Login
          </button>
        </div>
      </div>
    </div>
    </PageLayout>
  );
}
