import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, LayoutDashboard, Settings, Sparkles, ChevronDown } from 'lucide-react';

export default function Navbar({ user, activePage, onChangePage, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="glass-container" style={styles.navbar}>
      <div style={styles.brand} onClick={() => onChangePage('dashboard')}>
        <div style={styles.logoIcon}>
          <Sparkles size={20} color="#ffffff" />
        </div>
        <span style={styles.logoText}>AI Post Creator</span>
      </div>

      <nav style={styles.navLinks}>
        <button
          onClick={() => onChangePage('dashboard')}
          style={{
            ...styles.navBtn,
            ...(activePage === 'dashboard' ? styles.activeNavBtn : {}),
          }}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => onChangePage('profile')}
          style={{
            ...styles.navBtn,
            ...(activePage === 'profile' ? styles.activeNavBtn : {}),
          }}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </nav>

      <div style={styles.userContainer} ref={dropdownRef}>
        <div style={styles.userTrigger} onClick={() => setDropdownOpen(!dropdownOpen)}>
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              style={styles.avatar}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            style={{
              ...styles.avatarPlaceholder,
              display: user.profileImage ? 'none' : 'flex',
            }}
          >
            {getInitials(user.name)}
          </div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user.name}</span>
            <ChevronDown size={14} style={{
              transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform var(--transition-fast)'
            }} />
          </div>
        </div>

        {dropdownOpen && (
          <div className="glass-container" style={styles.dropdown}>
            <div style={styles.dropdownHeader}>
              <span style={styles.dropdownName}>{user.name}</span>
              <span style={styles.dropdownEmail}>{user.email}</span>
            </div>
            <hr style={styles.divider} />
            <button
              onClick={() => {
                onChangePage('profile');
                setDropdownOpen(false);
              }}
              style={styles.dropdownItem}
            >
              <User size={16} />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => {
                onLogout();
                setDropdownOpen(false);
              }}
              style={{ ...styles.dropdownItem, ...styles.logoutItem }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
    borderTop: 'none',
    marginBottom: '24px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'var(--color-primary-gradient)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.25)',
  },
  logoText: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.25rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #1e293b 0%, #4f46e5 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navLinks: {
    display: 'flex',
    gap: '8px',
  },
  navBtn: {
    border: 'none',
    background: 'transparent',
    padding: '8px 16px',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'var(--font-heading)',
    fontWeight: '550',
    fontSize: '0.92rem',
    color: 'var(--text-secondary)',
    transition: 'all var(--transition-fast)',
  },
  activeNavBtn: {
    background: 'rgba(99, 102, 241, 0.08)',
    color: 'var(--color-primary)',
  },
  userContainer: {
    position: 'relative',
  },
  userTrigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: '12px',
    transition: 'background var(--transition-fast)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1.5px solid var(--color-primary-light)',
  },
  avatarPlaceholder: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--color-primary-gradient)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: '700',
    border: '1.5px solid #ffffff',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  userName: {
    fontFamily: 'var(--font-heading)',
    fontSize: '0.9rem',
    fontWeight: '550',
    color: 'var(--text-primary)',
    display: 'none', // Hide name on small mobile screens
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 8px)',
    width: '220px',
    padding: '16px 8px 8px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    animation: 'slideDown 0.2s ease-out',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
  },
  dropdownHeader: {
    padding: '0 12px 8px 12px',
    display: 'flex',
    flexDirection: 'column',
  },
  dropdownName: {
    fontFamily: 'var(--font-heading)',
    fontWeight: '600',
    fontSize: '0.95rem',
    color: 'var(--text-primary)',
  },
  dropdownEmail: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    wordBreak: 'break-all',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
    margin: '4px 0',
  },
  dropdownItem: {
    border: 'none',
    background: 'transparent',
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    textAlign: 'left',
    width: '100%',
    transition: 'all var(--transition-fast)',
  },
  logoutItem: {
    color: 'var(--color-danger)',
  },
  // Responsive layout rules helper
  '@media (min-width: 640px)': {
    userName: {
      display: 'block',
    }
  }
};
