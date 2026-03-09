'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import useAITool from '../../../hooks/useAITool';
import { FaMagic, FaCopy, FaRedo, FaUtensils, FaCheckCircle } from 'react-icons/fa';

export default function MenuDescriptionGeneratorClient() {
  const [dishName, setDishName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [cuisine, setCuisine] = useState('indian');
  const [tone, setTone] = useState('casual');
  const [dietaryTags, setDietaryTags] = useState([]);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [copied, setCopied] = useState(false);

  const { generate, isGenerating, error, remaining } = useAITool('menu-description');

  const cuisines = [
    { value: 'indian', label: 'Indian' },
    { value: 'chinese', label: 'Chinese/Indo-Chinese' },
    { value: 'italian', label: 'Italian' },
    { value: 'mexican', label: 'Mexican' },
    { value: 'american', label: 'American' },
    { value: 'thai', label: 'Thai' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'continental', label: 'Continental' },
  ];

  const tones = [
    { value: 'casual', label: 'Casual & Friendly', desc: 'Warm, approachable language' },
    { value: 'fineDining', label: 'Fine Dining', desc: 'Elegant, sophisticated' },
    { value: 'quirky', label: 'Quirky & Fun', desc: 'Playful, memorable' },
    { value: 'healthFocused', label: 'Health-Focused', desc: 'Emphasize nutrition' },
    { value: 'indulgent', label: 'Indulgent', desc: 'Rich, tempting' },
  ];

  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Jain', 'No Onion-Garlic', 'Keto', 'Low-Calorie'];

  const toggleDietary = (tag) => {
    setDietaryTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleGenerate = async () => {
    if (!dishName.trim()) {
      alert('Please enter a dish name');
      return;
    }

    const result = await generate({
      dishName,
      ingredients: [ingredients, dietaryTags.length > 0 ? `Dietary: ${dietaryTags.join(', ')}` : ''].filter(Boolean).join('. '),
      cuisine: cuisines.find(c => c.value === cuisine)?.label || cuisine,
      style: tone,
    });

    if (result) {
      setGeneratedDescription(result);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDescription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', marginBottom: '16px', fontSize: '14px' }}>
              <FaMagic /> AI-Powered &bull; Free, No Login
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Menu Description Generator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Create appetizing, professional dish descriptions for your menu in seconds.
            </p>
          </div>
        </section>

        {/* Generator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              {/* Dish Name */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  <FaUtensils style={{ marginRight: '8px' }} />
                  Dish Name *
                </label>
                <input
                  type="text"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="e.g., Butter Chicken, Margherita Pizza, Pad Thai"
                  style={{ width: '100%', padding: '14px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '16px' }}
                />
              </div>

              {/* Ingredients */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Key Ingredients (optional)
                </label>
                <input
                  type="text"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="e.g., tender chicken, rich tomato gravy, aromatic spices"
                  style={{ width: '100%', padding: '14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '15px' }}
                />
              </div>

              {/* Cuisine & Tone */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Cuisine Type
                  </label>
                  <select
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                  >
                    {cuisines.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Tone/Style
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                  >
                    {tones.map(t => <option key={t.value} value={t.value}>{t.label} - {t.desc}</option>)}
                  </select>
                </div>
              </div>

              {/* Dietary Tags */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Dietary Tags (optional)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {dietaryOptions.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleDietary(tag)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: dietaryTags.includes(tag) ? '#ec4899' : '#f3f4f6',
                        color: dietaryTags.includes(tag) ? 'white' : '#374151',
                        border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '500'
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{
                  width: '100%', padding: '16px',
                  background: isGenerating ? '#9ca3af' : 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                  color: 'white', border: 'none', borderRadius: '10px',
                  fontSize: '18px', fontWeight: '700', cursor: isGenerating ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                }}
              >
                {isGenerating ? <>Generating...</> : <><FaMagic /> Generate Description</>}
              </button>

              {remaining !== null && (
                <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '13px', color: '#6b7280' }}>
                  {remaining} free generations remaining today
                </p>
              )}
              {error && (
                <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '14px', color: '#dc2626', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px' }}>
                  {error}
                </p>
              )}

              {/* Generated Description */}
              {generatedDescription && (
                <div style={{ marginTop: '32px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#111827' }}>
                    Generated Description for &quot;{dishName}&quot;
                  </h3>
                  <div style={{
                    padding: '20px', backgroundColor: '#fdf2f8', borderRadius: '12px',
                    border: '1px solid #fbcfe8'
                  }}>
                    <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.7, marginBottom: '12px', whiteSpace: 'pre-wrap' }}>
                      {generatedDescription}
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={handleCopy}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '8px 16px', backgroundColor: copied ? '#059669' : '#ec4899',
                          color: 'white', border: 'none', borderRadius: '6px',
                          fontSize: '13px', fontWeight: '500', cursor: 'pointer'
                        }}
                      >
                        {copied ? <><FaCheckCircle /> Copied!</> : <><FaCopy /> Copy</>}
                      </button>
                      <button
                        onClick={handleGenerate}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151',
                          border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
                        }}
                      >
                        <FaRedo /> Regenerate
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tips */}
        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>
              Menu Writing Tips
            </h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {[
                { title: 'Be specific about ingredients', desc: 'Mention premium ingredients: "aged cheddar" instead of just "cheese"' },
                { title: 'Use sensory words', desc: 'Words like crispy, tender, aromatic, zesty make dishes come alive' },
                { title: 'Keep it concise', desc: 'Aim for 15-25 words. Long descriptions don\'t get read' },
                { title: 'Highlight what\'s special', desc: 'House-made, locally sourced, chef\'s secret recipe' },
              ].map((tip, idx) => (
                <div key={idx} style={{ padding: '20px', backgroundColor: '#fdf2f8', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#be185d', marginBottom: '4px' }}>{tip.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#ec4899', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Create Your Digital Menu</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>DineOpen creates beautiful QR menus with professional descriptions for all your dishes.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#ec4899', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        <InternalLinks currentPath="/tools/menu-description-generator" variant="tool" />
      </div>
      <Footer />
    </>
  );
}
