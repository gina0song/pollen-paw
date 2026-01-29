// ============================================
// Layout Component
// Main layout wrapper with header and navigation
// ============================================

import React from 'react';
import Header from './Header';
import Navigation from './Navigation';
// Styles are imported in App.css

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app-layout">
      <Header />
      <Navigation />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
