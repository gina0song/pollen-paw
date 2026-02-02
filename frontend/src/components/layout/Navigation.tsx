// ============================================
// Navigation Component
// Top navigation bar with tabs for different pages
// ============================================

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, BarChart3, User } from 'lucide-react';  // 删掉了Sparkles，之后可能会用到
// Styles are imported in App.css

const Navigation: React.FC = () => {
  const location = useLocation();

  // Navigation items configuration
  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/log-symptoms', icon: PlusCircle, label: 'Log Symptoms' },
    { path: '/analysis', icon: BarChart3, label: 'Analysis' },
    // { path: '/ai-insights', icon: Sparkles, label: 'AI Insights' },
    { path: '/pet-profile', icon: User, label: 'Pet Profile' },
  ];

  /**
   * Check if current route is active
   */
  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <nav className="navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default Navigation;
