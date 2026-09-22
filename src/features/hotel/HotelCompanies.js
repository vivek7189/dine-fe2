'use client';
import React from 'react';
import HotelShell from './components/HotelShell';
import CompaniesView from './components/CompaniesView';

export default function HotelCompanies() {
  return <HotelShell>{(ctx) => (
    <>
      <h1 className="font-serif text-[28px] font-semibold leading-tight tracking-[-0.01em] text-[var(--h-ink)]">City Ledger</h1>
      <p className="mt-1 mb-6 text-[13.5px] text-[var(--h-muted2)]">Company accounts (bill-to-company) — transfer folios, track receivables, record settlements.</p>
      <CompaniesView {...ctx} />
    </>
  )}</HotelShell>;
}
