import React, { useState, useEffect } from 'react';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import { Heart } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activePage, setActivePage] = useState('dashboard');

  // Clear auth and session
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setActivePage('dashboard');
  };

  const handleAuthSuccess = (data) => {
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      profileImage: data.profileImage || '',
    });
  };

  const handleProfileUpdated = (updatedUser) => {
    setUser(updatedUser);
  };

  // Watch for global unauthorized events (e.g. from api.js on 401s)
  useEffect(() => {
    const handleUnauthorized = () => {
      handleLogout();
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  // Main Page Router
  const renderPage = () => {
    if (activePage === 'profile') {
      return (
        <Profile
          user={user}
          onProfileUpdated={handleProfileUpdated}
          onDeleteAccount={handleLogout}
        />
      );
    }
    return <Dashboard />;
  };

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-layout">
      {/* Navbar header */}
      <Navbar
        user={user}
        activePage={activePage}
        onChangePage={setActivePage}
        onLogout={handleLogout}
      />

      {/* Main Grid View */}
      <main className="app-main">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div className="glass-container" style={styles.footerInner}>
          <p style={styles.footerText}>
            AI Post Creator © 2026. Made with <Heart size={12} fill="var(--color-danger)" color="var(--color-danger)" style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} /> for content creators.
          </p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  footer: {
    maxWidth: '1400px',
    width: '100%',
    margin: '32px auto 0 auto',
    padding: '0 16px 24px 16px',
  },
  footerInner: {
    padding: '16px',
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.25)',
  },
  footerText: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  }
};
