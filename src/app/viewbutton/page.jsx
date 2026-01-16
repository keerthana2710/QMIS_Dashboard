"use client";

import React, { useState } from "react";
import PageLayout from "@/components/PageLayout";

export default function ViewButton() {
  const [formData, setFormData] = useState({
    attention: "2",
    creativity: "2",
    problemSolving: "2",
    memory: "3",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Cognitive Skills:", formData);
  };

  return (
    <PageLayout title="Analysis">
      <div className="bg-gray-50 px-4 py-6 sm:px-6 lg:px-10 space-y-10">

        {/* ================= Cognitive Analysis ================= */}
        <div className="mx-auto max-w-8xl rounded-lg bg-white shadow">
          <div className="border-b px-6 py-4">
            <h1 className="text-xl font-semibold text-gray-800">
              Emotional Analysis
            </h1>
          </div>

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

            {[
              {
                label: "Comfort & Security",
                value: "3",
                info: [
                  "Specific observations from drawing, e.g., comfort with familiar settings",
                  "3: Feels secure and comfortable",
                  "2: Moderate security",
                  "1: Feels insecure in new environments",
                ],
              },
              {
                label: "Expressiveness",
                value: "3",
                info: [
                  "E.g., difficulty in conveying feelings or expressing freely",
                  "3: Highly expressive",
                  "2: Moderate expressiveness",
                  "1: Difficulty in expressing thoughts/emotions",
                ],
              },
              {
                label: "Happiness",
                value: "3",
                info: [
                  "E.g., evidence of sadness or stress",
                  "3: Exhibits positive emotions",
                  "2: Neutral emotional tone",
                  "1: Negative emotions",
                ],
              },
              {
                label: "Social Interaction",
                value: "3",
                info: [
                  "E.g., ability to interact with others comfortably",
                  "3: Enjoys socializing",
                  "2: Moderate",
                  "1: Prefers solitude",
                ],
              },
              {
                label: "Adaptability",
                value: "3",
                info: [
                  "Specific observations from the activity",
                  "3: Easily adapts to new environments",
                  "2: Gradual adaptability",
                  "1: Struggles with change",
                ],
              },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <label className="font-medium text-gray-700">
                  {item.label} <span className="text-red-500">*</span>
                </label>
                <input
                  readOnly
                  value={item.value}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-100"
                />
                <p className="Content text-xs text-gray-500">
                  {item.info.map((i) => (
                    <span key={i} className="block">{i}</span>
                  ))}
                </p>
              </div>
            ))}

            <button className="rounded bg-red-600 px-6 py-2 text-sm text-white hover:bg-red-700">
              Save
            </button>
          </div>
        </div>

        {/* ================= Cognitive Skills (COMPLETE) ================= */}
        <div className="mx-auto max-w-8xl rounded-lg bg-white shadow">
          <div className="border-b px-6 py-4">
            <h1 className="text-xl font-semibold text-gray-800">
              Cognitive Skills
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">

            {/* Attention to Detail */}
            <div className="space-y-1">
              <label className="font-medium text-gray-700">
                Attention to Detail <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="attention"
                value={formData.attention}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-500">
                E.g., whether the child completes tasks thoroughly<br />
                3: High attention<br />
                2: Moderate<br />
                1: Easily distracted
              </p>
            </div>

            {/* Creative Thinking */}
            <div className="space-y-1">
              <label className="font-medium text-gray-700">
                Creative Thinking <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="creativity"
                value={formData.creativity}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-500">
                E.g., drawn objects, use of colors, inventiveness<br />
                3: Highly creative<br />
                2: Shows creativity<br />
                1: Limited creative thinking
              </p>
            </div>

            {/* Problem-Solving */}
            <div className="space-y-1">
              <label className="font-medium text-gray-700">
                Problem-Solving <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="problemSolving"
                value={formData.problemSolving}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-500">
                E.g., logical progression in their drawing or task completion<br />
                3: Excellent problem-solving<br />
                2: Adequate<br />
                1: Struggles with problem-solving
              </p>
            </div>

            {/* Memory */}
            <div className="space-y-1">
              <label className="font-medium text-gray-700">
                Memory <span className="text-red-500">*</span>
              </label>
              <select
                name="memory"
                value={formData.memory}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
              </select>
              <p className="text-xs text-gray-500">
                E.g., recollection of concepts and color names, connection to prior knowledge<br />
                3: Strong memory<br />
                2: Adequate<br />
                1: Weak memory
              </p>
            </div>

            <button
              type="submit"
              className="rounded bg-red-600 px-6 py-2 text-sm text-white hover:bg-red-700"
            >
              Save
            </button>
          </form>
        </div>

       
<div className="mx-auto max-w-8xl rounded-lg bg-white shadow">
  {/* Header */}
  <div className="border-b px-6 py-4">
    <h1 className="text-xl font-semibold text-gray-800">
      Academic Level Assessment
    </h1>
  </div>

  <div className="px-6 py-6 space-y-8">

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

    {/* ================= Gross Motor Skills ================= */}
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-800">Gross Motor Skills</h2>

      {[
        { label: "Walk on the Floor", value: "3", note: "Taking the kid around" },
        { label: "Able to Jump", value: "3", note: "Taking the kid around" },
        { label: "Climbs the Stairs", value: "3", note: "Taking the kid around" },
      ].map((item) => (
        <div key={item.label} className="space-y-1">
          <label className="font-medium text-gray-700">
            {item.label} <span className="text-red-500">*</span>
          </label>
          <input
            readOnly
            value={item.value}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-100"
          />
          <p className="text-xs text-gray-500">{item.note}</p>
        </div>
      ))}
    </div>

    {/* ================= Fine Motor Skills ================= */}
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-800">Fine Motor Skills</h2>

      {[
        { label: "Pincer grip", value: "Excellent", note: "Coloring and writing" },
        { label: "Coloring", value: "Excellent", note: "Coloring and writing" },
      ].map((item) => (
        <div key={item.label} className="space-y-1">
          <label className="font-medium text-gray-700">
            {item.label} <span className="text-red-500">*</span>
          </label>
          <input
            readOnly
            value={item.value}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-100"
          />
          <p className="text-xs text-gray-500">{item.note}</p>
        </div>
      ))}
    </div>

    {/* ================= Eye Hand Coordination ================= */}
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-800">Eye Hand Co-ordination</h2>

      <div className="space-y-1">
        <label className="font-medium text-gray-700">
          String Beads <span className="text-red-500">*</span>
        </label>
        <input
          readOnly
          value="Completely normal"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-100"
        />
      </div>
    </div>

    {/* ================= Language Skills ================= */}
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-800">Language Skills</h2>

      <div className="space-y-1">
        <label className="font-medium text-gray-700">
          Able to communicate in one or two sentences{" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          readOnly
          value="Age appropriate"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-100"
        />
        <p className="text-xs text-gray-500">
          Interaction with the admission team staff / KG teacher
        </p>
      </div>
    </div>

    {/* ================= Socio Economical Skills ================= */}
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-800">
        Socio Economical Skills
      </h2>

      <div className="space-y-1">
        <label className="font-medium text-gray-700">
          Comfortable in new environment{" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          readOnly
          value="Yet to set"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-100"
        />
        <p className="text-xs text-gray-500">
          Interaction with the admission team staff / KG teacher
        </p>
      </div>
    </div>

    {/* ================= Writing Skills ================= */}
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-800">Writing Skills</h2>

      {[
        { label: "Identification", value: "Yet to set" },
        { label: "Sequencing", value: "Yet to set" },
      ].map((item) => (
        <div key={item.label} className="space-y-1">
          <label className="font-medium text-gray-700">
            {item.label} <span className="text-red-500">*</span>
          </label>
          <input
            readOnly
            value={item.value}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-100"
          />
          <p className="text-xs text-gray-500">
            Coloring and Writing
          </p>
        </div>
      ))}
    </div>

    {/* Save Button */}
    <button className="rounded bg-red-600 px-6 py-2 text-sm text-white hover:bg-red-700">
      Save
    </button>

  </div>
</div>

      </div>
    </PageLayout>
  );
}
