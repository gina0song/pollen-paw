import React from 'react';
import Header from './Header';
import Navigation from './Navigation';

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
