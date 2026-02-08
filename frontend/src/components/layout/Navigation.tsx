import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, BarChart3, User } from 'lucide-react';  

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/log-symptoms', icon: PlusCircle, label: 'Log Symptoms' },
    { path: '/analysis', icon: BarChart3, label: 'Analysis' },
    { path: '/pet-profile', icon: User, label: 'Pet Profile' },
  ];

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
