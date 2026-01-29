// ============================================
// Header Component
// App header with logo and user info
// ============================================

import React from 'react';
import { LogOut } from 'lucide-react';
import { authService } from '../../services/authService';
// Styles are imported in App.css

const Header: React.FC = () => {
  const user = authService.getCurrentUser();

  /**
   * Handle logout
   */
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      authService.logout();
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo">Pollen Paw</h1>
        
        {user && (
          <div className="user-section">
            <span className="user-email">{user.email}</span>
            <button 
              onClick={handleLogout} 
              className="logout-btn"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
