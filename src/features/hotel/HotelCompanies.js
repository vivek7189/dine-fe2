'use client';
import React from 'react';
import { FaBuilding } from 'react-icons/fa';
import HotelShell from './components/HotelShell';
import CompaniesView from './components/CompaniesView';

export default function HotelCompanies() {
  return (
    <HotelShell icon={FaBuilding} title="City Ledger"
      subtitle="Company accounts (bill-to-company) — transfer folios, track receivables, record settlements.">
      {(ctx) => <CompaniesView {...ctx} />}
    </HotelShell>
  );
}
