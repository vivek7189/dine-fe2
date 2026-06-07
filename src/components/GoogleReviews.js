'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../lib/api';
import {
  FaStar,
  FaQrcode,
  FaRobot,
  FaEdit,
  FaDownload,
  FaCopy,
  FaCheck,
  FaGoogle,
  FaSpinner,
  FaLink,
  FaCog,
  FaFilter,
  FaReply,
  FaTrash,
  FaPrint,
  FaChartLine,
  FaEnvelope,
  FaExternalLinkAlt
} from 'react-icons/fa';

export default function GoogleReviews({ restaurantId, restaurant }) {
  // Sub-tab navigation
  const [activeSubTab, setActiveSubTab] = useState('reviews');

  // Settings state
  const [settings, setSettings] = useState({
    googleReviewUrl: '',
    aiEnabled: true,
    customMessage: '',
    qrCodeUrl: null,
    defaultReplyTone: 'professional'
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState({ connected: false, email: '', connectedAt: null });
  const [filters, setFilters] = useState({ rating: null, replied: null, sort: 'latest' });
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyTone, setReplyTone] = useState('professional');
  const [generatingReply, setGeneratingReply] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [reviewSource, setReviewSource] = useState('none');
  const [stats, setStats] = useState({ avg: 0, total: 0, responseRate: 0, newThisMonth: 0 });
  const [expandedReviews, setExpandedReviews] = useState(new Set());
  const [editingReplyFor, setEditingReplyFor] = useState(null);

  // QR / Collect state
  const [generatingQR, setGeneratingQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedReply, setCopiedReply] = useState(false);

  // Review content generation (Collect tab)
  const [reviewForm, setReviewForm] = useState({
    customerName: '',
    rating: 5,
    reviewText: ''
  });
  const [generatingContent, setGeneratingContent] = useState(false);

  // Responsive
  const [isMobile, setIsMobile] = useState(false);

  // Refs
  const refreshIntervalRef = useRef(null);

  // ─── Responsive ───
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ─── Initial load ───
  useEffect(() => {
    if (restaurantId) {
      loadSettings();
      checkAuthStatus();
      fetchReviews();
    }
  }, [restaurantId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Auto-refresh reviews every 15 minutes ───
  useEffect(() => {
    if (restaurantId) {
      refreshIntervalRef.current = setInterval(() => {
        fetchReviews(true);
      }, 15 * 60 * 1000);
      return () => clearInterval(refreshIntervalRef.current);
    }
  }, [restaurantId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Detect OAuth callback ───
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('connected') === 'true') {
        checkAuthStatus();
        fetchReviews();
        // Clean URL
        const url = new URL(window.location);
        url.searchParams.delete('connected');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── API Calls ───
  const loadSettings = async () => {
    if (!restaurantId) return;
    try {
      setSettingsLoading(true);
      const response = await apiClient.getGoogleReviewSettings(restaurantId);
      if (response.success && response.settings) {
        setSettings(prev => ({ ...prev, ...response.settings }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    if (!restaurantId) return;
    try {
      const response = await apiClient.getGoogleAuthStatus(restaurantId);
      if (response.success) {
        setAuthStatus({
          connected: response.connected || false,
          email: response.email || '',
          connectedAt: response.connectedAt || null
        });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const fetchReviews = async (silent = false) => {
    if (!restaurantId) return;
    try {
      if (!silent) setReviewsLoading(true);
      const response = await apiClient.getGoogleReviews(restaurantId, { pageSize: 50 });
      if (response.success) {
        const fetchedReviews = response.reviews || [];
        setReviews(fetchedReviews);
        setReviewSource(response.source || (fetchedReviews.length > 0 ? 'places' : 'none'));
        computeStats(fetchedReviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      if (!silent) setReviewsLoading(false);
    }
  };

  const computeStats = (reviewsList) => {
    if (!reviewsList || reviewsList.length === 0) {
      setStats({ avg: 0, total: 0, responseRate: 0, newThisMonth: 0 });
      return;
    }
    const total = reviewsList.length;
    const avg = reviewsList.reduce((sum, r) => sum + (r.rating || 0), 0) / total;
    const replied = reviewsList.filter(r => r.reply && r.reply.comment).length;
    const responseRate = total > 0 ? Math.round((replied / total) * 100) : 0;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = reviewsList.filter(r => {
      const reviewDate = new Date(r.createTime || r.time);
      return reviewDate >= startOfMonth;
    }).length;
    setStats({ avg: Math.round(avg * 10) / 10, total, responseRate, newThisMonth });
  };

  const saveSettings = async () => {
    if (!restaurantId) return;
    try {
      setSettingsLoading(true);
      await apiClient.updateGoogleReviewSettings(restaurantId, settings);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
      if (settings.googleReviewUrl && !settings.qrCodeUrl) {
        generateQRCode();
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings: ' + (error.message || 'Unknown error'));
    } finally {
      setSettingsLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!settings.googleReviewUrl) {
      alert('Please enter a Google Review URL first');
      return;
    }
    try {
      setGeneratingQR(true);
      const response = await apiClient.generateQRCode(restaurantId, settings.googleReviewUrl);
      if (response.success) {
        setSettings(prev => ({ ...prev, qrCodeUrl: response.qrCodeUrl }));
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code: ' + (error.message || 'Unknown error'));
    } finally {
      setGeneratingQR(false);
    }
  };

  const connectGoogleAccount = async () => {
    try {
      const response = await apiClient.getGoogleAuthUrl(restaurantId);
      if (response.success && response.url) {
        window.location.href = response.url;
      } else {
        alert('Failed to get Google auth URL. Please try again.');
      }
    } catch (error) {
      console.error('Error getting auth URL:', error);
      alert('Failed to connect Google account: ' + (error.message || 'Unknown error'));
    }
  };

  const disconnectGoogleAccount = async () => {
    if (!confirm('Are you sure you want to disconnect your Google Business Profile? You will no longer be able to reply to reviews directly.')) return;
    try {
      await apiClient.disconnectGoogleAccount(restaurantId);
      setAuthStatus({ connected: false, email: '', connectedAt: null });
      fetchReviews();
    } catch (error) {
      console.error('Error disconnecting:', error);
      alert('Failed to disconnect: ' + (error.message || 'Unknown error'));
    }
  };

  const handleReply = (reviewId, existingReply) => {
    setReplyingTo(reviewId);
    setReplyText(existingReply || '');
    setEditingReplyFor(existingReply ? reviewId : null);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
    setEditingReplyFor(null);
  };

  const generateAIReply = async (review) => {
    try {
      setGeneratingReply(true);
      const response = await apiClient.generateGoogleReviewReply(restaurantId, {
        reviewText: review.text || review.comment || '',
        reviewerName: review.authorName || review.reviewer?.displayName || 'Customer',
        rating: review.rating,
        tone: replyTone,
        restaurantName: restaurant?.name || ''
      });
      if (response.success && response.reply) {
        setReplyText(response.reply);
      }
    } catch (error) {
      console.error('Error generating reply:', error);
      alert('Failed to generate reply: ' + (error.message || 'Unknown error'));
    } finally {
      setGeneratingReply(false);
    }
  };

  const sendReply = async (reviewId) => {
    if (!replyText.trim()) return;
    try {
      setSendingReply(true);
      await apiClient.replyToGoogleReview(restaurantId, reviewId, replyText.trim());
      // Update local state
      setReviews(prev => prev.map(r => {
        if ((r.reviewId || r.id) === reviewId) {
          return { ...r, reply: { comment: replyText.trim(), updateTime: new Date().toISOString() } };
        }
        return r;
      }));
      cancelReply();
      computeStats(reviews);
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply: ' + (error.message || 'Unknown error'));
    } finally {
      setSendingReply(false);
    }
  };

  const deleteReply = async (reviewId) => {
    if (!confirm('Delete this reply?')) return;
    try {
      await apiClient.deleteGoogleReviewReply(restaurantId, reviewId);
      setReviews(prev => prev.map(r => {
        if ((r.reviewId || r.id) === reviewId) {
          return { ...r, reply: null };
        }
        return r;
      }));
      computeStats(reviews);
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('Failed to delete reply: ' + (error.message || 'Unknown error'));
    }
  };

  const generateReviewContent = async () => {
    if (!settings.aiEnabled || !reviewForm.customerName) return;
    try {
      setGeneratingContent(true);
      const response = await apiClient.generateReviewContent(
        restaurantId,
        reviewForm.customerName,
        reviewForm.rating
      );
      if (response.success) {
        setReviewForm(prev => ({ ...prev, reviewText: response.reviewContent }));
      }
    } catch (error) {
      console.error('Error generating review content:', error);
      alert('Failed to generate review content: ' + (error.message || 'Unknown error'));
    } finally {
      setGeneratingContent(false);
    }
  };

  // ─── Helpers ───
  const copyToClipboard = (text, type = 'default') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'reply') {
        setCopiedReply(true);
        setTimeout(() => setCopiedReply(false), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    });
  };

  const downloadQRCode = () => {
    if (!settings.qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = settings.qrCodeUrl;
    link.download = `google-review-qr-${restaurantId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQRCode = () => {
    if (!settings.qrCodeUrl) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Google Review QR Code - ${restaurant?.name || 'Restaurant'}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:Arial,sans-serif;margin:0;padding:40px;">
          <h2 style="margin-bottom:8px;color:#1f2937;">${restaurant?.name || 'Restaurant'}</h2>
          <p style="color:#6b7280;margin-bottom:24px;font-size:16px;">Scan to leave us a Google Review</p>
          <img src="${settings.qrCodeUrl}" style="width:300px;height:300px;" />
          ${settings.customMessage ? `<p style="margin-top:24px;color:#374151;text-align:center;max-width:400px;font-size:14px;">${settings.customMessage}</p>` : ''}
          <p style="margin-top:32px;color:#9ca3af;font-size:12px;">Powered by DineOpen</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 300);
  };

  const constructGoogleReviewUrl = (input) => {
    if (!input) return '';
    if (input.includes('writereview') || input.includes('placeid=')) return input;
    if (input.startsWith('http')) {
      const placeIdMatch = input.match(/place\/([^\/]+)/) || input.match(/placeid=([^&]+)/);
      if (placeIdMatch) return `https://search.google.com/local/writereview?placeid=${placeIdMatch[1]}`;
      if (input.includes('g.page')) return input;
      return input;
    }
    if (input.length > 20 && !input.includes('/') && !input.includes('?')) {
      return `https://search.google.com/local/writereview?placeid=${input}`;
    }
    return '';
  };

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
  };

  const getStarColor = (rating) => {
    if (rating >= 4) return '#FFC107';
    if (rating === 3) return '#FF9800';
    return '#F44336';
  };

  const renderStars = (rating, size = 14) => {
    const color = getStarColor(rating);
    return (
      <span style={{ display: 'inline-flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <FaStar key={i} size={size} style={{ color: i <= rating ? color : '#e0e0e0' }} />
        ))}
      </span>
    );
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  // ─── Filtered reviews ───
  const getFilteredReviews = () => {
    let filtered = [...reviews];
    if (filters.rating) {
      filtered = filtered.filter(r => r.rating === filters.rating);
    }
    if (filters.replied === 'replied') {
      filtered = filtered.filter(r => r.reply && r.reply.comment);
    } else if (filters.replied === 'unreplied') {
      filtered = filtered.filter(r => !r.reply || !r.reply.comment);
    }
    filtered.sort((a, b) => {
      const dateA = new Date(a.createTime || a.time || 0);
      const dateB = new Date(b.createTime || b.time || 0);
      switch (filters.sort) {
        case 'oldest': return dateA - dateB;
        case 'highest': return (b.rating || 0) - (a.rating || 0);
        case 'lowest': return (a.rating || 0) - (b.rating || 0);
        default: return dateB - dateA;
      }
    });
    return filtered;
  };

  // ─── Styles ───
  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: isMobile ? '20px' : '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  };

  const pillStyle = (active) => ({
    padding: '6px 14px',
    borderRadius: '20px',
    border: active ? 'none' : '1px solid #e5e7eb',
    backgroundColor: active ? '#4285F4' : 'white',
    color: active ? 'white' : '#374151',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap'
  });

  const primaryBtnStyle = (disabled) => ({
    padding: '10px 20px',
    background: disabled ? '#9ca3af' : 'linear-gradient(135deg, #4285F4, #1a73e8)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  });

  const secondaryBtnStyle = {
    padding: '10px 20px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  };

  // ═══════════════════════════════════════════
  // ─── TAB 1: REVIEWS ───
  // ═══════════════════════════════════════════
  const renderReviewsTab = () => {
    const filteredReviews = getFilteredReviews();

    return (
      <div>
        {/* Stats Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Average Rating */}
          <div style={{ ...cardStyle, textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#1f2937', marginBottom: '4px' }}>
              {stats.avg > 0 ? stats.avg.toFixed(1) : '--'}
            </div>
            <div style={{ marginBottom: '4px' }}>{stats.avg > 0 ? renderStars(Math.round(stats.avg), 16) : renderStars(0, 16)}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Average Rating</div>
          </div>
          {/* Total Reviews */}
          <div style={{ ...cardStyle, textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#1f2937', marginBottom: '4px' }}>
              {stats.total}
            </div>
            <div style={{ marginBottom: '4px' }}>
              <FaChartLine size={16} style={{ color: '#4285F4' }} />
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Total Reviews</div>
          </div>
          {/* Response Rate */}
          <div style={{ ...cardStyle, textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#1f2937', marginBottom: '4px' }}>
              {stats.responseRate}%
            </div>
            <div style={{ marginBottom: '4px' }}>
              <FaReply size={16} style={{ color: '#34A853' }} />
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Response Rate</div>
          </div>
          {/* New This Month */}
          <div style={{ ...cardStyle, textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#1f2937', marginBottom: '4px' }}>
              {stats.newThisMonth}
            </div>
            <div style={{ marginBottom: '4px' }}>
              <FaEnvelope size={16} style={{ color: '#FBBC05' }} />
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>New This Month</div>
          </div>
        </div>

        {/* Connection Banner */}
        {!authStatus.connected ? (
          <div style={{
            ...cardStyle,
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            border: '1px solid #93c5fd',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaGoogle size={20} style={{ color: '#4285F4' }} />
              <div>
                <div style={{ fontWeight: '600', color: '#1e40af', fontSize: '14px' }}>
                  Connect your Google Business Profile to see all reviews and reply directly
                </div>
                <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '2px' }}>
                  View full review history, respond to customers, and track analytics
                </div>
              </div>
            </div>
            <button onClick={connectGoogleAccount} style={primaryBtnStyle(false)}>
              <FaGoogle size={14} />
              Connect Google Account
            </button>
          </div>
        ) : (
          <div style={{
            ...cardStyle,
            background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
            border: '1px solid #6ee7b7',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: '#34A853', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px'
              }}>
                <FaCheck size={16} />
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#065f46', fontSize: '14px' }}>
                  Connected as {authStatus.email}
                </div>
                {authStatus.connectedAt && (
                  <div style={{ fontSize: '12px', color: '#059669', marginTop: '2px' }}>
                    Connected {getRelativeTime(authStatus.connectedAt)}
                  </div>
                )}
              </div>
            </div>
            <button onClick={disconnectGoogleAccount} style={{
              ...secondaryBtnStyle,
              backgroundColor: 'white',
              color: '#dc2626',
              borderColor: '#fca5a5'
            }}>
              Disconnect
            </button>
          </div>
        )}

        {/* Places API notice */}
        {reviewSource === 'places' && (
          <div style={{
            ...cardStyle,
            background: '#fffbeb',
            border: '1px solid #fcd34d',
            marginBottom: '24px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13px',
            color: '#92400e'
          }}>
            <FaFilter size={14} style={{ flexShrink: 0 }} />
            <span>
              Showing up to 5 recent reviews via Google Places. Connect your Google Business Profile for full review history.
            </span>
          </div>
        )}

        {/* Filter Bar */}
        {reviews.length > 0 && (
          <div style={{
            ...cardStyle,
            marginBottom: '24px',
            padding: '16px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '16px',
              alignItems: isMobile ? 'flex-start' : 'center',
              flexWrap: 'wrap'
            }}>
              {/* Rating filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Rating:</span>
                <button onClick={() => setFilters(f => ({ ...f, rating: null }))} style={pillStyle(!filters.rating)}>
                  All
                </button>
                {[5, 4, 3, 2, 1].map(r => (
                  <button key={r} onClick={() => setFilters(f => ({ ...f, rating: r }))} style={pillStyle(filters.rating === r)}>
                    {r}<FaStar size={10} style={{ marginLeft: '2px' }} />
                  </button>
                ))}
              </div>

              {/* Status filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Status:</span>
                <button onClick={() => setFilters(f => ({ ...f, replied: null }))} style={pillStyle(!filters.replied)}>
                  All
                </button>
                <button onClick={() => setFilters(f => ({ ...f, replied: 'replied' }))} style={pillStyle(filters.replied === 'replied')}>
                  Replied
                </button>
                <button onClick={() => setFilters(f => ({ ...f, replied: 'unreplied' }))} style={pillStyle(filters.replied === 'unreplied')}>
                  Unreplied
                </button>
              </div>

              {/* Sort */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: isMobile ? '0' : 'auto' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Sort:</span>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters(f => ({ ...f, sort: e.target.value }))}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#374151',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Review Cards */}
        {reviewsLoading ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '60px 20px' }}>
            <FaSpinner size={32} style={{ color: '#4285F4', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Loading reviews...</div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '60px 20px' }}>
            <FaStar size={48} style={{ color: '#e5e7eb', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              {reviews.length === 0 && !authStatus.connected
                ? 'Connect your Google Business Profile to see your reviews'
                : reviews.length === 0 && authStatus.connected
                  ? 'No reviews found. Share your QR code to start collecting reviews!'
                  : 'No reviews match your filters'}
            </h3>
            {reviews.length === 0 && !authStatus.connected && (
              <button onClick={connectGoogleAccount} style={{ ...primaryBtnStyle(false), marginTop: '16px' }}>
                <FaGoogle size={14} />
                Connect Google Account
              </button>
            )}
            {reviews.length === 0 && authStatus.connected && (
              <button onClick={() => setActiveSubTab('collect')} style={{ ...primaryBtnStyle(false), marginTop: '16px' }}>
                <FaQrcode size={14} />
                Get QR Code
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredReviews.map((review) => {
              const reviewId = review.reviewId || review.id;
              const authorName = review.authorName || review.reviewer?.displayName || 'Anonymous';
              const avatar = review.profilePhotoUrl || review.reviewer?.profilePhotoUrl;
              const reviewText = review.text || review.comment || '';
              const isExpanded = expandedReviews.has(reviewId);
              const isLong = reviewText.length > 200;
              const hasReply = review.reply && review.reply.comment;
              const isReplying = replyingTo === reviewId;

              return (
                <div key={reviewId} style={cardStyle}>
                  {/* Review Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                    {/* Avatar */}
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={authorName}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      backgroundColor: '#e5e7eb', display: avatar ? 'none' : 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontWeight: '700', fontSize: '16px', color: '#6b7280', flexShrink: 0
                    }}>
                      {getInitials(authorName)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '15px' }}>{authorName}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        {renderStars(review.rating)}
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                          {getRelativeTime(review.createTime || review.time)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Review Text */}
                  {reviewText && (
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{
                        fontSize: '14px', color: '#374151', lineHeight: '1.7', margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: isExpanded ? 'unset' : 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: isExpanded ? 'visible' : 'hidden'
                      }}>
                        {reviewText}
                      </p>
                      {isLong && (
                        <button
                          onClick={() => {
                            setExpandedReviews(prev => {
                              const next = new Set(prev);
                              if (next.has(reviewId)) next.delete(reviewId);
                              else next.add(reviewId);
                              return next;
                            });
                          }}
                          style={{
                            background: 'none', border: 'none', color: '#4285F4',
                            fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                            padding: '4px 0', marginTop: '4px'
                          }}
                        >
                          {isExpanded ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Existing Reply */}
                  {hasReply && !isReplying && (
                    <div style={{
                      backgroundColor: '#f9fafb', borderRadius: '12px', padding: '16px',
                      marginBottom: '12px', borderLeft: '3px solid #4285F4'
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                          Owner response
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleReply(reviewId, review.reply.comment)}
                            style={{
                              background: 'none', border: 'none', color: '#4285F4',
                              cursor: 'pointer', display: 'flex', alignItems: 'center',
                              gap: '4px', fontSize: '12px', fontWeight: '600'
                            }}
                          >
                            <FaEdit size={11} /> Edit
                          </button>
                          <button
                            onClick={() => deleteReply(reviewId)}
                            style={{
                              background: 'none', border: 'none', color: '#dc2626',
                              cursor: 'pointer', display: 'flex', alignItems: 'center',
                              gap: '4px', fontSize: '12px', fontWeight: '600'
                            }}
                          >
                            <FaTrash size={11} /> Delete
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6', margin: 0 }}>
                        {review.reply.comment}
                      </p>
                    </div>
                  )}

                  {/* Reply Button (when no reply and not replying) */}
                  {!hasReply && !isReplying && (
                    <button
                      onClick={() => handleReply(reviewId, '')}
                      style={{
                        ...secondaryBtnStyle,
                        padding: '8px 16px',
                        fontSize: '13px'
                      }}
                    >
                      <FaReply size={12} /> Reply
                    </button>
                  )}

                  {/* Reply Input */}
                  {isReplying && (
                    <div style={{
                      backgroundColor: '#f9fafb', borderRadius: '12px', padding: '16px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        rows={4}
                        style={{
                          width: '100%', padding: '12px', border: '1px solid #e5e7eb',
                          borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit',
                          resize: 'vertical', lineHeight: '1.6', marginBottom: '12px',
                          boxSizing: 'border-box'
                        }}
                      />

                      {/* AI Suggest + Tone */}
                      <div style={{
                        display: 'flex', flexWrap: 'wrap', gap: '8px',
                        alignItems: 'center', marginBottom: '12px'
                      }}>
                        <button
                          onClick={() => generateAIReply(review)}
                          disabled={generatingReply}
                          style={{
                            padding: '8px 14px',
                            background: generatingReply ? '#9ca3af' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            color: 'white', border: 'none', borderRadius: '8px',
                            fontWeight: '600', fontSize: '13px',
                            cursor: generatingReply ? 'not-allowed' : 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '6px'
                          }}
                        >
                          {generatingReply ? (
                            <><FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
                          ) : (
                            <><FaRobot size={12} /> AI Suggest Reply</>
                          )}
                        </button>
                        <select
                          value={replyTone}
                          onChange={(e) => setReplyTone(e.target.value)}
                          style={{
                            padding: '8px 12px', borderRadius: '8px',
                            border: '1px solid #e5e7eb', fontSize: '13px',
                            color: '#374151', backgroundColor: 'white', cursor: 'pointer'
                          }}
                        >
                          <option value="professional">Professional</option>
                          <option value="warm">Warm</option>
                          <option value="apologetic">Apologetic</option>
                          <option value="enthusiastic">Enthusiastic</option>
                        </select>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        {authStatus.connected ? (
                          <button
                            onClick={() => sendReply(reviewId)}
                            disabled={sendingReply || !replyText.trim()}
                            style={primaryBtnStyle(sendingReply || !replyText.trim())}
                          >
                            {sendingReply ? (
                              <><FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</>
                            ) : (
                              <><FaReply size={12} /> Send Reply</>
                            )}
                          </button>
                        ) : null}

                        <button
                          onClick={() => copyToClipboard(replyText, 'reply')}
                          disabled={!replyText.trim()}
                          style={{
                            ...secondaryBtnStyle,
                            padding: '10px 16px',
                            opacity: !replyText.trim() ? 0.5 : 1,
                            cursor: !replyText.trim() ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {copiedReply ? <><FaCheck size={12} /> Copied!</> : <><FaCopy size={12} /> Copy Reply</>}
                        </button>

                        <button onClick={cancelReply} style={{
                          ...secondaryBtnStyle,
                          padding: '10px 16px'
                        }}>
                          Cancel
                        </button>
                      </div>

                      {!authStatus.connected && (
                        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px', marginBottom: 0 }}>
                          Connect your Google account to reply directly, or copy and paste on Google Maps.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════
  // ─── TAB 2: COLLECT REVIEWS ───
  // ═══════════════════════════════════════════
  const renderCollectTab = () => {
    const reviewUrl = constructGoogleReviewUrl(settings.googleReviewUrl);

    return (
      <div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '24px',
          marginBottom: '24px'
        }}>
          {/* QR Code Card */}
          <div style={{
            ...cardStyle,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '20px', alignSelf: 'flex-start'
            }}>
              <FaQrcode size={20} style={{ color: '#4285F4' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>QR Code</h3>
            </div>

            {settings.qrCodeUrl ? (
              <>
                <div style={{
                  padding: '24px', backgroundColor: 'white', borderRadius: '16px',
                  border: '2px solid #e5e7eb', marginBottom: '20px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                  <img
                    src={settings.qrCodeUrl}
                    alt="Google Review QR Code"
                    style={{ width: '220px', height: '220px', display: 'block' }}
                  />
                </div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px', maxWidth: '280px' }}>
                  Share this QR code with customers to collect more reviews
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button onClick={downloadQRCode} style={secondaryBtnStyle}>
                    <FaDownload size={14} /> Download
                  </button>
                  <button onClick={printQRCode} style={secondaryBtnStyle}>
                    <FaPrint size={14} /> Print
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: '40px 20px' }}>
                <FaQrcode size={56} style={{ color: '#d1d5db', marginBottom: '16px' }} />
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                  {settings.googleReviewUrl
                    ? 'Generate a QR code for your Google Review page'
                    : 'Set up your Google Review URL in Settings first'}
                </p>
                {settings.googleReviewUrl && (
                  <button
                    onClick={generateQRCode}
                    disabled={generatingQR}
                    style={primaryBtnStyle(generatingQR)}
                  >
                    {generatingQR ? (
                      <><FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
                    ) : (
                      <><FaQrcode size={14} /> Generate QR Code</>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Share Link Card */}
          <div style={cardStyle}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px'
            }}>
              <FaLink size={18} style={{ color: '#34A853' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>Review Link</h3>
            </div>

            {reviewUrl ? (
              <>
                <div style={{
                  padding: '14px', backgroundColor: '#f9fafb', borderRadius: '10px',
                  border: '1px solid #e5e7eb', marginBottom: '16px',
                  wordBreak: 'break-all', fontSize: '13px', color: '#374151',
                  lineHeight: '1.6'
                }}>
                  {reviewUrl}
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => copyToClipboard(reviewUrl)}
                    style={{
                      ...primaryBtnStyle(false),
                      background: copied ? '#34A853' : 'linear-gradient(135deg, #4285F4, #1a73e8)'
                    }}
                  >
                    {copied ? <><FaCheck size={14} /> Copied!</> : <><FaCopy size={14} /> Copy Link</>}
                  </button>
                  <button
                    onClick={() => window.open(reviewUrl, '_blank')}
                    style={secondaryBtnStyle}
                  >
                    <FaExternalLinkAlt size={12} /> Test Link
                  </button>
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '16px', lineHeight: '1.6' }}>
                  Share this link via SMS, WhatsApp, email, or social media. Clicking it opens the Google Review page directly.
                </p>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <FaLink size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Configure your Google Review URL in Settings to generate a shareable link.
                </p>
                <button
                  onClick={() => setActiveSubTab('settings')}
                  style={{ ...primaryBtnStyle(false), marginTop: '12px' }}
                >
                  <FaCog size={14} /> Go to Settings
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI Review Content Generator */}
        <div style={cardStyle}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px'
          }}>
            <FaRobot size={18} style={{ color: '#8b5cf6' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
              AI Review Assistant
            </h3>
          </div>

          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px', lineHeight: '1.6' }}>
            Help customers write their review by generating a personalized draft they can use as a starting point.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Customer Name
              </label>
              <input
                type="text"
                value={reviewForm.customerName}
                onChange={(e) => setReviewForm(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter customer name"
                style={{
                  width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb',
                  borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Rating
              </label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map(r => (
                  <button
                    key={r}
                    onClick={() => setReviewForm(prev => ({ ...prev, rating: r }))}
                    style={{
                      padding: '8px', backgroundColor: reviewForm.rating >= r ? '#FFC107' : '#f3f4f6',
                      color: reviewForm.rating >= r ? 'white' : '#9ca3af',
                      border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '18px'
                    }}
                  >
                    <FaStar size={18} />
                  </button>
                ))}
                <span style={{ fontSize: '13px', color: '#6b7280', marginLeft: '6px', fontWeight: '600' }}>
                  {reviewForm.rating} Star{reviewForm.rating !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                Generated Review Text
              </label>
              <button
                onClick={generateReviewContent}
                disabled={generatingContent || !reviewForm.customerName || !settings.aiEnabled}
                style={{
                  padding: '6px 14px',
                  background: (generatingContent || !reviewForm.customerName || !settings.aiEnabled)
                    ? '#9ca3af'
                    : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white', border: 'none', borderRadius: '8px',
                  fontWeight: '600', fontSize: '12px',
                  cursor: (generatingContent || !reviewForm.customerName || !settings.aiEnabled) ? 'not-allowed' : 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '6px'
                }}
              >
                {generatingContent ? (
                  <><FaSpinner size={11} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
                ) : (
                  <><FaRobot size={11} /> AI Generate</>
                )}
              </button>
            </div>
            <textarea
              value={reviewForm.reviewText}
              onChange={(e) => setReviewForm(prev => ({ ...prev, reviewText: e.target.value }))}
              placeholder={settings.aiEnabled
                ? "Click 'AI Generate' to create review content, or type your own..."
                : "AI generation is disabled. Enable it in Settings."}
              rows={5}
              style={{
                width: '100%', padding: '12px', border: '1px solid #e5e7eb',
                borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit',
                resize: 'vertical', lineHeight: '1.6', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                if (reviewForm.reviewText) copyToClipboard(reviewForm.reviewText);
              }}
              disabled={!reviewForm.reviewText}
              style={{
                ...secondaryBtnStyle,
                opacity: !reviewForm.reviewText ? 0.5 : 1,
                cursor: !reviewForm.reviewText ? 'not-allowed' : 'pointer'
              }}
            >
              <FaCopy size={14} /> Copy Review Text
            </button>
            <button
              onClick={() => {
                const url = constructGoogleReviewUrl(settings.googleReviewUrl);
                if (url) window.open(url, '_blank');
                else alert('Please configure Google Review URL in Settings');
              }}
              style={primaryBtnStyle(!settings.googleReviewUrl)}
            >
              <FaGoogle size={14} /> Open Google Review Page
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════
  // ─── TAB 3: SETTINGS ───
  // ═══════════════════════════════════════════
  const renderSettingsTab = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Google Account Connection */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <FaGoogle size={20} style={{ color: '#4285F4' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
              Google Business Profile Connection
            </h3>
          </div>

          {!authStatus.connected ? (
            <>
              <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7', marginBottom: '20px' }}>
                Connect your Google Business Profile to unlock the full power of review management:
              </p>
              <ul style={{ margin: '0 0 24px 0', paddingLeft: '20px', color: '#374151', fontSize: '14px', lineHeight: '2' }}>
                <li>View your complete review history (not just the latest 5)</li>
                <li>Reply to reviews directly from this dashboard</li>
                <li>Track response rates and analytics</li>
              </ul>
              <button
                onClick={connectGoogleAccount}
                style={{
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, #4285F4, #1a73e8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 14px rgba(66,133,244,0.3)'
                }}
              >
                <FaGoogle size={18} />
                Connect Google Business Profile
              </button>
            </>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '20px',
              backgroundColor: '#ecfdf5',
              borderRadius: '12px',
              border: '1px solid #a7f3d0'
            }}>
              <div>
                <div style={{ fontWeight: '600', color: '#065f46', fontSize: '15px', marginBottom: '4px' }}>
                  Connected as {authStatus.email}
                </div>
                {authStatus.connectedAt && (
                  <div style={{ fontSize: '13px', color: '#059669' }}>
                    Connected since {new Date(authStatus.connectedAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </div>
                )}
              </div>
              <button onClick={disconnectGoogleAccount} style={{
                padding: '10px 20px',
                backgroundColor: 'white',
                color: '#dc2626',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Google Place ID / URL */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <FaLink size={18} style={{ color: '#34A853' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
              Google Review URL / Place ID
            </h3>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Google Review URL or Place ID
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={settings.googleReviewUrl}
                onChange={(e) => setSettings(prev => ({ ...prev, googleReviewUrl: e.target.value }))}
                placeholder="Enter Place ID or Google Maps URL"
                style={{
                  flex: 1, padding: '12px', border: '1px solid #e5e7eb',
                  borderRadius: '8px', fontSize: '14px'
                }}
              />
              <button
                onClick={() => {
                  const url = constructGoogleReviewUrl(settings.googleReviewUrl);
                  if (url) window.open(url, '_blank');
                  else alert('Please enter a valid Place ID or Google Maps URL');
                }}
                style={primaryBtnStyle(!settings.googleReviewUrl)}
              >
                <FaExternalLinkAlt size={12} /> Test
              </button>
            </div>
          </div>

          <div style={{
            padding: '14px', backgroundColor: '#eff6ff', borderRadius: '10px',
            border: '1px solid #bfdbfe'
          }}>
            <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e40af', marginBottom: '8px', marginTop: 0 }}>
              How to find your Place ID
            </h4>
            <ol style={{ fontSize: '12px', color: '#1e3a8a', margin: 0, paddingLeft: '18px', lineHeight: '2' }}>
              <li>Go to <strong>Google Maps</strong> and search for your business</li>
              <li>Click on your business listing</li>
              <li>The Place ID is in the URL (e.g., ChIJN1t_tDeuEmsRUsoyG83frY4)</li>
              <li>Or copy the full Google Maps URL and paste it here</li>
              <li>You can also use the <a href="https://developers.google.com/maps/documentation/places/web-service/place-id-finder" target="_blank" rel="noopener noreferrer" style={{ color: '#4285F4' }}>Place ID Finder</a></li>
            </ol>
          </div>
        </div>

        {/* AI Settings */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <FaRobot size={18} style={{ color: '#8b5cf6' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
              AI Settings
            </h3>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              fontSize: '14px', fontWeight: '600', color: '#374151', cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={settings.aiEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, aiEnabled: e.target.checked }))}
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#8b5cf6' }}
              />
              Enable AI Review Generation
            </label>
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px', marginLeft: '32px' }}>
              AI will generate review content for customers and reply suggestions for you
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Default Reply Tone
            </label>
            <select
              value={settings.defaultReplyTone || 'professional'}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultReplyTone: e.target.value }))}
              style={{
                padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb',
                fontSize: '14px', color: '#374151', backgroundColor: 'white',
                cursor: 'pointer', minWidth: '200px'
              }}
            >
              <option value="professional">Professional</option>
              <option value="warm">Warm</option>
              <option value="apologetic">Apologetic</option>
              <option value="enthusiastic">Enthusiastic</option>
            </select>
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
              This sets the default tone when generating AI reply suggestions
            </p>
          </div>

          {/* Custom Message */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Custom QR Code Message (Optional)
            </label>
            <textarea
              value={settings.customMessage}
              onChange={(e) => setSettings(prev => ({ ...prev, customMessage: e.target.value }))}
              placeholder="Add a custom message to show with QR code..."
              rows={3}
              style={{
                width: '100%', padding: '12px', border: '1px solid #e5e7eb',
                borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit',
                resize: 'vertical', boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={saveSettings}
          disabled={settingsLoading}
          style={{
            ...primaryBtnStyle(settingsLoading),
            padding: '14px 28px',
            fontSize: '15px',
            alignSelf: 'flex-start',
            background: settingsSaved
              ? '#34A853'
              : settingsLoading
                ? '#9ca3af'
                : 'linear-gradient(135deg, #4285F4, #1a73e8)'
          }}
        >
          {settingsLoading ? (
            <><FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
          ) : settingsSaved ? (
            <><FaCheck size={14} /> Saved!</>
          ) : (
            <><FaCog size={14} /> Save Settings</>
          )}
        </button>
      </div>
    );
  };

  // ═══════════════════════════════════════════
  // ─── MAIN RENDER ───
  // ═══════════════════════════════════════════
  const tabs = [
    { id: 'reviews', label: 'Reviews', icon: <FaStar size={14} /> },
    { id: 'collect', label: 'Collect Reviews', icon: <FaQrcode size={14} /> },
    { id: 'settings', label: 'Settings', icon: <FaCog size={14} /> }
  ];

  return (
    <div style={{
      padding: isMobile ? '20px' : '24px',
      backgroundColor: '#fafafa',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '24px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: '16px'
      }}>
        <div>
          <h2 style={{
            fontSize: isMobile ? '24px' : '32px',
            fontWeight: '900',
            color: '#1f2937',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FaGoogle size={28} style={{ color: '#4285F4' }} />
            Google Reviews
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            Manage reviews, collect feedback, and grow your online reputation
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '24px',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '4px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflowX: 'auto'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            style={{
              flex: isMobile ? 1 : 'none',
              padding: isMobile ? '10px 12px' : '10px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeSubTab === tab.id ? '#4285F4' : 'transparent',
              color: activeSubTab === tab.id ? 'white' : '#6b7280',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeSubTab === 'reviews' && renderReviewsTab()}
      {activeSubTab === 'collect' && renderCollectTab()}
      {activeSubTab === 'settings' && renderSettingsTab()}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
