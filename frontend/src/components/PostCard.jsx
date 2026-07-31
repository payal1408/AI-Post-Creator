import React, { useState } from 'react';
import { api } from '../api';
import { Star, Copy, Check, Edit3, Trash2, Save, X, Calendar, MessageSquare, Globe } from 'lucide-react';

export default function PostCard({ post, onPostUpdated, onPostDeleted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.generatedContent);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(post.generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleFavoriteToggle = async () => {
    try {
      const res = await api.toggleFavorite(post._id);
      if (res.success && res.data) {
        onPostUpdated({ ...post, favorite: res.data.favorite });
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setLoading(true);
    try {
      const res = await api.updatePost(post._id, editContent.trim());
      if (res.success && res.data) {
        setIsEditing(false);
        onPostUpdated({ ...post, generatedContent: res.data.generatedContent });
      }
    } catch (err) {
      console.error('Failed to update post content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(post.generatedContent);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await api.deletePost(post._id);
      if (res.success) {
        onPostDeleted(post._id);
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformBadgeClass = (platform) => {
    const p = platform?.toLowerCase();
    if (p === 'linkedin') return 'badge-linkedin';
    if (p === 'twitter' || p === 'x') return 'badge-twitter';
    if (p === 'instagram') return 'badge-instagram';
    return '';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="glass-container glass-container-hover" style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.badges}>
          <span className={`badge ${getPlatformBadgeClass(post.platform)}`} style={styles.badge}>
            <Globe size={11} />
            {post.platform}
          </span>
          <span className="badge badge-tone" style={styles.badge}>
            <MessageSquare size={11} />
            {post.tone}
          </span>
        </div>

        <button
          onClick={handleFavoriteToggle}
          style={styles.favBtn}
          aria-label={post.favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star
            size={20}
            fill={post.favorite ? 'var(--color-warning)' : 'transparent'}
            color={post.favorite ? 'var(--color-warning)' : 'var(--text-muted)'}
          />
        </button>
      </div>

      <h3 style={styles.topic}>{post.topic}</h3>

      {isEditing ? (
        <div style={styles.editContainer}>
          <textarea
            className="form-textarea"
            style={styles.editArea}
            rows={5}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            disabled={loading}
          />
          <div style={styles.editActions}>
            <button
              onClick={handleSaveEdit}
              className="btn btn-primary"
              style={styles.editBtn}
              disabled={loading}
            >
              <Save size={14} />
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="btn btn-secondary"
              style={styles.editBtn}
              disabled={loading}
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.contentWrapper}>
          <p style={styles.content}>{post.generatedContent}</p>
        </div>
      )}

      <div style={styles.cardFooter}>
        <div style={styles.dateBox}>
          <Calendar size={13} color="var(--text-muted)" />
          <span style={styles.date}>{formatDate(post.createdAt)}</span>
        </div>

        {!isEditing && (
          <div style={styles.actions}>
            <button
              onClick={handleCopy}
              style={{
                ...styles.actionBtn,
                ...(copied ? styles.copyActiveBtn : {}),
              }}
              title="Copy to clipboard"
            >
              {copied ? <Check size={16} color="var(--color-success)" /> : <Copy size={16} />}
              <span style={copied ? { color: 'var(--color-success)' } : {}}>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={() => setIsEditing(true)}
              style={styles.actionBtn}
              title="Edit content"
            >
              <Edit3 size={16} />
              <span>Edit</span>
            </button>

            {showDeleteConfirm ? (
              <div style={styles.confirmBox}>
                <button
                  onClick={handleDelete}
                  style={styles.confirmBtnYes}
                  disabled={loading}
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={styles.confirmBtnNo}
                  disabled={loading}
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                title="Delete post"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    animation: 'fadeIn 0.3s ease-out',
    background: 'rgba(255, 255, 255, 0.4)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badges: {
    display: 'flex',
    gap: '8px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.72rem',
    padding: '3px 8px',
  },
  favBtn: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '50%',
    transition: 'background var(--transition-fast)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topic: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.05rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    lineHeight: '1.3',
  },
  contentWrapper: {
    background: 'rgba(255, 255, 255, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
    padding: '12px 16px',
  },
  content: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.5',
  },
  editContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  editArea: {
    width: '100%',
    resize: 'vertical',
    fontSize: '0.9rem',
    lineHeight: '1.4',
    fontFamily: 'var(--font-body)',
  },
  editActions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  editBtn: {
    padding: '6px 12px',
    fontSize: '0.85rem',
    borderRadius: '8px',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: '8px',
    borderTop: '1px solid rgba(0, 0, 0, 0.04)',
    flexWrap: 'wrap',
    gap: '8px',
  },
  dateBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  date: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  actions: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  actionBtn: {
    border: 'none',
    background: 'transparent',
    padding: '6px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.8rem',
    fontWeight: '550',
    color: 'var(--text-secondary)',
    transition: 'all var(--transition-fast)',
  },
  copyActiveBtn: {
    background: 'rgba(16, 185, 129, 0.06)',
  },
  deleteBtn: {
    color: 'var(--color-danger)',
  },
  confirmBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'rgba(244, 63, 94, 0.06)',
    padding: '2px 6px',
    borderRadius: '8px',
    border: '1px solid rgba(244, 63, 94, 0.1)',
  },
  confirmBtnYes: {
    background: 'var(--color-danger)',
    color: '#ffffff',
    border: 'none',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontWeight: '600',
  },
  confirmBtnNo: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontWeight: '600',
  }
};
