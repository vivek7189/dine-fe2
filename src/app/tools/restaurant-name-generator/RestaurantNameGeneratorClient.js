'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';

const nameDatabase = {
  indian: ['Spice Garden', 'Curry House', 'Tandoor Palace', 'Masala Magic', 'Saffron Kitchen', 'The Dhaba', 'Naan Stop', 'Chutney Corner', 'Biryani Express', 'Roti Grill', 'Desi Delight', 'Punjab Junction', 'Mirchi Masala', 'Thali House', 'Bombay Bites'],
  italian: ['Bella Italia', 'La Trattoria', 'Pasta Paradise', 'Il Forno', 'Olive Garden', 'Mamma Mia', 'Tuscan Table', 'Pizza Perfecto', 'Dolce Vita', 'Risotto Room', 'Capri Kitchen', 'Roma Ristorante', 'Napoli Nights', 'Venice View', 'Sicilian Sun'],
  chinese: ['Golden Dragon', 'Jade Palace', 'Wok & Roll', 'Lucky Panda', 'Dragon Pearl', 'Bamboo Garden', 'Ming Dynasty', 'Fortune Kitchen', 'Red Lantern', 'Happy Dumpling', 'Szechuan Star', 'Noodle House', 'Dim Sum Den', 'Great Wall', 'Peking House'],
  mexican: ['El Toro', 'Casa del Sol', 'Taco Loco', 'La Fiesta', 'Salsa Verde', 'Amigos', 'Cantina Mexicana', 'El Burrito', 'Guadalajara Grill', 'Margarita House', 'Aztec Kitchen', 'Chipotle Corner', 'Frida\'s Kitchen', 'Oaxaca Nights', 'Tijuana Table'],
  cafe: ['The Daily Grind', 'Brew & Bite', 'Coffee Corner', 'Morning Blend', 'The Roasted Bean', 'Espresso Express', 'Cafe Mocha', 'Bean There', 'Latte Love', 'The Coffee House', 'Cuppa Joy', 'Steam & Sip', 'Perks & Pastry', 'The Beanery', 'Java Junction'],
  bar: ['The Tipsy Cow', 'Moonshine Bar', 'The Brass Tap', 'Cheers', 'The Rusty Nail', 'Cocktail Club', 'The Whiskey Den', 'Pour House', 'The Tap Room', 'Bourbon & Barrel', 'The Speak Easy', 'Gin & Juice', 'The Beer Garden', 'Hops & Dreams', 'Night Owl'],
  foodtruck: ['Wheels of Flavor', 'Rolling Bites', 'Street Eats', 'The Lunch Box', 'Roaming Kitchen', 'Flavor Express', 'Tasty Travels', 'Mobile Munchies', 'Curbside Cuisine', 'Food on Wheels', 'The Hungry Truck', 'Drive & Dine', 'Street Chef', 'Quick Bites', 'Rolling Stone Eats'],
  finedining: ['The Gilded Fork', 'Ember & Vine', 'Azure', 'The Grand Table', 'Noir', 'Maison Blanc', 'The Velvet Room', 'Opus', 'Citrine', 'The Oak Room', 'Lumiere', 'Silhouette', 'The Atelier', 'Ivory Tower', 'Prestige'],
  bakery: ['Sweet Delights', 'The Flour Shop', 'Crumbs & Cream', 'Sugar & Spice', 'The Bread Basket', 'Golden Crust', 'Whisk & Roll', 'The Pastry House', 'Dough & Co', 'Oven Fresh', 'Cake Walk', 'Butter Bliss', 'The Rolling Pin', 'Honey Bun', 'Sweet Spot'],
  seafood: ['The Catch', 'Ocean Grill', 'Blue Water', 'Captain\'s Table', 'Lobster Pot', 'Fish Market', 'The Oyster Bar', 'Pier 42', 'Sea Salt', 'Coral Reef', 'Neptune\'s Kitchen', 'Anchors Away', 'The Crab Shack', 'Tidal Table', 'Marina Grill'],
};

const adjectives = ['Golden', 'Royal', 'Urban', 'Classic', 'Modern', 'Rustic', 'Cozy', 'Grand', 'Little', 'Hidden', 'Famous', 'Secret', 'Magic', 'Happy', 'Lucky'];
const suffixes = ['Kitchen', 'Table', 'House', 'Place', 'Corner', 'Spot', 'Room', 'Grill', 'Bistro', 'Eatery', 'Diner', 'Cafe', 'Lounge', 'Den', 'Hub'];

export default function RestaurantNameGeneratorClient() {
  const [cuisine, setCuisine] = useState('cafe');
  const [generatedNames, setGeneratedNames] = useState([]);
  const [savedNames, setSavedNames] = useState([]);

  const generateNames = () => {
    const baseNames = nameDatabase[cuisine] || nameDatabase.cafe;
    const shuffled = [...baseNames].sort(() => Math.random() - 0.5);

    // Also generate some random combinations
    const randomNames = [];
    for (let i = 0; i < 5; i++) {
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const suf = suffixes[Math.floor(Math.random() * suffixes.length)];
      randomNames.push(`The ${adj} ${suf}`);
    }

    setGeneratedNames([...shuffled.slice(0, 10), ...randomNames.slice(0, 5)]);
  };

  const saveName = (name) => {
    if (!savedNames.includes(name)) {
      setSavedNames([...savedNames, name]);
    }
  };

  const cuisineOptions = [
    { value: 'cafe', label: 'Cafe / Coffee Shop' },
    { value: 'indian', label: 'Indian Restaurant' },
    { value: 'italian', label: 'Italian Restaurant' },
    { value: 'chinese', label: 'Chinese Restaurant' },
    { value: 'mexican', label: 'Mexican Restaurant' },
    { value: 'bar', label: 'Bar / Pub' },
    { value: 'foodtruck', label: 'Food Truck' },
    { value: 'finedining', label: 'Fine Dining' },
    { value: 'bakery', label: 'Bakery' },
    { value: 'seafood', label: 'Seafood Restaurant' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
              Restaurant Name Generator
            </h1>
            <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
              Generate creative, unique restaurant names for your new venture. Choose your cuisine type and get instant name ideas.
            </p>
          </div>

          {/* Generator Card */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '40px' }}>
            {/* Cuisine Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                Select Your Restaurant Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                {cuisineOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setCuisine(option.value)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: cuisine === option.value ? '2px solid #ef4444' : '1px solid #d1d5db',
                      backgroundColor: cuisine === option.value ? '#fef2f2' : 'white',
                      color: cuisine === option.value ? '#ef4444' : '#374151',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateNames}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer',
                marginBottom: '24px',
              }}
            >
              Generate Restaurant Names
            </button>

            {/* Generated Names */}
            {generatedNames.length > 0 && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
                  Generated Names (Click to save)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {generatedNames.map((name, idx) => (
                    <button
                      key={idx}
                      onClick={() => saveName(name)}
                      style={{
                        padding: '16px',
                        backgroundColor: savedNames.includes(name) ? '#d1fae5' : '#f3f4f6',
                        border: savedNames.includes(name) ? '2px solid #10b981' : '1px solid #e5e7eb',
                        borderRadius: '10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                      }}
                    >
                      {name} {savedNames.includes(name) && '✓'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Saved Names */}
          {savedNames.length > 0 && (
            <div style={{ backgroundColor: '#ecfdf5', borderRadius: '16px', padding: '24px', marginBottom: '40px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#065f46', marginBottom: '12px' }}>
                Your Saved Names ({savedNames.length})
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {savedNames.map((name, idx) => (
                  <span key={idx} style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', borderRadius: '20px', fontWeight: '500' }}>
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>
              Tips for Choosing a Restaurant Name
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                'Keep it short and memorable (2-3 words ideal)',
                'Make sure it\'s easy to spell and pronounce',
                'Check if the domain name is available',
                'Verify it\'s not trademarked',
                'Consider how it looks on signage and menus',
                'Test it with potential customers',
                'Make sure it reflects your cuisine or concept',
              ].map((tip, idx) => (
                <li key={idx} style={{ padding: '12px 0', borderBottom: idx < 6 ? '1px solid #e5e7eb' : 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#10b981', fontWeight: '700' }}>✓</span>
                  <span style={{ color: '#4b5563' }}>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#ef4444', borderRadius: '16px', color: 'white' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>
              Ready to Start Your Restaurant?
            </h2>
            <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>
              DineOpen provides everything you need: POS, menus, billing, AI ordering & more.
            </p>
            <Link
              href="https://dineopen.com/login"
              style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}
            >
              Start Free 30-Day Trial →
            </Link>
          </div>
        </div>
      </div>
      <InternalLinks currentPath="/tools/restaurant-name-generator" variant="tool" />
      <Footer />
    </>
  );
}
