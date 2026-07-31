import React, { useState } from 'react';
import { api } from '../api';
import { Mail, Lock, User, Image, LogIn, UserPlus, AlertCircle } from 'lucide-react';

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        if (!email || !password) {
          throw new Error('Please fill in all fields');
        }
        res = await api.login(email, password);
      } else {
        if (!name || !email || !password) {
          throw new Error('Name, email, and password are required');
        }
        if (name.length < 2) {
          throw new Error('Name must be at least 2 characters');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        res = await api.register(name, email, password, profileImage || undefined);
      }

      if (res.success && res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify({
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          profileImage: res.data.profileImage || ''
        }));
        onAuthSuccess(res.data);
      } else {
        throw new Error(res.message || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setProfileImage('');
  };

  return (
    <div style={styles.container}>
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="glass-container" style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>AI Post Creator</h1>
          <p style={styles.subtitle}>
            {isLogin ? 'Generate beautiful social content with AI' : 'Join us to create premium content'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={styles.tabContainer}>
          <button
            onClick={() => isLogin || toggleMode()}
            style={{
              ...styles.tab,
              ...(isLogin ? styles.activeTab : {}),
            }}
          >
            <LogIn size={16} />
            Login
          </button>
          <button
            onClick={() => !isLogin || toggleMode()}
            style={{
              ...styles.tab,
              ...(!isLogin ? styles.activeTab : {}),
            }}
          >
            <UserPlus size={16} />
            Register
          </button>
        </div>

        {error && (
          <div style={styles.errorContainer}>
            <AlertCircle size={18} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <div style={styles.inputWrapper}>
                <User size={18} style={styles.inputIcon} />
                <input
                  id="reg-name"
                  type="text"
                  placeholder="John Doe"
                  className="form-input"
                  style={styles.inputField}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                id="auth-email"
                type="email"
                placeholder="john@example.com"
                className="form-input"
                style={styles.inputField}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                id="auth-password"
                type="password"
                placeholder="••••••"
                className="form-input"
                style={styles.inputField}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="reg-avatar">Profile Image URL (Optional)</label>
              <div style={styles.inputWrapper}>
                <Image size={18} style={styles.inputIcon} />
                <input
                  id="reg-avatar"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  className="form-input"
                  style={styles.inputField}
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={loading}>
            {loading ? (
              <span style={styles.spinner}></span>
            ) : isLogin ? (
              <>
                <LogIn size={18} />
                Sign In
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Create Account
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    animation: 'fadeIn 0.5s ease-out',
  },
  header: {
    textAlign: 'center',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
  },
  tabContainer: {
    display: 'flex',
    background: 'rgba(0, 0, 0, 0.03)',
    borderRadius: '12px',
    padding: '4px',
    gap: '4px',
    border: '1px solid rgba(255, 255, 255, 0.4)',
  },
  tab: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: 'var(--font-heading)',
    fontWeight: '550',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },
  activeTab: {
    background: '#ffffff',
    color: 'var(--color-primary)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  },
  errorContainer: {
    background: 'rgba(244, 63, 94, 0.1)',
    border: '1px solid rgba(244, 63, 94, 0.2)',
    borderRadius: '12px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  errorText: {
    fontSize: '0.88rem',
    color: 'var(--color-danger)',
    fontWeight: '500',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  inputField: {
    width: '100%',
    paddingLeft: '48px',
  },
  submitBtn: {
    marginTop: '12px',
    width: '100%',
    height: '46px',
  },
  spinner: {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  }
};
