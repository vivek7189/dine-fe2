'use client';
// Shared sub-navigation for the hotel PMS pages. Removable with the feature.
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHotel, FaCalendarCheck, FaDoorClosed, FaTh, FaBroom, FaChartLine } from 'react-icons/fa';

const LINKS = [
  { href: '/hotel/pms/calendar', label: 'Calendar', icon: FaTh },
  { href: '/hotel/pms/reservations', label: 'Reservations', icon: FaCalendarCheck },
  { href: '/hotel/pms/housekeeping', label: 'Housekeeping', icon: FaBroom },
  { href: '/hotel/pms/reports', label: 'Reports', icon: FaChartLine },
  { href: '/hotel/pms/rooms', label: 'Rooms & Types', icon: FaDoorClosed },
];

export default function HotelNav() {
  const path = usePathname();
  return (
    <header className="mb-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white"><FaHotel /></div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Hotel</h1>
          <p className="text-sm text-slate-500">Front desk, rooms and reservations.</p>
        </div>
      </div>
      <nav className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
        {LINKS.map((l) => {
          const Icon = l.icon;
          const active = path === l.href || path.startsWith(l.href + '/');
          return (
            <Link key={l.href} href={l.href}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${active ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              <Icon size={13} /> {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
