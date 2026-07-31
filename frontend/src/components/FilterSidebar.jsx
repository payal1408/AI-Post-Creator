import React, { useState } from 'react';
import { Search, SlidersHorizontal, Calendar, X, Star, ArrowUpDown } from 'lucide-react';

export default function FilterSidebar({ filters, onFilterChange, onClearFilters }) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleFavorite = () => {
    updateFilter('favorite', filters.favorite === 'true' ? '' : 'true');
  };

  const platforms = ['LinkedIn', 'Twitter', 'Instagram'];
  const tones = ['Professional', 'Casual', 'Funny'];

  return (
    <div style={styles.outerContainer}>
      {/* Mobile Toggle Button */}
      <button
        style={styles.mobileToggleBtn}
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary"
      >
        <SlidersHorizontal size={16} />
        {isOpen ? 'Hide Filters' : 'Show Filters & Sort'}
      </button>

      {/* Main Sidebar Wrapper */}
      <div
        className="glass-container"
        style={{
          ...styles.sidebar,
          display: isOpen ? 'flex' : styles.sidebar.display,
        }}
      >
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <SlidersHorizontal size={18} color="var(--color-primary)" />
            <h3>Filters & Sorting</h3>
          </div>
          {onClearFilters && (
            <button onClick={onClearFilters} style={styles.clearBtn}>
              Clear All
            </button>
          )}
        </div>

        {/* Search */}
        <div className="form-group">
          <label className="form-label" htmlFor="filter-search">Search Keyword</label>
          <div style={styles.searchWrapper}>
            <Search size={16} style={styles.searchIcon} />
            <input
              id="filter-search"
              type="text"
              placeholder="Search topic or content..."
              className="form-input"
              style={styles.searchInput}
              value={filters.keyword || ''}
              onChange={(e) => updateFilter('keyword', e.target.value)}
            />
          </div>
        </div>

        {/* Sort */}
        <div className="form-group">
          <label className="form-label" htmlFor="filter-sort">Sort Order</label>
          <div style={styles.selectWrapper}>
            <ArrowUpDown size={16} style={styles.selectIcon} />
            <select
              id="filter-sort"
              className="form-select"
              style={styles.select}
              value={filters.sort || 'newest'}
              onChange={(e) => updateFilter('sort', e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical (Topic)</option>
            </select>
          </div>
        </div>

        {/* Platform Pills */}
        <div className="form-group">
          <label className="form-label">Platform</label>
          <div style={styles.pillsContainer}>
            <button
              onClick={() => updateFilter('platform', '')}
              style={{
                ...styles.pill,
                ...(!filters.platform ? styles.activePill : {}),
              }}
            >
              All
            </button>
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => updateFilter('platform', p)}
                style={{
                  ...styles.pill,
                  ...(filters.platform?.toLowerCase() === p.toLowerCase() ? styles.activePill : {}),
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Tone Pills */}
        <div className="form-group">
          <label className="form-label">Tone</label>
          <div style={styles.pillsContainer}>
            <button
              onClick={() => updateFilter('tone', '')}
              style={{
                ...styles.pill,
                ...(!filters.tone ? styles.activePill : {}),
              }}
            >
              All
            </button>
            {tones.map((t) => (
              <button
                key={t}
                onClick={() => updateFilter('tone', t)}
                style={{
                  ...styles.pill,
                  ...(filters.tone?.toLowerCase() === t.toLowerCase() ? styles.activePill : {}),
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Favorites Switch */}
        <div style={styles.switchRow} onClick={toggleFavorite}>
          <div style={styles.switchLabelBox}>
            <Star
              size={18}
              fill={filters.favorite === 'true' ? 'var(--color-warning)' : 'transparent'}
              color={filters.favorite === 'true' ? 'var(--color-warning)' : 'var(--text-muted)'}
            />
            <span style={styles.switchLabel}>Favorites Only</span>
          </div>
          <div
            style={{
              ...styles.switch,
              background: filters.favorite === 'true' ? 'var(--color-success)' : 'rgba(0,0,0,0.1)',
            }}
          >
            <div
              style={{
                ...styles.switchHandle,
                transform: filters.favorite === 'true' ? 'translateX(18px)' : 'translateX(0)',
              }}
            />
          </div>
        </div>

        {/* Date Filter */}
        <div className="form-group">
          <label className="form-label">Date Range</label>
          <div style={styles.dateRow}>
            <div style={styles.dateInputWrapper}>
              <Calendar size={14} style={styles.dateIcon} />
              <input
                type="date"
                className="form-input"
                style={styles.dateInput}
                value={filters.startDate || ''}
                onChange={(e) => updateFilter('startDate', e.target.value)}
                aria-label="Start date"
              />
            </div>
            <span style={styles.dateRangeSeparator}>to</span>
            <div style={styles.dateInputWrapper}>
              <Calendar size={14} style={styles.dateIcon} />
              <input
                type="date"
                className="form-input"
                style={styles.dateInput}
                value={filters.endDate || ''}
                onChange={(e) => updateFilter('endDate', e.target.value)}
                aria-label="End date"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  outerContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  mobileToggleBtn: {
    display: 'none', // Overwritten by CSS responsive logic or dynamic JS
    marginBottom: '16px',
    width: '100%',
    justifyContent: 'center',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    paddingBottom: '12px',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  clearBtn: {
    border: 'none',
    background: 'transparent',
    color: 'var(--color-primary)',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '6px',
    transition: 'background var(--transition-fast)',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted)',
  },
  searchInput: {
    width: '100%',
    paddingLeft: '38px',
    fontSize: '0.9rem',
    paddingTop: '10px',
    paddingBottom: '10px',
  },
  selectWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  selectIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  select: {
    width: '100%',
    paddingLeft: '36px',
    fontSize: '0.9rem',
    paddingTop: '10px',
    paddingBottom: '10px',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '14px',
  },
  pillsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  pill: {
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid rgba(0,0,0,0.06)',
    background: 'rgba(255, 255, 255, 0.4)',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.82rem',
    fontWeight: '550',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  activePill: {
    background: 'var(--color-primary-gradient)',
    color: '#ffffff',
    borderColor: 'transparent',
    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.15)',
  },
  switchRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  switchLabelBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  switchLabel: {
    fontFamily: 'var(--font-heading)',
    fontSize: '0.88rem',
    fontWeight: '550',
    color: 'var(--text-secondary)',
  },
  switch: {
    width: '38px',
    height: '20px',
    borderRadius: '10px',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    transition: 'background var(--transition-fast)',
  },
  switchHandle: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform var(--transition-fast)',
  },
  dateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  dateInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  dateIcon: {
    position: 'absolute',
    left: '10px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  dateInput: {
    width: '100%',
    padding: '8px 6px 8px 30px',
    fontSize: '0.78rem',
    lineHeight: '1.2',
  },
  dateRangeSeparator: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  }
};
