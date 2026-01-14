'use client';

import React from 'react';

import '../styles/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
      
          {children}
        
      </body>
    </html>
  );
}
