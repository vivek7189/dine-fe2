'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HiHome, HiUsers, HiCube, HiDocumentText, HiDocumentDuplicate,
  HiTruck, HiCreditCard, HiReceiptTax, HiChartBar, HiCog,
  HiChevronLeft, HiChevronRight,
} from 'react-icons/hi';

const navSections = [
  {
    items: [
      { label: 'Home', href: '/invoice/dashboard', icon: HiHome },
      { label: 'Customers', href: '/invoice/customers', icon: HiUsers },
      { label: 'Items', href: '/invoice/items', icon: HiCube },
    ],
  },
  {
    items: [
      { label: 'Quotes', href: '/invoice/quotes', icon: HiDocumentText },
      { label: 'Invoices', href: '/invoice/invoices', icon: HiDocumentDuplicate },
      { label: 'Challans', href: '/invoice/challans', icon: HiTruck },
    ],
  },
  {
    items: [
      { label: 'Payments', href: '/invoice/payments', icon: HiCreditCard },
      { label: 'Expenses', href: '/invoice/expenses', icon: HiReceiptTax },
    ],
  },
  {
    items: [{ label: 'Reports', href: '/invoice/reports', icon: HiChartBar }],
  },
];

export default function InvoiceSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('inv_sidebar_collapsed');
      if (saved === 'true') setCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('inv_sidebar_collapsed', String(next));
  };

  const isActive = (href) => {
    if (href === '/invoice/dashboard') return pathname === '/invoice/dashboard' || pathname === '/invoice';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`
        h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-200 flex-shrink-0
        ${collapsed ? 'w-14' : 'w-52'}
      `}
    >
      <div className="h-12 flex items-center px-3 border-b border-gray-100 gap-2 flex-shrink-0">
        <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <HiDocumentDuplicate className="h-3.5 w-3.5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-gray-900 text-sm">Invoice</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-1.5">
        {navSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {sectionIndex > 0 && <div className="my-1.5 border-t border-gray-100" />}
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`
                    flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                    transition-colors duration-150 mb-0.5
                    ${
                      active
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-100 px-1.5 py-1.5 flex-shrink-0">
        <Link
          href="/invoice/settings"
          title={collapsed ? 'Settings' : undefined}
          className={`
            flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
            transition-colors duration-150
            ${
              pathname.startsWith('/invoice/settings')
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }
          `}
        >
          <HiCog className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>

        <button
          onClick={toggleCollapse}
          className="flex items-center justify-center w-full mt-1 px-2.5 py-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
        >
          {collapsed ? <HiChevronRight className="h-4 w-4" /> : <HiChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
