import React, { useState } from 'react';
import { api } from '../api';
import { Sparkles, MessageSquare, Globe, Wand2, AlertTriangle } from 'lucide-react';

export default function PostGenerator({ onPostGenerated }) {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('LinkedIn');
  const [tone, setTone] = useState('Professional');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic || topic.trim().length < 3) {
      setError('Topic must be at least 3 characters long');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.generatePost(topic.trim(), platform, tone);
      if (res.success && res.data) {
        setTopic('');
        onPostGenerated(res.data);
      } else {
        throw new Error(res.message || 'AI Generation failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to AI Service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-container" style={styles.container}>
      <div style={styles.titleContainer}>
        <div style={styles.iconBox}>
          <Wand2 size={18} color="#4f46e5" />
        </div>
        <h2 style={styles.title}>Craft a New Post</h2>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={styles.loaderContainer}>
          <div style={styles.magicLoader}>
            <Sparkles size={32} style={styles.sparkleIcon} />
            <div style={styles.spinnerRing}></div>
          </div>
          <p style={styles.loaderText}>AI is crafting your post...</p>
          <p style={styles.loaderSubtext}>This will only take a couple of seconds</p>
        </div>
      ) : (
        <form onSubmit={handleGenerate} style={styles.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="generator-topic">What is your post about?</label>
            <textarea
              id="generator-topic"
              placeholder="E.g., The benefits of green energy, React vs Angular in 2026, or a short announcement about a promotion..."
              className="form-textarea"
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={styles.textarea}
              required
            />
          </div>

          <div style={styles.row}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="generator-platform">Platform</label>
              <div style={styles.selectWrapper}>
                <Globe size={16} style={styles.selectIcon} />
                <select
                  id="generator-platform"
                  className="form-select"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  style={styles.select}
                >
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Twitter">Twitter / X</option>
                  <option value="Instagram">Instagram</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="generator-tone">Tone</label>
              <div style={styles.selectWrapper}>
                <MessageSquare size={16} style={styles.selectIcon} />
                <select
                  id="generator-tone"
                  className="form-select"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  style={styles.select}
                >
                  <option value="Professional">Professional</option>
                  <option value="Casual">Casual</option>
                  <option value="Funny">Funny</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={styles.submitBtn}>
            <Sparkles size={16} />
            Generate with AI
          </button>
        </form>
      )}
    </div>
  );
}

const styles = {
  container: {
    marginBottom: '24px',
    animation: 'fadeIn 0.4s ease-out',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  iconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(99, 102, 241, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
  },
  errorBox: {
    background: 'rgba(244, 63, 94, 0.08)',
    border: '1px solid rgba(244, 63, 94, 0.15)',
    borderRadius: '10px',
    color: 'var(--color-danger)',
    padding: '10px 14px',
    fontSize: '0.88rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  textarea: {
    resize: 'vertical',
    minHeight: '80px',
    lineHeight: '1.4',
  },
  row: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  selectWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  selectIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  select: {
    width: '100%',
    paddingLeft: '40px',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    backgroundSize: '16px',
  },
  submitBtn: {
    marginTop: '16px',
    width: '100%',
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    textAlign: 'center',
  },
  magicLoader: {
    position: 'relative',
    width: '64px',
    height: '64px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleIcon: {
    color: '#6366f1',
    animation: 'pulse 1.5s infinite ease-in-out',
  },
  spinnerRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '3px solid rgba(99, 102, 241, 0.1)',
    borderTopColor: '#6366f1',
    animation: 'spin 1s linear infinite',
  },
  loaderText: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  loaderSubtext: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  }
};
