import React, { useState } from 'react';
import { api } from '../api';
import { User, Mail, Lock, Image, Save, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Profile({ user, onProfileUpdated, onDeleteAccount }) {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState(user.profileImage || '');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Delete account confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (name.length < 2) {
      setErrorMsg('Name must be at least 2 characters long');
      return;
    }

    if (password && password.length < 6) {
      setErrorMsg('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const updateData = { name, email, profileImage };
      if (password) {
        updateData.password = password;
      }

      const res = await api.updateProfile(updateData);
      if (res.success && res.data) {
        const updatedUser = {
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          profileImage: res.data.profileImage || ''
        };
        // Save in local storage and notify parent App
        localStorage.setItem('user', JSON.stringify(updatedUser));
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        onProfileUpdated(updatedUser);
        setSuccessMsg('Profile updated successfully!');
        setPassword(''); // clear password field
      } else {
        throw new Error(res.message || 'Failed to update profile');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred while updating profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteConfirmText !== email) {
      setErrorMsg('Confirmation email does not match');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.deleteAccount();
      if (res.success) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        onDeleteAccount();
      } else {
        throw new Error(res.message || 'Failed to delete account');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error deleting account.');
      setLoading(false);
    }
  };

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
    <div style={styles.container}>
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div style={styles.contentGrid}>
        {/* Left Side: Avatar Card */}
        <div className="glass-container" style={styles.cardLeft}>
          <div style={styles.avatarWrapper}>
            {profileImage ? (
              <img
                src={profileImage}
                alt={name}
                style={styles.largeAvatar}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              style={{
                ...styles.largeAvatarPlaceholder,
                display: profileImage ? 'none' : 'flex',
              }}
            >
              {getInitials(name)}
            </div>
          </div>

          <h2 style={styles.profileName}>{name}</h2>
          <span style={styles.profileEmail}>{user.email}</span>
          <div style={styles.badgeContainer}>
            <span className="badge badge-tone" style={{ fontSize: '0.78rem' }}>
              Premium Creator
            </span>
          </div>
        </div>

        {/* Right Side: Account Forms */}
        <div style={styles.formsContainer}>
          {/* Success / Error Alerts */}
          {successMsg && (
            <div className="glass-container" style={styles.successAlert}>
              <CheckCircle size={18} color="var(--color-success)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--color-success)', fontWeight: '500' }}>
                {successMsg}
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="glass-container" style={styles.errorAlert}>
              <AlertTriangle size={18} color="var(--color-danger)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--color-danger)', fontWeight: '500' }}>
                {errorMsg}
              </span>
            </div>
          )}

          <div className="glass-container" style={styles.cardRight}>
            <h3 style={styles.cardTitle}>Profile Settings</h3>
            <form onSubmit={handleUpdate} style={styles.form}>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-name">Full Name</label>
                <div style={styles.inputWrapper}>
                  <User size={18} style={styles.inputIcon} />
                  <input
                    id="profile-name"
                    type="text"
                    className="form-input"
                    style={styles.inputField}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-email">Email Address</label>
                <div style={styles.inputWrapper}>
                  <Mail size={18} style={styles.inputIcon} />
                  <input
                    id="profile-email"
                    type="email"
                    className="form-input"
                    style={styles.inputField}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-avatar">Profile Image URL</label>
                <div style={styles.inputWrapper}>
                  <Image size={18} style={styles.inputIcon} />
                  <input
                    id="profile-avatar"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    className="form-input"
                    style={styles.inputField}
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-password">New Password (leave empty to keep current)</label>
                <div style={styles.inputWrapper}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    id="profile-password"
                    type="password"
                    placeholder="••••••"
                    className="form-input"
                    style={styles.inputField}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={styles.saveBtn} disabled={loading}>
                <Save size={16} />
                Save Changes
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="glass-container" style={styles.dangerCard}>
            <h3 style={styles.dangerTitle}>Danger Zone</h3>
            <p style={styles.dangerText}>
              Permanently delete your account. This action cannot be undone. All your generated posts will be deleted recursively.
            </p>

            {showDeleteConfirm ? (
              <form onSubmit={handleDeleteAccount} style={styles.deleteConfirmForm}>
                <div style={styles.warningAlert}>
                  <AlertTriangle size={18} color="var(--color-danger)" style={{ flexShrink: 0 }} />
                  <span style={styles.warningText}>
                    Please type <strong>{email}</strong> below to confirm deletion.
                  </span>
                </div>
                <input
                  type="text"
                  placeholder={email}
                  className="form-input"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  style={styles.deleteInput}
                  required
                />
                <div style={styles.deleteActions}>
                  <button type="submit" className="btn btn-danger" style={styles.deleteBtn} disabled={loading}>
                    Permanently Delete
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn btn-danger"
                style={styles.deleteInitBtn}
              >
                <Trash2 size={16} />
                Delete My Account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    animation: 'fadeIn 0.3s ease-out',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '24px',
    alignItems: 'start',
  },
  cardLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '40px 24px',
    background: 'rgba(255, 255, 255, 0.45)',
  },
  avatarWrapper: {
    marginBottom: '20px',
  },
  largeAvatar: {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #ffffff',
    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.15)',
  },
  largeAvatarPlaceholder: {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    background: 'var(--color-primary-gradient)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    fontWeight: '700',
    border: '3px solid #ffffff',
    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.15)',
  },
  profileName: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  profileEmail: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    marginBottom: '16px',
  },
  badgeContainer: {
    display: 'flex',
    gap: '8px',
  },
  formsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  cardRight: {
    padding: '28px',
    background: 'rgba(255, 255, 255, 0.45)',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '20px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    paddingBottom: '10px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  inputField: {
    width: '100%',
    paddingLeft: '44px',
  },
  saveBtn: {
    marginTop: '12px',
    alignSelf: 'flex-start',
  },
  successAlert: {
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    borderRadius: '12px',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  errorAlert: {
    background: 'rgba(244, 63, 94, 0.08)',
    border: '1px solid rgba(244, 63, 94, 0.15)',
    borderRadius: '12px',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  dangerCard: {
    padding: '24px',
    background: 'rgba(254, 242, 242, 0.4)',
    border: '1px solid rgba(244, 63, 94, 0.15)',
  },
  dangerTitle: {
    fontSize: '1.15rem',
    fontWeight: '600',
    color: 'var(--color-danger)',
    marginBottom: '8px',
  },
  dangerText: {
    fontSize: '0.88rem',
    color: 'var(--text-secondary)',
    marginBottom: '16px',
    lineHeight: '1.4',
  },
  deleteInitBtn: {
    alignSelf: 'flex-start',
  },
  deleteConfirmForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '12px',
  },
  warningAlert: {
    background: 'rgba(244, 63, 94, 0.06)',
    border: '1px solid rgba(244, 63, 94, 0.1)',
    borderRadius: '8px',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  warningText: {
    fontSize: '0.82rem',
    color: 'var(--color-danger)',
  },
  deleteInput: {
    maxWidth: '320px',
  },
  deleteActions: {
    display: 'flex',
    gap: '10px',
  },
  deleteBtn: {
    background: 'var(--color-danger)',
    color: 'white',
  }
};
