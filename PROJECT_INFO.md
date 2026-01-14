# QMIS Portal - Next.js Dashboard

## Project Overview
A beautiful, fully responsive Next.js dashboard inspired by the QMIS Portal design with dark/light mode support and complete frontend UI.

## Features
✅ **Responsive Design** - Optimized for mobile, tablet, and desktop
✅ **Dark/Light Mode** - Theme switcher in sidebar and login
✅ **13 Dashboard Pages** - Complete sidebar navigation
✅ **Beautiful Charts** - Interactive analytics with Recharts
✅ **Modern UI** - Using Tailwind CSS with custom colors
✅ **Frontend Only** - No backend dependencies

## Brand Colors
- **Primary**: #0A0F3D (Navy Blue)
- **Accent**: #af2025 (Red)

## Pages Included
1. **Dashboard** - Main analytics with charts and data tables
2. **Leads Management** - Lead tracking and management
3. **Psychometric Tests** - Test management interface
4. **Vouchers** - Voucher and offer management
5. **Events** - Event listing and management
6. **Volunteer Management** - Volunteer tracking
7. **Google Analytics** - Analytics dashboard
8. **AI Chatbot** - Chat interface
9. **Career Guidance** - Career path exploration
10. **School Activities** - Activity management
11. **Contact Us** - Contact form
12. **Enquiries** - Enquiry tracking
13. **Profile** - User profile editor
14. **Login** - Authentication page

## Technology Stack
- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React Icons
- **Charts**: Recharts
- **Language**: JSX (JavaScript)

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Open http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

## Project Structure
```
src/
├── app/                 # Next.js pages and layouts
│   ├── layout.jsx      # Root layout with theme provider
│   ├── page.jsx        # Home (redirects to dashboard/login)
│   ├── login/          # Login page
│   ├── dashboard/      # Dashboard page
│   ├── leads/          # Leads management
│   ├── psychometric/   # Psychometric tests
│   ├── vouchers/       # Vouchers management
│   ├── events/         # Events
│   ├── volunteer/      # Volunteer management
│   ├── analytics/      # Analytics
│   ├── chatbot/        # Chatbot interface
│   ├── career/         # Career guidance
│   ├── activities/     # School activities
│   ├── contact/        # Contact form
│   ├── enquiry/        # Enquiry tracking
│   └── profile/        # User profile
├── components/
│   ├── Sidebar.jsx     # Main navigation sidebar
│   ├── Header.jsx      # Top header
│   ├── Dashboard.jsx   # Dashboard content
│   └── PageLayout.jsx  # Layout wrapper for pages
├── context/
│   └── ThemeContext.jsx # Dark/Light mode context
└── styles/
    └── globals.css     # Tailwind imports
```

## Key Features

### Authentication
- Mock login system (no backend)
- Token stored in localStorage
- Redirects to login for protected pages

### Theme System
- Uses React Context for state management
- Persists preference to localStorage
- Smooth transitions between dark/light modes

### Responsive Design
- Mobile-first approach
- Sidebar collapses on mobile devices
- Touch-friendly UI elements
- Optimized for all screen sizes

### Data Visualization
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions
- Interactive tooltips

## Notes
- This is a frontend-only demonstration
- No actual backend API calls
- Data is mock/static for UI demonstration
- All pages are fully functional UI
- Can be extended with real APIs

## Deployment
The project can be deployed to:
- Vercel (recommended for Next.js)
- Netlify
- AWS
- Any Node.js compatible hosting

## Customization
- Modify colors in `tailwind.config.js`
- Update sidebar items in `src/components/Sidebar.jsx`
- Add new pages in `src/app/`
- Customize theme in `src/context/ThemeContext.jsx`
