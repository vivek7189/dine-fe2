'use client';

// Shown on the WhatsApp Ordering screens when ordering is ON but the saved "Phone Number ID" can't be
// Meta's (Meta's IDs are 14–20 digits, e.g. 1054061551129079; a 10-digit phone number was typed in).
// With a wrong ID no customer message ever reaches the bot.
export const badPhoneNumberId = (config) => {
  const id = String((config && config.phoneNumberId) || '').trim();
  return !!(config && config.enabled && id && !/^\d{14,20}$/.test(id));
};

export default function WhatsAppNumberIdWarning({ config }) {
  if (!badPhoneNumberId(config)) return null;
  return (
    <div role="alert" data-testid="wa-number-id-warning" style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 14, padding: '14px 16px', marginBottom: 18 }}>
      <div style={{ fontWeight: 800, fontSize: 15, color: '#b91c1c' }}>⚠️ WhatsApp orders are not reaching you</div>
      <div style={{ fontSize: 13.5, color: '#7f1d1d', marginTop: 6, lineHeight: 1.5 }}>
        The <b>Phone Number ID</b> saved here (<b>{String(config.phoneNumberId)}</b>) is a phone number, not the ID from Meta.
        Because of this, customer messages never reach the ordering bot.
      </div>
      <div style={{ fontSize: 13.5, color: '#7f1d1d', marginTop: 6, lineHeight: 1.5 }}>
        Fix: connect your WhatsApp number again from <b>Admin → WhatsApp</b> (Meta fills the right ID), or turn WhatsApp ordering off.
        Need help? Message DineOpen support.
      </div>
    </div>
  );
}
