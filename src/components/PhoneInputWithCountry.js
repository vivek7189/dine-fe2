'use client';

import { useState, useMemo } from 'react';
import { FaChevronDown, FaSearch } from 'react-icons/fa';
import { countries } from '../lib/countries';

/**
 * Reusable phone input with a searchable country-code selector.
 * The parent owns both the dialling country and the local digits so it can
 * build the full E.164 number (`country.dialCode + value`) for OTP / order APIs.
 *
 * Props:
 *  - country          selected country object ({ code, name, flag, dialCode })
 *  - onCountryChange  (country) => void
 *  - value            local phone digits (no country code)
 *  - onChange         (digits) => void  — receives sanitised digits
 *  - placeholder      input placeholder
 *  - size             'sm' (compact, cart modal) | 'md' (login popup)
 *  - accentColor      focus/hover accent (defaults to brand red)
 *  - error            boolean — red border when true
 *  - autoFocus        boolean
 */
export default function PhoneInputWithCountry({
  country,
  onCountryChange,
  value = '',
  onChange,
  placeholder = 'Phone number',
  size = 'md',
  accentColor = '#ef4444',
  error = false,
  autoFocus = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  // India keeps its strict 10-digit cap; other countries allow up to 15 (E.164).
  const maxLen = country?.code === 'IN' ? 10 : 15;
  const pad = size === 'sm' ? '10px 12px' : '14px';
  const fontSize = size === 'sm' ? '14px' : '16px';
  const radius = size === 'sm' ? '10px' : '12px';

  const handleDigits = (raw) => onChange((raw || '').replace(/\D/g, '').slice(0, maxLen));

  const selectCountry = (c) => {
    onCountryChange?.(c);
    setOpen(false);
    setSearch('');
    try {
      if (c?.code) localStorage.setItem('selectedCountryCode', c.code);
    } catch { /* ignore */ }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          border: `2px solid ${error ? '#ef4444' : '#e5e7eb'}`,
          borderRadius: radius,
          backgroundColor: 'white',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
      >
        {/* Country selector */}
        <div
          onClick={() => setOpen((o) => !o)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: pad,
            cursor: 'pointer',
            borderRight: '1px solid #e5e7eb',
            userSelect: 'none',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '16px' }}>{country?.flag}</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
            {country?.dialCode}
          </span>
          <FaChevronDown
            style={{
              fontSize: '9px',
              color: '#9ca3af',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </div>

        {/* Local number */}
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => handleDigits(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            minWidth: 0,
            padding: pad,
            border: 'none',
            outline: 'none',
            fontSize,
            backgroundColor: 'transparent',
            borderTopRightRadius: radius,
            borderBottomRightRadius: radius,
          }}
          onFocus={(e) => {
            e.target.parentNode.style.borderColor = accentColor;
          }}
          onBlur={(e) => {
            e.target.parentNode.style.borderColor = error ? '#ef4444' : '#e5e7eb';
          }}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <>
          {/* click-away backdrop */}
          <div
            onClick={() => { setOpen(false); setSearch(''); }}
            style={{ position: 'fixed', inset: 0, zIndex: 500 }}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              width: '300px',
              maxWidth: '92vw',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.12), 0 4px 6px rgba(0,0,0,0.05)',
              zIndex: 501,
              marginTop: '4px',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ position: 'relative' }}>
                <FaSearch
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    fontSize: '12px',
                  }}
                />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search countries..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 8px 8px 30px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none',
                    backgroundColor: '#f9fafb',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
            <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
              {filtered.map((c) => (
                <div
                  key={c.code}
                  onClick={() => selectCountry(c)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    borderBottom: '1px solid #f8fafc',
                    color: c.code === country?.code ? '#1f2937' : '#374151',
                    backgroundColor: c.code === country?.code ? '#f1f5f9' : 'white',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = c.code === country?.code ? '#f1f5f9' : 'white';
                  }}
                >
                  <span style={{ fontSize: '18px', minWidth: '24px' }}>{c.flag}</span>
                  <span style={{ flex: 1, fontWeight: 500 }}>{c.name}</span>
                  <span style={{ color: '#6b7280', fontWeight: 600, fontSize: '13px' }}>{c.dialCode}</span>
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                  No countries found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
