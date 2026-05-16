'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import {
  FaChevronDown,
  FaChevronUp,
  FaCheck,
  FaArrowRight,
  FaRedo,
  FaShare,
} from 'react-icons/fa';

// ─── Questions ────────────────────────────────────────────────────────────────

const QUESTIONS = [
  // Experience (3)
  {
    question: 'How many years have you worked in the food/restaurant industry?',
    category: 'experience',
    weight: 2,
    options: [
      { text: 'None', score: 0 },
      { text: 'Less than 1 year', score: 1 },
      { text: '1–3 years', score: 2 },
      { text: '3+ years', score: 3 },
    ],
  },
  {
    question: 'Have you managed a team of 5+ people before?',
    category: 'experience',
    weight: 1,
    options: [
      { text: 'Never', score: 0 },
      { text: 'Informally', score: 1 },
      { text: 'Yes, in another industry', score: 2 },
      { text: 'Yes, in a restaurant', score: 3 },
    ],
  },
  {
    question: 'How comfortable are you with kitchen operations (cooking, food safety, inventory)?',
    category: 'experience',
    weight: 1,
    options: [
      { text: 'Not at all', score: 0 },
      { text: 'Basic understanding', score: 1 },
      { text: 'Can manage', score: 2 },
      { text: 'Expert-level', score: 3 },
    ],
  },
  // Finance (3)
  {
    question: 'How much capital do you have available (savings + committed investors)?',
    category: 'finance',
    weight: 2,
    options: [
      { text: 'Less than 3 months operating costs', score: 0 },
      { text: '3–6 months', score: 1 },
      { text: '6–12 months', score: 2 },
      { text: '12+ months', score: 3 },
    ],
  },
  {
    question: 'Do you have a clear understanding of food cost, labor cost, and rent ratios?',
    category: 'finance',
    weight: 1,
    options: [
      { text: 'No idea', score: 0 },
      { text: 'Vague sense', score: 1 },
      { text: "I've studied benchmarks", score: 2 },
      { text: "I've managed a P&L", score: 3 },
    ],
  },
  {
    question: "What's your personal financial runway if the restaurant earns nothing for 6 months?",
    category: 'finance',
    weight: 1,
    options: [
      { text: "I'd be in trouble", score: 0 },
      { text: 'Tight but survivable', score: 1 },
      { text: 'Comfortable', score: 2 },
      { text: 'Fully backed up', score: 3 },
    ],
  },
  // Planning (3)
  {
    question: 'Have you written a detailed business plan?',
    category: 'planning',
    weight: 2,
    options: [
      { text: 'No', score: 0 },
      { text: 'Started one', score: 1 },
      { text: 'Draft complete', score: 2 },
      { text: 'Professionally reviewed plan', score: 3 },
    ],
  },
  {
    question: 'Have you identified and researched your target location?',
    category: 'planning',
    weight: 1,
    options: [
      { text: 'No', score: 0 },
      { text: 'General area in mind', score: 1 },
      { text: 'Visited several options', score: 2 },
      { text: 'Signed or negotiating lease', score: 3 },
    ],
  },
  {
    question: 'Do you have a defined concept, target customer, and competitive advantage?',
    category: 'planning',
    weight: 1,
    options: [
      { text: 'Still exploring', score: 0 },
      { text: 'General idea', score: 1 },
      { text: 'Clear concept', score: 2 },
      { text: 'Validated with potential customers', score: 3 },
    ],
  },
  // Execution (3)
  {
    question: 'Do you have relationships with suppliers, contractors, or industry contacts?',
    category: 'execution',
    weight: 1,
    options: [
      { text: 'None', score: 0 },
      { text: 'A few acquaintances', score: 1 },
      { text: 'Some reliable contacts', score: 2 },
      { text: 'Strong network', score: 3 },
    ],
  },
  {
    question: 'Have you obtained or researched all required licenses for your area?',
    category: 'execution',
    weight: 2,
    options: [
      { text: "Haven't started", score: 0 },
      { text: "Know what's needed", score: 1 },
      { text: 'Applications in progress', score: 2 },
      { text: 'All secured', score: 3 },
    ],
  },
  {
    question: 'Do you have a menu designed with pricing and food cost analysis?',
    category: 'execution',
    weight: 1,
    options: [
      { text: 'No', score: 0 },
      { text: 'Rough ideas', score: 1 },
      { text: 'Draft menu with pricing', score: 2 },
      { text: 'Fully costed menu ready', score: 3 },
    ],
  },
  // Mindset (3)
  {
    question: 'How do you handle high-pressure situations and long working hours?',
    category: 'mindset',
    weight: 1,
    options: [
      { text: 'I avoid them', score: 0 },
      { text: 'Manage OK short-term', score: 1 },
      { text: 'Comfortable', score: 2 },
      { text: 'Thrive under pressure', score: 3 },
    ],
  },
  {
    question: 'How would your family/partner react to you working 12+ hours/day for the first year?',
    category: 'mindset',
    weight: 2,
    options: [
      { text: 'Strongly against', score: 0 },
      { text: 'Concerned', score: 1 },
      { text: 'Supportive', score: 2 },
      { text: 'Fully on board', score: 3 },
    ],
  },
  {
    question: 'If your restaurant failed, how would you feel?',
    category: 'mindset',
    weight: 1,
    options: [
      { text: "Devastated — can't afford to fail", score: 0 },
      { text: 'Very disappointed', score: 1 },
      { text: "A tough lesson but I'd recover", score: 2 },
      { text: "Part of the journey — I'd try again", score: 3 },
    ],
  },
];

const CATEGORY_LABELS = {
  experience: 'Industry Experience',
  finance: 'Financial Readiness',
  planning: 'Planning & Research',
  execution: 'Execution Readiness',
  mindset: 'Mindset & Support',
};

const CATEGORY_COLORS = {
  experience: '#6366f1',
  finance: '#16a34a',
  planning: '#f59e0b',
  execution: '#ef4444',
  mindset: '#8b5cf6',
};

const CATEGORY_RECOMMENDATIONS = {
  experience: 'Consider working in a restaurant for 6–12 months before opening your own. Shadow a restaurant manager, take a hospitality course, or partner with someone who has hands-on experience.',
  finance: 'Focus on building more capital and understanding restaurant financials deeply. Study food cost ratios, labor percentages, and rent benchmarks. Aim for 12+ months of operating capital before committing.',
  planning: 'Invest time in a detailed business plan and thorough location research. Validate your concept with potential customers, study competitors, and develop realistic financial projections.',
  execution: 'Build your network — find reliable suppliers, contractors, and industry mentors. Begin the licensing process early (it often takes 3–6 months) and develop your menu with full food cost analysis.',
  mindset: 'Ensure your support system and stress tolerance are ready for the demands of restaurant ownership. Have honest conversations with family, build resilience practices, and accept that the first year will be extremely demanding.',
};

function getGrade(score) {
  if (score >= 90) return { grade: 'A', label: 'Highly Ready', color: '#16a34a' };
  if (score >= 75) return { grade: 'B', label: 'Well Prepared', color: '#22c55e' };
  if (score >= 60) return { grade: 'C', label: 'Getting There', color: '#f59e0b' };
  if (score >= 40) return { grade: 'D', label: 'Needs More Preparation', color: '#f97316' };
  return { grade: 'F', label: 'Not Ready Yet', color: '#ef4444' };
}

function calculateResults(answers) {
  const categoryScores = {};
  const categoryMax = {};

  QUESTIONS.forEach((q, i) => {
    const cat = q.category;
    if (!categoryScores[cat]) { categoryScores[cat] = 0; categoryMax[cat] = 0; }
    categoryScores[cat] += (answers[i] || 0) * q.weight;
    categoryMax[cat] += 3 * q.weight;
  });

  let totalScore = 0;
  let totalMax = 0;
  const categories = {};

  Object.keys(categoryScores).forEach((cat) => {
    totalScore += categoryScores[cat];
    totalMax += categoryMax[cat];
    categories[cat] = Math.round((categoryScores[cat] / categoryMax[cat]) * 100);
  });

  const score = Math.round((totalScore / totalMax) * 100);
  return { score, categories };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RestaurantQuizClient() {
  const [phase, setPhase] = useState('start'); // start | quiz | animating | results
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  const maxW = { maxWidth: '800px', margin: '0 auto' };

  const startQuiz = () => {
    setPhase('quiz');
    setCurrentQ(0);
    setAnswers({});
    setResults(null);
    setDisplayScore(0);
  };

  const resetQuiz = () => {
    setPhase('start');
    setCurrentQ(0);
    setAnswers({});
    setResults(null);
    setDisplayScore(0);
  };

  const selectAnswer = (score) => {
    const newAnswers = { ...answers, [currentQ]: score };
    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    } else {
      // Calculate & animate
      const r = calculateResults(newAnswers);
      setResults(r);
      setPhase('animating');
      let count = 0;
      const interval = setInterval(() => {
        count += 2;
        if (count >= r.score) {
          setDisplayScore(r.score);
          clearInterval(interval);
          setTimeout(() => setPhase('results'), 400);
        } else {
          setDisplayScore(count);
        }
      }, 30);
    }
  };

  const shareResult = () => {
    if (!results) return;
    const gradeInfo = getGrade(results.score);
    const text = `I scored ${results.score}/100 (Grade ${gradeInfo.grade}: ${gradeInfo.label}) on the "Should I Open a Restaurant?" quiz by DineOpen! Take the quiz: https://www.dineopen.com/tools/restaurant-quiz`;
    if (navigator.share) {
      navigator.share({ title: 'Restaurant Readiness Score', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Result copied to clipboard!');
    }
  };

  const gradeInfo = results ? getGrade(results.score) : null;
  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section
          style={{
            background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
            color: 'white',
            padding: '60px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '4px 14px',
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderRadius: '20px',
                fontSize: '12px',
                marginBottom: '16px',
                letterSpacing: '0.5px',
              }}
            >
              15 Questions &bull; 3 Minutes &bull; Free
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '14px', lineHeight: 1.2 }}>
              Should I Open a Restaurant?
            </h1>
            <p style={{ fontSize: '17px', opacity: 0.9, lineHeight: 1.6 }}>
              Get your personalized readiness score across 5 key dimensions — experience, finance, planning, execution, and mindset.
            </p>
          </div>
        </section>

        {/* Tool Section */}
        <section style={{ padding: '48px 20px' }}>
          <div style={maxW}>
            {/* ── Start Screen ── */}
            {phase === 'start' && (
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '48px 32px',
                  textAlign: 'center',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                }}
              >
                <p style={{ fontSize: '56px', marginBottom: '16px' }}>🍽️</p>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                  Restaurant Readiness Quiz
                </h2>
                <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '32px', lineHeight: 1.6, maxWidth: '500px', margin: '0 auto 32px' }}>
                  Answer 15 questions to get a personalized readiness score, category breakdown, and actionable recommendations.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <span
                      key={key}
                      style={{
                        display: 'inline-block',
                        padding: '6px 14px',
                        backgroundColor: `${CATEGORY_COLORS[key]}15`,
                        color: CATEGORY_COLORS[key],
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '600',
                      }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <button
                  onClick={startQuiz}
                  style={{
                    padding: '16px 40px',
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '17px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  Start Quiz <FaArrowRight />
                </button>
              </div>
            )}

            {/* ── Quiz Phase ── */}
            {phase === 'quiz' && (
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '40px 32px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                }}
              >
                {/* Progress bar */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                      Question {currentQ + 1} of {QUESTIONS.length}
                    </span>
                    <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#f3f4f6', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${progress}%`,
                        backgroundColor: '#16a34a',
                        borderRadius: '999px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Category badge */}
                <div style={{ marginBottom: '16px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      backgroundColor: `${CATEGORY_COLORS[QUESTIONS[currentQ].category]}15`,
                      color: CATEGORY_COLORS[QUESTIONS[currentQ].category],
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '700',
                    }}
                  >
                    {CATEGORY_LABELS[QUESTIONS[currentQ].category]}
                  </span>
                </div>

                {/* Question */}
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '28px', lineHeight: 1.4 }}>
                  {QUESTIONS[currentQ].question}
                </h3>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {QUESTIONS[currentQ].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => selectAnswer(opt.score)}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        backgroundColor: answers[currentQ] === opt.score ? '#f0fdf4' : '#fafafa',
                        border: answers[currentQ] === opt.score ? '2px solid #16a34a' : '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '15px',
                        fontWeight: '500',
                        color: '#374151',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                      }}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Animating Score ── */}
            {phase === 'animating' && (
              <div
                style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '64px 32px',
                  textAlign: 'center',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                }}
              >
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', fontWeight: '600' }}>
                  Calculating your readiness...
                </p>
                <div
                  style={{
                    fontSize: '72px',
                    fontWeight: '800',
                    color: getGrade(displayScore).color,
                    lineHeight: 1,
                    marginBottom: '8px',
                  }}
                >
                  {displayScore}
                </div>
                <p style={{ fontSize: '16px', color: '#9ca3af' }}>out of 100</p>
              </div>
            )}

            {/* ── Results ── */}
            {phase === 'results' && results && (
              <div>
                {/* Score card */}
                <div
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    padding: '48px 32px',
                    textAlign: 'center',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                    marginBottom: '24px',
                  }}
                >
                  <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>
                    Your Readiness Score
                  </p>
                  <div
                    style={{
                      fontSize: '64px',
                      fontWeight: '800',
                      color: gradeInfo.color,
                      lineHeight: 1,
                      marginBottom: '12px',
                    }}
                  >
                    {results.score}
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '6px 16px',
                      backgroundColor: `${gradeInfo.color}15`,
                      color: gradeInfo.color,
                      borderRadius: '20px',
                      fontSize: '15px',
                      fontWeight: '700',
                      marginBottom: '12px',
                      border: `2px solid ${gradeInfo.color}30`,
                    }}
                  >
                    Grade {gradeInfo.grade}: {gradeInfo.label}
                  </div>

                  <p style={{ fontSize: '15px', color: '#6b7280', marginTop: '16px', lineHeight: 1.6 }}>
                    {results.score >= 75
                      ? "You're in a strong position to open a restaurant. Focus on shoring up any weak areas below."
                      : results.score >= 50
                      ? "You have a solid foundation but should address the gaps identified below before committing."
                      : "There are significant areas to develop before opening a restaurant. Use the recommendations below as your roadmap."}
                  </p>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
                    <button
                      onClick={shareResult}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <FaShare /> Share Result
                    </button>
                    <button
                      onClick={resetQuiz}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: 'white',
                        color: '#374151',
                        border: '2px solid #e5e7eb',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <FaRedo /> Retake Quiz
                    </button>
                  </div>
                </div>

                {/* Category breakdown */}
                <div
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '32px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                    marginBottom: '24px',
                  }}
                >
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
                    Category Breakdown
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {Object.entries(results.categories).map(([cat, score]) => (
                      <div key={cat}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                            {CATEGORY_LABELS[cat]}
                          </span>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: CATEGORY_COLORS[cat] }}>
                            {score}%
                          </span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: '#f3f4f6', borderRadius: '999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${score}%`,
                              backgroundColor: CATEGORY_COLORS[cat],
                              borderRadius: '999px',
                              transition: 'width 0.6s ease',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '32px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                  }}
                >
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>
                    Personalized Recommendations
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {Object.entries(results.categories)
                      .filter(([, score]) => score < 70)
                      .sort((a, b) => a[1] - b[1])
                      .map(([cat, score]) => (
                        <div
                          key={cat}
                          style={{
                            padding: '16px 20px',
                            backgroundColor: '#fffbeb',
                            border: '1px solid #fde68a',
                            borderRadius: '12px',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start',
                          }}
                        >
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              backgroundColor: CATEGORY_COLORS[cat],
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              marginTop: '2px',
                            }}
                          >
                            <span style={{ color: 'white', fontSize: '11px', fontWeight: '700' }}>!</span>
                          </span>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: '700', color: '#92400e', margin: '0 0 4px' }}>
                              {CATEGORY_LABELS[cat]} ({score}%)
                            </p>
                            <p style={{ fontSize: '14px', color: '#78350f', margin: 0, lineHeight: 1.5 }}>
                              {CATEGORY_RECOMMENDATIONS[cat]}
                            </p>
                          </div>
                        </div>
                      ))}
                    {Object.entries(results.categories).filter(([, score]) => score < 70).length === 0 && (
                      <div
                        style={{
                          padding: '16px 20px',
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: '12px',
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'center',
                        }}
                      >
                        <FaCheck style={{ color: '#16a34a', flexShrink: 0 }} />
                        <p style={{ fontSize: '14px', color: '#166534', margin: 0, fontWeight: '600' }}>
                          Excellent! You scored well across all categories. You appear ready to move forward with your restaurant plans.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* ── SEO Content ── */}
        <section style={{ padding: '16px 20px 60px' }}>
          <div style={maxW}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>

              <article
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}
              >
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '16px', lineHeight: 1.3 }}>
                  10 Things to Know Before Opening a Restaurant
                </h2>
                <div style={{ fontSize: '15px', lineHeight: 1.7, color: '#374151' }}>
                  <p>
                    Opening a restaurant is one of the most exciting — and risky — ventures in the hospitality industry.
                    Before you sign a lease or invest your savings, there are critical factors that separate successful
                    restaurant owners from those who close within the first year.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>1. Understand the true startup costs.</strong> Most first-time owners underestimate capital requirements
                    by 30–50%. Beyond rent and renovation, you need working capital for 6+ months of operations, marketing launch
                    costs, licensing fees, and an emergency fund for unexpected expenses.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>2. Location is not just about foot traffic.</strong> Consider parking availability, delivery access,
                    nearby competition, lease terms, and whether the neighborhood demographics match your concept.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>3. Your concept must solve a real gap.</strong> Identify what is missing in your target market — whether
                    it is a cuisine type, a price point, or a dining experience — and build around that gap.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>4. Hire for attitude, train for skill.</strong> Reliable staff who care about the customer experience
                    are worth more than experienced workers with poor attitudes.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>5. Technology is no longer optional.</strong> A modern POS system, online ordering, and inventory
                    management are table stakes in today&apos;s restaurant industry.
                  </p>
                </div>
              </article>

              <article
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}
              >
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '16px', lineHeight: 1.3 }}>
                  Restaurant Failure Rate Statistics
                </h2>
                <div style={{ fontSize: '15px', lineHeight: 1.7, color: '#374151' }}>
                  <p>
                    The restaurant industry has one of the highest failure rates of any business sector. Understanding these
                    statistics helps you prepare properly and avoid common pitfalls.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>The numbers are sobering.</strong> Approximately 60% of restaurants fail within their first year of
                    operation, and nearly 80% close before their fifth anniversary. These figures are consistent across markets
                    in India, the US, the UK, and the Middle East.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>Top reasons for failure:</strong> Undercapitalization, poor location choice, lack of a clear concept,
                    inexperienced management, and failure to adapt to market feedback. Food quality alone is rarely the primary
                    reason — it is almost always a business problem, not a cooking problem.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>The good news.</strong> Restaurants opened by people with prior industry experience, adequate capital
                    (12+ months), and a validated concept fail at a much lower rate — closer to 20–30% in the first year.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>Format matters.</strong> QSRs and cloud kitchens tend to have lower failure rates than fine dining,
                    primarily due to lower capital requirements and simpler operations.
                  </p>
                </div>
              </article>

              <article
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}
              >
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '16px', lineHeight: 1.3 }}>
                  First-Time Restaurant Owner Guide
                </h2>
                <div style={{ fontSize: '15px', lineHeight: 1.7, color: '#374151' }}>
                  <p>
                    If this is your first restaurant venture, you are entering one of the most rewarding but demanding
                    industries in the world. Here is practical advice from operators who have been through it.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>Work in a restaurant first.</strong> Even 6 months of hands-on experience will teach you more about
                    operations, customer behavior, and team dynamics than any business course.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>Start with a detailed business plan.</strong> Include a market analysis, competitive landscape,
                    financial projections, staffing plan, and a month-by-month cash flow forecast for the first 18 months.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>Build a financial buffer.</strong> Plan for 12 months of operating expenses in reserve, and assume
                    your revenue projections for the first 6 months will be 30–40% lower than hoped.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>Find a mentor.</strong> Connect with experienced restaurant owners in your area. A single experienced
                    mentor can help you avoid mistakes that would otherwise cost tens of thousands.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    <strong>Focus on systems from day one.</strong> Implement proper POS, inventory tracking, staff scheduling,
                    and accounting systems before you open — not after.
                  </p>
                </div>
              </article>

            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ padding: '0 20px 60px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>
              Frequently Asked Questions
            </h2>
            {[
              {
                q: 'How much money do I need to open a restaurant?',
                a: 'Costs vary dramatically by location and format. In India, a small restaurant can start from ₹10–50 lakhs depending on the city and size. In the USA, expect $150,000–$500,000 for a full-service restaurant. In the UK, budget £75,000–£300,000. These figures include lease deposit, renovation, equipment, initial inventory, licenses, and working capital. Always add a 20–30% contingency buffer.',
              },
              {
                q: "What's the success rate for new restaurants?",
                a: 'Statistics show that approximately 60% of restaurants fail within their first year, and around 80% close within five years. However, restaurants opened by people with prior industry experience, strong capitalization, and a validated concept have failure rates closer to 20–30% in year one. Preparation is the single biggest factor in beating the odds.',
              },
              {
                q: 'Do I need restaurant experience to open one?',
                a: 'It is not legally required, but experience dramatically increases your chances of success. Owners with restaurant backgrounds understand rush periods, staff management, supplier relationships, and food safety compliance in ways that theoretical preparation cannot replicate. If you lack experience, consider working in a restaurant for 6–12 months, or partnering with someone who has operational expertise.',
              },
              {
                q: 'What licenses do I need to open a restaurant?',
                a: 'Requirements vary by country. In India: FSSAI food license, trade license, GST registration, fire safety certificate, and local municipal permits. In the USA: business license, food service license, health department permit, liquor license (if applicable), and fire department clearance. In the UK: register with local council, obtain premises licence (for alcohol), and pass environmental health inspections. Research early — licensing can take 2–6 months.',
              },
              {
                q: 'How long does it take to open a restaurant?',
                a: 'From concept to opening day, expect 6–18 months. The timeline: concept development (1–3 months), securing funding (1–3 months), location search (1–3 months), renovation (2–4 months), licensing (2–6 months, often concurrent), hiring and training (1–2 months), and soft launch (2–4 weeks). Construction, licensing, and financing cause the biggest delays.',
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  overflow: 'hidden',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: '16px',
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827', flex: 1 }}>{item.q}</span>
                  <span style={{ color: '#6366f1', flexShrink: 0 }}>
                    {openFaq === i ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </button>
                {openFaq === i && (
                  <div
                    style={{
                      padding: '0 24px 20px',
                      fontSize: '15px',
                      lineHeight: 1.7,
                      color: '#4b5563',
                      borderTop: '1px solid #f3f4f6',
                      paddingTop: '16px',
                    }}
                  >
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          style={{
            background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
            color: 'white',
            padding: '64px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px' }}>
              Ready to Launch Your Restaurant?
            </h2>
            <p style={{ fontSize: '16px', opacity: 0.85, marginBottom: '28px', lineHeight: 1.6 }}>
              DineOpen POS gives you everything you need from day one — billing, inventory management, staff scheduling,
              online ordering, and real-time analytics. Start your restaurant journey with the right tools in place.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              <Link
                href="/pricing"
                style={{
                  display: 'inline-block',
                  padding: '14px 32px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '16px',
                  textDecoration: 'none',
                }}
              >
                Start Free Trial
              </Link>
              <Link
                href="/demo"
                style={{
                  display: 'inline-block',
                  padding: '14px 32px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '16px',
                  textDecoration: 'none',
                }}
              >
                Book a Demo
              </Link>
            </div>
          </div>
        </section>

        {/* ── Related Tools ── */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '28px' }}>
              Related Free Tools
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { href: '/tools/startup-cost-calculator', label: 'Startup Cost Calculator', desc: 'Estimate your total investment' },
                { href: '/tools/business-plan-generator', label: 'Business Plan Generator', desc: 'Create a professional plan' },
                { href: '/tools/break-even-calculator', label: 'Break-Even Calculator', desc: 'Find your break-even point' },
                { href: '/tools/food-cost-calculator', label: 'Food Cost Calculator', desc: 'Optimize your menu pricing' },
              ].map((tool) => (
                <a
                  key={tool.href}
                  href={tool.href}
                  style={{
                    display: 'block',
                    padding: '20px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)')}
                >
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{tool.label}</p>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>{tool.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <InternalLinks currentPath="/tools/restaurant-quiz" variant="tool" />
        <Footer />
      </div>
    </>
  );
}
