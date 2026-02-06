'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaMagic, FaCopy, FaRedo, FaLock, FaUtensils, FaCheckCircle } from 'react-icons/fa';

export default function MenuDescriptionGeneratorClient() {
  const [dishName, setDishName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [cuisine, setCuisine] = useState('indian');
  const [tone, setTone] = useState('casual');
  const [dietaryTags, setDietaryTags] = useState([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescriptions, setGeneratedDescriptions] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

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
    if (dietaryTags.includes(tag)) {
      setDietaryTags(dietaryTags.filter(t => t !== tag));
    } else {
      setDietaryTags([...dietaryTags, tag]);
    }
  };

  const handleGenerate = async () => {
    if (!dishName.trim()) {
      alert('Please enter a dish name');
      return;
    }

    // Check if user is logged in (you would check actual auth state here)
    const isLoggedIn = false; // Replace with actual auth check

    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    // If logged in, call API
    generateDescriptions();
  };

  const generateDescriptions = async () => {
    setIsGenerating(true);
    setGeneratedDescriptions([]);

    // Simulate API call - In production, this would call your AI endpoint
    setTimeout(() => {
      const mockDescriptions = generateMockDescriptions();
      setGeneratedDescriptions(mockDescriptions);
      setIsGenerating(false);
    }, 2000);
  };

  const generateMockDescriptions = () => {
    // These would come from your AI API
    const templates = {
      casual: [
        `Our ${dishName} is comfort food at its best! Made with ${ingredients || 'fresh ingredients'}, this dish brings all the flavors you love to your table.`,
        `Craving something delicious? Try our ${dishName} - a crowd favorite that never disappoints. ${dietaryTags.length > 0 ? dietaryTags.join(', ') + ' friendly!' : ''}`,
        `${dishName} done right! We take ${ingredients || 'quality ingredients'} and turn them into pure magic. Your taste buds will thank you.`,
      ],
      fineDining: [
        `An exquisite preparation of ${dishName}, artfully crafted with ${ingredients || 'the finest seasonal ingredients'}. A symphony of flavors that elevates the dining experience.`,
        `Discover the elegance of our ${dishName} - a thoughtfully composed dish where ${ingredients || 'premium ingredients'} come together in perfect harmony.`,
        `Our chef\'s interpretation of ${dishName} showcases culinary mastery. ${ingredients ? `Featuring ${ingredients},` : ''} each element is carefully balanced to create a memorable experience.`,
      ],
      quirky: [
        `Holy moly, it\'s ${dishName}! This bad boy is loaded with ${ingredients || 'goodness'} and ready to rock your world. You\'ve been warned.`,
        `${dishName}: Because life\'s too short for boring food! We packed in ${ingredients || 'all the good stuff'} and added a dash of awesome.`,
        `Meet your new obsession: ${dishName}! It\'s like a party in your mouth and everyone\'s invited. ${dietaryTags.length > 0 ? `Plus, it\'s ${dietaryTags.join(' & ')}!` : ''}`,
      ],
      healthFocused: [
        `Nourish your body with our ${dishName}. Crafted with ${ingredients || 'wholesome ingredients'}, this dish delivers both nutrition and flavor. ${dietaryTags.length > 0 ? dietaryTags.join(', ') + '.' : ''}`,
        `Feel good about what you eat! Our ${dishName} features ${ingredients || 'nutrient-rich ingredients'} that fuel your day without compromising on taste.`,
        `Healthy never tasted so good! Try our ${dishName} - a perfect balance of ${ingredients || 'fresh, quality ingredients'} designed for mindful eating.`,
      ],
      indulgent: [
        `Give in to temptation with our ${dishName}. Rich, decadent, and absolutely irresistible. Made with ${ingredients || 'premium ingredients'} for the ultimate indulgence.`,
        `${dishName}: Pure indulgence on a plate. We don\'t hold back on ${ingredients || 'the good stuff'}. Go ahead, you deserve this.`,
        `Warning: Our ${dishName} is dangerously delicious! Loaded with ${ingredients || 'incredible flavors'}, this dish is for those who believe in treating themselves.`,
      ],
    };

    return templates[tone] || templates.casual;
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleLoginAndGenerate = () => {
    // Redirect to login with return URL
    window.location.href = `https://app.dineopen.com/login?returnUrl=${encodeURIComponent(window.location.href)}&action=menu-generator`;
  };

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', marginBottom: '16px', fontSize: '14px' }}>
              <FaMagic /> AI-Powered
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
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <><FaMagic /> Generate Descriptions</>
                )}
              </button>

              {/* Login Prompt Modal */}
              {showLoginPrompt && (
                <div style={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 1000, padding: '20px'
                }}>
                  <div style={{
                    backgroundColor: 'white', borderRadius: '16px', padding: '32px',
                    maxWidth: '400px', width: '100%', textAlign: 'center'
                  }}>
                    <div style={{
                      width: '64px', height: '64px', backgroundColor: '#fce7f3', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                    }}>
                      <FaLock style={{ color: '#ec4899', fontSize: '24px' }} />
                    </div>
                    <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px', color: '#111827' }}>
                      Free Account Required
                    </h3>
                    <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '24px' }}>
                      Sign up for a free DineOpen account to generate AI menu descriptions. It only takes 30 seconds!
                    </p>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <button
                        onClick={handleLoginAndGenerate}
                        style={{
                          padding: '14px', backgroundColor: '#ec4899', color: 'white',
                          border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer'
                        }}
                      >
                        Sign Up Free
                      </button>
                      <button
                        onClick={() => setShowLoginPrompt(false)}
                        style={{
                          padding: '14px', backgroundColor: '#f3f4f6', color: '#374151',
                          border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '16px' }}>
                      Already have an account? <a href="https://app.dineopen.com/login" style={{ color: '#ec4899' }}>Log in</a>
                    </p>
                  </div>
                </div>
              )}

              {/* Generated Descriptions */}
              {generatedDescriptions.length > 0 && (
                <div style={{ marginTop: '32px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#111827' }}>
                    Generated Descriptions for &quot;{dishName}&quot;
                  </h3>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {generatedDescriptions.map((desc, idx) => (
                      <div key={idx} style={{
                        padding: '20px', backgroundColor: '#fdf2f8', borderRadius: '12px',
                        border: '1px solid #fbcfe8', position: 'relative'
                      }}>
                        <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.7, marginBottom: '12px' }}>
                          {desc}
                        </p>
                        <button
                          onClick={() => handleCopy(desc, idx)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 16px', backgroundColor: copiedIndex === idx ? '#059669' : '#ec4899',
                            color: 'white', border: 'none', borderRadius: '6px',
                            fontSize: '13px', fontWeight: '500', cursor: 'pointer'
                          }}
                        >
                          {copiedIndex === idx ? <><FaCheckCircle /> Copied!</> : <><FaCopy /> Copy</>}
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleGenerate}
                    style={{
                      marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '12px 24px', backgroundColor: '#f3f4f6', color: '#374151',
                      border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
                    }}
                  >
                    <FaRedo /> Generate More
                  </button>
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
            <Link href="https://app.dineopen.com/register" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#ec4899', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
