import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import PostGenerator from '../components/PostGenerator';
import FilterSidebar from '../components/FilterSidebar';
import PostCard from '../components/PostCard';
import { Sparkles, MessageSquare, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filtering state
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 6, // 6 posts per page for better layout grid
    sort: 'newest',
    keyword: '',
    platform: '',
    tone: '',
    favorite: '',
    startDate: '',
    endDate: '',
  });

  // Fetch posts from API
  const fetchPosts = useCallback(async (currentFilters) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getPosts(currentFilters);
      if (res.success && res.data) {
        setPosts(res.data.posts || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      } else {
        throw new Error(res.message || 'Failed to fetch posts');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to the server. Make sure MongoDB and backend are running.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search and filter updates
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPosts(filters);
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [filters, fetchPosts]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    // Reset to page 1 when criteria changes
    setFilters({ ...newFilters, page: 1 });
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 6,
      sort: 'newest',
      keyword: '',
      platform: '',
      tone: '',
      favorite: '',
      startDate: '',
      endDate: '',
    });
  };

  // Change page
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // When a new post is generated, we prepend it locally and reload or reset filters
  const handlePostGenerated = (newPost) => {
    // Show new post instantly at top
    setPosts((prev) => [newPost, ...prev.slice(0, filters.limit - 1)]);
    setPagination((prev) => ({
      ...prev,
      total: prev.total + 1,
      // Recalculate pages if needed
      pages: Math.ceil((prev.total + 1) / filters.limit) || 1
    }));
    // Alternatively, reload posts
    // fetchPosts(filters);
  };

  // Handlers for individual PostCard actions
  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
    // Refetch the current page to fill empty slots
    fetchPosts(filters);
  };

  return (
    <div style={styles.container}>
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div style={styles.layoutGrid}>
        {/* Sidebar Filters */}
        <aside style={styles.sidebarSection}>
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </aside>

        {/* Main Content: Post Creator + Post Grid */}
        <main style={styles.contentSection}>
          <PostGenerator onPostGenerated={handlePostGenerated} />

          {error && (
            <div className="glass-container" style={styles.errorBox}>
              <AlertCircle size={20} color="var(--color-danger)" />
              <div style={styles.errorDetails}>
                <h4 style={{ color: 'var(--color-danger)' }}>Connection Error</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{error}</p>
              </div>
            </div>
          )}

          {/* Posts Grid Header */}
          <div style={styles.postsHeader}>
            <h2 style={styles.sectionTitle}>Your Generated Posts</h2>
            {!loading && (
              <span style={styles.resultsCount}>
                {pagination.total} {pagination.total === 1 ? 'post' : 'posts'} found
              </span>
            )}
          </div>

          {/* Listing Section */}
          {loading ? (
            <div style={styles.postsGrid}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-container shimmer" style={styles.skeletonCard}>
                  <div style={styles.skeletonHeader}>
                    <div style={styles.skeletonBadge}></div>
                    <div style={styles.skeletonBadge}></div>
                  </div>
                  <div style={styles.skeletonTitle}></div>
                  <div style={styles.skeletonLine}></div>
                  <div style={styles.skeletonLine}></div>
                  <div style={styles.skeletonLineShort}></div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="glass-container" style={styles.emptyState}>
              <div style={styles.emptyIconBox}>
                <Sparkles size={32} color="var(--color-primary-light)" />
              </div>
              <h3 style={styles.emptyTitle}>No posts created yet</h3>
              <p style={styles.emptyText}>
                Use the AI craft tool above to generate your first professional social media post!
              </p>
              {Object.values(filters).some((v) => v !== '' && v !== 1 && v !== 6 && v !== 'newest') && (
                <button onClick={handleClearFilters} className="btn btn-secondary" style={{ marginTop: '12px' }}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div style={styles.postsGrid}>
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onPostUpdated={handlePostUpdated}
                    onPostDeleted={handlePostDeleted}
                  />
                ))}
              </div>

              {/* Pagination Section */}
              {pagination.pages > 1 && (
                <div style={styles.pagination}>
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    style={styles.pagBtn}
                    className="btn btn-secondary"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span style={styles.pagInfo}>
                    Page <strong>{filters.page}</strong> of {pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page === pagination.pages}
                    style={styles.pagBtn}
                    className="btn btn-secondary"
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    animation: 'fadeIn 0.3s ease-out',
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  sidebarSection: {
    position: 'sticky',
    top: '80px',
  },
  contentSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  errorBox: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
    background: 'rgba(244, 63, 94, 0.08)',
    border: '1px solid rgba(244, 63, 94, 0.15)',
    padding: '16px 20px',
    marginBottom: '16px',
  },
  errorDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  postsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '12px 0 8px 0',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  resultsCount: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: '550',
  },
  postsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
  },
  skeletonCard: {
    height: '240px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  skeletonHeader: {
    display: 'flex',
    gap: '8px',
  },
  skeletonBadge: {
    width: '60px',
    height: '18px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.4)',
  },
  skeletonTitle: {
    width: '70%',
    height: '22px',
    borderRadius: '4px',
    background: 'rgba(255,255,255,0.4)',
    marginTop: '6px',
  },
  skeletonLine: {
    width: '100%',
    height: '14px',
    borderRadius: '4px',
    background: 'rgba(255,255,255,0.3)',
  },
  skeletonLineShort: {
    width: '45%',
    height: '14px',
    borderRadius: '4px',
    background: 'rgba(255,255,255,0.3)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
    background: 'rgba(255,255,255,0.25)',
  },
  emptyIconBox: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'rgba(99, 102, 241, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    maxWidth: '360px',
    lineHeight: '1.5',
    marginBottom: '12px',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '24px',
  },
  pagBtn: {
    padding: '8px',
    borderRadius: '50%',
  },
  pagInfo: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  }
};
