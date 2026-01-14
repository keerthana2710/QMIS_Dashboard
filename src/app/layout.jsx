'use client';

import React from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import '../styles/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
