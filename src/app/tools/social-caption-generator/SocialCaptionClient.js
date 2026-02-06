'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function SocialCaptionClient() {
  const [postType, setPostType] = useState('food');
  const [dishName, setDishName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [tone, setTone] = useState('engaging');
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState([]);
  const [apiCallsUsed, setApiCallsUsed] = useState(0);
  const MAX_API_CALLS = 10;

  useEffect(() => {
    const loginStatus = localStorage.getItem('dineopen_logged_in');
    const calls = localStorage.getItem('dineopen_caption_gen_calls');
    setIsLoggedIn(loginStatus === 'true');
    setApiCallsUsed(parseInt(calls) || 0);
  }, []);

  const postTypes = [
    { value: 'food', label: 'Food Photography' },
    { value: 'promo', label: 'Promotion/Offer' },
    { value: 'event', label: 'Event Announcement' },
    { value: 'behind', label: 'Behind the Scenes' },
    { value: 'team', label: 'Team/Staff' },
    { value: 'customer', label: 'Customer Love' },
  ];

  const tones = [
    { value: 'engaging', label: 'Engaging' },
    { value: 'funny', label: 'Funny/Witty' },
    { value: 'professional', label: 'Professional' },
    { value: 'emotional', label: 'Emotional' },
    { value: 'minimal', label: 'Minimal' },
  ];

  const handleGenerate = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (apiCallsUsed >= MAX_API_CALLS) {
      alert('You have reached the limit of 10 free generations.');
      return;
    }

    setIsGenerating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const captions = generateMockCaptions();
      setGeneratedCaptions(captions);

      const newCount = apiCallsUsed + 1;
      setApiCallsUsed(newCount);
      localStorage.setItem('dineopen_caption_gen_calls', newCount.toString());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockCaptions = () => {
    const captionsByType = {
      food: [
        `${includeEmojis ? '🍽️ ' : ''}This isn${`'`}t just food, it${`'`}s a love story on a plate.${includeHashtags ? '\n\n#FoodPorn #Foodie #InstaFood #Delicious #FoodPhotography' : ''}`,
        `${includeEmojis ? '😋 ' : ''}When the cravings hit, we${`'`}ve got you covered!${includeHashtags ? '\n\n#FoodLovers #YumYum #FoodGram #Tasty' : ''}`,
        `${includeEmojis ? '✨ ' : ''}Freshly made, crafted with love, ready to make your day.${includeHashtags ? '\n\n#ChefLife #Homemade #FreshFood #FoodArt' : ''}`,
      ],
      promo: [
        `${includeEmojis ? '🔥 ' : ''}LIMITED TIME OFFER! Don${`'`}t miss out on this deal!${includeHashtags ? '\n\n#SpecialOffer #Discount #FoodDeal #WeekendVibes' : ''}`,
        `${includeEmojis ? '🎉 ' : ''}Your taste buds called. They want you to claim this offer NOW!${includeHashtags ? '\n\n#Offer #Foodie #DontMissOut' : ''}`,
        `${includeEmojis ? '💯 ' : ''}Because good food at great prices is always a YES!${includeHashtags ? '\n\n#ValueForMoney #FoodDeals #HungryMuch' : ''}`,
      ],
      event: [
        `${includeEmojis ? '📅 ' : ''}Mark your calendars! Something exciting is cooking...${includeHashtags ? '\n\n#Event #FoodEvent #ComingSoon #StayTuned' : ''}`,
        `${includeEmojis ? '🎊 ' : ''}Join us for a celebration of flavors!${includeHashtags ? '\n\n#EventAlert #FoodFestival #PartyTime' : ''}`,
      ],
      behind: [
        `${includeEmojis ? '👨‍🍳 ' : ''}Behind every great dish is a kitchen full of passion.${includeHashtags ? '\n\n#BehindTheScenes #KitchenLife #ChefMode' : ''}`,
        `${includeEmojis ? '🔥 ' : ''}Where the magic happens! A sneak peek into our kitchen.${includeHashtags ? '\n\n#KitchenDiaries #ChefLife #CookingWithLove' : ''}`,
      ],
      team: [
        `${includeEmojis ? '👏 ' : ''}Meet the incredible team that makes it all happen!${includeHashtags ? '\n\n#TeamWork #RestaurantLife #OurTeam' : ''}`,
        `${includeEmojis ? '❤️ ' : ''}Our secret ingredient? The amazing people behind every plate.${includeHashtags ? '\n\n#TeamLove #StaffAppreciation' : ''}`,
      ],
      customer: [
        `${includeEmojis ? '🙏 ' : ''}Your smiles make everything worth it! Thank you for the love.${includeHashtags ? '\n\n#CustomerLove #ThankYou #HappyCustomers' : ''}`,
        `${includeEmojis ? '💕 ' : ''}Moments like these remind us why we do what we do.${includeHashtags ? '\n\n#GratefulHeart #CustomerFirst' : ''}`,
      ],
    };

    return (captionsByType[postType] || captionsByType.food).map(caption => ({
      caption,
      platform: 'Instagram/Facebook',
    }));
  };

  const handleLogin = () => {
    window.location.href = 'https://app.dineopen.com/login?redirect=' + encodeURIComponent(window.location.href);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>
              ✨ AI-Powered
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Social Media Caption Generator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Create engaging Instagram & Facebook captions for your restaurant
            </p>
          </div>
        </section>

        {/* Generator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
              {/* Input */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Post Details</h3>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Post Type
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {postTypes.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setPostType(opt.value)}
                        style={{
                          padding: '10px',
                          backgroundColor: postType === opt.value ? '#8b5cf6' : '#f3f4f6',
                          color: postType === opt.value ? 'white' : '#374151',
                          border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600'
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Dish/Subject Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    placeholder="e.g., Butter Chicken, Weekend Brunch"
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Occasion (Optional)
                  </label>
                  <input
                    type="text"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    placeholder="e.g., Diwali, Valentine's Day, Weekend"
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Tone
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {tones.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setTone(opt.value)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: tone === opt.value ? '#8b5cf6' : '#f3f4f6',
                          color: tone === opt.value ? 'white' : '#374151',
                          border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: '600'
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={includeEmojis} onChange={(e) => setIncludeEmojis(e.target.checked)} />
                    <span style={{ fontSize: '14px' }}>Include Emojis</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={includeHashtags} onChange={(e) => setIncludeHashtags(e.target.checked)} />
                    <span style={{ fontSize: '14px' }}>Include Hashtags</span>
                  </label>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  style={{
                    width: '100%', padding: '14px',
                    background: isGenerating ? '#9ca3af' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white', border: 'none', borderRadius: '8px', cursor: isGenerating ? 'not-allowed' : 'pointer',
                    fontWeight: '700', fontSize: '16px'
                  }}
                >
                  {isGenerating ? 'Generating...' : '✨ Generate Captions'}
                </button>

                {isLoggedIn && (
                  <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
                    {MAX_API_CALLS - apiCallsUsed} free generations remaining
                  </p>
                )}
              </div>

              {/* Results */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Generated Captions</h3>

                {generatedCaptions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {generatedCaptions.map((item, i) => (
                      <div
                        key={i}
                        style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: '#f5f3ff' }}
                      >
                        <p style={{ fontSize: '14px', color: '#111827', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                          {item.caption}
                        </p>
                        <button
                          onClick={() => copyToClipboard(item.caption)}
                          style={{
                            marginTop: '12px', padding: '8px 16px', backgroundColor: '#8b5cf6', color: 'white',
                            border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600'
                          }}
                        >
                          Copy Caption
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>📱</p>
                    <p>Select post type and click Generate for AI-powered caption ideas</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#8b5cf6', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Boost Your Restaurant Marketing</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>DineOpen helps you engage customers through WhatsApp, SMS, and social media.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#8b5cf6', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial
            </Link>
          </div>
        </section>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</p>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Login Required</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Create a free account to generate AI captions. You get 10 free generations!
            </p>
            <button
              onClick={handleLogin}
              style={{
                width: '100%', padding: '14px', backgroundColor: '#8b5cf6', color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', marginBottom: '12px'
              }}
            >
              Login / Sign Up Free
            </button>
            <button
              onClick={() => setShowLoginModal(false)}
              style={{
                width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#6b7280',
                border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
