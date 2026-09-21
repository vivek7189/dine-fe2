'use client';
// Shared warm/editorial header + tab nav for the hotel PMS (Cardamom House design).
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaThLarge, FaRegClock, FaCalendarCheck, FaTags, FaBroom, FaUsers, FaChartLine, FaDoorClosed, FaCircle } from 'react-icons/fa';
import { T } from '../theme';

const LINKS = [
  { href: '/hotel/pms/home', label: 'Front Desk', icon: FaThLarge },
  { href: '/hotel/pms/calendar', label: 'Reservations', icon: FaRegClock },
  { href: '/hotel/pms/reservations', label: 'Bookings', icon: FaCalendarCheck },
  { href: '/hotel/pms/rates', label: 'Rates', icon: FaTags },
  { href: '/hotel/pms/housekeeping', label: 'Housekeeping', icon: FaBroom },
  { href: '/hotel/pms/staff', label: 'Staff', icon: FaUsers },
  { href: '/hotel/pms/reports', label: 'Reports', icon: FaChartLine },
  { href: '/hotel/pms/rooms', label: 'Setup', icon: FaDoorClosed },
];

export default function HotelNav() {
  const path = usePathname();
  let outlet = '';
  if (typeof window !== 'undefined') { try { outlet = JSON.parse(localStorage.getItem('selectedRestaurant') || '{}')?.name || ''; } catch { /* noop */ } }

  return (
    <header className="mb-6">
      {/* property context bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-[#EBE4D6] pb-4">
        <FaCircle size={8} className="text-[#3E7C5A]" />
        <span className={`text-[15px] font-semibold ${T.ink}`}>{outlet || 'Hotel'}</span>
        <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-[#EBE4D6] bg-white px-3 py-1 text-[12px] text-[#8A6721]">
          <FaCircle size={6} className="text-[#B58836]" /> Property management
        </span>
      </div>

      {/* tab nav */}
      <nav className="-mb-px flex gap-0.5 overflow-x-auto">
        {LINKS.map((l) => {
          const Icon = l.icon;
          const active = path === l.href || path.startsWith(l.href + '/');
          return (
            <Link key={l.href} href={l.href}
              className={`group relative flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-[13.5px] font-medium transition-colors ${active ? T.brassText : 'text-[#8A8172] hover:text-[#2A241B]'}`}>
              <Icon size={12.5} className={active ? '' : 'text-[#B3A88F] group-hover:text-[#8A8172]'} />
              {l.label}
              <span className={`absolute inset-x-3 -bottom-px h-[2.5px] rounded-full transition-all ${active ? 'bg-[#9A7B45]' : 'bg-transparent group-hover:bg-[#E3DAC5]'}`} />
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
