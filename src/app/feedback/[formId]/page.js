'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

// ─── Star Rating ──────────────────────────────────────────────
function StarRating({ value, onChange, maxRating = 5, primaryColor }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => {
        const active = star <= (hovered || value || 0);
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 48,
              color: active ? primaryColor : '#d1d5db',
              transition: 'color 0.15s, transform 0.15s',
              transform: active ? 'scale(1.15)' : 'scale(1)',
              padding: 4,
              lineHeight: 1,
            }}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

// ─── Emoji Rating ─────────────────────────────────────────────
const EMOJIS = ['😡', '😕', '😐', '🙂', '😍'];

function EmojiRating({ value, onChange, primaryColor }) {
  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
      {EMOJIS.map((emoji, i) => {
        const rating = i + 1;
        const selected = value === rating;
        return (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              border: selected ? `3px solid ${primaryColor}` : '3px solid transparent',
              background: selected ? `${primaryColor}18` : '#f3f4f6',
              cursor: 'pointer',
              fontSize: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
              transform: selected ? 'scale(1.15)' : 'scale(1)',
            }}
            aria-label={`Rating ${rating}`}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
}

// ─── Single Choice ────────────────────────────────────────────
function SingleChoice({ options, value, onChange, primaryColor }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 480 }}>
      {(options || []).map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              padding: '14px 20px',
              borderRadius: 12,
              border: selected ? `2px solid ${primaryColor}` : '2px solid #e5e7eb',
              background: selected ? `${primaryColor}12` : '#fff',
              color: selected ? primaryColor : '#1f2937',
              fontWeight: selected ? 600 : 400,
              fontSize: 16,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                border: selected ? `2px solid ${primaryColor}` : '2px solid #d1d5db',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {selected && (
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: primaryColor,
                  }}
                />
              )}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── Multiple Choice ──────────────────────────────────────────
function MultipleChoice({ options, value, onChange, primaryColor }) {
  const selected = Array.isArray(value) ? value : [];

  const toggle = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((v) => v !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 480 }}>
      {(options || []).map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            style={{
              padding: '14px 20px',
              borderRadius: 12,
              border: isSelected ? `2px solid ${primaryColor}` : '2px solid #e5e7eb',
              background: isSelected ? `${primaryColor}12` : '#fff',
              color: isSelected ? primaryColor : '#1f2937',
              fontWeight: isSelected ? 600 : 400,
              fontSize: 16,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                border: isSelected ? `2px solid ${primaryColor}` : '2px solid #d1d5db',
                background: isSelected ? primaryColor : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.15s',
              }}
            >
              {isSelected && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── Text Input ───────────────────────────────────────────────
function TextInput({ value, onChange, primaryColor }) {
  return (
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your answer here..."
      rows={4}
      style={{
        width: '100%',
        maxWidth: 480,
        padding: '14px 16px',
        borderRadius: 12,
        border: '2px solid #e5e7eb',
        fontSize: 16,
        fontFamily: 'inherit',
        resize: 'vertical',
        outline: 'none',
        transition: 'border-color 0.15s',
        boxSizing: 'border-box',
      }}
      onFocus={(e) => (e.target.style.borderColor = primaryColor)}
      onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
    />
  );
}

// ─── NPS Scale ────────────────────────────────────────────────
function NpsScale({ value, onChange, primaryColor }) {
  const getColor = (n) => {
    if (value === null || value === undefined) return { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' };
    if (n === value) {
      return { bg: primaryColor, text: '#fff', border: primaryColor };
    }
    return { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' };
  };

  return (
    <div style={{ width: '100%', maxWidth: 500 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(11, 1fr)',
          gap: 4,
        }}
      >
        {Array.from({ length: 11 }, (_, i) => {
          const colors = getColor(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i)}
              style={{
                width: '100%',
                aspectRatio: '1',
                maxWidth: 44,
                borderRadius: '50%',
                border: `2px solid ${colors.border}`,
                background: colors.bg,
                color: colors.text,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
                padding: 0,
                margin: '0 auto',
              }}
            >
              {i}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#9ca3af' }}>
        <span>Not likely</span>
        <span>Very likely</span>
      </div>
    </div>
  );
}

// ─── Yes / No ─────────────────────────────────────────────────
function YesNo({ value, onChange, primaryColor }) {
  const options = [
    { label: 'Yes', val: 'yes', icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="2" />
        <path d="M8 14.5l4 4 8-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )},
    { label: 'No', val: 'no', icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="2" />
        <path d="M9 9l10 10M19 9l-10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )},
  ];

  return (
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
      {options.map(({ label, val, icon }) => {
        const selected = value === val;
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange(val)}
            style={{
              width: 140,
              height: 120,
              borderRadius: 16,
              border: selected ? `3px solid ${primaryColor}` : '3px solid #e5e7eb',
              background: selected ? `${primaryColor}12` : '#fff',
              color: selected ? primaryColor : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              fontSize: 18,
              fontWeight: 600,
              transition: 'all 0.15s',
              transform: selected ? 'scale(1.04)' : 'scale(1)',
            }}
          >
            {icon}
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────
function Spinner({ color = '#6b7280' }) {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        border: `4px solid ${color}22`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'feedbackSpin 0.8s linear infinite',
      }}
    />
  );
}

// ─── Checkmark Animation ──────────────────────────────────────
function AnimatedCheckmark({ color }) {
  return (
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'feedbackPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
    >
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path
          d="M10 20l8 8 12-16"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 50,
            strokeDashoffset: 0,
            animation: 'feedbackCheckDraw 0.5s ease 0.3s both',
          }}
        />
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── Main Page Component ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

export default function FeedbackFormPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const formId = params.formId;

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState('next'); // 'next' | 'back'
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(true);

  // Determine source from URL params
  const srcParam = searchParams.get('src');
  const source = srcParam === 'wa' ? 'whatsapp' : srcParam === 'qr' ? 'qr' : 'link';

  // ── Fetch form ────────────────────────────────────────────
  useEffect(() => {
    if (!formId) return;
    setLoading(true);
    fetch(`${API_URL}/api/feedback/public/form/${formId}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'not_found' : 'error');
        return res.json();
      })
      .then((data) => {
        if (!data.success || !data.form) throw new Error('not_found');
        // Sort questions by order
        const sorted = { ...data.form };
        sorted.questions = [...(sorted.questions || [])].sort((a, b) => a.order - b.order);
        setForm(sorted);
      })
      .catch((err) => {
        setError(err.message === 'not_found' ? 'not_found' : 'error');
      })
      .finally(() => setLoading(false));
  }, [formId]);

  // ── Answer helpers ────────────────────────────────────────
  const questions = form?.questions || [];
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  const isAnswered = useCallback(
    (qId) => {
      const a = answers[qId];
      if (a === null || a === undefined || a === '') return false;
      if (Array.isArray(a) && a.length === 0) return false;
      return true;
    },
    [answers]
  );

  const canAdvance = currentQuestion
    ? !currentQuestion.required || isAnswered(currentQuestion.id)
    : false;

  const setAnswer = useCallback((questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  // ── Navigation ────────────────────────────────────────────
  const animateTransition = useCallback((dir, callback) => {
    if (animating) return;
    setAnimating(true);
    setDirection(dir);
    setVisible(false);
    setTimeout(() => {
      callback();
      setDirection(dir);
      setTimeout(() => {
        setVisible(true);
        setAnimating(false);
      }, 30);
    }, 250);
  }, [animating]);

  const goNext = useCallback(() => {
    if (!canAdvance || animating) return;
    if (currentIndex < questions.length - 1) {
      animateTransition('next', () => setCurrentIndex((i) => i + 1));
    } else {
      // Submit
      handleSubmit();
    }
  }, [canAdvance, currentIndex, questions.length, animating]);

  const goBack = useCallback(() => {
    if (currentIndex === 0 || animating) return;
    animateTransition('back', () => setCurrentIndex((i) => i - 1));
  }, [currentIndex, animating]);

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        answers: questions.map((q) => ({
          questionId: q.id,
          questionType: q.type,
          questionTitle: q.title,
          value: answers[q.id] ?? null,
        })),
        source,
        customerName: null,
        customerPhone: null,
      };
      const res = await fetch(`${API_URL}/api/feedback/public/form/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('submit_error');
      setSubmitted(true);
    } catch {
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [submitting, questions, answers, source, formId]);

  // ── Keyboard: Enter to advance ────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !submitted) {
        // Don't trigger on textarea
        if (e.target?.tagName === 'TEXTAREA') return;
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, submitted]);

  // ── Branding ──────────────────────────────────────────────
  const branding = form?.branding || {};
  const primaryColor = branding.primaryColor || '#ef4444';
  const backgroundColor = branding.backgroundColor || '#f8fafc';

  // ── Render helpers ────────────────────────────────────────
  const renderQuestion = (q) => {
    const val = answers[q.id];
    const set = (v) => setAnswer(q.id, v);

    switch (q.type) {
      case 'rating_stars':
        return <StarRating value={val} onChange={set} maxRating={q.maxRating || 5} primaryColor={primaryColor} />;
      case 'rating_emoji':
        return <EmojiRating value={val} onChange={set} primaryColor={primaryColor} />;
      case 'single_choice':
        return <SingleChoice options={q.options} value={val} onChange={set} primaryColor={primaryColor} />;
      case 'multiple_choice':
        return <MultipleChoice options={q.options} value={val} onChange={set} primaryColor={primaryColor} />;
      case 'text':
        return <TextInput value={val} onChange={set} primaryColor={primaryColor} />;
      case 'nps':
        return <NpsScale value={val} onChange={set} primaryColor={primaryColor} />;
      case 'yes_no':
        return <YesNo value={val} onChange={set} primaryColor={primaryColor} />;
      default:
        return <p style={{ color: '#9ca3af' }}>Unsupported question type</p>;
    }
  };

  // ── Progress ──────────────────────────────────────────────
  const progress = questions.length > 0 ? ((currentIndex + (submitted ? 1 : 0)) / questions.length) * 100 : 0;

  // ── Transition style ──────────────────────────────────────
  const transitionOffset = direction === 'next' ? 30 : -30;
  const questionStyle = {
    transition: 'opacity 0.25s ease, transform 0.25s ease',
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : `translateY(${transitionOffset}px)`,
  };

  // ═════════════════════════════════════════════════════════
  // ─── CSS keyframes (injected once) ──────────────────────
  // ═════════════════════════════════════════════════════════
  const keyframes = `
    @keyframes feedbackSpin {
      to { transform: rotate(360deg); }
    }
    @keyframes feedbackPop {
      0% { transform: scale(0); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes feedbackCheckDraw {
      0% { stroke-dashoffset: 50; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes feedbackFadeUp {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  `;

  // ═════════════════════════════════════════════════════════
  // ─── Render ─────────────────────────────────────────────
  // ═════════════════════════════════════════════════════════

  // Container shared styles
  const pageStyle = {
    minHeight: '100dvh',
    background: backgroundColor,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: '#1f2937',
    overflow: 'hidden',
  };

  const centeredContainer = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 20px',
    textAlign: 'center',
  };

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: keyframes }} />
        <div style={pageStyle}>
          <div style={centeredContainer}>
            <Spinner color={primaryColor} />
            <p style={{ marginTop: 16, color: '#9ca3af', fontSize: 15 }}>Loading form...</p>
          </div>
        </div>
      </>
    );
  }

  // ── Error ─────────────────────────────────────────────────
  if (error || !form) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: keyframes }} />
        <div style={pageStyle}>
          <div style={centeredContainer}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="26" stroke="#e5e7eb" strokeWidth="4" />
                <path d="M20 20l16 16M36 20l-16 16" stroke="#d1d5db" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#374151' }}>
              Form not found
            </h2>
            <p style={{ color: '#9ca3af', fontSize: 15, maxWidth: 320 }}>
              This feedback form doesn&apos;t exist or is no longer available.
            </p>
          </div>
        </div>
      </>
    );
  }

  // ── Thank You ─────────────────────────────────────────────
  if (submitted) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: keyframes }} />
        <div style={pageStyle}>
          {/* Progress bar — full */}
          <div style={{ height: 4, background: '#e5e7eb', width: '100%', flexShrink: 0 }}>
            <div
              style={{
                height: '100%',
                width: '100%',
                background: primaryColor,
                borderRadius: '0 2px 2px 0',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
          <div style={centeredContainer}>
            <div style={{ animation: 'feedbackFadeUp 0.5s ease both' }}>
              <AnimatedCheckmark color={primaryColor} />
            </div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                marginTop: 28,
                marginBottom: 10,
                color: '#1f2937',
                animation: 'feedbackFadeUp 0.5s ease 0.2s both',
              }}
            >
              {branding.thankYouMessage || 'Thank you for your feedback!'}
            </h2>
            <p
              style={{
                color: '#9ca3af',
                fontSize: 15,
                animation: 'feedbackFadeUp 0.5s ease 0.35s both',
              }}
            >
              {branding.restaurantName && `— ${branding.restaurantName}`}
            </p>
          </div>
        </div>
      </>
    );
  }

  // ── Main Form ─────────────────────────────────────────────
  const isLast = currentIndex === questions.length - 1;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      <div style={pageStyle}>
        {/* ── Progress Bar ──────────────────────────────── */}
        <div style={{ height: 4, background: '#e5e7eb', width: '100%', flexShrink: 0 }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: primaryColor,
              borderRadius: '0 2px 2px 0',
              transition: 'width 0.4s ease',
            }}
          />
        </div>

        {/* ── Header ───────────────────────────────────── */}
        <div
          style={{
            padding: '20px 20px 0',
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          {branding.logoUrl && (
            <img
              src={branding.logoUrl}
              alt={branding.restaurantName || 'Logo'}
              style={{ height: 40, marginBottom: 8, objectFit: 'contain' }}
            />
          )}
          {branding.restaurantName && (
            <h1
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: '#1f2937',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {branding.restaurantName}
            </h1>
          )}
        </div>

        {/* ── Question Area ────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 20px 0',
            minHeight: 0,
          }}
        >
          <div style={{ ...questionStyle, width: '100%', maxWidth: 540, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Counter */}
            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12, fontWeight: 500 }}>
              {currentIndex + 1} of {questions.length}
            </p>

            {/* Question title */}
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 6,
                color: '#1f2937',
                lineHeight: 1.35,
                textAlign: 'center',
                maxWidth: 480,
              }}
            >
              {currentQuestion?.title}
              {currentQuestion?.required && (
                <span style={{ color: primaryColor, marginLeft: 2 }}>*</span>
              )}
            </h2>

            {/* Description */}
            {currentQuestion?.description && (
              <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 4, textAlign: 'center', maxWidth: 420 }}>
                {currentQuestion.description}
              </p>
            )}

            {/* Question renderer */}
            <div style={{ marginTop: 28, width: '100%', display: 'flex', justifyContent: 'center' }}>
              {currentQuestion && renderQuestion(currentQuestion)}
            </div>
          </div>
        </div>

        {/* ── Navigation Footer ────────────────────────── */}
        <div
          style={{
            padding: '16px 20px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: 540,
            width: '100%',
            margin: '0 auto',
            flexShrink: 0,
          }}
        >
          {/* Back */}
          {currentIndex > 0 ? (
            <button
              type="button"
              onClick={goBack}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                border: '2px solid #e5e7eb',
                background: '#fff',
                color: '#6b7280',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
          ) : (
            <div />
          )}

          {/* Next / Submit */}
          <button
            type="button"
            onClick={goNext}
            disabled={!canAdvance || submitting}
            style={{
              padding: '12px 32px',
              borderRadius: 12,
              border: 'none',
              background: canAdvance && !submitting ? primaryColor : '#d1d5db',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              cursor: canAdvance && !submitting ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: canAdvance && !submitting ? 1 : 0.6,
            }}
          >
            {submitting ? (
              <>
                <Spinner color="#fff" />
              </>
            ) : isLast ? (
              <>
                Submit
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8h12M9 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            ) : (
              <>
                Next
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* ── Press Enter hint ─────────────────────────── */}
        {canAdvance && currentQuestion?.type !== 'text' && (
          <p
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: '#c0c5cc',
              paddingBottom: 16,
              margin: 0,
            }}
          >
            press <strong>Enter ↵</strong>
          </p>
        )}
      </div>
    </>
  );
}
