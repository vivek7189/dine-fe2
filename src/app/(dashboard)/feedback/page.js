'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FaClipboardList,
  FaPlus,
  FaEdit,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaChartBar,
  FaCopy,
  FaLink,
  FaQrcode,
  FaWhatsapp,
  FaMagic,
  FaStar,
  FaSmile,
  FaChevronLeft,
  FaChevronRight,
  FaFileExport,
  FaEye,
  FaLightbulb,
  FaTimes,
} from 'react-icons/fa';
import apiClient from '@/lib/api';

const FRONTEND_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : 'https://www.dineopen.com';

const QUESTION_TYPES = [
  { value: 'rating_stars', label: 'Star Rating' },
  { value: 'rating_emoji', label: 'Emoji Rating' },
  { value: 'single_choice', label: 'Single Choice' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'text', label: 'Text Answer' },
  { value: 'nps', label: 'NPS Score (0-10)' },
  { value: 'yes_no', label: 'Yes / No' },
];

const QUESTION_TYPE_MAP = Object.fromEntries(
  QUESTION_TYPES.map((t) => [t.value, t.label])
);

const STATUS_STYLES = {
  draft: {
    background: '#f3f4f6',
    color: '#6b7280',
    label: 'Draft',
  },
  active: {
    background: '#dcfce7',
    color: '#16a34a',
    label: 'Active',
  },
  archived: {
    background: '#fff7ed',
    color: '#ea580c',
    label: 'Archived',
  },
};

const TEMPLATES = [
  {
    id: 'restaurant_dining',
    title: 'Restaurant Dining',
    description: 'Full-service restaurant experience feedback',
    questionCount: 6,
  },
  {
    id: 'quick_service',
    title: 'Quick Service',
    description: 'Fast food and counter service feedback',
    questionCount: 5,
  },
  {
    id: 'bar_pub',
    title: 'Bar & Pub',
    description: 'Bar, pub, and lounge experience feedback',
    questionCount: 5,
  },
  {
    id: 'delivery',
    title: 'Delivery',
    description: 'Food delivery experience feedback',
    questionCount: 5,
  },
  {
    id: 'cafe',
    title: 'Cafe',
    description: 'Coffee shop and cafe experience feedback',
    questionCount: 5,
  },
];

const defaultQuestion = () => ({
  id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type: 'rating_stars',
  title: '',
  options: [],
  required: true,
});

// ─── Main Component ──────────────────────────────────────────────

export default function FeedbackPage() {
  const [restaurantId, setRestaurantId] = useState(null);
  const [view, setView] = useState('list'); // list | editor | analytics
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Editor state
  const [currentForm, setCurrentForm] = useState(null);
  const [editorSaving, setEditorSaving] = useState(false);

  // Template modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);

  // AI generator
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Analytics state
  const [analyticsFormId, setAnalyticsFormId] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [responses, setResponses] = useState([]);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Clipboard copy feedback
  const [copiedId, setCopiedId] = useState(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ─── Init ────────────────────────────────────────────────────

  useEffect(() => {
    const rid = localStorage.getItem('selectedRestaurantId');
    if (rid) {
      setRestaurantId(rid);
    }
  }, []);

  useEffect(() => {
    // Electron is always a desktop POS terminal — never use mobile layout
    if (typeof window !== 'undefined' && window.electronAPI) {
      setIsMobile(false);
      return;
    }
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ─── Fetch forms ─────────────────────────────────────────────

  const fetchForms = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const res = await apiClient.getFeedbackForms(restaurantId);
      setForms(res.forms || []);
    } catch (err) {
      console.error('Failed to fetch feedback forms:', err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  // ─── Helpers ─────────────────────────────────────────────────

  const getFormUrl = (form) =>
    `${FRONTEND_URL}/feedback/${form._id || form.id}`;

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // ─── CRUD ────────────────────────────────────────────────────

  const handleCreateForm = () => {
    setCurrentForm({
      title: '',
      description: '',
      questions: [defaultQuestion()],
      status: 'draft',
      branding: { primaryColor: '#ef4444', thankYouMessage: 'Thank you for your feedback!' },
      distribution: { link: true, qr: false, whatsapp: false },
    });
    setView('editor');
  };

  const handleEditForm = (form) => {
    setCurrentForm({
      ...form,
      branding: form.branding || { primaryColor: '#ef4444', thankYouMessage: 'Thank you for your feedback!' },
      distribution: form.distribution || { link: true, qr: false, whatsapp: false },
      questions: (form.questions || []).map((q) => ({
        ...q,
        id: q.id || q._id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        options: q.options || [],
      })),
    });
    setView('editor');
  };

  const handleDeleteForm = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.deleteFeedbackForm(restaurantId, deleteTarget._id || deleteTarget.id);
      setForms((prev) => prev.filter((f) => (f._id || f.id) !== (deleteTarget._id || deleteTarget.id)));
    } catch (err) {
      console.error('Failed to delete form:', err);
      alert('Failed to delete form. Please try again.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSaveForm = async (status) => {
    if (!currentForm.title.trim()) {
      alert('Please enter a form title.');
      return;
    }
    setEditorSaving(true);
    try {
      const payload = {
        ...currentForm,
        status: status || currentForm.status || 'draft',
      };
      let result;
      if (currentForm._id || currentForm.id) {
        result = await apiClient.updateFeedbackForm(
          restaurantId,
          currentForm._id || currentForm.id,
          payload
        );
      } else {
        result = await apiClient.createFeedbackForm(restaurantId, payload);
      }
      await fetchForms();
      if (result?.form) {
        setCurrentForm(result.form);
      }
      setView('list');
    } catch (err) {
      console.error('Failed to save form:', err);
      alert('Failed to save form. Please try again.');
    } finally {
      setEditorSaving(false);
    }
  };

  // ─── Template handling ───────────────────────────────────────

  const handleSelectTemplate = async (templateId) => {
    setTemplateLoading(true);
    try {
      const res = await apiClient.getFeedbackTemplate(templateId);
      if (res?.template) {
        setCurrentForm((prev) => ({
          ...prev,
          title: prev.title || res.template.title,
          description: prev.description || res.template.description,
          questions: (res.template.questions || []).map((q) => ({
            ...q,
            id: q.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            options: q.options || [],
          })),
        }));
      }
    } catch (err) {
      console.error('Failed to load template:', err);
      alert('Failed to load template. Please try again.');
    } finally {
      setTemplateLoading(false);
      setShowTemplateModal(false);
    }
  };

  // ─── AI generate ─────────────────────────────────────────────

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await apiClient.generateFeedbackFormAI(restaurantId, aiPrompt, '');
      if (res) {
        setCurrentForm((prev) => ({
          ...prev,
          title: res.title || prev.title,
          description: res.description || prev.description,
          questions: (res.questions || []).map((q) => ({
            ...q,
            id: q.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            options: q.options || [],
          })),
        }));
        setAiOpen(false);
        setAiPrompt('');
      }
    } catch (err) {
      console.error('AI generation failed:', err);
      alert('AI generation failed. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // ─── Analytics ───────────────────────────────────────────────

  const openAnalytics = async (form) => {
    const fid = form._id || form.id;
    setAnalyticsFormId(fid);
    setAnalytics(null);
    setResponses([]);
    setInsights(null);
    setView('analytics');
    fetchAnalytics(fid);
    fetchResponses(fid);
  };

  const fetchAnalytics = async (fid) => {
    setAnalyticsLoading(true);
    try {
      const res = await apiClient.getFeedbackAnalytics(restaurantId, fid);
      setAnalytics(res?.analytics || null);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchResponses = async (fid) => {
    setResponsesLoading(true);
    try {
      const res = await apiClient.getFeedbackResponses(restaurantId, {
        formId: fid,
        limit: 20,
      });
      setResponses(res?.responses || []);
    } catch (err) {
      console.error('Failed to fetch responses:', err);
    } finally {
      setResponsesLoading(false);
    }
  };

  const handleGenerateInsights = async () => {
    if (!analyticsFormId) return;
    setInsightsLoading(true);
    try {
      const res = await apiClient.generateFeedbackInsights(restaurantId, analyticsFormId);
      setInsights(res?.insights || null);
    } catch (err) {
      console.error('Failed to generate insights:', err);
      alert('Failed to generate insights. Please try again.');
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!responses.length) return;
    const headers = ['Date', 'Source', 'Sentiment', 'Answers'];
    const rows = responses.map((r) => [
      formatDate(r.createdAt || r.submittedAt),
      r.source || 'link',
      r.sentiment || '—',
      JSON.stringify(r.answers || r.responses || {}),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-responses-${analyticsFormId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Question helpers ────────────────────────────────────────

  const updateQuestion = (idx, updates) => {
    setCurrentForm((prev) => {
      const questions = [...prev.questions];
      questions[idx] = { ...questions[idx], ...updates };
      return { ...prev, questions };
    });
  };

  const removeQuestion = (idx) => {
    setCurrentForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx),
    }));
  };

  const moveQuestion = (idx, dir) => {
    setCurrentForm((prev) => {
      const questions = [...prev.questions];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= questions.length) return prev;
      [questions[idx], questions[newIdx]] = [questions[newIdx], questions[idx]];
      return { ...prev, questions };
    });
  };

  const addQuestion = () => {
    setCurrentForm((prev) => ({
      ...prev,
      questions: [...prev.questions, defaultQuestion()],
    }));
  };

  const addOption = (qIdx) => {
    setCurrentForm((prev) => {
      const questions = [...prev.questions];
      const q = { ...questions[qIdx] };
      q.options = [...(q.options || []), ''];
      questions[qIdx] = q;
      return { ...prev, questions };
    });
  };

  const updateOption = (qIdx, oIdx, value) => {
    setCurrentForm((prev) => {
      const questions = [...prev.questions];
      const q = { ...questions[qIdx] };
      const opts = [...q.options];
      opts[oIdx] = value;
      q.options = opts;
      questions[qIdx] = q;
      return { ...prev, questions };
    });
  };

  const removeOption = (qIdx, oIdx) => {
    setCurrentForm((prev) => {
      const questions = [...prev.questions];
      const q = { ...questions[qIdx] };
      q.options = q.options.filter((_, i) => i !== oIdx);
      questions[qIdx] = q;
      return { ...prev, questions };
    });
  };

  // ─── Render: Loading ─────────────────────────────────────────

  if (!restaurantId) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
        <FaClipboardList style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }} />
        <p style={{ fontSize: '16px' }}>No restaurant selected. Please select a restaurant first.</p>
      </div>
    );
  }

  // ─── Render: List View ───────────────────────────────────────

  const renderList = () => (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827' }}>
          Feedback Forms
        </h1>
        <button
          onClick={handleCreateForm}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <FaPlus /> Create Form
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
          <div style={{ fontSize: '14px' }}>Loading forms...</div>
        </div>
      ) : forms.length === 0 ? (
        /* Empty state */
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <FaClipboardList
            style={{ fontSize: '56px', color: '#d1d5db', marginBottom: '16px' }}
          />
          <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#374151' }}>
            No feedback forms yet
          </h3>
          <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6b7280' }}>
            Create your first feedback form to start collecting customer insights.
          </p>
          <button
            onClick={handleCreateForm}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <FaPlus /> Create your first feedback form
          </button>
        </div>
      ) : (
        /* Form cards grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '16px',
          }}
        >
          {forms.map((form) => {
            const fid = form._id || form.id;
            const status = STATUS_STYLES[form.status] || STATUS_STYLES.draft;
            return (
              <div
                key={fid}
                style={{
                  background: '#fff',
                  borderRadius: '14px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Title row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        margin: '0 0 4px',
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#111827',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {form.title || 'Untitled Form'}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '13px',
                        color: '#6b7280',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {form.description || 'No description'}
                    </p>
                  </div>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: status.background,
                      color: status.color,
                      flexShrink: 0,
                      marginLeft: '8px',
                    }}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Meta row */}
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#9ca3af' }}>
                  <span>{form.responseCount ?? 0} responses</span>
                  <span>{formatDate(form.createdAt)}</span>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '4px',
                    flexWrap: 'wrap',
                  }}
                >
                  <button
                    onClick={() => handleEditForm(form)}
                    style={actionBtnStyle}
                    title="Edit"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => copyToClipboard(getFormUrl(form), fid)}
                    style={actionBtnStyle}
                    title="Copy link"
                  >
                    {copiedId === fid ? (
                      <>Copied!</>
                    ) : (
                      <>
                        <FaCopy /> Copy Link
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => openAnalytics(form)}
                    style={actionBtnStyle}
                    title="Analytics"
                  >
                    <FaChartBar /> Analytics
                  </button>
                  <button
                    onClick={() => setDeleteTarget(form)}
                    style={{ ...actionBtnStyle, color: '#ef4444' }}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ─── Render: Editor View ─────────────────────────────────────

  const renderEditor = () => {
    if (!currentForm) return null;

    const isChoiceType = (type) => type === 'single_choice' || type === 'multiple_choice';

    return (
      <div>
        {/* Back button */}
        <button
          onClick={() => {
            setView('list');
            setCurrentForm(null);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#6b7280',
            padding: '0',
            marginBottom: '20px',
          }}
        >
          <FaChevronLeft /> Back to Forms
        </button>

        <div
          style={{
            display: 'flex',
            gap: '24px',
            flexDirection: isMobile ? 'column' : 'row',
          }}
        >
          {/* ─── Left: Editor ─────────────────────────── */}
          <div style={{ flex: isMobile ? 'unset' : '0 0 60%', minWidth: 0 }}>
            {/* Title & Description */}
            <div style={cardStyle}>
              <label style={labelStyle}>Form Title</label>
              <input
                type="text"
                value={currentForm.title}
                onChange={(e) => setCurrentForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Dining Experience Feedback"
                style={inputStyle}
              />
              <label style={{ ...labelStyle, marginTop: '12px' }}>Description</label>
              <textarea
                value={currentForm.description || ''}
                onChange={(e) => setCurrentForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief description shown at the top of the form"
                rows={2}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* Template + AI row */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '16px',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => setShowTemplateModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  color: '#374151',
                }}
              >
                <FaClipboardList /> Use Template
              </button>
              <button
                onClick={() => setAiOpen(!aiOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: aiOpen ? '#fef3c7' : '#f3f4f6',
                  border: `1px solid ${aiOpen ? '#fbbf24' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  color: '#374151',
                }}
              >
                <FaMagic /> AI Generator
              </button>
            </div>

            {/* AI Generator panel */}
            {aiOpen && (
              <div
                style={{
                  ...cardStyle,
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                }}
              >
                <label style={labelStyle}>
                  Describe your restaurant and what you want to know
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. We're a fine dining Italian restaurant. We want to know about food quality, service speed, ambiance, and likelihood to recommend."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
                <button
                  onClick={handleAIGenerate}
                  disabled={aiLoading || !aiPrompt.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    background:
                      aiLoading || !aiPrompt.trim()
                        ? '#d1d5db'
                        : 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: aiLoading || !aiPrompt.trim() ? 'not-allowed' : 'pointer',
                    marginTop: '10px',
                  }}
                >
                  {aiLoading ? (
                    <>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '14px',
                          height: '14px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: '#fff',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }}
                      />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaMagic /> Generate with AI
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Questions */}
            <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 600, color: '#374151' }}>
              Questions ({currentForm.questions.length})
            </h3>

            {currentForm.questions.map((q, idx) => (
              <div key={q.id || idx} style={{ ...cardStyle, position: 'relative' }}>
                {/* Header row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                  }}
                >
                  {/* Order number / drag handle area */}
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: '#f3f4f6',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#6b7280',
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </span>

                  {/* Type dropdown */}
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(idx, { type: e.target.value })}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '12px',
                      color: '#374151',
                      background: '#fff',
                      cursor: 'pointer',
                      flex: 1,
                      minWidth: '120px',
                    }}
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>

                  {/* Reorder buttons */}
                  <button
                    onClick={() => moveQuestion(idx, -1)}
                    disabled={idx === 0}
                    style={smallBtnStyle(idx === 0)}
                    title="Move up"
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    onClick={() => moveQuestion(idx, 1)}
                    disabled={idx === currentForm.questions.length - 1}
                    style={smallBtnStyle(idx === currentForm.questions.length - 1)}
                    title="Move down"
                  >
                    <FaArrowDown />
                  </button>
                  <button
                    onClick={() => removeQuestion(idx)}
                    style={{
                      ...smallBtnStyle(false),
                      color: '#ef4444',
                    }}
                    title="Delete question"
                  >
                    <FaTrash />
                  </button>
                </div>

                {/* Title */}
                <input
                  type="text"
                  value={q.title}
                  onChange={(e) => updateQuestion(idx, { title: e.target.value })}
                  placeholder="Enter question text"
                  style={inputStyle}
                />

                {/* Options editor for choice types */}
                {isChoiceType(q.type) && (
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ ...labelStyle, fontSize: '11px' }}>Options</label>
                    {(q.options || []).map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        style={{
                          display: 'flex',
                          gap: '6px',
                          marginBottom: '6px',
                          alignItems: 'center',
                        }}
                      >
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOption(idx, oIdx, e.target.value)}
                          placeholder={`Option ${oIdx + 1}`}
                          style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                        />
                        <button
                          onClick={() => removeOption(idx, oIdx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px',
                            fontSize: '12px',
                          }}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addOption(idx)}
                      style={{
                        background: 'none',
                        border: '1px dashed #d1d5db',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        color: '#6b7280',
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      + Add Option
                    </button>
                  </div>
                )}

                {/* Required toggle */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '6px',
                    marginTop: '10px',
                    fontSize: '12px',
                    color: '#6b7280',
                  }}
                >
                  <span>Required</span>
                  <button
                    onClick={() => updateQuestion(idx, { required: !q.required })}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '20px',
                      color: q.required ? '#16a34a' : '#d1d5db',
                      padding: 0,
                      lineHeight: 1,
                    }}
                  >
                    {q.required ? '●' : '○'}
                  </button>
                </div>
              </div>
            ))}

            {/* Add question */}
            <button
              onClick={addQuestion}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px',
                background: '#fff',
                border: '2px dashed #d1d5db',
                borderRadius: '12px',
                fontSize: '14px',
                color: '#6b7280',
                cursor: 'pointer',
                marginBottom: '16px',
              }}
            >
              <FaPlus /> Add Question
            </button>

            {/* Branding */}
            <div style={cardStyle}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                Branding
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Primary Color</label>
                <input
                  type="color"
                  value={currentForm.branding?.primaryColor || '#ef4444'}
                  onChange={(e) =>
                    setCurrentForm((p) => ({
                      ...p,
                      branding: { ...p.branding, primaryColor: e.target.value },
                    }))
                  }
                  style={{
                    width: '36px',
                    height: '36px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                />
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {currentForm.branding?.primaryColor || '#ef4444'}
                </span>
              </div>
              <label style={labelStyle}>Thank-you Message</label>
              <textarea
                value={currentForm.branding?.thankYouMessage || ''}
                onChange={(e) =>
                  setCurrentForm((p) => ({
                    ...p,
                    branding: { ...p.branding, thankYouMessage: e.target.value },
                  }))
                }
                placeholder="Message shown after form submission"
                rows={2}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* Distribution */}
            <div style={cardStyle}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                Distribution
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { key: 'link', icon: <FaLink />, label: 'Shareable Link' },
                  { key: 'qr', icon: <FaQrcode />, label: 'QR Code' },
                  { key: 'whatsapp', icon: <FaWhatsapp />, label: 'WhatsApp' },
                ].map(({ key, icon, label }) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151' }}>
                      {icon} {label}
                    </div>
                    <button
                      onClick={() =>
                        setCurrentForm((p) => ({
                          ...p,
                          distribution: {
                            ...p.distribution,
                            [key]: !p.distribution?.[key],
                          },
                        }))
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '22px',
                        color: currentForm.distribution?.[key] ? '#16a34a' : '#d1d5db',
                        padding: 0,
                        lineHeight: 1,
                      }}
                    >
                      {currentForm.distribution?.[key] ? '●' : '○'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Show form URL when form is saved and active */}
              {(currentForm._id || currentForm.id) && currentForm.status === 'active' && (
                <div
                  style={{
                    marginTop: '14px',
                    padding: '10px 12px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      flex: 1,
                      wordBreak: 'break-all',
                    }}
                  >
                    {getFormUrl(currentForm)}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(getFormUrl(currentForm), 'editor-link')
                    }
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280',
                      fontSize: '14px',
                      flexShrink: 0,
                    }}
                  >
                    {copiedId === 'editor-link' ? 'Copied!' : <FaCopy />}
                  </button>
                </div>
              )}

              {/* QR code preview */}
              {currentForm.distribution?.qr && (currentForm._id || currentForm.id) && (
                <div
                  style={{
                    marginTop: '14px',
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '120px',
                      height: '120px',
                      margin: '0 auto 8px',
                      background: '#fff',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FaQrcode style={{ fontSize: '48px', color: '#d1d5db' }} />
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>
                    QR code will be generated for the form URL
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9ca3af', wordBreak: 'break-all' }}>
                    {getFormUrl(currentForm)}
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginTop: '8px',
                marginBottom: '32px',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => handleSaveForm('draft')}
                disabled={editorSaving}
                style={{
                  padding: '10px 24px',
                  background: '#fff',
                  border: '1px solid #d1d5db',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: editorSaving ? 'not-allowed' : 'pointer',
                  color: '#374151',
                  opacity: editorSaving ? 0.6 : 1,
                }}
              >
                {editorSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={() => handleSaveForm('active')}
                disabled={editorSaving}
                style={{
                  padding: '10px 24px',
                  background:
                    editorSaving
                      ? '#d1d5db'
                      : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: editorSaving ? 'not-allowed' : 'pointer',
                }}
              >
                {editorSaving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>

          {/* ─── Right: Live Preview ─────────────────── */}
          <div style={{ flex: isMobile ? 'unset' : '0 0 calc(40% - 24px)' }}>
            <div
              style={{
                ...cardStyle,
                position: isMobile ? 'static' : 'sticky',
                top: '20px',
              }}
            >
              <h4
                style={{
                  margin: '0 0 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <FaEye style={{ marginRight: '6px' }} /> Live Preview
              </h4>
              <div
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                {/* Header bar */}
                <div
                  style={{
                    background:
                      currentForm.branding?.primaryColor || '#ef4444',
                    padding: '16px',
                    color: '#fff',
                  }}
                >
                  <h5
                    style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    {currentForm.title || 'Form Title'}
                  </h5>
                  {currentForm.description && (
                    <p
                      style={{
                        margin: '4px 0 0',
                        fontSize: '11px',
                        opacity: 0.9,
                      }}
                    >
                      {currentForm.description}
                    </p>
                  )}
                </div>
                {/* First question preview */}
                <div style={{ padding: '16px' }}>
                  {currentForm.questions.length > 0 ? (
                    <div>
                      <p
                        style={{
                          margin: '0 0 8px',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#374151',
                        }}
                      >
                        {currentForm.questions[0].title || 'Question 1'}
                        {currentForm.questions[0].required && (
                          <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>
                        )}
                      </p>
                      {renderPreviewInput(currentForm.questions[0])}
                      {currentForm.questions.length > 1 && (
                        <p
                          style={{
                            margin: '12px 0 0',
                            fontSize: '11px',
                            color: '#9ca3af',
                            textAlign: 'center',
                          }}
                        >
                          + {currentForm.questions.length - 1} more question
                          {currentForm.questions.length - 1 > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '12px', color: '#d1d5db', textAlign: 'center' }}>
                      No questions added yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Preview input renderer ──────────────────────────────────

  const renderPreviewInput = (q) => {
    switch (q.type) {
      case 'rating_stars':
        return (
          <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <FaStar key={s} style={{ fontSize: '18px', color: s <= 3 ? '#f59e0b' : '#e5e7eb' }} />
            ))}
          </div>
        );
      case 'rating_emoji':
        return (
          <div style={{ display: 'flex', gap: '8px', fontSize: '20px' }}>
            {['😡', '😕', '😐', '😊', '😍'].map((e, i) => (
              <span key={i} style={{ opacity: i === 3 ? 1 : 0.4 }}>{e}</span>
            ))}
          </div>
        );
      case 'nps':
        return (
          <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
            {Array.from({ length: 11 }, (_, i) => (
              <span
                key={i}
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  color: '#6b7280',
                  background: i === 8 ? '#dcfce7' : '#fff',
                }}
              >
                {i}
              </span>
            ))}
          </div>
        );
      case 'yes_no':
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            {['Yes', 'No'].map((opt) => (
              <span
                key={opt}
                style={{
                  padding: '4px 14px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '12px',
                  color: '#374151',
                }}
              >
                {opt}
              </span>
            ))}
          </div>
        );
      case 'single_choice':
      case 'multiple_choice':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {(q.options || []).slice(0, 3).map((opt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#374151' }}>
                <span
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: q.type === 'single_choice' ? '50%' : '3px',
                    border: '1px solid #d1d5db',
                    flexShrink: 0,
                  }}
                />
                {opt || `Option ${i + 1}`}
              </div>
            ))}
            {(q.options || []).length > 3 && (
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                +{q.options.length - 3} more
              </span>
            )}
          </div>
        );
      case 'text':
      default:
        return (
          <div
            style={{
              padding: '8px 10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#d1d5db',
            }}
          >
            Type your answer...
          </div>
        );
    }
  };

  // ─── Render: Analytics View ──────────────────────────────────

  const renderAnalytics = () => {
    const selectedForm = forms.find(
      (f) => (f._id || f.id) === analyticsFormId
    );

    return (
      <div>
        {/* Back button */}
        <button
          onClick={() => {
            setView('list');
            setAnalytics(null);
            setInsights(null);
            setResponses([]);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#6b7280',
            padding: '0',
            marginBottom: '20px',
          }}
        >
          <FaChevronLeft /> Back to Forms
        </button>

        <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 700, color: '#111827' }}>
          Analytics
        </h2>

        {/* Form selector */}
        {forms.length > 1 && (
          <div style={{ marginBottom: '20px' }}>
            <select
              value={analyticsFormId || ''}
              onChange={(e) => {
                const fid = e.target.value;
                setAnalyticsFormId(fid);
                setAnalytics(null);
                setInsights(null);
                setResponses([]);
                fetchAnalytics(fid);
                fetchResponses(fid);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                color: '#374151',
                background: '#fff',
                minWidth: '240px',
              }}
            >
              {forms.map((f) => (
                <option key={f._id || f.id} value={f._id || f.id}>
                  {f.title || 'Untitled Form'}
                </option>
              ))}
            </select>
          </div>
        )}

        {analyticsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
            Loading analytics...
          </div>
        ) : analytics ? (
          <>
            {/* Summary cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile
                  ? '1fr 1fr'
                  : 'repeat(4, 1fr)',
                gap: '14px',
                marginBottom: '24px',
              }}
            >
              <SummaryCard
                label="Total Responses"
                value={analytics.totalResponses ?? 0}
              />
              <SummaryCard
                label="Average Rating"
                value={
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {(analytics.avgRating ?? 0).toFixed(1)}
                    <FaStar style={{ color: '#f59e0b', fontSize: '14px' }} />
                  </span>
                }
              />
              <SummaryCard
                label="NPS Score"
                value={analytics.npsScore ?? '—'}
              />
              <SummaryCard
                label="Sentiment"
                value={
                  analytics.sentimentCounts ? (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: '#16a34a' }}>
                        +{analytics.sentimentCounts.positive || 0}
                      </span>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>
                        ~{analytics.sentimentCounts.neutral || 0}
                      </span>
                      <span style={{ fontSize: '11px', color: '#ef4444' }}>
                        -{analytics.sentimentCounts.negative || 0}
                      </span>
                    </div>
                  ) : (
                    '—'
                  )
                }
              />
            </div>

            {/* Question breakdowns */}
            {analytics.questionBreakdowns &&
              analytics.questionBreakdowns.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h3
                    style={{
                      margin: '0 0 12px',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#374151',
                    }}
                  >
                    Question Breakdowns
                  </h3>
                  {analytics.questionBreakdowns.map((qb, idx) => (
                    <div key={idx} style={{ ...cardStyle, marginBottom: '12px' }}>
                      <h4
                        style={{
                          margin: '0 0 10px',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#374151',
                        }}
                      >
                        {qb.title || `Question ${idx + 1}`}
                      </h4>
                      {renderQuestionBreakdown(qb)}
                    </div>
                  ))}
                </div>
              )}

            {/* Responses list */}
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#374151' }}>
                  Recent Responses
                </h3>
                <button
                  onClick={handleExportCSV}
                  disabled={!responses.length}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    background: responses.length ? '#fff' : '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: responses.length ? 'pointer' : 'not-allowed',
                    color: responses.length ? '#374151' : '#9ca3af',
                  }}
                >
                  <FaFileExport /> Export CSV
                </button>
              </div>

              {responsesLoading ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: '13px' }}>
                  Loading responses...
                </div>
              ) : responses.length === 0 ? (
                <div
                  style={{
                    ...cardStyle,
                    textAlign: 'center',
                    color: '#9ca3af',
                    padding: '32px',
                  }}
                >
                  No responses yet
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {responses.map((r, idx) => {
                    const sentimentColor =
                      r.sentiment === 'positive'
                        ? '#16a34a'
                        : r.sentiment === 'negative'
                          ? '#ef4444'
                          : '#6b7280';
                    const sentimentBg =
                      r.sentiment === 'positive'
                        ? '#dcfce7'
                        : r.sentiment === 'negative'
                          ? '#fef2f2'
                          : '#f3f4f6';
                    return (
                      <div
                        key={idx}
                        style={{
                          ...cardStyle,
                          padding: '14px 16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              gap: '10px',
                              alignItems: 'center',
                              marginBottom: '4px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                              {formatDate(r.createdAt || r.submittedAt)}
                            </span>
                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                              via {r.source || 'link'}
                            </span>
                            {r.sentiment && (
                              <span
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  background: sentimentBg,
                                  color: sentimentColor,
                                }}
                              >
                                {r.sentiment}
                              </span>
                            )}
                          </div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '13px',
                              color: '#374151',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {summarizeAnswers(r.answers || r.responses)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AI Insights */}
            <div style={{ marginBottom: '32px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#374151' }}>
                  AI Insights
                </h3>
                {!insights && (
                  <button
                    onClick={handleGenerateInsights}
                    disabled={insightsLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      background: insightsLoading
                        ? '#d1d5db'
                        : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: insightsLoading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {insightsLoading ? (
                      <>
                        <span
                          style={{
                            display: 'inline-block',
                            width: '14px',
                            height: '14px',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTopColor: '#fff',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                          }}
                        />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FaLightbulb /> Generate AI Insights
                      </>
                    )}
                  </button>
                )}
              </div>

              {insights && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Summary */}
                  {insights.summary && (
                    <div style={{ ...cardStyle, background: '#f9fafb' }}>
                      <h4 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                        Summary
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
                        {insights.summary}
                      </p>
                    </div>
                  )}

                  {/* Strengths */}
                  {insights.strengths && insights.strengths.length > 0 && (
                    <div
                      style={{
                        ...cardStyle,
                        borderLeft: '4px solid #16a34a',
                      }}
                    >
                      <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#16a34a' }}>
                        Strengths
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '18px' }}>
                        {insights.strengths.map((s, i) => (
                          <li key={i} style={{ fontSize: '13px', color: '#374151', marginBottom: '4px', lineHeight: 1.5 }}>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {insights.improvements && insights.improvements.length > 0 && (
                    <div
                      style={{
                        ...cardStyle,
                        borderLeft: '4px solid #ea580c',
                      }}
                    >
                      <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#ea580c' }}>
                        Areas for Improvement
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '18px' }}>
                        {insights.improvements.map((s, i) => (
                          <li key={i} style={{ fontSize: '13px', color: '#374151', marginBottom: '4px', lineHeight: 1.5 }}>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action items */}
                  {insights.actionItems && insights.actionItems.length > 0 && (
                    <div
                      style={{
                        ...cardStyle,
                        borderLeft: '4px solid #2563eb',
                      }}
                    >
                      <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#2563eb' }}>
                        Action Items
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '18px' }}>
                        {insights.actionItems.map((s, i) => (
                          <li key={i} style={{ fontSize: '13px', color: '#374151', marginBottom: '4px', lineHeight: 1.5 }}>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Trends */}
                  {insights.trends && insights.trends.length > 0 && (
                    <div
                      style={{
                        ...cardStyle,
                        borderLeft: '4px solid #9333ea',
                      }}
                    >
                      <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#9333ea' }}>
                        Trends
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '18px' }}>
                        {insights.trends.map((s, i) => (
                          <li key={i} style={{ fontSize: '13px', color: '#374151', marginBottom: '4px', lineHeight: 1.5 }}>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Regenerate button */}
                  <button
                    onClick={() => {
                      setInsights(null);
                      handleGenerateInsights();
                    }}
                    disabled={insightsLoading}
                    style={{
                      alignSelf: 'flex-start',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      background: '#f3f4f6',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      color: '#6b7280',
                    }}
                  >
                    <FaLightbulb /> Regenerate Insights
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ ...cardStyle, textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
            No analytics data available
          </div>
        )}
      </div>
    );
  };

  // ─── Question breakdown renderer ─────────────────────────────

  const renderQuestionBreakdown = (qb) => {
    const type = qb.type || qb.questionType;

    if (type === 'rating_stars' || type === 'rating_emoji') {
      return (
        <div>
          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
            Average: <strong style={{ color: '#111827' }}>{(qb.average ?? 0).toFixed(1)}</strong> / 5
          </div>
          {qb.distribution && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {Object.entries(qb.distribution)
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([rating, count]) => {
                  const max = Math.max(...Object.values(qb.distribution), 1);
                  return (
                    <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280', width: '16px', textAlign: 'right' }}>
                        {rating}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: '14px',
                          background: '#f3f4f6',
                          borderRadius: '4px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${(count / max) * 100}%`,
                            background: '#f59e0b',
                            borderRadius: '4px',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '11px', color: '#9ca3af', width: '28px' }}>{count}</span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      );
    }

    if (type === 'single_choice' || type === 'multiple_choice') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {qb.options &&
            Object.entries(qb.options)
              .sort(([, a], [, b]) => b - a)
              .map(([option, count]) => {
                const max = Math.max(...Object.values(qb.options), 1);
                return (
                  <div key={option} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#374151',
                        width: '100px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {option}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: '14px',
                        background: '#f3f4f6',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${(count / max) * 100}%`,
                          background: '#3b82f6',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '11px', color: '#9ca3af', width: '28px' }}>{count}</span>
                  </div>
                );
              })}
        </div>
      );
    }

    if (type === 'nps') {
      return (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { label: 'Promoters', count: qb.promoters ?? 0, color: '#16a34a', bg: '#dcfce7' },
            { label: 'Passives', count: qb.passives ?? 0, color: '#ca8a04', bg: '#fef9c3' },
            { label: 'Detractors', count: qb.detractors ?? 0, color: '#ef4444', bg: '#fef2f2' },
          ].map((seg) => (
            <div
              key={seg.label}
              style={{
                flex: 1,
                minWidth: '80px',
                background: seg.bg,
                borderRadius: '8px',
                padding: '10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '16px', fontWeight: 700, color: seg.color }}>
                {seg.count}
              </div>
              <div style={{ fontSize: '11px', color: seg.color }}>{seg.label}</div>
            </div>
          ))}
        </div>
      );
    }

    if (type === 'text') {
      return (
        <div style={{ fontSize: '13px', color: '#6b7280' }}>
          {qb.count ?? 0} text responses received
        </div>
      );
    }

    // Default
    return (
      <div style={{ fontSize: '13px', color: '#9ca3af' }}>
        {qb.count ?? 0} responses
      </div>
    );
  };

  // ─── Helpers ─────────────────────────────────────────────────

  const summarizeAnswers = (answers) => {
    if (!answers) return 'No answers';
    if (typeof answers === 'string') return answers;
    if (Array.isArray(answers)) {
      return answers
        .map((a) => (typeof a === 'object' ? a.value || a.answer || JSON.stringify(a) : String(a)))
        .join(', ');
    }
    return Object.values(answers)
      .map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v)))
      .join(', ');
  };

  // ─── Template Modal ──────────────────────────────────────────

  const renderTemplateModal = () => {
    if (!showTemplateModal) return null;

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10010,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
        onClick={() => setShowTemplateModal(false)}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '560px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#111' }}>
              Choose a Template
            </h3>
            <button
              onClick={() => setShowTemplateModal(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: '#6b7280',
                fontSize: '18px',
                lineHeight: 1,
              }}
            >
              <FaTimes />
            </button>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '12px',
            }}
          >
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => handleSelectTemplate(tmpl.id)}
                disabled={templateLoading}
                style={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                  cursor: templateLoading ? 'not-allowed' : 'pointer',
                  transition: 'border-color 0.2s',
                  opacity: templateLoading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!templateLoading) e.currentTarget.style.borderColor = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <h4
                  style={{
                    margin: '0 0 4px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#111827',
                  }}
                >
                  {tmpl.title}
                </h4>
                <p
                  style={{
                    margin: '0 0 8px',
                    fontSize: '12px',
                    color: '#6b7280',
                    lineHeight: 1.4,
                  }}
                >
                  {tmpl.description}
                </p>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                  }}
                >
                  {tmpl.questionCount} questions
                </span>
              </button>
            ))}
          </div>
          {templateLoading && (
            <div style={{ textAlign: 'center', padding: '16px 0', color: '#9ca3af', fontSize: '13px' }}>
              Loading template...
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── Delete confirmation modal ───────────────────────────────

  const renderDeleteModal = () => {
    if (!deleteTarget) return null;

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10010,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
        onClick={() => setDeleteTarget(null)}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '28px',
            maxWidth: '420px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#111' }}>
              Delete Form
            </h3>
            <button
              onClick={() => setDeleteTarget(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: '#6b7280',
                fontSize: '18px',
                lineHeight: 1,
              }}
            >
              <FaTimes />
            </button>
          </div>
          <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#4b5563', lineHeight: 1.5 }}>
            Are you sure you want to delete &ldquo;{deleteTarget.title || 'Untitled Form'}&rdquo;?
            This action cannot be undone and all responses will be lost.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setDeleteTarget(null)}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                background: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                color: '#374151',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteForm}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#dc2626',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── Main Render ─────────────────────────────────────────────

  return (
    <div style={{ padding: isMobile ? '16px' : '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Spinner keyframes */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {view === 'list' && renderList()}
      {view === 'editor' && renderEditor()}
      {view === 'analytics' && renderAnalytics()}

      {/* Modals */}
      {renderTemplateModal()}
      {renderDeleteModal()}
    </div>
  );
}

// ─── Summary Card sub-component ────────────────────────────────

function SummaryCard({ label, value }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '16px',
      }}
    >
      <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{value}</div>
    </div>
  );
}

// ─── Shared Style Constants ────────────────────────────────────

const cardStyle = {
  background: '#fff',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  padding: '16px',
  marginBottom: '16px',
};

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  color: '#374151',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#6b7280',
  marginBottom: '6px',
};

const actionBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '6px 12px',
  background: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: 500,
  cursor: 'pointer',
  color: '#374151',
};

const smallBtnStyle = (disabled) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
  background: disabled ? '#f9fafb' : '#fff',
  cursor: disabled ? 'default' : 'pointer',
  color: disabled ? '#d1d5db' : '#6b7280',
  fontSize: '11px',
  padding: 0,
  flexShrink: 0,
});
