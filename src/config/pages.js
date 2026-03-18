// Central registry of all pages/modules in the app
export const PAGES = [
  { key: 'dashboard',    label: 'Dashboard',          path: '/dashboard' },
  { key: 'leads',        label: 'Leads',               path: '/leads' },
  { key: 'psychometric', label: 'Psychometric Tests',  path: '/psychometric' },
  { key: 'contacts',     label: 'Contacts',            path: '/contacts' },
  { key: 'activities',   label: 'School Activities',   path: '/activities' },
  { key: 'career',       label: 'Career Guidance',     path: '/career' },
  { key: 'chatbot',      label: 'AI Chatbot',          path: '/chatbot' },
  { key: 'enquiry',      label: 'Enquiry',             path: '/enquiry' },
  { key: 'profile',      label: 'Profile',             path: '/profile' },
];

// All available roles (excluding SUPER_ADMIN which always has full access)
export const ROLES = ['admin', 'manager', 'counselor', 'viewer'];

export const SUPER_ADMIN_ROLE = 'SUPER_ADMIN';

// Map a page path → page key (e.g. '/leads' → 'leads')
export const PATH_TO_PAGE_KEY = PAGES.reduce((acc, p) => {
  acc[p.path] = p.key;
  return acc;
}, {});
