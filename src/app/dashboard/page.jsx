'use client';

import React from 'react';
import PageLayout from '@/components/PageLayout';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  return (
    <PageLayout page="dashboard">
      <Dashboard />
    </PageLayout>
  );
}
