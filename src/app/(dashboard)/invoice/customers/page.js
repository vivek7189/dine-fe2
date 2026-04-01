'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HiSearch, HiUserGroup, HiPlus } from 'react-icons/hi';
import apiClient from '../../../../lib/api';
import PageHeader from '../components/layout/PageHeader';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '0.00';
  return Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = searchDebounced ? `?search=${encodeURIComponent(searchDebounced)}` : '';
      const data = await apiClient.getInvoiceCustomers(params);
      setCustomers(data.customers || data || []);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [searchDebounced]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const columns = [
    {
      key: 'displayName',
      label: 'Display Name',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: 'companyName',
      label: 'Company Name',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'phone',
      label: 'Phone',
    },
    {
      key: 'receivables',
      label: 'Receivables',
      render: (value) => (
        <span className="font-medium">
          {'\u20B9'}{formatCurrency(value || 0)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '100px',
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'default'}>
          {value === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const hasCustomers = !loading && customers.length > 0;
  const isEmpty = !loading && customers.length === 0 && !searchDebounced;
  const noResults = !loading && customers.length === 0 && searchDebounced;

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Manage your customer contacts"
        actions={
          <Link href="/invoice/customers/new">
            <Button icon={HiPlus}>New Customer</Button>
          </Link>
        }
      />

      {/* Search */}
      {!isEmpty && (
        <div className="mb-4">
          <div className="relative max-w-md">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {isEmpty && (
        <EmptyState
          icon={HiUserGroup}
          title="No customers yet"
          description="Add your first customer to start creating invoices."
          action={
            <Link href="/invoice/customers/new">
              <Button icon={HiPlus}>Add Customer</Button>
            </Link>
          }
        />
      )}

      {/* No Search Results */}
      {noResults && (
        <EmptyState
          icon={HiSearch}
          title="No customers found"
          description={`No customers match "${searchDebounced}". Try a different search term.`}
        />
      )}

      {/* Table */}
      {(hasCustomers || loading) && (
        <Table
          columns={columns}
          data={customers}
          loading={loading}
          emptyMessage="No customers found"
          onRowClick={(row) => router.push(`/invoice/customers/${row._id || row.id}`)}
        />
      )}
    </div>
  );
}
