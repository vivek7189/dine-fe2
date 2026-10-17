'use client';

// Phone-first start box for ad landing pages: keeps the number in sessionStorage (never the URL)
// for /login to pre-fill, the same hand-off as the homepage hero.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '../../../lib/analytics';
import { gtagEvent } from '../../../lib/googleTag';
import { DIAL_COUNTRIES } from '../../../lib/dialCountries';

const PREFILL_PHONE_KEY = 'dineopen_prefill_phone';

export default function LPStart({ slug, dial, id }) {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const c = DIAL_COUNTRIES.find((x) => x.code === dial);
  const prefix = c ? `${c.flag} ${c.dialCode}` : '';

  const start = (e) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits && (digits.length < 6 || digits.length > 15)) { setError('Please check the phone number'); return; }
    if (digits) {
      try { sessionStorage.setItem(PREFILL_PHONE_KEY, JSON.stringify({ country: dial, number: digits })); } catch { /* private mode */ }
    }
    track('lp_cta_click', { slug, cta: 'trial', withPhone: Boolean(digits) });
    gtagEvent('trial_click', { lp: slug });
    router.push('/login');
  };

  return (
    <form className="lp-start" onSubmit={start} noValidate>
      <label htmlFor={id} className="lp-sr">Your mobile number</label>
      <div className="lp-phone">
        {prefix ? <span className="lp-dial">{prefix}</span> : null}
        <input id={id} type="tel" inputMode="tel" autoComplete="tel" placeholder="Mobile number"
          value={phone} onChange={(e) => { setPhone(e.target.value); setError(''); }} />
      </div>
      <button type="submit" className="lp-btn">Start free trial →</button>
      {error ? <p className="lp-err" role="alert">{error}</p> : null}
    </form>
  );
}
