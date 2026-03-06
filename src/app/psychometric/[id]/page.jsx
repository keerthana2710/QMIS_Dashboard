'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Printer } from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toISOString().split('T')[0];
}

const ratingLabel = (v) => {
  if (v === 1) return '1 – Low';
  if (v === 2) return '2 – Moderate';
  if (v === 3) return '3 – High';
  return v ?? '—';
};

function ChildInfoCard({ child, lead }) {
  const name = child?.name || lead?.father_name || '—';
  const dob = formatDate(child?.date_of_birth);
  const gender = child?.gender || '—';
  const oldSchool = child?.previous_school || '—';
  const reason = child?.reason_for_quitting || '—';

  return (
    <div className="mb-6 text-sm text-gray-700 space-y-1">
      <p><span className="font-semibold">Name : </span>{name}</p>
      <p><span className="font-semibold">DOB : </span>{dob}</p>
      <p><span className="font-semibold">Gender : </span>{gender}</p>
      <p><span className="font-semibold">Old School : </span>{oldSchool}</p>
      <p><span className="font-semibold">Reason For Quit : </span>
        <span className="text-blue-600">{reason}</span>
      </p>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="mb-6">
      <div className="border-b-2 border-blue-500 mb-4">
        <h2 className="text-xl font-semibold text-gray-800 pb-2">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function RatingField({ label, name, value, onChange, helperLines, required }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-bold text-gray-800 mb-1">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        type="number"
        min={1}
        max={3}
        value={value ?? ''}
        onChange={(e) => onChange(name, e.target.value === '' ? '' : parseInt(e.target.value))}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
      {helperLines && helperLines.map((line, i) => (
        <p key={i} className="text-xs text-gray-400 mt-0.5">{line}</p>
      ))}
    </div>
  );
}

function TextField({ label, name, value, onChange, helperText, required }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-bold text-gray-800 mb-1">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
      {helperText && <p className="text-xs text-gray-400 mt-0.5">{helperText}</p>}
    </div>
  );
}

// ─── Print question definitions ───────────────────────────────────────────────
const EMOTIONAL_QUESTIONS = [
  {
    key: 'comfort_security',
    label: 'Comfort & Security',
    context: 'Specific observations from drawing, e.g., comfort with familiar settings',
    options: [
      { value: 1, desc: 'Feels insecure in new environments' },
      { value: 2, desc: 'Moderate security' },
      { value: 3, desc: 'Feels secure and comfortable' },
    ],
  },
  {
    key: 'expressiveness',
    label: 'Expressiveness',
    context: 'E.g., difficulty in conveying feelings or expressing freely',
    options: [
      { value: 1, desc: 'Difficulty in expressing thoughts/emotions' },
      { value: 2, desc: 'Moderate expressiveness' },
      { value: 3, desc: 'Highly expressive' },
    ],
  },
  {
    key: 'happiness',
    label: 'Happiness',
    context: 'E.g., evidence of sadness or stress',
    options: [
      { value: 1, desc: 'Negative emotions' },
      { value: 2, desc: 'Neutral emotional tone' },
      { value: 3, desc: 'Exhibits positive emotions' },
    ],
  },
  {
    key: 'social_interaction',
    label: 'Social Interaction',
    context: 'E.g., ability to interact with others comfortably and freely',
    options: [
      { value: 1, desc: 'Prefers solitude' },
      { value: 2, desc: 'Moderate' },
      { value: 3, desc: 'Enjoys socializing' },
    ],
  },
  {
    key: 'adaptability',
    label: 'Adaptability',
    context: 'Specific observations from the activity',
    options: [
      { value: 1, desc: 'Struggles with change' },
      { value: 2, desc: 'Gradual adaptability' },
      { value: 3, desc: 'Easily adapts to new environments' },
    ],
  },
];

const COGNITIVE_QUESTIONS = [
  {
    key: 'attention_to_detail',
    label: 'Attention to Detail',
    context: 'E.g., whether the child completes tasks thoroughly',
    options: [
      { value: 1, desc: 'Easily distracted' },
      { value: 2, desc: 'Moderate' },
      { value: 3, desc: 'High attention' },
    ],
  },
  {
    key: 'creative_thinking',
    label: 'Creative Thinking',
    context: 'E.g., drawn objects, use of colors, inventiveness',
    options: [
      { value: 1, desc: 'Limited creative thinking' },
      { value: 2, desc: 'Shows creativity' },
      { value: 3, desc: 'Highly creative' },
    ],
  },
  {
    key: 'problem_solving',
    label: 'Problem-Solving',
    context: 'E.g., logical progression in their drawing or task completion',
    options: [
      { value: 1, desc: 'Struggles with problem-solving' },
      { value: 2, desc: 'Adequate' },
      { value: 3, desc: 'Excellent problem-solving' },
    ],
  },
  {
    key: 'memory',
    label: 'Memory',
    context: 'E.g., recollection of concepts and color names, connection to prior knowledge',
    options: [
      { value: 1, desc: 'Weak memory' },
      { value: 2, desc: 'Adequate' },
      { value: 3, desc: 'Strong memory' },
    ],
  },
];

const ACADEMIC_SECTIONS = [
  {
    title: 'Gross Motor Skills',
    context: 'Observation: Taking the kid around',
    questions: [
      { key: 'walk_on_floor', label: 'Walk on the Floor', type: 'rating' },
      { key: 'able_to_jump', label: 'Able to Jump', type: 'rating' },
      { key: 'climbs_stairs', label: 'Climbs the Stairs', type: 'rating' },
    ],
  },
  {
    title: 'Fine Motor Skills',
    context: 'Activity: Coloring and writing',
    questions: [
      { key: 'pincer_grip', label: 'Pincer Grip', type: 'text' },
      { key: 'coloring', label: 'Coloring', type: 'text' },
    ],
  },
  {
    title: 'Eye-Hand Co-ordination',
    context: '',
    questions: [
      { key: 'string_boards', label: 'String Boards', type: 'text' },
    ],
  },
  {
    title: 'Language Skills',
    context: 'Interaction with the admission team staff / KG teacher',
    questions: [
      { key: 'communication', label: 'Able to communicate in one or two sentences', type: 'text' },
    ],
  },
  {
    title: 'Socio-Emotional Skills',
    context: 'Interaction with the admission team staff / KG teacher',
    questions: [
      { key: 'comfortable_in_new_environment', label: 'Comfortable in new environment', type: 'text' },
    ],
  },
  {
    title: 'Writing Skills',
    context: 'Activity: Coloring and Writing',
    questions: [
      { key: 'identification', label: 'Identification', type: 'text' },
      { key: 'sequencing', label: 'Sequencing', type: 'text' },
    ],
  },
];

const RATING_OPTIONS = [
  { value: 1, desc: 'Low' },
  { value: 2, desc: 'Moderate' },
  { value: 3, desc: 'High' },
];

// Sub-components for the print view
function PrintRatingQuestion({ num, label, context, options, selected }) {
  return (
    <div style={{ marginBottom: '14px', pageBreakInside: 'avoid' }}>
      <div style={{ fontWeight: '600', fontSize: '12px', marginBottom: '2px' }}>
        {num}. {label}
      </div>
      {context && (
        <div style={{ fontSize: '10px', color: '#6b7280', fontStyle: 'italic', marginBottom: '6px' }}>
          {context}
        </div>
      )}
      <div style={{ display: 'flex', gap: '12px' }}>
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <div
              key={opt.value}
              style={{
                border: isSelected ? '2px solid #1d4ed8' : '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '6px 12px',
                backgroundColor: isSelected ? '#dbeafe' : '#f9fafb',
                flex: 1,
                textAlign: 'center',
              }}
            >
              <div style={{ fontWeight: isSelected ? '700' : '400', fontSize: '14px', color: isSelected ? '#1e3a8a' : '#374151' }}>
                {opt.value}
              </div>
              <div style={{ fontSize: '10px', color: isSelected ? '#1d4ed8' : '#6b7280', marginTop: '2px' }}>
                {opt.desc}
              </div>
              {isSelected && (
                <div style={{ fontSize: '9px', color: '#1d4ed8', fontWeight: '700', marginTop: '2px' }}>
                  ✓ SELECTED
                </div>
              )}
            </div>
          );
        })}
      </div>
      {selected === undefined || selected === null || selected === '' ? (
        <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '4px' }}>Not answered</div>
      ) : null}
    </div>
  );
}

function PrintTextField({ num, label, context, value }) {
  return (
    <div style={{ marginBottom: '14px', pageBreakInside: 'avoid' }}>
      <div style={{ fontWeight: '600', fontSize: '12px', marginBottom: '2px' }}>
        {num}. {label}
      </div>
      {context && (
        <div style={{ fontSize: '10px', color: '#6b7280', fontStyle: 'italic', marginBottom: '6px' }}>
          {context}
        </div>
      )}
      <div style={{
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        padding: '8px 12px',
        backgroundColor: value ? '#f0fdf4' : '#fafafa',
        fontSize: '12px',
        color: value ? '#166534' : '#9ca3af',
        minHeight: '32px',
      }}>
        {value || 'Not answered'}
      </div>
    </div>
  );
}

// ─── Print View ───────────────────────────────────────────────────────────────
function PrintView({ test }) {
  const child = test?.child;
  const lead = test?.lead;
  const emotional = Array.isArray(test?.emotional_analysis) ? test.emotional_analysis[0] : test?.emotional_analysis;
  const cognitive = Array.isArray(test?.cognitive_skills) ? test.cognitive_skills[0] : test?.cognitive_skills;
  const academic = Array.isArray(test?.academic_assessment) ? test.academic_assessment[0] : test?.academic_assessment;

  let qNum = 0;

  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#111', fontSize: '12px', padding: '24px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '3px solid #1e3a8a', paddingBottom: '12px', marginBottom: '20px' }}>
        <div style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '0.5px', color: '#1e3a8a' }}>
          QMIS — Psychometric Assessment Report
        </div>
        <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
          Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          &nbsp;·&nbsp; Application No: {test?.application_no || '—'}
        </div>
      </div>

      {/* Student & Assessment Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div>
          <div style={{ fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px' }}>
            Student Details
          </div>
          {[
            ['Name', child?.name || lead?.father_name || '—'],
            ['Grade', child?.grade || test?.grade || '—'],
            ['Date of Birth', formatDate(child?.date_of_birth)],
            ['Gender', child?.gender || '—'],
            ['Previous School', child?.previous_school || '—'],
            ['Reason for Quitting', child?.reason_for_quitting || '—'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', gap: '8px', fontSize: '11px', marginBottom: '4px' }}>
              <span style={{ color: '#6b7280', minWidth: '130px' }}>{label}:</span>
              <span style={{ fontWeight: '500' }}>{value}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '8px' }}>
            Assessment Info
          </div>
          {[
            ['Counselor', test?.counselor_name || '—'],
            ['Scheduled', test?.test_scheduled_date ? new Date(test.test_scheduled_date).toLocaleString('en-IN') : '—'],
            ['Test Status', test?.test_conducted ? '✓ Conducted' : 'Pending'],
            ['Stage', test?.stage || '—'],
            ['Lead Status', lead?.status || '—'],
            ['Parent Phone', lead?.father_phone || '—'],
            ['Parent Email', lead?.father_email || '—'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', gap: '8px', fontSize: '11px', marginBottom: '4px' }}>
              <span style={{ color: '#6b7280', minWidth: '110px' }}>{label}:</span>
              <span style={{ fontWeight: '500' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 1: Emotional Analysis ── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#1e3a8a', color: '#fff', padding: '6px 12px', borderRadius: '4px', fontWeight: '700', fontSize: '13px', marginBottom: '14px' }}>
          Section 1 — Emotional Analysis
        </div>
        {emotional ? (
          EMOTIONAL_QUESTIONS.map((q) => {
            qNum++;
            return (
              <PrintRatingQuestion
                key={q.key}
                num={qNum}
                label={q.label}
                context={q.context}
                options={q.options}
                selected={emotional[q.key]}
              />
            );
          })
        ) : (
          <div style={{ color: '#ef4444', fontStyle: 'italic', fontSize: '11px' }}>This section has not been assessed yet.</div>
        )}
      </div>

      {/* ── Section 2: Cognitive Skills ── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#1e3a8a', color: '#fff', padding: '6px 12px', borderRadius: '4px', fontWeight: '700', fontSize: '13px', marginBottom: '14px' }}>
          Section 2 — Cognitive Skills
        </div>
        {cognitive ? (
          COGNITIVE_QUESTIONS.map((q) => {
            qNum++;
            return (
              <PrintRatingQuestion
                key={q.key}
                num={qNum}
                label={q.label}
                context={q.context}
                options={q.options}
                selected={cognitive[q.key]}
              />
            );
          })
        ) : (
          <div style={{ color: '#ef4444', fontStyle: 'italic', fontSize: '11px' }}>This section has not been assessed yet.</div>
        )}
      </div>

      {/* ── Section 3: Academic Level Assessment ── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#1e3a8a', color: '#fff', padding: '6px 12px', borderRadius: '4px', fontWeight: '700', fontSize: '13px', marginBottom: '14px' }}>
          Section 3 — Academic Level Assessment
        </div>
        {academic ? (
          ACADEMIC_SECTIONS.map((section) => (
            <div key={section.title} style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: '700', fontSize: '11px', color: '#1d4ed8', borderBottom: '1px solid #bfdbfe', paddingBottom: '4px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {section.title}
                {section.context && <span style={{ fontWeight: '400', fontStyle: 'italic', marginLeft: '8px', color: '#6b7280', textTransform: 'none', letterSpacing: 'normal' }}>— {section.context}</span>}
              </div>
              {section.questions.map((q) => {
                qNum++;
                return q.type === 'rating' ? (
                  <PrintRatingQuestion
                    key={q.key}
                    num={qNum}
                    label={q.label}
                    context=""
                    options={RATING_OPTIONS}
                    selected={academic[q.key]}
                  />
                ) : (
                  <PrintTextField
                    key={q.key}
                    num={qNum}
                    label={q.label}
                    context=""
                    value={academic[q.key]}
                  />
                );
              })}
            </div>
          ))
        ) : (
          <div style={{ color: '#ef4444', fontStyle: 'italic', fontSize: '11px' }}>This section has not been assessed yet.</div>
        )}
      </div>

      {/* Signature Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px', marginTop: '32px', paddingTop: '16px', borderTop: '2px solid #e5e7eb', textAlign: 'center', fontSize: '11px', color: '#6b7280' }}>
        {['Counselor Signature', 'Parent / Guardian Signature', 'Date'].map((label) => (
          <div key={label}>
            <div style={{ borderBottom: '1px solid #9ca3af', marginBottom: '4px', paddingBottom: '24px' }}></div>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 1: Emotional Analysis ───────────────────────────────────────────────
function EmotionalAnalysisStep({ testId, existing, child, lead, onNext }) {
  const [form, setForm] = useState({
    comfort_security: existing?.comfort_security ?? '',
    expressiveness: existing?.expressiveness ?? '',
    happiness: existing?.happiness ?? '',
    social_interaction: existing?.social_interaction ?? '',
    adaptability: existing?.adaptability ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (name, val) => setForm(f => ({ ...f, [name]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(`/api/psychometric/${testId}/emotional`, form);
      toast.success('Emotional Analysis saved!');
      onNext();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionCard title="Emotional Analysis">
        <ChildInfoCard child={child} lead={lead} />

        <RatingField
          label="Comfort & Security"
          name="comfort_security"
          value={form.comfort_security}
          onChange={handleChange}
          required
          helperLines={[
            'Specific observations from drawing, e.g., comfort with familiar settings',
            '3: Feels secure and comfortable',
            '2: Moderate security',
            '1: Feels insecure in new environments',
          ]}
        />
        <RatingField
          label="Expressiveness"
          name="expressiveness"
          value={form.expressiveness}
          onChange={handleChange}
          required
          helperLines={[
            'E.g., difficulty in conveying feelings or expressing freely',
            '3: Highly expressive',
            '2: Moderate expressiveness',
            '1: Difficulty in expressing thoughts/emotions',
          ]}
        />
        <RatingField
          label="Happiness"
          name="happiness"
          value={form.happiness}
          onChange={handleChange}
          required
          helperLines={[
            'E.g., evidence of sadness or stress',
            '3: Exhibits positive emotions',
            '2: Neutral emotional tone',
            '1: Negative emotions',
          ]}
        />
        <RatingField
          label="Social Interaction"
          name="social_interaction"
          value={form.social_interaction}
          onChange={handleChange}
          required
          helperLines={[
            'E.g., ability to interact with others comfortably freely',
            '3: Enjoys socializing',
            '2: Moderate',
            '1: Prefers solitude',
          ]}
        />
        <RatingField
          label="Adaptability"
          name="adaptability"
          value={form.adaptability}
          onChange={handleChange}
          required
          helperLines={[
            'Specific observations from the activity',
            '3: Easily adapts to new environments',
            '2: Gradual adaptability',
            '1: Struggles with change',
          ]}
        />
      </SectionCard>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2 bg-accent text-white rounded hover:bg-red-700 font-medium text-sm transition disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}

// ─── Step 2: Cognitive Skills ─────────────────────────────────────────────────
function CognitiveSkillsStep({ testId, existing, child, lead, onNext, onBack }) {
  const [form, setForm] = useState({
    attention_to_detail: existing?.attention_to_detail ?? '',
    creative_thinking: existing?.creative_thinking ?? '',
    problem_solving: existing?.problem_solving ?? '',
    memory: existing?.memory ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (name, val) => setForm(f => ({ ...f, [name]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(`/api/psychometric/${testId}/cognitive`, form);
      toast.success('Cognitive Skills saved!');
      onNext();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionCard title="Cognitive Skills">
        <ChildInfoCard child={child} lead={lead} />

        <RatingField
          label="Attention to Detail"
          name="attention_to_detail"
          value={form.attention_to_detail}
          onChange={handleChange}
          required
          helperLines={[
            'E.g., whether the child completes tasks thoroughly',
            '3: High attention',
            '2: Moderate',
            '1: Easily distracted',
          ]}
        />
        <RatingField
          label="Creative Thinking"
          name="creative_thinking"
          value={form.creative_thinking}
          onChange={handleChange}
          required
          helperLines={[
            'E.g., drawn objects, use of colors, inventiveness',
            '3: Highly creative',
            '2: Shows creativity',
            '1: Limited creative thinking',
          ]}
        />
        <RatingField
          label="Problem-Solving"
          name="problem_solving"
          value={form.problem_solving}
          onChange={handleChange}
          required
          helperLines={[
            'E.g., logical progression in their drawing or task completion',
            '3: Excellent problem-solving',
            '2: Adequate',
            '1: Struggles with problem-solving',
          ]}
        />
        <RatingField
          label="Memory"
          name="memory"
          value={form.memory}
          onChange={handleChange}
          required
          helperLines={[
            'E.g., recollection of concepts and color names, connection to prior knowledge',
            '3: Strong memory',
            '2: Adequate',
            '1: Weak memory',
          ]}
        />
      </SectionCard>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium text-sm transition"
        >
          Back
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-accent text-white rounded hover:bg-red-700 font-medium text-sm transition disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Academic Level Assessment ───────────────────────────────────────
function AcademicAssessmentStep({ testId, existing, child, lead, onBack, onComplete }) {
  const [form, setForm] = useState({
    walk_on_floor: existing?.walk_on_floor ?? '',
    able_to_jump: existing?.able_to_jump ?? '',
    climbs_stairs: existing?.climbs_stairs ?? '',
    pincer_grip: existing?.pincer_grip ?? '',
    coloring: existing?.coloring ?? '',
    string_boards: existing?.string_boards ?? '',
    communication: existing?.communication ?? '',
    comfortable_in_new_environment: existing?.comfortable_in_new_environment ?? '',
    identification: existing?.identification ?? '',
    sequencing: existing?.sequencing ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (name, val) => setForm(f => ({ ...f, [name]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(`/api/psychometric/${testId}/academic`, form);
      toast.success('Academic Assessment saved! Test marked as conducted.');
      onComplete();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionCard title="Academic Level Assessment">
        <ChildInfoCard child={child} lead={lead} />

        <h3 className="text-lg font-semibold text-gray-700 mb-3">Gross Motor Skills</h3>
        <RatingField label="Walk on the Floor" name="walk_on_floor" value={form.walk_on_floor} onChange={handleChange} required helperLines={['Taking the kid around']} />
        <RatingField label="Able to Jump" name="able_to_jump" value={form.able_to_jump} onChange={handleChange} required helperLines={['Taking the kid around']} />
        <RatingField label="Climbs the Stairs" name="climbs_stairs" value={form.climbs_stairs} onChange={handleChange} required helperLines={['Taking the kid around']} />

        <h3 className="text-lg font-semibold text-gray-700 mb-3 mt-4">Fine Motor Skills</h3>
        <TextField label="Pincer grip" name="pincer_grip" value={form.pincer_grip} onChange={handleChange} required helperText="Coloring and writing" />
        <TextField label="Coloring" name="coloring" value={form.coloring} onChange={handleChange} required helperText="Coloring and writing" />

        <h3 className="text-lg font-semibold text-gray-700 mb-3 mt-4">Eye Hand co-ordination</h3>
        <TextField label="String Boards" name="string_boards" value={form.string_boards} onChange={handleChange} required />

        <h3 className="text-lg font-semibold text-gray-700 mb-3 mt-4">Language Skills</h3>
        <TextField label="Able to communicate in one or two sentences" name="communication" value={form.communication} onChange={handleChange} required helperText="Interaction with the admission team staff/KG teacher" />

        <h3 className="text-lg font-semibold text-gray-700 mb-3 mt-4">Socio economical Skills</h3>
        <TextField label="Comfortable in new environment" name="comfortable_in_new_environment" value={form.comfortable_in_new_environment} onChange={handleChange} required helperText="Interaction with the admission team staff/KG teacher" />

        <h3 className="text-lg font-semibold text-gray-700 mb-3 mt-4">Writting Skills</h3>
        <TextField label="Identification" name="identification" value={form.identification} onChange={handleChange} required helperText="Coloring and Writing" />
        <TextField label="Sequencing" name="sequencing" value={form.sequencing} onChange={handleChange} required helperText="Coloring and Writing" />
      </SectionCard>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium text-sm transition"
        >
          Back
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-accent text-white rounded hover:bg-red-700 font-medium text-sm transition disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// ─── Counselor Section ────────────────────────────────────────────────────────
function CounselorSection({ testId, test, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    counselor_name: test?.counselor_name ?? '',
    test_scheduled_date: test?.test_scheduled_date
      ? new Date(test.test_scheduled_date).toISOString().slice(0, 16)
      : '',
  });

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        counselor_name: form.counselor_name || null,
        test_scheduled_date: form.test_scheduled_date || null,
        assigned_at: form.counselor_name ? new Date().toISOString() : null,
      };
      await api.patch(`/api/psychometric/${testId}`, payload);
      toast.success('Counselor details updated');
      onUpdated(payload);
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-800">Counselor Details</h3>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            {test?.counselor_name ? 'Edit' : 'Assign Counselor'}
          </button>
        )}
      </div>

      {editing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Counselor Name</label>
            <input
              type="text"
              name="counselor_name"
              value={form.counselor_name}
              onChange={handleChange}
              placeholder="Enter counselor name"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date & Time</label>
            <input
              type="datetime-local"
              name="test_scheduled_date"
              value={form.test_scheduled_date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div className="sm:col-span-2 flex gap-3 mt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-accent text-white rounded hover:bg-red-700 text-sm font-medium disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-5 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
          <div>
            <span className="font-medium text-gray-500">Counselor: </span>
            {test?.counselor_name || <span className="text-gray-400 italic">Not assigned</span>}
          </div>
          <div>
            <span className="font-medium text-gray-500">Scheduled: </span>
            {test?.test_scheduled_date
              ? new Date(test.test_scheduled_date).toLocaleString()
              : <span className="text-gray-400 italic">Not scheduled</span>}
          </div>
          {test?.assigned_at && (
            <div>
              <span className="font-medium text-gray-500">Assigned At: </span>
              {new Date(test.assigned_at).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Stepper Indicator ────────────────────────────────────────────────────────
const STEPS = ['Emotional Analysis', 'Cognitive Skills', 'Academic Level Assessment'];

function StepperHeader({ currentStep }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((label, idx) => {
        const stepNum = idx + 1;
        const isCompleted = currentStep > stepNum;
        const isActive = currentStep === stepNum;
        return (
          <div key={idx} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                  ${isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive
                    ? 'bg-accent border-accent text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                  }`}
              >
                {isCompleted ? '✓' : stepNum}
              </div>
              <span
                className={`mt-1 text-xs font-medium text-center max-w-[100px]
                  ${isActive ? 'text-accent' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}
              >
                {label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-5 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PsychometricTestPage() {
  const { id } = useParams();
  const router = useRouter();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await api.get(`/api/psychometric/${id}`);
        if (res.data.success) {
          const t = res.data.test;
          setTest(t);
          const emotional = Array.isArray(t.emotional_analysis) ? t.emotional_analysis[0] : t.emotional_analysis;
          const cognitive = Array.isArray(t.cognitive_skills) ? t.cognitive_skills[0] : t.cognitive_skills;
          if (cognitive?.id) setStep(3);
          else if (emotional?.id) setStep(2);
          else setStep(1);
        }
      } catch (err) {
        toast.error('Failed to load test record');
        router.push('/psychometric');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  const handleComplete = () => {
    router.push('/psychometric');
  };

  if (loading) {
    return (
      <PageLayout title="Psychometric Assessment">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent" />
        </div>
      </PageLayout>
    );
  }

  return (
    <>
      {/* Print CSS — hides everything on the page, shows only the print container */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #psychometric-print-view,
          #psychometric-print-view * { visibility: visible !important; }
          #psychometric-print-view {
            display: block !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* Print-only container — off-screen on screen, fully visible when printing */}
      <div
        id="psychometric-print-view"
        style={{ position: 'fixed', left: '-9999px', top: 0, width: '210mm' }}
      >
        {test && <PrintView test={test} />}
      </div>

      {/* Screen layout inside PageLayout */}
      <PageLayout title="Psychometric Assessment">
        <div className="max-w-3xl mx-auto">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/psychometric')}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back to Psychometric Tests
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              <Printer size={15} /> Print / Save PDF
            </button>
          </div>

          {/* Counselor Section */}
          <CounselorSection
            testId={id}
            test={test}
            onUpdated={(patch) => setTest(t => ({ ...t, ...patch }))}
          />

          {/* Stepper Header */}
          <StepperHeader currentStep={step} />

          {/* Step Content */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {step === 1 && (
              <EmotionalAnalysisStep
                testId={id}
                existing={test?.emotional_analysis?.[0] || test?.emotional_analysis || null}
                child={test?.child}
                lead={test?.lead}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <CognitiveSkillsStep
                testId={id}
                existing={test?.cognitive_skills?.[0] || test?.cognitive_skills || null}
                child={test?.child}
                lead={test?.lead}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <AcademicAssessmentStep
                testId={id}
                existing={test?.academic_assessment?.[0] || test?.academic_assessment || null}
                child={test?.child}
                lead={test?.lead}
                onBack={() => setStep(2)}
                onComplete={handleComplete}
              />
            )}
          </div>
        </div>
      </PageLayout>
    </>
  );
}
